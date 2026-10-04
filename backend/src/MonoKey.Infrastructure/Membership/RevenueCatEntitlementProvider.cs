using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using MonoKey.Application.Membership;

namespace MonoKey.Infrastructure.Membership;

public sealed class RevenueCatEntitlementProvider(HttpClient client, IOptions<RevenueCatOptions> options, TimeProvider clock) : IMobileEntitlementProvider
{
    public bool IsConfigured => options.Value.IsConfigured;
    public bool VerifyWebhookAuthorization(string authorization) => IsConfigured &&
        CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(authorization), Encoding.UTF8.GetBytes(options.Value.WebhookAuthorization!));

    public async Task<VerifiedMobileEntitlement> ReconcileSandboxAsync(string ownerUid, CancellationToken cancellationToken)
    {
        if (!IsConfigured || string.IsNullOrWhiteSpace(ownerUid) || ownerUid.Length > 128) throw new InvalidOperationException("Mobile billing is not configured.");
        using var request = new HttpRequestMessage(HttpMethod.Get, $"https://api.revenuecat.com/v1/subscribers/{Uri.EscapeDataString(ownerUid)}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", options.Value.SecretKey);
        using var response = await client.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode) throw new InvalidOperationException("Mobile billing reconciliation is unavailable.");
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(cancellationToken));
        var subscriber = document.RootElement.GetProperty("subscriber");
        if (subscriber.GetProperty("original_app_user_id").GetString() != ownerUid) throw new UnauthorizedAccessException("Mobile billing account mismatch. Account aliases require a separate reviewed transfer.");
        if (!subscriber.GetProperty("entitlements").TryGetProperty(options.Value.EntitlementId!, out var entitlement)) return new(false, null);
        var product = entitlement.GetProperty("product_identifier").GetString();
        if (product is null || !subscriber.GetProperty("subscriptions").TryGetProperty(product, out var subscription) ||
            !subscription.GetProperty("is_sandbox").GetBoolean()) throw new UnauthorizedAccessException("Live mobile billing is disabled.");
        if (!DateTimeOffset.TryParse(entitlement.GetProperty("expires_date").GetString(), System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.AssumeUniversal, out var expiry)) return new(false, null);
        expiry = expiry.ToUniversalTime();
        return new(expiry > clock.GetUtcNow(), expiry);
    }
}
