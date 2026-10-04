namespace MonoKey.Application.Membership;

public sealed record MembershipDto(string Plan, string Status, DateTimeOffset? ValidUntilUtc, bool CheckoutAvailable);
public sealed record PlanDto(string Id, string? DisplayPrice, int? SubscriptionLimit, int? VaultRecordLimit);
public sealed record CheckoutDto(string Url);

public interface IMembershipService
{
    Task<MembershipDto> GetAsync(CancellationToken cancellationToken);
    IReadOnlyList<PlanDto> GetPlans();
    Task<CheckoutDto> CheckoutAsync(CancellationToken cancellationToken);
    Task AcceptStripeEventAsync(string body, string signature, CancellationToken cancellationToken);
    Task EnsureCanCreateAsync(bool vaultRecord, CancellationToken cancellationToken);
}
