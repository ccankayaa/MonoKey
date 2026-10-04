using MonoKey.Application.Common;
using MonoKey.Domain.Devices;

namespace MonoKey.Application.Devices;

public sealed record RegisterDeviceCommand(string DeviceIdentifier, string Name, DevicePlatform Platform);

public sealed record DeviceDto(
    Guid Id,
    string DeviceIdentifier,
    string Name,
    DevicePlatform Platform,
    DateTimeOffset LastSeenAtUtc,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public interface IDeviceRepository
{
    Task<DeviceRecord?> GetByIdentifierAsync(string userId, string deviceIdentifier, CancellationToken cancellationToken);

    Task<DeviceRecord?> GetAsync(string userId, Guid id, CancellationToken cancellationToken);

    Task<IReadOnlyList<DeviceRecord>> ListAsync(string userId, CancellationToken cancellationToken);

    Task AddAsync(DeviceRecord device, CancellationToken cancellationToken);

    void Remove(DeviceRecord device);

    Task SaveChangesAsync(CancellationToken cancellationToken);
}

public interface IDeviceService
{
    Task<DeviceDto> RegisterAsync(RegisterDeviceCommand command, CancellationToken cancellationToken);

    Task<IReadOnlyList<DeviceDto>> ListAsync(CancellationToken cancellationToken);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
