using FluentValidation;
using MonoKey.Application.Common;
using MonoKey.Domain.Subscriptions;
using MonoKey.Application.Membership;

namespace MonoKey.Application.Subscriptions;

internal sealed class SubscriptionService(
    ISubscriptionRepository repository,
    IUserContext userContext,
    IValidator<CreateSubscriptionCommand> createValidator,
    IValidator<UpdateSubscriptionCommand> updateValidator,
    TimeProvider timeProvider,
    IMembershipService? membership = null) : ISubscriptionService
{
    private static string? CleanLabel(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    public async Task<SubscriptionDto> CreateAsync(
        CreateSubscriptionCommand command,
        CancellationToken cancellationToken)
    {
        await createValidator.ValidateAndThrowAsync(command, cancellationToken);
        if (command.ClientRequestId.HasValue)
        {
            var previous = await repository.GetByRequestIdAsync(userContext.UserId, command.ClientRequestId.Value, cancellationToken);
            if (previous is not null)
            {
                if (previous.Name != command.Name.Trim() || previous.Amount != command.Amount || previous.CurrencyCode != command.CurrencyCode.ToUpperInvariant() || previous.BillingIntervalUnit != command.BillingIntervalUnit || previous.BillingIntervalCount != command.BillingIntervalCount || previous.NextRenewalDate != command.NextRenewalDate || previous.ProviderPlanLabel != CleanLabel(command.ProviderPlanLabel) || previous.Category != CleanLabel(command.Category) || previous.PaymentMethodLabel != CleanLabel(command.PaymentMethodLabel))
                    throw new ConflictException("Request ID already belongs to a different subscription creation.");
                return Map(previous);
            }
        }
        if (membership is not null) await membership.EnsureCanCreateAsync(false, cancellationToken);

        var subscription = new Subscription(
            userContext.UserId,
            command.Name,
            command.Amount,
            command.CurrencyCode,
            command.BillingIntervalUnit,
            command.BillingIntervalCount,
            command.NextRenewalDate);

        subscription.SetLabels(command.ProviderPlanLabel, command.Category, command.PaymentMethodLabel);
        subscription.SetClientRequestId(command.ClientRequestId);
        await repository.AddAsync(subscription, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return Map(subscription);
    }

    public async Task<PagedResult<SubscriptionDto>> ListAsync(
        int page,
        int pageSize,
        SubscriptionStatus? status,
        CancellationToken cancellationToken)
    {
        if (page <= 0 || pageSize is <= 0 or > 100 || (status.HasValue && !Enum.IsDefined(status.Value)))
        {
            throw new ValidationException("Page, page size, or status is invalid.");
        }

        var (items, totalCount) = await repository.ListAsync(
            userContext.UserId,
            (page - 1) * pageSize,
            pageSize,
            status,
            cancellationToken);

        return new PagedResult<SubscriptionDto>(items.Select(Map).ToArray(), page, pageSize, totalCount);
    }

    public async Task<SubscriptionDto> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        var subscription = await FindOwnedAsync(id, false, cancellationToken);
        return Map(subscription);
    }

    public async Task<SubscriptionDto> UpdateAsync(
        Guid id,
        UpdateSubscriptionCommand command,
        CancellationToken cancellationToken)
    {
        await updateValidator.ValidateAndThrowAsync(command, cancellationToken);
        var subscription = await FindOwnedAsync(id, true, cancellationToken);
        EnsureConcurrencyToken(subscription, command.ConcurrencyToken);

        subscription.UpdateDetails(
            command.Name,
            command.Amount,
            command.CurrencyCode,
            command.BillingIntervalUnit,
            command.BillingIntervalCount,
            command.NextRenewalDate);
        subscription.SetLabels(command.ProviderPlanLabel, command.Category, command.PaymentMethodLabel);
        subscription.ChangeStatus(command.Status);

        await repository.SaveChangesAsync(cancellationToken);
        return Map(subscription);
    }

    public async Task DeleteAsync(Guid id, Guid concurrencyToken, CancellationToken cancellationToken)
    {
        if (concurrencyToken == Guid.Empty)
        {
            throw new ValidationException("A concurrency token is required.");
        }

        var subscription = await FindOwnedAsync(id, true, cancellationToken);
        EnsureConcurrencyToken(subscription, concurrencyToken);
        repository.Remove(subscription);
        await repository.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CostSummaryDto>> GetCostSummariesAsync(CancellationToken cancellationToken)
    {
        var subscriptions = await repository.ListActiveAsync(userContext.UserId, cancellationToken);
        return subscriptions
            .GroupBy(subscription => subscription.CurrencyCode, StringComparer.Ordinal)
            .OrderBy(group => group.Key, StringComparer.Ordinal)
            .Select(group => new CostSummaryDto(
                group.Key,
                decimal.Round(group.Sum(subscription => subscription.CalculateMonthlyCost()), 2),
                decimal.Round(group.Sum(subscription => subscription.CalculateAnnualCost()), 2)))
            .ToArray();
    }

    public async Task<IReadOnlyList<SubscriptionDto>> GetUpcomingRenewalsAsync(
        int days,
        CancellationToken cancellationToken)
    {
        if (days is < 0 or > 365)
        {
            throw new ValidationException("Days must be between 0 and 365.");
        }

        var from = DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime);
        var items = await repository.ListUpcomingAsync(userContext.UserId, from, from.AddDays(days), cancellationToken);
        return items.Select(Map).ToArray();
    }

    private async Task<Subscription> FindOwnedAsync(Guid id, bool trackChanges, CancellationToken cancellationToken)
    {
        return await repository.GetAsync(userContext.UserId, id, trackChanges, cancellationToken)
            ?? throw new NotFoundException("Subscription was not found.");
    }

    private static void EnsureConcurrencyToken(Subscription subscription, Guid concurrencyToken)
    {
        if (subscription.ConcurrencyToken != concurrencyToken)
        {
            throw new ConflictException("The subscription was changed by another request.");
        }
    }

    private static SubscriptionDto Map(Subscription subscription) => new(
        subscription.Id,
        subscription.Name,
        subscription.Amount,
        subscription.CurrencyCode,
        subscription.BillingIntervalCode,
        subscription.BillingIntervalUnit,
        subscription.BillingIntervalCount,
        subscription.NextRenewalDate,
        subscription.Status,
        subscription.ConcurrencyToken,
        subscription.CreatedAtUtc,
        subscription.UpdatedAtUtc, subscription.ProviderPlanLabel, subscription.Category, subscription.PaymentMethodLabel);
}
