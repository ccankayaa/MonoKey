using MonoKey.Domain.Common;

namespace MonoKey.Domain.Notifications;

public sealed class NotificationPreference : AuditableEntity
{
    private NotificationPreference()
    {
    }

    public NotificationPreference(string userId, bool renewalRemindersEnabled, int daysBeforeRenewal)
    {
        if (string.IsNullOrWhiteSpace(userId) || userId.Length > 128)
        {
            throw new ArgumentException("A valid user identifier is required.", nameof(userId));
        }

        UserId = userId;
        Update(renewalRemindersEnabled, daysBeforeRenewal);
    }

    public string UserId { get; private set; } = string.Empty;

    public bool RenewalRemindersEnabled { get; private set; }

    public int DaysBeforeRenewal { get; private set; }

    public void Update(bool renewalRemindersEnabled, int daysBeforeRenewal)
    {
        if (daysBeforeRenewal is < 0 or > 365)
        {
            throw new ArgumentOutOfRangeException(nameof(daysBeforeRenewal), "Days before renewal must be between 0 and 365.");
        }

        RenewalRemindersEnabled = renewalRemindersEnabled;
        DaysBeforeRenewal = daysBeforeRenewal;
    }
}
