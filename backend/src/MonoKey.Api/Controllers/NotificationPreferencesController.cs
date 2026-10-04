using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MonoKey.Application.Notifications;

namespace MonoKey.Api.Controllers;

[ApiController]
[Authorize]
[EnableRateLimiting("authenticated")]
[Route("api/notification-preferences")]
public sealed class NotificationPreferencesController(INotificationPreferenceService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<NotificationPreferenceDto>> Get(CancellationToken cancellationToken) =>
        Ok(await service.GetAsync(cancellationToken));

    [HttpPut]
    public async Task<ActionResult<NotificationPreferenceDto>> Upsert(
        UpdateNotificationPreferenceRequest request,
        CancellationToken cancellationToken) =>
        Ok(await service.UpsertAsync(
            new UpdateNotificationPreferenceCommand(
                request.RenewalRemindersEnabled,
                request.DaysBeforeRenewal),
            cancellationToken));
}

public sealed record UpdateNotificationPreferenceRequest(bool RenewalRemindersEnabled, int DaysBeforeRenewal);
