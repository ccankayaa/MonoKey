using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using MonoKey.Infrastructure.Persistence;

namespace MonoKey.Api.Infrastructure;

internal sealed class ReadinessCheck(IServiceScopeFactory scopeFactory) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(4));
        await using var scope = scopeFactory.CreateAsyncScope();
        try
        {
            var database = scope.ServiceProvider.GetRequiredService<MonoKeyDbContext>();
            return await database.Database.CanConnectAsync(timeout.Token) ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy();
        }
        catch { return HealthCheckResult.Unhealthy(); }
    }
}
