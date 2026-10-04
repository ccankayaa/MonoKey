using MonoKey.Domain.Common;

namespace MonoKey.Domain.Membership;

public sealed class BillingEvent : AuditableEntity
{
    private BillingEvent() { }
    public BillingEvent(string provider, string externalId, Guid membershipId)
    {
        Provider = provider;
        ExternalId = externalId;
        MembershipId = membershipId;
    }

    public string Provider { get; private set; } = string.Empty;
    public string ExternalId { get; private set; } = string.Empty;
    public Guid MembershipId { get; private set; }
}
