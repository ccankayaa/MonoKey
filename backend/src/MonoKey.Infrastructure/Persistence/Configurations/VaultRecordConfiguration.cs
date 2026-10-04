using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MonoKey.Domain.Vault;

namespace MonoKey.Infrastructure.Persistence.Configurations;

internal sealed class VaultRecordConfiguration : IEntityTypeConfiguration<VaultRecord>
{
    public void Configure(EntityTypeBuilder<VaultRecord> builder)
    {
        builder.ToTable("vault_records", table =>
        {
            table.HasCheckConstraint("ck_vault_records_format", "\"FormatVersion\" = 1");
            table.HasCheckConstraint("ck_vault_records_revision", "\"Revision\" > 0");
            table.HasCheckConstraint(
                "ck_vault_records_payload",
                "(\"IsDeleted\" AND octet_length(\"Nonce\") = 0 AND octet_length(\"Ciphertext\") = 0) OR " +
                "(NOT \"IsDeleted\" AND octet_length(\"Nonce\") = 24 AND octet_length(\"Ciphertext\") BETWEEN 16 AND 262160)");
        });
        builder.HasKey(record => record.Id);
        builder.Property(record => record.Id).ValueGeneratedNever();
        builder.Property(record => record.UserId).HasMaxLength(128).IsRequired();
        builder.Property(record => record.EncryptionAlgorithm).HasMaxLength(64).IsRequired();
        builder.Property(record => record.Nonce).HasColumnType("bytea").IsRequired();
        builder.Property(record => record.Ciphertext).HasColumnType("bytea").IsRequired();
        builder.Property(record => record.ConcurrencyToken).IsConcurrencyToken();
        builder.Property(record => record.CreatedAtUtc).HasColumnType("timestamp with time zone");
        builder.Property(record => record.UpdatedAtUtc).HasColumnType("timestamp with time zone");
        builder.HasIndex(record => new { record.UserId, record.UpdatedAtUtc });
    }
}
