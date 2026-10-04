using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MonoKey.Domain.Devices;

namespace MonoKey.Infrastructure.Persistence.Configurations;

internal sealed class DeviceRecordConfiguration : IEntityTypeConfiguration<DeviceRecord>
{
    public void Configure(EntityTypeBuilder<DeviceRecord> builder)
    {
        builder.ToTable("devices", table =>
            table.HasCheckConstraint("ck_devices_platform", "\"Platform\" >= 1 AND \"Platform\" <= 6"));
        builder.HasKey(device => device.Id);
        builder.Property(device => device.Id).ValueGeneratedNever();
        builder.Property(device => device.UserId).HasMaxLength(128).IsRequired();
        builder.Property(device => device.DeviceIdentifier).HasMaxLength(200).IsRequired();
        builder.Property(device => device.Name).HasMaxLength(100).IsRequired();
        builder.Property(device => device.Platform).HasConversion<int>().IsRequired();
        builder.Property(device => device.LastSeenAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(device => device.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(device => device.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(device => new { device.UserId, device.DeviceIdentifier }).IsUnique();
    }
}
