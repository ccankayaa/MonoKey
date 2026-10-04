using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using MonoKey.Infrastructure.Persistence;

namespace MonoKey.IntegrationTests;

public sealed class PersistenceConfigurationTests(BoundaryWebApplicationFactory factory)
    : IClassFixture<BoundaryWebApplicationFactory>
{
    [Fact]
    public void MonoKeyDbContext_UsesPostgreSqlProvider()
    {
        using var scope = factory.Services.CreateScope();
        using var context = scope.ServiceProvider.GetRequiredService<MonoKeyDbContext>();

        Assert.Equal("Npgsql.EntityFrameworkCore.PostgreSQL", context.Database.ProviderName);
    }
}
