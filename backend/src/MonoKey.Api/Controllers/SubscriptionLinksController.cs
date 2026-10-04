using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MonoKey.Application.Subscriptions;

namespace MonoKey.Api.Controllers;

[ApiController]
[Authorize]
[EnableRateLimiting("authenticated")]
[Route("api/subscriptions/{subscriptionId:guid}/vault-links")]
public sealed class SubscriptionLinksController(ISubscriptionLinkService service) : ControllerBase
{
    [HttpGet]
    public Task<IReadOnlyList<SubscriptionLinkDto>> List(Guid subscriptionId, CancellationToken cancellationToken) => service.ListAsync(subscriptionId, cancellationToken);
    [HttpPut("{recordId:guid}")]
    public async Task<IActionResult> Link(Guid subscriptionId, Guid recordId, LinkVaultRecordCommand command, CancellationToken cancellationToken)
    {
        await service.LinkAsync(subscriptionId, recordId, command, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{recordId:guid}")]
    public async Task<IActionResult> Unlink(Guid subscriptionId, Guid recordId, [FromQuery] Guid concurrencyToken, CancellationToken cancellationToken)
    {
        await service.UnlinkAsync(subscriptionId, recordId, concurrencyToken, cancellationToken);
        return NoContent();
    }
}
