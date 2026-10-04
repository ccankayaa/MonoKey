using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Options;
using MonoKey.Domain.Subscriptions;
using MonoKey.Domain.Vault;
using MonoKey.Infrastructure.Membership;

namespace MonoKey.Infrastructure.Persistence;

internal sealed class PlanCreationInterceptor(IOptions<BillingOptions> options, TimeProvider clock) : SaveChangesInterceptor
{
    private IDbContextTransaction? ownedTransaction;
    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(DbContextEventData eventData, InterceptionResult<int> result, CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not MonoKeyDbContext context || !context.Database.IsRelational()) return result;
        var subscriptions = context.ChangeTracker.Entries<Subscription>().Where(item => item.State == EntityState.Added).Select(item => item.Entity).ToArray();
        var records = context.ChangeTracker.Entries<VaultRecord>().Where(item => item.State == EntityState.Added).Select(item => item.Entity).ToArray();
        var subscriptionLimit = options.Value.FreeSubscriptionLimit; var recordLimit = options.Value.FreeVaultRecordLimit;
        if (subscriptionLimit is null && recordLimit is null || subscriptions.Length + records.Length == 0) return result;
        if (subscriptionLimit < 0 || recordLimit < 0) throw new InvalidOperationException("Configured plan limits cannot be negative.");
        if (context.Database.CurrentTransaction is null) ownedTransaction = await context.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            foreach (var uid in subscriptions.Select(item => item.UserId).Concat(records.Select(item => item.UserId)).Distinct().Order(StringComparer.Ordinal))
            {
                // The transaction holds this per-owner lock until the actual inserts commit.
                await context.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({uid}, {735119L}))", cancellationToken);
                var membership = await context.Memberships.AsNoTracking().SingleOrDefaultAsync(item => item.UserId == uid, cancellationToken);
                if (membership?.HasPro(clock.GetUtcNow()) == true) continue;
                if (subscriptionLimit.HasValue && await context.Subscriptions.CountAsync(item => item.UserId == uid, cancellationToken) + subscriptions.Count(item => item.UserId == uid) > subscriptionLimit ||
                    recordLimit.HasValue && await context.VaultRecords.CountAsync(item => item.UserId == uid && !item.IsDeleted, cancellationToken) + records.Count(item => item.UserId == uid) > recordLimit)
                    throw new ValidationException("The configured plan creation limit has been reached. Existing data remains accessible.");
            }
        }
        catch { await RollbackAsync(cancellationToken); throw; }
        return result;
    }
    public override async ValueTask<int> SavedChangesAsync(SaveChangesCompletedEventData eventData, int result, CancellationToken cancellationToken = default)
    {
        if (ownedTransaction is not null) { await ownedTransaction.CommitAsync(cancellationToken); await ownedTransaction.DisposeAsync(); ownedTransaction = null; }
        return result;
    }
    public override Task SaveChangesFailedAsync(DbContextErrorEventData eventData, CancellationToken cancellationToken = default) => RollbackAsync(cancellationToken);
    public override Task SaveChangesCanceledAsync(DbContextEventData eventData, CancellationToken cancellationToken = default) => RollbackAsync(cancellationToken);
    private async Task RollbackAsync(CancellationToken cancellationToken)
    {
        if (ownedTransaction is null) return;
        try { await ownedTransaction.RollbackAsync(cancellationToken); } finally { await ownedTransaction.DisposeAsync(); ownedTransaction = null; }
    }
}
