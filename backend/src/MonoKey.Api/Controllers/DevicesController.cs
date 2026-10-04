using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MonoKey.Application.Devices;
using MonoKey.Domain.Devices;

namespace MonoKey.Api.Controllers;

[ApiController]
[Authorize]
[EnableRateLimiting("authenticated")]
[Route("api/devices")]
public sealed class DevicesController(IDeviceService service) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<DeviceDto>> Register(
        RegisterDeviceRequest request,
        CancellationToken cancellationToken) =>
        Ok(await service.RegisterAsync(
            new RegisterDeviceCommand(request.DeviceIdentifier, request.Name, request.Platform),
            cancellationToken));

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DeviceDto>>> List(CancellationToken cancellationToken) =>
        Ok(await service.ListAsync(cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await service.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}

public sealed record RegisterDeviceRequest(string DeviceIdentifier, string Name, DevicePlatform Platform);
