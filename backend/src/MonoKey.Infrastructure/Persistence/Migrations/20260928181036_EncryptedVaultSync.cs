using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonoKey.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class EncryptedVaultSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "vault_key_envelopes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    FormatVersion = table.Column<int>(type: "integer", nullable: false),
                    KdfAlgorithm = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    KdfMemoryKiB = table.Column<int>(type: "integer", nullable: false),
                    KdfIterations = table.Column<int>(type: "integer", nullable: false),
                    KdfParallelism = table.Column<int>(type: "integer", nullable: false),
                    Salt = table.Column<byte[]>(type: "bytea", nullable: false),
                    EncryptionAlgorithm = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    MasterWrapNonce = table.Column<byte[]>(type: "bytea", nullable: false),
                    MasterWrappedKey = table.Column<byte[]>(type: "bytea", nullable: false),
                    RecoveryWrapNonce = table.Column<byte[]>(type: "bytea", nullable: false),
                    RecoveryWrappedKey = table.Column<byte[]>(type: "bytea", nullable: false),
                    Revision = table.Column<long>(type: "bigint", nullable: false),
                    ConcurrencyToken = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vault_key_envelopes", x => x.Id);
                    table.CheckConstraint("ck_vault_key_envelopes_format", "\"FormatVersion\" = 1");
                    table.CheckConstraint("ck_vault_key_envelopes_kdf_iterations", "\"KdfIterations\" >= 2 AND \"KdfIterations\" <= 10");
                    table.CheckConstraint("ck_vault_key_envelopes_kdf_memory", "\"KdfMemoryKiB\" >= 32768 AND \"KdfMemoryKiB\" <= 262144");
                    table.CheckConstraint("ck_vault_key_envelopes_kdf_parallelism", "\"KdfParallelism\" >= 1 AND \"KdfParallelism\" <= 4");
                    table.CheckConstraint("ck_vault_key_envelopes_revision", "\"Revision\" > 0");
                });

            migrationBuilder.CreateTable(
                name: "vault_records",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    FormatVersion = table.Column<int>(type: "integer", nullable: false),
                    EncryptionAlgorithm = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Nonce = table.Column<byte[]>(type: "bytea", nullable: false),
                    Ciphertext = table.Column<byte[]>(type: "bytea", nullable: false),
                    Revision = table.Column<long>(type: "bigint", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    ConcurrencyToken = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vault_records", x => x.Id);
                    table.CheckConstraint("ck_vault_records_format", "\"FormatVersion\" = 1");
                    table.CheckConstraint("ck_vault_records_payload", "(\"IsDeleted\" AND octet_length(\"Nonce\") = 0 AND octet_length(\"Ciphertext\") = 0) OR (NOT \"IsDeleted\" AND octet_length(\"Nonce\") = 24 AND octet_length(\"Ciphertext\") BETWEEN 16 AND 262160)");
                    table.CheckConstraint("ck_vault_records_revision", "\"Revision\" > 0");
                });

            migrationBuilder.CreateIndex(
                name: "IX_vault_key_envelopes_UserId",
                table: "vault_key_envelopes",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_vault_records_UserId_UpdatedAtUtc",
                table: "vault_records",
                columns: new[] { "UserId", "UpdatedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "vault_key_envelopes");

            migrationBuilder.DropTable(
                name: "vault_records");
        }
    }
}
