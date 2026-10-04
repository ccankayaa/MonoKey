using MonoKey.Application.Common;
using MonoKey.Domain.Subscriptions;

namespace MonoKey.Application.Subscriptions;

public sealed record CreateSubscriptionCommand(
    string Name,
    decimal Amount,
    string CurrencyCode,
    BillingIntervalUnit BillingIntervalUnit,
    int BillingIntervalCount,
    DateOnly NextRenewalDate,
    string? ProviderPlanLabel = null, string? Category = null, string? PaymentMethodLabel = null, Guid? ClientRequestId = null);

public sealed record UpdateSubscriptionCommand(
    string Name,
    decimal Amount,
    string CurrencyCode,
    BillingIntervalUnit BillingIntervalUnit,
    int BillingIntervalCount,
    DateOnly NextRenewalDate,
    SubscriptionStatus Status,
    Guid ConcurrencyToken,
    string? ProviderPlanLabel = null, string? Category = null, string? PaymentMethodLabel = null);

public sealed record SubscriptionDto(
    Guid Id,
    string Name,
    decimal Amount,
    string CurrencyCode,
    int BillingIntervalCode,
    BillingIntervalUnit BillingIntervalUnit,
    int BillingIntervalCount,
    DateOnly NextRenewalDate,
    SubscriptionStatus Status,
    Guid ConcurrencyToken,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc,
    string? ProviderPlanLabel, string? Category, string? PaymentMethodLabel);

public sealed record CostSummaryDto(string CurrencyCode, decimal MonthlyCost, decimal YearlyCost);

public interface ISubscriptionService
{
    Task<SubscriptionDto> CreateAsync(CreateSubscriptionCommand command, CancellationToken cancellationToken);

    Task<PagedResult<SubscriptionDto>> ListAsync(
        int page,
        int pageSize,
        SubscriptionStatus? status,
        CancellationToken cancellationToken);

    Task<SubscriptionDto> GetAsync(Guid id, CancellationToken cancellationToken);

    Task<SubscriptionDto> UpdateAsync(Guid id, UpdateSubscriptionCommand command, CancellationToken cancellationToken);

    Task DeleteAsync(Guid id, Guid concurrencyToken, CancellationToken cancellationToken);

    Task<IReadOnlyList<CostSummaryDto>> GetCostSummariesAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<SubscriptionDto>> GetUpcomingRenewalsAsync(int days, CancellationToken cancellationToken);
}
