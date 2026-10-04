using System.Data.Common;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql;
using Microsoft.Extensions.DependencyInjection;
using MonoKey.Infrastructure;
using MonoKey.Infrastructure.Membership;
using MonoKey.Domain.Subscriptions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using MonoKey.Infrastructure.Persistence;

namespace MonoKey.IntegrationTests;

[CollectionDefinition("PostgreSQL", DisableParallelization = true)]
public sealed class PostgreSqlCollection
{
    public const string Name = "PostgreSQL";
}

[Collection(PostgreSqlCollection.Name)]
public sealed class PostgreSqlIntegrationTests
{
    private const string ConnectionStringEnvironmentVariable = "MONOKEY_TEST_POSTGRES_CONNECTION_STRING";

    [PostgreSqlFact]
    [Trait("Category", "PostgreSql")]
    public async Task Migrations_ApplyToPostgreSqlAndMatchTheCheckedInHistory()
    {
        await using var context = CreateContext();

        await context.Database.MigrateAsync(CancellationToken.None);

        Assert.Equal("Npgsql.EntityFrameworkCore.PostgreSQL", context.Database.ProviderName);
        Assert.Equal(
            context.Database.GetMigrations(),
            await context.Database.GetAppliedMigrationsAsync(CancellationToken.None));
    }

    [PostgreSqlFact]
    [Trait("Category", "PostgreSql")]
    public async Task SubscriptionCurrencyCheckConstraint_IsEnforcedByPostgreSql()
    {
        await using var context = CreateContext();
        await context.Database.MigrateAsync(CancellationToken.None);
        await using var transaction = await context.Database.BeginTransactionAsync(CancellationToken.None);

        var exception = await Assert.ThrowsAnyAsync<DbException>(() => context.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO monokey.subscriptions
                ("Id", "UserId", "Name", "Amount", "CurrencyCode", "BillingIntervalCode",
                 "BillingIntervalUnit", "BillingIntervalCount", "NextRenewalDate", "Status",
                 "ConcurrencyToken", "CreatedAtUtc", "UpdatedAtUtc")
            VALUES
                ({Guid.CreateVersion7()}, {"postgres-check-test"}, {"Plan"}, {10m}, {"usd"},
                 {3}, {3}, {1}, {new DateOnly(2030, 1, 1)}, {1}, {Guid.CreateVersion7()},
                 {DateTimeOffset.UtcNow}, {DateTimeOffset.UtcNow})
            """, CancellationToken.None));

        Assert.Contains("ck_subscriptions_currency_code", exception.Message, StringComparison.Ordinal);
    }

    [PostgreSqlFact]
    [Trait("Category", "PostgreSql")]
    public async Task LegacySchemaTransfer_PreservesCiphertextAndAppliedIdsAndRepeatsSafely()
    {
        var source = new NpgsqlConnectionStringBuilder(Environment.GetEnvironmentVariable(ConnectionStringEnvironmentVariable));
        if (source.Host is not ("localhost" or "127.0.0.1") || source.Database is not ("monokey_ci" or "postgres") || source.Username != "monokey_ci")
            throw new InvalidOperationException("Compatibility fixtures require the isolated local/CI PostgreSQL role and database.");
        var fixture = "monokey_compat_" + Guid.NewGuid().ToString("N");
        await using var admin = new NpgsqlConnection(source.ConnectionString);
        await admin.OpenAsync();
        await using (var create = new NpgsqlCommand($"CREATE DATABASE {fixture}", admin)) await create.ExecuteNonQueryAsync();
        source.Database = fixture;
        await using var context = new MonoKeyDbContext(new DbContextOptionsBuilder<MonoKeyDbContext>().UseNpgsql(source.ConnectionString).Options);
        await context.GetService<IMigrator>().MigrateAsync("20260928181036_EncryptedVaultSync");
        var recordId = Guid.CreateVersion7();
        var ciphertext = Enumerable.Range(17, 32).Select(value => (byte)value).ToArray();
        await context.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO public.vault_records ("Id","UserId","FormatVersion","EncryptionAlgorithm","Nonce","Ciphertext","Revision","IsDeleted","ConcurrencyToken","CreatedAtUtc","UpdatedAtUtc")
            VALUES ({recordId},{"compat-owner"},{1},{"xchacha20-poly1305"},{new byte[24]},{ciphertext},{1L},{false},{Guid.CreateVersion7()},{DateTimeOffset.UtcNow},{DateTimeOffset.UtcNow});
            """);
        var oldIds = (await context.Database.GetAppliedMigrationsAsync()).ToArray();
        Assert.Equal(2, oldIds.Length);
        await context.Database.MigrateAsync();
        await context.Database.MigrateAsync();
        Assert.False(context.Database.HasPendingModelChanges());
        var saved = await context.VaultRecords.AsNoTracking().SingleAsync(item => item.Id == recordId);
        Assert.Equal(ciphertext, saved.Ciphertext);
        Assert.Equal("compat-owner", saved.UserId);
        var ids = (await context.Database.GetAppliedMigrationsAsync()).ToArray();
        Assert.Equal(oldIds, ids.Take(2));
        Assert.Equal(4, ids.Length);
        // The disposable runner cluster owns fixture cleanup; no application database is dropped.
    }

    [PostgreSqlFact]
    [Trait("Category", "PostgreSql")]
    public async Task ConfiguredFreeLimit_RejectsConcurrentCreationWithoutBlockingExistingData()
    {
        var connection = Environment.GetEnvironmentVariable(ConnectionStringEnvironmentVariable)!;
        var services = new ServiceCollection();
        services.AddInfrastructure(connection, new BillingOptions { FreeSubscriptionLimit = 1 });
        await using var provider = services.BuildServiceProvider();
        await using (var scope = provider.CreateAsyncScope()) await scope.ServiceProvider.GetRequiredService<MonoKeyDbContext>().Database.MigrateAsync();
        var uid = "quota-fixture-" + Guid.NewGuid();
        async Task<bool> CreateAsync()
        {
            await using var scope = provider.CreateAsyncScope();
            var context = scope.ServiceProvider.GetRequiredService<MonoKeyDbContext>();
            context.Subscriptions.Add(new Subscription(uid, "Fixture", 1m, "USD", BillingIntervalUnit.Month, 1, new DateOnly(2030, 1, 1)));
            try { await context.SaveChangesAsync(); return true; } catch (ValidationException) { return false; }
        }
        var results = await Task.WhenAll(CreateAsync(), CreateAsync());
        Assert.Single(results, value => value);
        await using var read = provider.CreateAsyncScope();
        Assert.Equal(1, await read.ServiceProvider.GetRequiredService<MonoKeyDbContext>().Subscriptions.CountAsync(item => item.UserId == uid));
    }

    private static MonoKeyDbContext CreateContext()
    {
        var connectionString = Environment.GetEnvironmentVariable(ConnectionStringEnvironmentVariable)!;

        var options = new DbContextOptionsBuilder<MonoKeyDbContext>()
            .UseNpgsql(connectionString)
            .Options;
        return new MonoKeyDbContext(options);
    }
}

internal sealed class PostgreSqlFactAttribute : FactAttribute
{
    private const string ConnectionStringEnvironmentVariable = "MONOKEY_TEST_POSTGRES_CONNECTION_STRING";

    public PostgreSqlFactAttribute()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(ConnectionStringEnvironmentVariable)))
        {
            Skip = $"Set {ConnectionStringEnvironmentVariable} to a disposable PostgreSQL database to run this test.";
        }
    }
}
