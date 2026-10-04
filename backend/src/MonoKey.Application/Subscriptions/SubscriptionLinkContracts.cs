namespace MonoKey.Application.Subscriptions;

public sealed record SubscriptionLinkDto(Guid VaultRecordId);
public sealed record LinkVaultRecordCommand(Guid SubscriptionConcurrencyToken, long RecordRevision);
public interface ISubscriptionLinkService
{
    Task<IReadOnlyList<SubscriptionLinkDto>> ListAsync(Guid subscriptionId, CancellationToken cancellationToken);
    Task LinkAsync(Guid subscriptionId, Guid recordId, LinkVaultRecordCommand command, CancellationToken cancellationToken);
    Task UnlinkAsync(Guid subscriptionId, Guid recordId, Guid concurrencyToken, CancellationToken cancellationToken);
}
