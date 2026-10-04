using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MonoKey.Domain.Notifications;

namespace MonoKey.Infrastructure.Persistence.Configurations;

internal sealed class NotificationPreferenceConfiguration : IEntityTypeConfiguration<NotificationPreference>
{
    public void Configure(EntityTypeBuilder<NotificationPreference> builder)
    {
        builder.ToTable("notification_preferences", table =>
            table.HasCheckConstraint(
                "ck_notification_preferences_days_before",
                "\"DaysBeforeRenewal\" >= 0 AND \"DaysBeforeRenewal\" <= 365"));
        builder.HasKey(preference => preference.Id);
        builder.Property(preference => preference.Id).ValueGeneratedNever();
        builder.Property(preference => preference.UserId).HasMaxLength(128).IsRequired();
        builder.Property(preference => preference.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(preference => preference.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(preference => preference.UserId).IsUnique();
    }
}
