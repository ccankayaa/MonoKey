using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonoKey.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MonoKeySchemaAndMembership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "monokey");

            migrationBuilder.RenameTable(
                name: "vault_records",
                newName: "vault_records",
                newSchema: "monokey");

            migrationBuilder.RenameTable(
                name: "vault_key_envelopes",
                newName: "vault_key_envelopes",
                newSchema: "monokey");

            migrationBuilder.RenameTable(
                name: "user_profiles",
                newName: "user_profiles",
                newSchema: "monokey");

            migrationBuilder.RenameTable(
                name: "subscriptions",
                newName: "subscriptions",
                newSchema: "monokey");

            migrationBuilder.RenameTable(
                name: "notification_preferences",
                newName: "notification_preferences",
                newSchema: "monokey");

            migrationBuilder.RenameTable(
                name: "devices",
                newName: "devices",
                newSchema: "monokey");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_vault_records_Id_UserId",
                schema: "monokey",
                table: "vault_records",
                columns: new[] { "Id", "UserId" });

            migrationBuilder.AddUniqueConstraint(
                name: "AK_subscriptions_Id_UserId",
                schema: "monokey",
                table: "subscriptions",
                columns: new[] { "Id", "UserId" });

            migrationBuilder.CreateTable(
                name: "account_memberships",
                schema: "monokey",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    Provider = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: true),
                    CustomerReference = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    ValidUntilUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LastProviderEventUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_account_memberships", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "subscription_vault_links",
                schema: "monokey",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    SubscriptionId = table.Column<Guid>(type: "uuid", nullable: false),
                    VaultRecordId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_subscription_vault_links", x => x.Id);
                    table.ForeignKey(
                        name: "FK_subscription_vault_links_subscriptions_SubscriptionId_UserId",
                        columns: x => new { x.SubscriptionId, x.UserId },
                        principalSchema: "monokey",
                        principalTable: "subscriptions",
                        principalColumns: new[] { "Id", "UserId" },
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_subscription_vault_links_vault_records_VaultRecordId_UserId",
                        columns: x => new { x.VaultRecordId, x.UserId },
                        principalSchema: "monokey",
                        principalTable: "vault_records",
                        principalColumns: new[] { "Id", "UserId" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "billing_events",
                schema: "monokey",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Provider = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    ExternalId = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    MembershipId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_billing_events", x => x.Id);
                    table.ForeignKey(
                        name: "FK_billing_events_account_memberships_MembershipId",
                        column: x => x.MembershipId,
                        principalSchema: "monokey",
                        principalTable: "account_memberships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_account_memberships_Provider_CustomerReference",
                schema: "monokey",
                table: "account_memberships",
                columns: new[] { "Provider", "CustomerReference" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_account_memberships_UserId",
                schema: "monokey",
                table: "account_memberships",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_billing_events_MembershipId",
                schema: "monokey",
                table: "billing_events",
                column: "MembershipId");

            migrationBuilder.CreateIndex(
                name: "IX_billing_events_Provider_ExternalId",
                schema: "monokey",
                table: "billing_events",
                columns: new[] { "Provider", "ExternalId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_subscription_vault_links_SubscriptionId_UserId",
                schema: "monokey",
                table: "subscription_vault_links",
                columns: new[] { "SubscriptionId", "UserId" });

            migrationBuilder.CreateIndex(
                name: "IX_subscription_vault_links_UserId_SubscriptionId_VaultRecordId",
                schema: "monokey",
                table: "subscription_vault_links",
                columns: new[] { "UserId", "SubscriptionId", "VaultRecordId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_subscription_vault_links_VaultRecordId_UserId",
                schema: "monokey",
                table: "subscription_vault_links",
                columns: new[] { "VaultRecordId", "UserId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "billing_events",
                schema: "monokey");

            migrationBuilder.DropTable(
                name: "subscription_vault_links",
                schema: "monokey");

            migrationBuilder.DropTable(
                name: "account_memberships",
                schema: "monokey");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_vault_records_Id_UserId",
                schema: "monokey",
                table: "vault_records");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_subscriptions_Id_UserId",
                schema: "monokey",
                table: "subscriptions");

            migrationBuilder.RenameTable(
                name: "vault_records",
                schema: "monokey",
                newName: "vault_records");

            migrationBuilder.RenameTable(
                name: "vault_key_envelopes",
                schema: "monokey",
                newName: "vault_key_envelopes");

            migrationBuilder.RenameTable(
                name: "user_profiles",
                schema: "monokey",
                newName: "user_profiles");

            migrationBuilder.RenameTable(
                name: "subscriptions",
                schema: "monokey",
                newName: "subscriptions");

            migrationBuilder.RenameTable(
                name: "notification_preferences",
                schema: "monokey",
                newName: "notification_preferences");

            migrationBuilder.RenameTable(
                name: "devices",
                schema: "monokey",
                newName: "devices");
        }
    }
}
