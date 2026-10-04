using Microsoft.EntityFrameworkCore;
using MonoKey.Application.Devices;
using MonoKey.Domain.Devices;

namespace MonoKey.Infrastructure.Persistence.Repositories;

internal sealed class DeviceRepository(MonoKeyDbContext context) : IDeviceRepository
{
    public Task<DeviceRecord?> GetByIdentifierAsync(
        string userId,
        string deviceIdentifier,
        CancellationToken cancellationToken) =>
        context.Devices.SingleOrDefaultAsync(
            device => device.UserId == userId && device.DeviceIdentifier == deviceIdentifier,
            cancellationToken);

    public Task<DeviceRecord?> GetAsync(string userId, Guid id, CancellationToken cancellationToken) =>
        context.Devices.SingleOrDefaultAsync(
            device => device.UserId == userId && device.Id == id,
            cancellationToken);

    public async Task<IReadOnlyList<DeviceRecord>> ListAsync(
        string userId,
        CancellationToken cancellationToken) =>
        await context.Devices
            .AsNoTracking()
            .Where(device => device.UserId == userId)
            .OrderByDescending(device => device.LastSeenAtUtc)
            .ThenBy(device => device.Id)
            .ToListAsync(cancellationToken);

    public Task AddAsync(DeviceRecord device, CancellationToken cancellationToken) =>
        context.Devices.AddAsync(device, cancellationToken).AsTask();

    public void Remove(DeviceRecord device) => context.Devices.Remove(device);

    public Task SaveChangesAsync(CancellationToken cancellationToken) => context.SaveChangesAsync(cancellationToken);
}
