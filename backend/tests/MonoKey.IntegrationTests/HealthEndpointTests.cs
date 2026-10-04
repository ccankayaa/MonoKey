using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace MonoKey.IntegrationTests;

public sealed class HealthEndpointTests(BoundaryWebApplicationFactory factory)
    : IClassFixture<BoundaryWebApplicationFactory>
{
    [Fact]
    public async Task GetHealth_WhenApplicationIsHealthy_ReturnsHealthyResponse()
    {
        using var client = factory.CreateClient();
        using var cancellationTokenSource = new CancellationTokenSource(TimeSpan.FromSeconds(30));

        using var response = await client.GetAsync("/health", cancellationTokenSource.Token);
        var content = await response.Content.ReadAsStringAsync(cancellationTokenSource.Token);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Healthy", content);
    }
}
