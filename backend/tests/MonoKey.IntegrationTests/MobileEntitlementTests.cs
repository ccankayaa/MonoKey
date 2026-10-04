using System.Net;
using System.Text;
using Microsoft.Extensions.Options;
using MonoKey.Infrastructure.Membership;

namespace MonoKey.IntegrationTests;

public sealed class MobileEntitlementTests
{
    [Fact]
    public void DisabledMobileBilling_CannotAcceptAClientAssertion()
    {
        using var client = new HttpClient();
        var provider = new RevenueCatEntitlementProvider(client, Options.Create(new RevenueCatOptions()), TimeProvider.System);
        Assert.False(provider.IsConfigured);
        Assert.False(provider.VerifyWebhookAuthorization("client-says-Pro"));
    }
    [Theory]
    [InlineData("foreign-owner", true)]
    [InlineData("owner", false)]
    public async Task Reconciliation_RejectsForeignOwnershipAndLivePurchase(string providerOwner, bool sandbox)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(new { subscriber = new { original_app_user_id = providerOwner, entitlements = new Dictionary<string, object> { ["Pro"] = new { product_identifier = "test-product", expires_date = "2099-01-01T00:00:00Z" } }, subscriptions = new Dictionary<string, object> { ["test-product"] = new { is_sandbox = sandbox } } } });
        using var client = new HttpClient(new Reply(json));
        var options = new RevenueCatOptions { Enabled = true, SecretKey = "test-only-provider-secret", WebhookAuthorization = new string('x', 40), EntitlementId = "Pro" };
        var provider = new RevenueCatEntitlementProvider(client, Options.Create(options), TimeProvider.System);
        Assert.True(provider.VerifyWebhookAuthorization(new string('x', 40)));
        Assert.False(provider.VerifyWebhookAuthorization(new string('y', 40)));
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => provider.ReconcileSandboxAsync("owner", CancellationToken.None));
    }
    private sealed class Reply(string body) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) =>
            Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(body, Encoding.UTF8, "application/json") });
    }
}
