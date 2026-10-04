using FluentValidation;
using MonoKey.Application.Common;
using MonoKey.Application.Subscriptions;
using MonoKey.Domain.Subscriptions;

namespace MonoKey.UnitTests.Subscriptions;

public sealed class SubscriptionServiceTests
{
    [Fact]
    public async Task CreateAsync_UsesAuthenticatedUserAndDoesNotAcceptOwnerInput()
    {
        var repository = new FakeSubscriptionRepository();
        var service = CreateService(repository, "authenticated-user");

        var result = await service.CreateAsync(
            new CreateSubscriptionCommand(
                "Music",
                9.99m,
                "eur",
                BillingIntervalUnit.Month,
                1,
                new DateOnly(2030, 1, 1)),
            CancellationToken.None);

        Assert.Equal("authenticated-user", repository.Added!.UserId);
        Assert.Equal(repository.Added.Id, result.Id);
    }

    [Fact]
    public async Task GetAsync_DoesNotReturnAnotherUsersSubscription()
    {
        var repository = new FakeSubscriptionRepository();
        repository.Items.Add(new Subscription(
            "other-user",
            "Private",
            10m,
            "USD",
            BillingIntervalUnit.Month,
            1,
            new DateOnly(2030, 1, 1)));
        var service = CreateService(repository, "authenticated-user");

        await Assert.ThrowsAsync<NotFoundException>(() =>
            service.GetAsync(repository.Items[0].Id, CancellationToken.None));
    }

    [Fact]
    public async Task GetCostSummariesAsync_SeparatesCurrencies()
    {
        var repository = new FakeSubscriptionRepository();
        repository.Items.Add(CreateOwned("USD", 10m));
        repository.Items.Add(CreateOwned("EUR", 20m));
        var service = CreateService(repository, "authenticated-user");

        var summaries = await service.GetCostSummariesAsync(CancellationToken.None);

        Assert.Equal(2, summaries.Count);
        Assert.Contains(summaries, summary => summary.CurrencyCode == "USD" && summary.YearlyCost == 120m);
        Assert.Contains(summaries, summary => summary.CurrencyCode == "EUR" && summary.YearlyCost == 240m);
    }

    [Fact]
    public async Task GetUpcomingRenewalsAsync_UsesInclusiveUtcCalendarWindow()
    {
        var repository = new FakeSubscriptionRepository();
        var now = new DateTimeOffset(2026, 9, 27, 23, 0, 0, TimeSpan.Zero);
        var service = CreateService(repository, "authenticated-user", new FixedTimeProvider(now));

        await service.GetUpcomingRenewalsAsync(30, CancellationToken.None);

        Assert.Equal(new DateOnly(2026, 9, 27), repository.UpcomingFrom);
        Assert.Equal(new DateOnly(2026, 10, 27), repository.UpcomingThrough);
    }

    private static ISubscriptionService CreateService(
        FakeSubscriptionRepository repository,
        string userId,
        TimeProvider? timeProvider = null)
    {
        var clock = timeProvider ?? TimeProvider.System;
        return new SubscriptionService(
            repository,
            new StubUserContext(userId),
            new CreateSubscriptionCommandValidator(clock),
            new UpdateSubscriptionCommandValidator(clock),
            clock);
    }

    private static Subscription CreateOwned(string currencyCode, decimal amount) => new(
        "authenticated-user",
        currencyCode,
        amount,
        currencyCode,
        BillingIntervalUnit.Month,
        1,
        new DateOnly(2030, 1, 1));

    private sealed record StubUserContext(string UserId) : IUserContext;

    private sealed class FixedTimeProvider(DateTimeOffset utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => utcNow;
    }

    private sealed class FakeSubscriptionRepository : ISubscriptionRepository
    {
        public List<Subscription> Items { get; } = [];

        public Subscription? Added { get; private set; }

        public DateOnly? UpcomingFrom { get; private set; }

        public DateOnly? UpcomingThrough { get; private set; }

        public Task<Subscription?> GetByRequestIdAsync(string userId, Guid requestId, CancellationToken cancellationToken) => Task.FromResult(Items.FirstOrDefault(item => item.UserId == userId && item.ClientRequestId == requestId));

        public Task AddAsync(Subscription subscription, CancellationToken cancellationToken)
        {
            Added = subscription;
            Items.Add(subscription);
            return Task.CompletedTask;
        }

        public Task<Subscription?> GetAsync(
            string userId,
            Guid id,
            bool trackChanges,
            CancellationToken cancellationToken) =>
            Task.FromResult(Items.SingleOrDefault(item => item.UserId == userId && item.Id == id));

        public Task<(IReadOnlyList<Subscription> Items, int TotalCount)> ListAsync(
            string userId,
            int skip,
            int take,
            SubscriptionStatus? status,
            CancellationToken cancellationToken)
        {
            var query = Items.Where(item => item.UserId == userId && (!status.HasValue || item.Status == status));
            var results = query.Skip(skip).Take(take).ToArray();
            return Task.FromResult<(IReadOnlyList<Subscription>, int)>((results, query.Count()));
        }

        public Task<IReadOnlyList<Subscription>> ListActiveAsync(
            string userId,
            CancellationToken cancellationToken) =>
            Task.FromResult<IReadOnlyList<Subscription>>(
                Items.Where(item => item.UserId == userId && item.Status == SubscriptionStatus.Active).ToArray());

        public Task<IReadOnlyList<Subscription>> ListUpcomingAsync(
            string userId,
            DateOnly from,
            DateOnly through,
            CancellationToken cancellationToken)
        {
            UpcomingFrom = from;
            UpcomingThrough = through;
            return Task.FromResult<IReadOnlyList<Subscription>>(
                Items.Where(item =>
                    item.UserId == userId && item.NextRenewalDate >= from && item.NextRenewalDate <= through).ToArray());
        }

        public void Remove(Subscription subscription) => Items.Remove(subscription);

        public Task SaveChangesAsync(CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
