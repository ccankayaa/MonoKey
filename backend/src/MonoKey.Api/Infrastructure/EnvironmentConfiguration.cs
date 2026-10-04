using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Npgsql;

namespace MonoKey.Api.Infrastructure;

public sealed record EnvironmentConfiguration(string Name, string ProjectId, bool UseEmulator)
{
    public static EnvironmentConfiguration Validate(IConfiguration configuration, IHostEnvironment environment)
    {
        var name = environment.EnvironmentName switch
        {
            "Development" => "dev",
            "Staging" => "test",
            "Production" => "prod",
            "Testing" => "fixture",
            _ => throw new InvalidOperationException("Unsupported application environment."),
        };
        var emulator = configuration.GetValue<bool>("Authentication:Firebase:UseEmulator");
        var project = configuration["Authentication:Firebase:ProjectId"] ?? string.Empty;
        if (name == "fixture")
        {
            if (environment.ApplicationName != "MonoKey.Api" || !AppDomain.CurrentDomain.GetAssemblies().Any(assembly => assembly.GetName().Name == "MonoKey.IntegrationTests"))
            {
                throw new InvalidOperationException("Testing is restricted to the integration test host.");
            }

            return new(name, "fixture", false);
        }

        if (name != "dev" && (emulator || configuration["FIREBASE_AUTH_EMULATOR_HOST"] is not null))
        {
            throw new InvalidOperationException("Emulator authentication is restricted to Development.");
        }

        if (name == "dev" && (!emulator || project != "demo-monokey") ||
            name == "test" && project != "vaultx-1ee62" ||
            name == "prod" && (string.IsNullOrWhiteSpace(project) || project == "vaultx-1ee62" || project.StartsWith("demo-", StringComparison.Ordinal)))
        {
            throw new InvalidOperationException("Firebase project does not match the application environment.");
        }

        var connectionString = configuration.GetConnectionString("MonoKeyDatabase");
        if (string.IsNullOrWhiteSpace(connectionString) || connectionString.StartsWith("@Microsoft.KeyVault(", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("MonoKeyDatabase must be configured and its secret reference resolved.");
        }

        NpgsqlConnectionStringBuilder database;
        try
        {
            database = new NpgsqlConnectionStringBuilder(connectionString);
        }
        catch (ArgumentException)
        {
            throw new InvalidOperationException("MonoKeyDatabase configuration is invalid.");
        }

        if (database.Database != $"monokey_{name}")
        {
            throw new InvalidOperationException("Database does not match the application environment.");
        }

        if (name == "dev" && database.Host is not ("localhost" or "127.0.0.1" or "::1") ||
            name != "dev" && (database.SslMode != SslMode.VerifyFull || database.IncludeErrorDetail ||
                database.Username is "admin_ccan" or "postgres" || database.MaxPoolSize > 20 ||
                name == "test" && (database.Host != "monokeydb.postgres.database.azure.com" || database.Username != "monokey_test_app")))
        {
            throw new InvalidOperationException("Database boundary, runtime role, TLS or pool configuration is invalid.");
        }

        var origins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
        if (origins.Any(origin =>
            !Uri.TryCreate(origin, UriKind.Absolute, out var uri) || origin.Contains('*', StringComparison.Ordinal) ||
            uri.GetLeftPart(UriPartial.Authority) != origin ||
            name != "dev" && (uri.Scheme != "https" && uri.Scheme != "chrome-extension" || uri.IsLoopback) ||
            name == "dev" && !uri.IsLoopback && !configuration.GetValue<bool>("Development:AllowLan")))
        {
            throw new InvalidOperationException("CORS requires exact origins for the application environment.");
        }

        return new(name, project, emulator);
    }
}
