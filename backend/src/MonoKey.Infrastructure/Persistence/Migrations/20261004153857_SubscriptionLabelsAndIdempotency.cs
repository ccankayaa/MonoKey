using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MonoKey.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SubscriptionLabelsAndIdempotency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                schema: "monokey",
                table: "subscriptions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ClientRequestId",
                schema: "monokey",
                table: "subscriptions",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethodLabel",
                schema: "monokey",
                table: "subscriptions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProviderPlanLabel",
                schema: "monokey",
                table: "subscriptions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_subscriptions_UserId_ClientRequestId",
                schema: "monokey",
                table: "subscriptions",
                columns: new[] { "UserId", "ClientRequestId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_subscriptions_UserId_ClientRequestId",
                schema: "monokey",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "Category",
                schema: "monokey",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "ClientRequestId",
                schema: "monokey",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "PaymentMethodLabel",
                schema: "monokey",
                table: "subscriptions");

            migrationBuilder.DropColumn(
                name: "ProviderPlanLabel",
                schema: "monokey",
                table: "subscriptions");
        }
    }
}
