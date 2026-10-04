using MonoKey.Domain.Subscriptions;

namespace MonoKey.UnitTests.Subscriptions;

public sealed class SubscriptionTests
{
    [Fact]
    public void Constructor_GeneratesIdentityAndNormalizesValues()
    {
        var subscription = CreateSubscription(currencyCode: " usd ");

        Assert.NotEqual(Guid.Empty, subscription.Id);
        Assert.NotEqual(Guid.Empty, subscription.ConcurrencyToken);
        Assert.Equal("USD", subscription.CurrencyCode);
        Assert.Equal((int)BillingIntervalUnit.Month, subscription.BillingIntervalCode);
        Assert.Equal(SubscriptionStatus.Active, subscription.Status);
    }

    [Fact]
    public void Constructor_RejectsNegativeAmount()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => CreateSubscription(amount: -0.01m));
    }

    [Theory]
    [InlineData(BillingIntervalUnit.Day, 1, 365)]
    [InlineData(BillingIntervalUnit.Week, 1, 52)]
    [InlineData(BillingIntervalUnit.Month, 1, 12)]
    [InlineData(BillingIntervalUnit.Year, 1, 1)]
    public void CalculateAnnualCost_UsesStableIntervalFactors(
        BillingIntervalUnit unit,
        int count,
        int expectedCycles)
    {
        var subscription = CreateSubscription(amount: 10m, unit: unit, count: count);

        Assert.Equal(10m * expectedCycles, subscription.CalculateAnnualCost());
    }

    [Fact]
    public void ChangeStatus_CancelledSubscriptionCannotBeReactivated()
    {
        var subscription = CreateSubscription();
        subscription.ChangeStatus(SubscriptionStatus.Cancelled);

        Assert.Throws<InvalidOperationException>(() => subscription.ChangeStatus(SubscriptionStatus.Active));
    }

    private static Subscription CreateSubscription(
        decimal amount = 10m,
        string currencyCode = "USD",
        BillingIntervalUnit unit = BillingIntervalUnit.Month,
        int count = 1) =>
        new(
            "user-1",
            "Example",
            amount,
            currencyCode,
            unit,
            count,
            new DateOnly(2030, 1, 1));
}
