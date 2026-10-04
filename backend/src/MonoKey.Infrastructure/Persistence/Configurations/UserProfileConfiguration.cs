using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MonoKey.Domain.Profiles;

namespace MonoKey.Infrastructure.Persistence.Configurations;

internal sealed class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.ToTable("user_profiles");
        builder.HasKey(profile => profile.Id);
        builder.Property(profile => profile.Id).ValueGeneratedNever();
        builder.Property(profile => profile.UserId).HasMaxLength(128).IsRequired();
        builder.Property(profile => profile.DisplayName).HasMaxLength(200);
        builder.Property(profile => profile.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(profile => profile.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(profile => profile.UserId).IsUnique();
    }
}
