using Microsoft.EntityFrameworkCore;
using MonoKey.Application.Subscriptions;
using MonoKey.Domain.Subscriptions;

namespace MonoKey.Infrastructure.Persistence.Repositories;

internal sealed class SubscriptionRepository(MonoKeyDbContext context) : ISubscriptionRepository
{
    public Task<Subscription?> GetByRequestIdAsync(string userId, Guid requestId, CancellationToken cancellationToken) =>
        context.Subscriptions.AsNoTracking().SingleOrDefaultAsync(item => item.UserId == userId && item.ClientRequestId == requestId, cancellationToken);

    public Task AddAsync(Subscription subscription, CancellationToken cancellationToken) =>
        context.Subscriptions.AddAsync(subscription, cancellationToken).AsTask();

    public Task<Subscription?> GetAsync(
        string userId,
        Guid id,
        bool trackChanges,
        CancellationToken cancellationToken)
    {
        IQueryable<Subscription> query = context.Subscriptions;
        if (!trackChanges)
        {
            query = query.AsNoTracking();
        }

        return query.SingleOrDefaultAsync(
            subscription => subscription.UserId == userId && subscription.Id == id,
            cancellationToken);
    }

    public async Task<(IReadOnlyList<Subscription> Items, int TotalCount)> ListAsync(
        string userId,
        int skip,
        int take,
        SubscriptionStatus? status,
        CancellationToken cancellationToken)
    {
        var query = context.Subscriptions.AsNoTracking().Where(subscription => subscription.UserId == userId);
        if (status.HasValue)
        {
            query = query.Where(subscription => subscription.Status == status.Value);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(subscription => subscription.NextRenewalDate)
            .ThenBy(subscription => subscription.Id)
            .Skip(skip)
            .Take(take)
            .ToListAsync(cancellationToken);
        return (items, totalCount);
    }

    public async Task<IReadOnlyList<Subscription>> ListActiveAsync(
        string userId,
        CancellationToken cancellationToken) =>
        await context.Subscriptions
            .AsNoTracking()
            .Where(subscription =>
                subscription.UserId == userId && subscription.Status == SubscriptionStatus.Active)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Subscription>> ListUpcomingAsync(
        string userId,
        DateOnly from,
        DateOnly through,
        CancellationToken cancellationToken) =>
        await context.Subscriptions
            .AsNoTracking()
            .Where(subscription =>
                subscription.UserId == userId &&
                subscription.Status == SubscriptionStatus.Active &&
                subscription.NextRenewalDate >= from &&
                subscription.NextRenewalDate <= through)
            .OrderBy(subscription => subscription.NextRenewalDate)
            .ThenBy(subscription => subscription.Id)
            .ToListAsync(cancellationToken);

    public void Remove(Subscription subscription) => context.Subscriptions.Remove(subscription);

    public Task SaveChangesAsync(CancellationToken cancellationToken) => context.SaveChangesAsync(cancellationToken);
}
