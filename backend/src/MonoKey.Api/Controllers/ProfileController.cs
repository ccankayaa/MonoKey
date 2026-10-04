using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MonoKey.Application.Profiles;
using MonoKey.Application.Common;

namespace MonoKey.Api.Controllers;

[ApiController]
[Authorize]
[EnableRateLimiting("authenticated")]
[Route("api/profile")]
public sealed class ProfileController(IUserProfileService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<UserProfileDto>> Get(CancellationToken cancellationToken)
    {
        try { return Ok(await service.GetAsync(cancellationToken)); }
        catch (NotFoundException) { return NoContent(); }
    }

    [HttpPut]
    public async Task<ActionResult<UserProfileDto>> Upsert(
        UpdateUserProfileRequest request,
        CancellationToken cancellationToken) =>
        Ok(await service.UpsertAsync(new UpdateUserProfileCommand(request.DisplayName), cancellationToken));
}

public sealed record UpdateUserProfileRequest(string? DisplayName);
