using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MonoKey.Domain.Vault;

namespace MonoKey.Infrastructure.Persistence.Configurations;

internal sealed class VaultKeyEnvelopeConfiguration : IEntityTypeConfiguration<VaultKeyEnvelope>
{
    public void Configure(EntityTypeBuilder<VaultKeyEnvelope> builder)
    {
        builder.ToTable("vault_key_envelopes", table =>
        {
            table.HasCheckConstraint("ck_vault_key_envelopes_format", "\"FormatVersion\" = 1");
            table.HasCheckConstraint("ck_vault_key_envelopes_revision", "\"Revision\" > 0");
            table.HasCheckConstraint(
                "ck_vault_key_envelopes_kdf_memory",
                "\"KdfMemoryKiB\" >= 32768 AND \"KdfMemoryKiB\" <= 262144");
            table.HasCheckConstraint(
                "ck_vault_key_envelopes_kdf_iterations",
                "\"KdfIterations\" >= 2 AND \"KdfIterations\" <= 10");
            table.HasCheckConstraint(
                "ck_vault_key_envelopes_kdf_parallelism",
                "\"KdfParallelism\" >= 1 AND \"KdfParallelism\" <= 4");
        });
        builder.HasKey(envelope => envelope.Id);
        builder.Property(envelope => envelope.Id).ValueGeneratedNever();
        builder.Property(envelope => envelope.UserId).HasMaxLength(128).IsRequired();
        builder.Property(envelope => envelope.KdfAlgorithm).HasMaxLength(32).IsRequired();
        builder.Property(envelope => envelope.Salt).HasColumnType("bytea").IsRequired();
        builder.Property(envelope => envelope.EncryptionAlgorithm).HasMaxLength(64).IsRequired();
        builder.Property(envelope => envelope.MasterWrapNonce).HasColumnType("bytea").IsRequired();
        builder.Property(envelope => envelope.MasterWrappedKey).HasColumnType("bytea").IsRequired();
        builder.Property(envelope => envelope.RecoveryWrapNonce).HasColumnType("bytea").IsRequired();
        builder.Property(envelope => envelope.RecoveryWrappedKey).HasColumnType("bytea").IsRequired();
        builder.Property(envelope => envelope.ConcurrencyToken).IsConcurrencyToken();
        builder.Property(envelope => envelope.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(envelope => envelope.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(envelope => envelope.UserId).IsUnique();
    }
}
