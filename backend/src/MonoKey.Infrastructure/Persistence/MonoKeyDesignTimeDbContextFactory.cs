using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using MonoKey.Infrastructure.Configuration;

namespace MonoKey.Infrastructure.Persistence;

public sealed class MonoKeyDesignTimeDbContextFactory : IDesignTimeDbContextFactory<MonoKeyDbContext>
{
    public MonoKeyDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__MonoKeyDatabase");
        connectionString ??= WindowsDevelopmentCredential.Read();
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            var environmentFilePath = DevelopmentEnvironmentFile.FindFromRepository(
                Directory.GetCurrentDirectory());
            if (environmentFilePath is not null)
            {
                DevelopmentEnvironmentFile.Read(environmentFilePath)
                    .TryGetValue("ConnectionStrings:MonoKeyDatabase", out connectionString);
            }
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "ConnectionStrings__MonoKeyDatabase is required through the process environment or the ignored Development environment file.");
        }

        var options = new DbContextOptionsBuilder<MonoKeyDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new MonoKeyDbContext(options);
    }
}
