using MonoKey.Domain.Common;

namespace MonoKey.Domain.Subscriptions;

public sealed class SubscriptionVaultLink : AuditableEntity
{
    private SubscriptionVaultLink() { }

    public SubscriptionVaultLink(string userId, Guid subscriptionId, Guid vaultRecordId)
    {
        UserId = userId;
        SubscriptionId = subscriptionId;
        VaultRecordId = vaultRecordId;
    }

    public string UserId { get; private set; } = string.Empty;
    public Guid SubscriptionId { get; private set; }
    public Guid VaultRecordId { get; private set; }
}
