using MonoKey.Domain.Common;

namespace MonoKey.Domain.Subscriptions;

public sealed class Subscription : AuditableEntity
{
    private Subscription()
    {
    }

    public Subscription(
        string userId,
        string name,
        decimal amount,
        string currencyCode,
        BillingIntervalUnit billingIntervalUnit,
        int billingIntervalCount,
        DateOnly nextRenewalDate)
    {
        UserId = RequireText(userId, nameof(userId), 128);
        SetDetails(name, amount, currencyCode, billingIntervalUnit, billingIntervalCount, nextRenewalDate);
        Status = SubscriptionStatus.Active;
        ConcurrencyToken = Guid.CreateVersion7();
    }

    public string? ProviderPlanLabel { get; private set; }
    public string? Category { get; private set; }
    public string? PaymentMethodLabel { get; private set; }
    public Guid? ClientRequestId { get; private set; }
    public void SetLabels(string? providerPlanLabel, string? category, string? paymentMethodLabel)
    {
        ProviderPlanLabel = NormalizeLabel(providerPlanLabel);
        Category = NormalizeLabel(category);
        PaymentMethodLabel = NormalizeLabel(paymentMethodLabel);
    }
    public void SetClientRequestId(Guid? requestId) => ClientRequestId = requestId;
    private static string? NormalizeLabel(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        if (value.Trim().Length > 100) throw new ArgumentException("Label cannot exceed 100 characters.");
        return value.Trim();
    }
    public string UserId { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public decimal Amount { get; private set; }

    public string CurrencyCode { get; private set; } = string.Empty;

    public int BillingIntervalCode { get; private set; }

    public BillingIntervalUnit BillingIntervalUnit { get; private set; }

    public int BillingIntervalCount { get; private set; }

    public DateOnly NextRenewalDate { get; private set; }

    public SubscriptionStatus Status { get; private set; }

    public Guid ConcurrencyToken { get; private set; }

    public void UpdateDetails(
        string name,
        decimal amount,
        string currencyCode,
        BillingIntervalUnit billingIntervalUnit,
        int billingIntervalCount,
        DateOnly nextRenewalDate)
    {
        EnsureNotCancelled();
        SetDetails(name, amount, currencyCode, billingIntervalUnit, billingIntervalCount, nextRenewalDate);
        ConcurrencyToken = Guid.CreateVersion7();
    }

    public void ChangeStatus(SubscriptionStatus status)
    {
        if (!Enum.IsDefined(status))
        {
            throw new ArgumentOutOfRangeException(nameof(status));
        }

        if (Status == SubscriptionStatus.Cancelled && status != SubscriptionStatus.Cancelled)
        {
            throw new InvalidOperationException("A cancelled subscription cannot be reactivated.");
        }

        if (Status != status)
        {
            Status = status;
            ConcurrencyToken = Guid.CreateVersion7();
        }
    }

    public decimal CalculateAnnualCost()
    {
        var cyclesPerYear = BillingIntervalUnit switch
        {
            BillingIntervalUnit.Day => 365m / BillingIntervalCount,
            BillingIntervalUnit.Week => 52m / BillingIntervalCount,
            BillingIntervalUnit.Month => 12m / BillingIntervalCount,
            BillingIntervalUnit.Year => 1m / BillingIntervalCount,
            _ => throw new InvalidOperationException("Unsupported billing interval unit."),
        };

        return Amount * cyclesPerYear;
    }

    public decimal CalculateMonthlyCost() => CalculateAnnualCost() / 12m;

    private void SetDetails(
        string name,
        decimal amount,
        string currencyCode,
        BillingIntervalUnit billingIntervalUnit,
        int billingIntervalCount,
        DateOnly nextRenewalDate)
    {
        Name = RequireText(name, nameof(name), 200);

        if (amount < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "Amount cannot be negative.");
        }

        if (billingIntervalCount <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(billingIntervalCount), "Billing interval count must be positive.");
        }

        if (!Enum.IsDefined(billingIntervalUnit))
        {
            throw new ArgumentOutOfRangeException(nameof(billingIntervalUnit));
        }

        var normalizedCurrencyCode = RequireText(currencyCode, nameof(currencyCode), 3).ToUpperInvariant();
        if (normalizedCurrencyCode.Length != 3 || normalizedCurrencyCode.Any(character => character is < 'A' or > 'Z'))
        {
            throw new ArgumentException("Currency code must contain exactly three ASCII letters.", nameof(currencyCode));
        }

        Amount = amount;
        CurrencyCode = normalizedCurrencyCode;
        BillingIntervalUnit = billingIntervalUnit;
        BillingIntervalCode = (int)billingIntervalUnit;
        BillingIntervalCount = billingIntervalCount;
        NextRenewalDate = nextRenewalDate;
    }

    private void EnsureNotCancelled()
    {
        if (Status == SubscriptionStatus.Cancelled)
        {
            throw new InvalidOperationException("A cancelled subscription cannot be changed.");
        }
    }

    private static string RequireText(string value, string parameterName, int maximumLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("Value is required.", parameterName);
        }

        var trimmed = value.Trim();
        if (trimmed.Length > maximumLength)
        {
            throw new ArgumentException($"Value cannot exceed {maximumLength} characters.", parameterName);
        }

        return trimmed;
    }
}
