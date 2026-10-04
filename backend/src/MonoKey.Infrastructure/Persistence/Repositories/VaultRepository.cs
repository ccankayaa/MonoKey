using Microsoft.EntityFrameworkCore;
using MonoKey.Application.Vault;
using MonoKey.Domain.Vault;

namespace MonoKey.Infrastructure.Persistence.Repositories;

internal sealed class VaultRepository(MonoKeyDbContext context) : IVaultRepository
{
    public Task<VaultKeyEnvelope?> GetKeyEnvelopeAsync(
        string userId,
        bool trackChanges,
        CancellationToken cancellationToken)
    {
        IQueryable<VaultKeyEnvelope> query = context.VaultKeyEnvelopes;
        if (!trackChanges)
        {
            query = query.AsNoTracking();
        }

        return query.SingleOrDefaultAsync(envelope => envelope.UserId == userId, cancellationToken);
    }

    public Task AddKeyEnvelopeAsync(VaultKeyEnvelope envelope, CancellationToken cancellationToken) =>
        context.VaultKeyEnvelopes.AddAsync(envelope, cancellationToken).AsTask();

    public Task<VaultRecord?> GetRecordAsync(
        string userId,
        Guid id,
        bool trackChanges,
        CancellationToken cancellationToken)
    {
        IQueryable<VaultRecord> query = context.VaultRecords;
        if (!trackChanges)
        {
            query = query.AsNoTracking();
        }

        return query.SingleOrDefaultAsync(
            record => record.UserId == userId && record.Id == id,
            cancellationToken);
    }

    public async Task<(IReadOnlyList<VaultRecord> Items, int TotalCount)> ListRecordsAsync(
        string userId,
        int skip,
        int take,
        CancellationToken cancellationToken)
    {
        var query = context.VaultRecords.AsNoTracking().Where(record => record.UserId == userId);
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(record => record.UpdatedAtUtc)
            .ThenBy(record => record.Id)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
        return (items, totalCount);
    }

    public Task AddRecordAsync(VaultRecord record, CancellationToken cancellationToken) =>
        context.VaultRecords.AddAsync(record, cancellationToken).AsTask();

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        var deletedIds = context.ChangeTracker.Entries<VaultRecord>().Where(entry => entry.Entity.IsDeleted).Select(entry => entry.Entity.Id).ToArray();
        if (deletedIds.Length > 0)
        {
            var links = await context.SubscriptionVaultLinks.Where(link => deletedIds.Contains(link.VaultRecordId)).ToListAsync(cancellationToken);
            context.SubscriptionVaultLinks.RemoveRange(links);
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
