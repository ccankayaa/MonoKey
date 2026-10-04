using FluentValidation;
using MonoKey.Application.Common;
using MonoKey.Domain.Devices;

namespace MonoKey.Application.Devices;

public sealed class RegisterDeviceCommandValidator : AbstractValidator<RegisterDeviceCommand>
{
    public RegisterDeviceCommandValidator()
    {
        RuleFor(command => command.DeviceIdentifier).NotEmpty().MaximumLength(200);
        RuleFor(command => command.Name).NotEmpty().MaximumLength(100);
        RuleFor(command => command.Platform).IsInEnum();
    }
}

internal sealed class DeviceService(
    IDeviceRepository repository,
    IUserContext userContext,
    IValidator<RegisterDeviceCommand> validator,
    TimeProvider timeProvider) : IDeviceService
{
    public async Task<DeviceDto> RegisterAsync(RegisterDeviceCommand command, CancellationToken cancellationToken)
    {
        await validator.ValidateAndThrowAsync(command, cancellationToken);
        var now = timeProvider.GetUtcNow();
        var device = await repository.GetByIdentifierAsync(userContext.UserId, command.DeviceIdentifier, cancellationToken);
        if (device is null)
        {
            device = new DeviceRecord(userContext.UserId, command.DeviceIdentifier, command.Name, command.Platform, now);
            await repository.AddAsync(device, cancellationToken);
        }
        else
        {
            device.Update(command.Name, command.Platform, now);
        }

        await repository.SaveChangesAsync(cancellationToken);
        return Map(device);
    }

    public async Task<IReadOnlyList<DeviceDto>> ListAsync(CancellationToken cancellationToken)
    {
        var devices = await repository.ListAsync(userContext.UserId, cancellationToken);
        return devices.Select(Map).ToArray();
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var device = await repository.GetAsync(userContext.UserId, id, cancellationToken)
            ?? throw new NotFoundException("Device was not found.");
        repository.Remove(device);
        await repository.SaveChangesAsync(cancellationToken);
    }

    private static DeviceDto Map(DeviceRecord device) => new(
        device.Id,
        device.DeviceIdentifier,
        device.Name,
        device.Platform,
        device.LastSeenAtUtc,
        device.CreatedAtUtc,
        device.UpdatedAtUtc);
}
