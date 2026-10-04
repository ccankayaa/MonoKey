using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MonoKey.Application.Membership;

namespace MonoKey.Api.Controllers;

[ApiController]
[Route("api/membership")]
[Authorize]
[EnableRateLimiting("authenticated")]
public sealed class MembershipController(IMembershipService service, IMobileMembershipService mobile) : ControllerBase
{
    [HttpGet]
    public Task<MembershipDto> Get(CancellationToken cancellationToken) => service.GetAsync(cancellationToken);
    [HttpGet("plans")]
    public IReadOnlyList<PlanDto> Plans() => service.GetPlans();
    [HttpPost("checkout")]
    public Task<CheckoutDto> Checkout(CancellationToken cancellationToken) => service.CheckoutAsync(cancellationToken);
    [HttpPost("mobile-account")]
    public async Task<IActionResult> RegisterMobileAccount(CancellationToken cancellationToken)
    {
        await mobile.RegisterAccountAsync(cancellationToken);
        return NoContent();
    }
    [AllowAnonymous]
    [HttpPost("revenuecat-webhook")]
    [RequestSizeLimit(65_536)]
    public async Task<IActionResult> MobileWebhook(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body);
        await mobile.AcceptWebhookAsync(await reader.ReadToEndAsync(cancellationToken), Request.Headers.Authorization.ToString(), cancellationToken);
        return NoContent();
    }
    [AllowAnonymous]
    [HttpPost("stripe-webhook")]
    [RequestSizeLimit(65_536)]
    public async Task<IActionResult> StripeWebhook(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body);
        var body = await reader.ReadToEndAsync(cancellationToken);
        await service.AcceptStripeEventAsync(body, Request.Headers["Stripe-Signature"].ToString(), cancellationToken);
        return NoContent();
    }
}
