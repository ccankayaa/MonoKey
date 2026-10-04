using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MonoKey.Application.Common;
using MonoKey.Application.Subscriptions;
using MonoKey.Domain.Subscriptions;

namespace MonoKey.Api.Controllers;

[ApiController]
[Authorize]
[EnableRateLimiting("authenticated")]
[Route("api/subscriptions")]
public sealed class SubscriptionsController(ISubscriptionService service) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<SubscriptionDto>> Create(
        CreateSubscriptionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(request.ToCommand(), cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<SubscriptionDto>>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] SubscriptionStatus? status = null,
        CancellationToken cancellationToken = default) =>
        Ok(await service.ListAsync(page, pageSize, status, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SubscriptionDto>> GetById(Guid id, CancellationToken cancellationToken) =>
        Ok(await service.GetAsync(id, cancellationToken));

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SubscriptionDto>> Update(
        Guid id,
        UpdateSubscriptionRequest request,
        CancellationToken cancellationToken) =>
        Ok(await service.UpdateAsync(id, request.ToCommand(), cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        [FromQuery] Guid concurrencyToken,
        CancellationToken cancellationToken)
    {
        await service.DeleteAsync(id, concurrencyToken, cancellationToken);
        return NoContent();
    }

    [HttpGet("cost-summary")]
    public async Task<ActionResult<IReadOnlyList<CostSummaryDto>>> GetCostSummary(
        CancellationToken cancellationToken) =>
        Ok(await service.GetCostSummariesAsync(cancellationToken));

    [HttpGet("upcoming")]
    public async Task<ActionResult<IReadOnlyList<SubscriptionDto>>> GetUpcoming(
        [FromQuery] int days = 30,
        CancellationToken cancellationToken = default) =>
        Ok(await service.GetUpcomingRenewalsAsync(days, cancellationToken));
}

public sealed record CreateSubscriptionRequest(
    string Name,
    decimal Amount,
    string CurrencyCode,
    BillingIntervalUnit BillingIntervalUnit,
    int BillingIntervalCount,
    DateOnly NextRenewalDate,
    string? ProviderPlanLabel = null, string? Category = null, string? PaymentMethodLabel = null, Guid? ClientRequestId = null)
{
    public CreateSubscriptionCommand ToCommand() => new(
        Name,
        Amount,
        CurrencyCode,
        BillingIntervalUnit,
        BillingIntervalCount,
        NextRenewalDate, ProviderPlanLabel, Category, PaymentMethodLabel, ClientRequestId);
}

public sealed record UpdateSubscriptionRequest(
    string Name,
    decimal Amount,
    string CurrencyCode,
    BillingIntervalUnit BillingIntervalUnit,
    int BillingIntervalCount,
    DateOnly NextRenewalDate,
    SubscriptionStatus Status,
    Guid ConcurrencyToken,
    string? ProviderPlanLabel = null, string? Category = null, string? PaymentMethodLabel = null)
{
    public UpdateSubscriptionCommand ToCommand() => new(
        Name,
        Amount,
        CurrencyCode,
        BillingIntervalUnit,
        BillingIntervalCount,
        NextRenewalDate,
        Status,
        ConcurrencyToken, ProviderPlanLabel, Category, PaymentMethodLabel);
}
