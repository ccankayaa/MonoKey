using Microsoft.EntityFrameworkCore;
using MonoKey.Application.Notifications;
using MonoKey.Domain.Notifications;

namespace MonoKey.Infrastructure.Persistence.Repositories;

internal sealed class NotificationPreferenceRepository(MonoKeyDbContext context) : INotificationPreferenceRepository
{
    public Task<NotificationPreference?> GetAsync(string userId, CancellationToken cancellationToken) =>
        context.NotificationPreferences.SingleOrDefaultAsync(
            preference => preference.UserId == userId,
            cancellationToken);

    public Task AddAsync(NotificationPreference preference, CancellationToken cancellationToken) =>
        context.NotificationPreferences.AddAsync(preference, cancellationToken).AsTask();

    public Task SaveChangesAsync(CancellationToken cancellationToken) => context.SaveChangesAsync(cancellationToken);
}
