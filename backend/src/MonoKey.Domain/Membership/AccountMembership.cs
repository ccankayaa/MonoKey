using MonoKey.Domain.Common;

namespace MonoKey.Domain.Membership;

public sealed class AccountMembership : AuditableEntity
{
    private AccountMembership() { }
    public AccountMembership(string userId) => UserId = userId;
    public string UserId { get; private set; } = string.Empty;
    public string? Provider { get; private set; }
    public string? CustomerReference { get; private set; }
    public string Status { get; private set; } = "Free";
    public DateTimeOffset? ValidUntilUtc { get; private set; }
    public DateTimeOffset? LastProviderEventUtc { get; private set; }
    public void AttachCustomer(string provider, string customerReference)
    {
        if (CustomerReference is not null && CustomerReference != customerReference)
        {
            throw new InvalidOperationException("Customer mapping already exists.");
        }

        Provider = provider;
        CustomerReference = customerReference;
    }

    public void ApplyVerifiedEvent(string status, DateTimeOffset? validUntilUtc, DateTimeOffset occurredAtUtc)
    {
        if (LastProviderEventUtc >= occurredAtUtc) return;
        Status = status;
        ValidUntilUtc = validUntilUtc?.ToUniversalTime();
        LastProviderEventUtc = occurredAtUtc.ToUniversalTime();
    }

    public bool HasPro(DateTimeOffset now) => Status == "Active" && ValidUntilUtc > now;
}
