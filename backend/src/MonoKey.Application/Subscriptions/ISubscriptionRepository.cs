using MonoKey.Domain.Subscriptions;

namespace MonoKey.Application.Subscriptions;

public interface ISubscriptionRepository
{
    Task<Subscription?> GetByRequestIdAsync(string userId, Guid requestId, CancellationToken cancellationToken);
    Task AddAsync(Subscription subscription, CancellationToken cancellationToken);

    Task<Subscription?> GetAsync(string userId, Guid id, bool trackChanges, CancellationToken cancellationToken);

    Task<(IReadOnlyList<Subscription> Items, int TotalCount)> ListAsync(
        string userId,
        int skip,
        int take,
        SubscriptionStatus? status,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<Subscription>> ListActiveAsync(string userId, CancellationToken cancellationToken);

    Task<IReadOnlyList<Subscription>> ListUpcomingAsync(
        string userId,
        DateOnly from,
        DateOnly through,
        CancellationToken cancellationToken);

    void Remove(Subscription subscription);

    Task SaveChangesAsync(CancellationToken cancellationToken);
}
