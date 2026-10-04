using MonoKey.Application.Common;
using MonoKey.Domain.Notifications;

namespace MonoKey.Application.Notifications;

public sealed record UpdateNotificationPreferenceCommand(bool RenewalRemindersEnabled, int DaysBeforeRenewal);

public sealed record NotificationPreferenceDto(
    Guid Id,
    bool RenewalRemindersEnabled,
    int DaysBeforeRenewal,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public interface INotificationPreferenceRepository
{
    Task<NotificationPreference?> GetAsync(string userId, CancellationToken cancellationToken);

    Task AddAsync(NotificationPreference preference, CancellationToken cancellationToken);

    Task SaveChangesAsync(CancellationToken cancellationToken);
}

public interface INotificationPreferenceService
{
    Task<NotificationPreferenceDto> GetAsync(CancellationToken cancellationToken);

    Task<NotificationPreferenceDto> UpsertAsync(
        UpdateNotificationPreferenceCommand command,
        CancellationToken cancellationToken);
}
