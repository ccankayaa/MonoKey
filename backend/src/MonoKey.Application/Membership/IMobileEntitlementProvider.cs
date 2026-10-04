namespace MonoKey.Application.Membership;

public sealed record VerifiedMobileEntitlement(bool Active, DateTimeOffset? ValidUntilUtc);
public interface IMobileEntitlementProvider
{
    bool IsConfigured { get; }
    bool VerifyWebhookAuthorization(string authorization);
    Task<VerifiedMobileEntitlement> ReconcileSandboxAsync(string ownerUid, CancellationToken cancellationToken);
}
public interface IMobileMembershipService
{
    Task RegisterAccountAsync(CancellationToken cancellationToken);
    Task AcceptWebhookAsync(string body, string authorization, CancellationToken cancellationToken);
}
