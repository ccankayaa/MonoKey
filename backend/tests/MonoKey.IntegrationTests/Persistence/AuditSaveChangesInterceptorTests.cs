using Microsoft.EntityFrameworkCore;
using MonoKey.Domain.Subscriptions;
using MonoKey.Infrastructure.Persistence;
using MonoKey.IntegrationTests.Infrastructure;

namespace MonoKey.IntegrationTests.Persistence;

public sealed class AuditSaveChangesInterceptorTests
{
    [Fact]
    public async Task SaveChanges_SetsUtcAuditValuesAndPreservesCreatedTimestampOnUpdate()
    {
        var createdAt = new DateTimeOffset(2026, 9, 27, 10, 0, 0, TimeSpan.Zero);
        var timeProvider = new MutableTimeProvider(createdAt);
        var options = new DbContextOptionsBuilder<MonoKeyDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .AddInterceptors(new AuditSaveChangesInterceptor(timeProvider))
            .Options;

        await using var context = new MonoKeyDbContext(options);
        var subscription = new Subscription(
            "user-1",
            "Music",
            10m,
            "USD",
            BillingIntervalUnit.Month,
            1,
            new DateOnly(2030, 1, 1));
        context.Subscriptions.Add(subscription);

        await context.SaveChangesAsync(CancellationToken.None);

        Assert.Equal(createdAt, subscription.CreatedAtUtc);
        Assert.Equal(createdAt, subscription.UpdatedAtUtc);
        Assert.Equal(TimeSpan.Zero, subscription.CreatedAtUtc.Offset);

        var updatedAt = createdAt.AddHours(1);
        timeProvider.UtcNow = updatedAt;
        subscription.UpdateDetails(
            "Music Plus",
            12m,
            "USD",
            BillingIntervalUnit.Month,
            1,
            new DateOnly(2030, 2, 1));
        context.SaveChanges();

        Assert.Equal(createdAt, subscription.CreatedAtUtc);
        Assert.Equal(updatedAt, subscription.UpdatedAtUtc);
    }
}
