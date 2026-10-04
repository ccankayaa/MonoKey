using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using MonoKey.IntegrationTests.Infrastructure;

namespace MonoKey.IntegrationTests;

public sealed class SubscriptionApiTests(MonoKeyWebApplicationFactory factory)
    : IClassFixture<MonoKeyWebApplicationFactory>
{
    [Fact]
    public async Task SubscriptionEndpoints_ProvideAuthenticatedCrudAndOwnershipIsolation()
    {
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserHeader, "user-a");
        var renewalDate = DateOnly.FromDateTime(DateTime.UtcNow).AddMonths(1);

        using var createResponse = await client.PostAsJsonAsync(
            "/api/subscriptions",
            new
            {
                name = "Music",
                amount = 9.99m,
                currencyCode = "usd",
                billingIntervalUnit = 3,
                billingIntervalCount = 1,
                nextRenewalDate = renewalDate,
            },
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        using var created = JsonDocument.Parse(
            await createResponse.Content.ReadAsStringAsync(CancellationToken.None));
        var id = created.RootElement.GetProperty("id").GetGuid();
        var concurrencyToken = created.RootElement.GetProperty("concurrencyToken").GetGuid();

        using var getResponse = await client.GetAsync(
            $"/api/subscriptions/{id}",
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        using var updateResponse = await client.PutAsJsonAsync(
            $"/api/subscriptions/{id}",
            new
            {
                name = "Music Plus",
                amount = 12.50m,
                currencyCode = "USD",
                billingIntervalUnit = 3,
                billingIntervalCount = 1,
                nextRenewalDate = renewalDate.AddMonths(1),
                status = 2,
                concurrencyToken,
            },
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

        using var updated = JsonDocument.Parse(
            await updateResponse.Content.ReadAsStringAsync(CancellationToken.None));
        var updatedToken = updated.RootElement.GetProperty("concurrencyToken").GetGuid();

        using var staleUpdateResponse = await client.PutAsJsonAsync(
            $"/api/subscriptions/{id}",
            new
            {
                name = "Stale update",
                amount = 13m,
                currencyCode = "USD",
                billingIntervalUnit = 3,
                billingIntervalCount = 1,
                nextRenewalDate = renewalDate.AddMonths(1),
                status = 2,
                concurrencyToken,
            },
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.Conflict, staleUpdateResponse.StatusCode);

        using var listResponse = await client.GetAsync("/api/subscriptions?page=1&pageSize=10", CancellationToken.None);
        Assert.Equal(HttpStatusCode.OK, listResponse.StatusCode);

        client.DefaultRequestHeaders.Remove(TestAuthenticationHandler.UserHeader);
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserHeader, "user-b");
        using var otherUserResponse = await client.GetAsync(
            $"/api/subscriptions/{id}",
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.NotFound, otherUserResponse.StatusCode);

        client.DefaultRequestHeaders.Remove(TestAuthenticationHandler.UserHeader);
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserHeader, "user-a");
        using var deleteResponse = await client.DeleteAsync(
            $"/api/subscriptions/{id}?concurrencyToken={updatedToken}",
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        using var deletedResponse = await client.GetAsync(
            $"/api/subscriptions/{id}",
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.NotFound, deletedResponse.StatusCode);
    }

    [Fact]
    public async Task ProtectedEndpoint_WithoutAuthentication_ReturnsUnauthorized()
    {
        using var client = factory.CreateClient();

        using var response = await client.GetAsync(
            "/api/subscriptions",
            CancellationToken.None);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateSubscription_WithInvalidAmount_ReturnsProblemDetails()
    {
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserHeader, "validation-user");

        using var response = await client.PostAsJsonAsync(
            "/api/subscriptions",
            new
            {
                name = "Invalid",
                amount = -1m,
                currencyCode = "USD",
                billingIntervalUnit = 3,
                billingIntervalCount = 1,
                nextRenewalDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(1),
            },
            CancellationToken.None);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var body = await response.Content.ReadAsStringAsync(CancellationToken.None);
        Assert.Contains("errors", body, StringComparison.Ordinal);
    }

    [Fact]
    public async Task SummaryAndUpcomingEndpoints_ReturnPerCurrencyAndDateFilteredResults()
    {
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserHeader, $"summary-{Guid.NewGuid()}");
        var renewalDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(10);

        foreach (var currency in new[] { "USD", "EUR" })
        {
            using var createResponse = await client.PostAsJsonAsync(
                "/api/subscriptions",
                new
                {
                    name = $"Plan {currency}",
                    amount = 10m,
                    currencyCode = currency,
                    billingIntervalUnit = 3,
                    billingIntervalCount = 1,
                    nextRenewalDate = renewalDate,
                },
                CancellationToken.None);
            Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        }

        using var summaryResponse = await client.GetAsync("/api/subscriptions/cost-summary", CancellationToken.None);
        Assert.Equal(HttpStatusCode.OK, summaryResponse.StatusCode);
        var summaryBody = await summaryResponse.Content.ReadAsStringAsync(CancellationToken.None);
        Assert.Contains("USD", summaryBody, StringComparison.Ordinal);
        Assert.Contains("EUR", summaryBody, StringComparison.Ordinal);

        using var upcomingResponse = await client.GetAsync("/api/subscriptions/upcoming?days=30", CancellationToken.None);
        Assert.Equal(HttpStatusCode.OK, upcomingResponse.StatusCode);
        using var upcoming = JsonDocument.Parse(
            await upcomingResponse.Content.ReadAsStringAsync(CancellationToken.None));
        Assert.Equal(2, upcoming.RootElement.GetArrayLength());
    }
}
