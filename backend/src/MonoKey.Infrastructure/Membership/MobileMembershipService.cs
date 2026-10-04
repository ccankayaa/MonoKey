using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MonoKey.Application.Common;
using MonoKey.Application.Membership;
using MonoKey.Domain.Membership;
using MonoKey.Infrastructure.Persistence;

namespace MonoKey.Infrastructure.Membership;

internal sealed class MobileMembershipService(MonoKeyDbContext context, IUserContext user, IMobileEntitlementProvider provider, TimeProvider clock) : IMobileMembershipService
{
    public async Task RegisterAccountAsync(CancellationToken cancellationToken)
    {
        if (!provider.IsConfigured) throw new InvalidOperationException("Mobile billing is not configured.");
        var membership = await context.Memberships.SingleOrDefaultAsync(item => item.UserId == user.UserId, cancellationToken);
        if (membership is null) { membership = new AccountMembership(user.UserId); context.Memberships.Add(membership); }
        if (membership.Provider is not (null or "RevenueCat")) throw new ConflictException("This membership already has a different billing provider.");
        membership.AttachCustomer("RevenueCat", user.UserId);
        await context.SaveChangesAsync(cancellationToken);
    }
    public async Task AcceptWebhookAsync(string body, string authorization, CancellationToken cancellationToken)
    {
        if (!provider.VerifyWebhookAuthorization(authorization)) throw new UnauthorizedAccessException("Mobile billing event could not be verified.");
        using var document = JsonDocument.Parse(body);
        var payload = document.RootElement.GetProperty("event");
        if (payload.GetProperty("environment").GetString() != "SANDBOX") throw new UnauthorizedAccessException("Live mobile billing is disabled.");
        var externalId = payload.GetProperty("id").GetString()!;
        if (externalId.Length is < 1 or > 200) throw new UnauthorizedAccessException("Mobile billing event ID is invalid.");
        if (await context.BillingEvents.AnyAsync(item => item.Provider == "RevenueCat" && item.ExternalId == externalId, cancellationToken)) return;
        var uid = payload.GetProperty("app_user_id").GetString();
        var membership = await context.Memberships.SingleOrDefaultAsync(item => item.Provider == "RevenueCat" && item.CustomerReference == uid, cancellationToken)
            ?? throw new NotFoundException("Mobile billing account mapping was not found.");
        var entitlement = await provider.ReconcileSandboxAsync(membership.UserId, cancellationToken);
        membership.ApplyVerifiedEvent(entitlement.Active ? "Active" : "Free", entitlement.ValidUntilUtc, clock.GetUtcNow());
        context.BillingEvents.Add(new BillingEvent("RevenueCat", externalId, membership.Id));
        await context.SaveChangesAsync(cancellationToken);
    }
}
