using Microsoft.EntityFrameworkCore;
using MonoKey.Infrastructure.Configuration;
using MonoKey.Infrastructure.Persistence;
using Npgsql;

var mode = args.SingleOrDefault();
var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__MonoKeyDatabase");
if (mode == "dev-migrate") connectionString ??= WindowsDevelopmentCredential.Read();
if (mode is not ("test-migrate" or "dev-migrate") || string.IsNullOrWhiteSpace(connectionString))
{
    Console.Error.WriteLine("Use test-migrate or dev-migrate with the authorized migration connection in the environment/Development credential store.");
    return 1;
}

try
{
    var target = new NpgsqlConnectionStringBuilder(connectionString);
    var remote = mode == "test-migrate";
    if (target.Database != (remote ? "monokey_test" : "monokey_dev") ||
        remote && (target.Host != "monokeydb.postgres.database.azure.com" || target.Username != "monokey_test_migrator" || target.SslMode != SslMode.VerifyFull || target.MaxPoolSize > 2) ||
        !remote && target.Host is not ("localhost" or "127.0.0.1" or "::1"))
    {
        throw new InvalidOperationException("Migration target does not match the authorized dev/test boundary.");
    }

    using var timeout = new CancellationTokenSource(TimeSpan.FromMinutes(5));
    await using var connection = new NpgsqlConnection(connectionString);
    await connection.OpenAsync(timeout.Token);
    // Session lock survives individual migration transactions and serializes CLI/pipeline execution.
    await using var acquire = new NpgsqlCommand("SELECT pg_advisory_lock(742819601)", connection);
    await acquire.ExecuteNonQueryAsync(timeout.Token);
    try
    {
        var options = new DbContextOptionsBuilder<MonoKeyDbContext>().UseNpgsql(connection).Options;
        await using var context = new MonoKeyDbContext(options);
        if (context.Database.HasPendingModelChanges()) throw new InvalidOperationException("The model has unreviewed migration changes.");
        await context.Database.MigrateAsync(timeout.Token);
        if (remote)
        {
            await context.Database.ExecuteSqlRawAsync("GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA monokey TO monokey_test_app; GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA monokey TO monokey_test_app;", timeout.Token);
        }

        Console.WriteLine("Applied migrations: " + string.Join(", ", await context.Database.GetAppliedMigrationsAsync(timeout.Token)));
        Console.WriteLine("Migration completed; public.__EFMigrationsHistory retained for compatibility.");
    }
    finally
    {
        await using var release = new NpgsqlCommand("SELECT pg_advisory_unlock(742819601)", connection);
        await release.ExecuteNonQueryAsync(CancellationToken.None);
    }

    return 0;
}
catch (Exception exception)
{
    Console.Error.WriteLine($"Migration failed safely ({exception.GetType().Name}); credentials and database details were suppressed.");
    return 1;
}
