using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MonoKey.Application.Common;
using MonoKey.Application.Subscriptions;
using MonoKey.Domain.Subscriptions;

namespace MonoKey.Infrastructure.Persistence.Repositories;

internal sealed class SubscriptionLinkService(MonoKeyDbContext context, IUserContext user) : ISubscriptionLinkService
{
    public async Task<IReadOnlyList<SubscriptionLinkDto>> ListAsync(Guid subscriptionId, CancellationToken cancellationToken)
    {
        await FindSubscriptionAsync(subscriptionId, cancellationToken);
        return await context.SubscriptionVaultLinks.AsNoTracking()
            .Where(link => link.UserId == user.UserId && link.SubscriptionId == subscriptionId &&
                context.VaultRecords.Any(record => record.Id == link.VaultRecordId && record.UserId == user.UserId && !record.IsDeleted))
            .Select(link => new SubscriptionLinkDto(link.VaultRecordId)).ToListAsync(cancellationToken);
    }

    public async Task LinkAsync(Guid subscriptionId, Guid recordId, LinkVaultRecordCommand command, CancellationToken cancellationToken)
    {
        var subscription = await FindSubscriptionAsync(subscriptionId, cancellationToken);
        var record = await context.VaultRecords.SingleOrDefaultAsync(item => item.UserId == user.UserId && item.Id == recordId && !item.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Vault record was not found.");
        if (record.Revision != command.RecordRevision) throw new ConflictException("Vault record changed; refresh before linking.");
        if (await context.SubscriptionVaultLinks.AnyAsync(item => item.UserId == user.UserId && item.SubscriptionId == subscriptionId && item.VaultRecordId == recordId, cancellationToken)) return;
        if (subscription.ConcurrencyToken != command.SubscriptionConcurrencyToken) throw new ConflictException("Subscription changed; refresh before linking.");
        context.SubscriptionVaultLinks.Add(new SubscriptionVaultLink(user.UserId, subscriptionId, recordId));
        // Touch both concurrency-protected resources so a concurrent delete/tombstone cannot leave a new link.
        context.Entry(subscription).Property(item => item.UpdatedAtUtc).IsModified = true;
        context.Entry(record).Property(item => item.UpdatedAtUtc).IsModified = true;
        await context.SaveChangesAsync(cancellationToken);
    }

    public async Task UnlinkAsync(Guid subscriptionId, Guid recordId, Guid concurrencyToken, CancellationToken cancellationToken)
    {
        var subscription = await FindSubscriptionAsync(subscriptionId, cancellationToken);
        if (subscription.ConcurrencyToken != concurrencyToken) throw new ConflictException("Subscription changed; refresh before unlinking.");
        var link = await context.SubscriptionVaultLinks.SingleOrDefaultAsync(item => item.UserId == user.UserId && item.SubscriptionId == subscriptionId && item.VaultRecordId == recordId, cancellationToken);
        if (link is not null)
        {
            context.SubscriptionVaultLinks.Remove(link);
            await context.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task<Subscription> FindSubscriptionAsync(Guid id, CancellationToken cancellationToken) =>
        await context.Subscriptions.SingleOrDefaultAsync(item => item.UserId == user.UserId && item.Id == id, cancellationToken)
            ?? throw new NotFoundException("Subscription was not found.");
}
