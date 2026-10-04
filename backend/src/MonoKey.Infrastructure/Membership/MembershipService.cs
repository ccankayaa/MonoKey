using System.Net.Http.Headers;
using System.Text.Json;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MonoKey.Application.Common;
using MonoKey.Application.Membership;
using MonoKey.Domain.Membership;
using MonoKey.Infrastructure.Persistence;

namespace MonoKey.Infrastructure.Membership;

internal sealed class MembershipService(MonoKeyDbContext context, IUserContext user, TimeProvider clock, IOptions<BillingOptions> options, HttpClient client) : IMembershipService
{
    private BillingOptions Configuration => options.Value;
    public async Task<MembershipDto> GetAsync(CancellationToken cancellationToken)
    {
        var membership = await context.Memberships.AsNoTracking().SingleOrDefaultAsync(item => item.UserId == user.UserId, cancellationToken);
        var pro = membership?.HasPro(clock.GetUtcNow()) == true;
        return new(pro ? "Pro" : "Free", pro ? "Active" : "Free", membership?.ValidUntilUtc, Configuration.IsConfigured);
    }

    public IReadOnlyList<PlanDto> GetPlans() =>
        [new("Free", null, Configuration.FreeSubscriptionLimit, Configuration.FreeVaultRecordLimit), new("Pro", Configuration.DisplayPrice, null, null)];

    public async Task EnsureCanCreateAsync(bool vaultRecord, CancellationToken cancellationToken)
    {
        if ((await GetAsync(cancellationToken)).Plan == "Pro") return;
        var limit = vaultRecord ? Configuration.FreeVaultRecordLimit : Configuration.FreeSubscriptionLimit;
        if (limit is null) return;
        var count = vaultRecord
            ? await context.VaultRecords.CountAsync(item => item.UserId == user.UserId && !item.IsDeleted, cancellationToken)
            : await context.Subscriptions.CountAsync(item => item.UserId == user.UserId, cancellationToken);
        if (count >= limit) throw new ValidationException("The configured plan creation limit has been reached. Existing data remains accessible.");
    }

    public async Task<CheckoutDto> CheckoutAsync(CancellationToken cancellationToken)
    {
        if (!Configuration.IsConfigured) throw new InvalidOperationException("Paid checkout is not configured.");
        var membership = await context.Memberships.SingleOrDefaultAsync(item => item.UserId == user.UserId, cancellationToken);
        if (membership is null)
        {
            membership = new AccountMembership(user.UserId);
            context.Memberships.Add(membership);
            await context.SaveChangesAsync(cancellationToken);
        }

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Configuration.StripeSecretKey);
        if (membership.CustomerReference is null)
        {
            var customer = await PostAsync(client, "customers", new Dictionary<string, string> { ["metadata[membership_id]"] = membership.Id.ToString() }, $"monokey-customer-{membership.Id}", cancellationToken);
            membership.AttachCustomer("Stripe", customer.GetProperty("id").GetString()!);
            await context.SaveChangesAsync(cancellationToken);
        }

        var session = await PostAsync(client, "checkout/sessions", new Dictionary<string, string>
        {
            ["customer"] = membership.CustomerReference!,
            ["mode"] = "subscription",
            ["line_items[0][price]"] = Configuration.StripePriceId!,
            ["line_items[0][quantity]"] = "1",
            ["success_url"] = $"{Configuration.WebOrigin}/membership",
            ["cancel_url"] = $"{Configuration.WebOrigin}/membership",
        }, $"monokey-checkout-{membership.Id}-{clock.GetUtcNow().ToUnixTimeSeconds() / 1800}", cancellationToken);
        var url = session.GetProperty("url").GetString()!;
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) || uri.Scheme != "https" || uri.Host != "checkout.stripe.com") throw new InvalidOperationException("Checkout returned an invalid URL.");
        return new(url);
    }

    public async Task AcceptStripeEventAsync(string body, string signature, CancellationToken cancellationToken)
    {
        if (!Configuration.IsConfigured || !StripeSignature.Verify(body, signature, Configuration.StripeWebhookSecret!, clock.GetUtcNow())) throw new UnauthorizedAccessException("Billing event could not be verified.");
        using var document = JsonDocument.Parse(body);
        var root = document.RootElement;
        if (root.GetProperty("livemode").GetBoolean()) throw new UnauthorizedAccessException("Live billing is disabled.");
        var type = root.GetProperty("type").GetString();
        if (type is not ("customer.subscription.updated" or "customer.subscription.deleted" or "customer.subscription.created")) return;
        var externalId = root.GetProperty("id").GetString()!;
        if (externalId.Length is < 1 or > 200) throw new ValidationException("Billing event ID is invalid.");
        if (await context.BillingEvents.AnyAsync(item => item.Provider == "Stripe" && item.ExternalId == externalId, cancellationToken)) return;
        var payload = root.GetProperty("data").GetProperty("object");
        var customer = payload.GetProperty("customer").GetString();
        var membership = await context.Memberships.SingleOrDefaultAsync(item => item.Provider == "Stripe" && item.CustomerReference == customer, cancellationToken)
            ?? throw new NotFoundException("Billing account mapping was not found.");
        // Reconcile through the provider, rather than trusting stale delivery order or a checkout redirect.
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Configuration.StripeSecretKey);
        using var response = await client.GetAsync($"subscriptions/{Uri.EscapeDataString(payload.GetProperty("id").GetString()!)}", cancellationToken);
        if (!response.IsSuccessStatusCode) throw new InvalidOperationException("Billing reconciliation is unavailable.");
        using var current = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        var subscription = current.RootElement;
        if (subscription.GetProperty("customer").GetString() != customer || subscription.GetProperty("livemode").GetBoolean()) throw new UnauthorizedAccessException("Billing account mismatch.");
        var items = subscription.GetProperty("items").GetProperty("data").EnumerateArray();
        DateTimeOffset? until = null;
        foreach (var item in items)
        {
            if (item.GetProperty("price").GetProperty("id").GetString() != Configuration.StripePriceId) continue;
            if (item.TryGetProperty("current_period_end", out var end) || subscription.TryGetProperty("current_period_end", out end)) until = DateTimeOffset.FromUnixTimeSeconds(end.GetInt64());
        }

        var status = subscription.GetProperty("status").GetString() is "active" or "trialing" && until is not null ? "Active" : "Free";
        membership.ApplyVerifiedEvent(status, until, clock.GetUtcNow());
        context.BillingEvents.Add(new BillingEvent("Stripe", externalId, membership.Id));
        await context.SaveChangesAsync(cancellationToken);
    }

    private static async Task<JsonElement> PostAsync(HttpClient client, string path, Dictionary<string, string> fields, string idempotencyKey, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, path) { Content = new FormUrlEncodedContent(fields) };
        request.Headers.Add("Idempotency-Key", idempotencyKey);
        using var response = await client.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode) throw new InvalidOperationException("Billing provider is unavailable.");
        using var json = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        return json.RootElement.Clone();
    }
}
