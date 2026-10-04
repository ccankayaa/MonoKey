using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MonoKey.Domain.Subscriptions;

namespace MonoKey.Infrastructure.Persistence.Configurations;

internal sealed class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("subscriptions", table =>
        {
            table.HasCheckConstraint("ck_subscriptions_amount", "\"Amount\" >= 0");
            table.HasCheckConstraint("ck_subscriptions_interval_count", "\"BillingIntervalCount\" > 0");
            table.HasCheckConstraint(
                "ck_subscriptions_interval_code",
                "\"BillingIntervalCode\" = \"BillingIntervalUnit\"");
            table.HasCheckConstraint(
                "ck_subscriptions_interval_unit",
                "\"BillingIntervalUnit\" >= 1 AND \"BillingIntervalUnit\" <= 4");
            table.HasCheckConstraint(
                "ck_subscriptions_status",
                "\"Status\" >= 1 AND \"Status\" <= 3");
            table.HasCheckConstraint(
                "ck_subscriptions_currency_code",
                "\"CurrencyCode\" ~ '^[A-Z]{3}$'");
        });
        builder.Property(item => item.ProviderPlanLabel).HasMaxLength(100);
        builder.Property(item => item.Category).HasMaxLength(100);
        builder.Property(item => item.PaymentMethodLabel).HasMaxLength(100);
        builder.HasIndex(item => new { item.UserId, item.ClientRequestId }).IsUnique();
        builder.HasKey(subscription => subscription.Id);
        builder.Property(subscription => subscription.Id).ValueGeneratedNever();
        builder.Property(subscription => subscription.UserId).HasMaxLength(128).IsRequired();
        builder.Property(subscription => subscription.Name).HasMaxLength(200).IsRequired();
        builder.Property(subscription => subscription.Amount).HasPrecision(18, 2);
        builder.Property(subscription => subscription.CurrencyCode).HasMaxLength(3).IsFixedLength().IsRequired();
        builder.Property(subscription => subscription.BillingIntervalCode).IsRequired();
        builder.Property(subscription => subscription.BillingIntervalUnit).HasConversion<int>().IsRequired();
        builder.Property(subscription => subscription.BillingIntervalCount).IsRequired();
        builder.Property(subscription => subscription.NextRenewalDate).HasColumnType("date");
        builder.Property(subscription => subscription.Status).HasConversion<int>().IsRequired();
        builder.Property(subscription => subscription.ConcurrencyToken).IsConcurrencyToken();
        builder.Property(subscription => subscription.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(subscription => subscription.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(subscription => new { subscription.UserId, subscription.NextRenewalDate });
        builder.HasIndex(subscription => new { subscription.UserId, subscription.Status });
    }
}
