using FluentValidation;
using MonoKey.Application.Common;
using MonoKey.Domain.Notifications;

namespace MonoKey.Application.Notifications;

public sealed class UpdateNotificationPreferenceCommandValidator : AbstractValidator<UpdateNotificationPreferenceCommand>
{
    public UpdateNotificationPreferenceCommandValidator()
    {
        RuleFor(command => command.DaysBeforeRenewal).InclusiveBetween(0, 365);
    }
}

internal sealed class NotificationPreferenceService(
    INotificationPreferenceRepository repository,
    IUserContext userContext,
    IValidator<UpdateNotificationPreferenceCommand> validator) : INotificationPreferenceService
{
    public async Task<NotificationPreferenceDto> GetAsync(CancellationToken cancellationToken)
    {
        var preference = await repository.GetAsync(userContext.UserId, cancellationToken)
            ?? throw new NotFoundException("Notification preference was not found.");
        return Map(preference);
    }

    public async Task<NotificationPreferenceDto> UpsertAsync(
        UpdateNotificationPreferenceCommand command,
        CancellationToken cancellationToken)
    {
        await validator.ValidateAndThrowAsync(command, cancellationToken);
        var preference = await repository.GetAsync(userContext.UserId, cancellationToken);
        if (preference is null)
        {
            preference = new NotificationPreference(
                userContext.UserId,
                command.RenewalRemindersEnabled,
                command.DaysBeforeRenewal);
            await repository.AddAsync(preference, cancellationToken);
        }
        else
        {
            preference.Update(command.RenewalRemindersEnabled, command.DaysBeforeRenewal);
        }

        await repository.SaveChangesAsync(cancellationToken);
        return Map(preference);
    }

    private static NotificationPreferenceDto Map(NotificationPreference preference) => new(
        preference.Id,
        preference.RenewalRemindersEnabled,
        preference.DaysBeforeRenewal,
        preference.CreatedAtUtc,
        preference.UpdatedAtUtc);
}
