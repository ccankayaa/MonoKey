using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using MonoKey.Domain.Membership;
using MonoKey.Infrastructure.Membership;
using MonoKey.Infrastructure.Persistence;
using MonoKey.IntegrationTests.Infrastructure;

namespace MonoKey.IntegrationTests;

public sealed class LinksAndMembershipTests(MonoKeyWebApplicationFactory factory) : IClassFixture<MonoKeyWebApplicationFactory>
{
    [Fact]
    public async Task Links_RequireBothOwnersAndCurrentRevisionAndDisappearOnTombstone()
    {
        using var client = factory.CreateClient();
        var owner = Guid.NewGuid().ToString();
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserHeader, owner);
        var requestId = Guid.NewGuid();
        var input = new { name = "Service", amount = 9m, currencyCode = "USD", billingIntervalUnit = "Month", billingIntervalCount = 1, nextRenewalDate = "2030-01-01", clientRequestId = requestId };
        using var created = await client.PostAsJsonAsync("/api/subscriptions", input);
        var subscription = await created.Content.ReadFromJsonAsync<JsonElement>();
        using var retry = await client.PostAsJsonAsync("/api/subscriptions", input);
        Assert.Equal(subscription.GetProperty("id").GetGuid(), (await retry.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("id").GetGuid());
        var recordId = Guid.NewGuid();
        using var record = await client.PostAsJsonAsync("/api/vault/records", new { id = recordId, formatVersion = 1, encryptionAlgorithm = "xchacha20-poly1305", nonce = Convert.ToBase64String(new byte[24]), ciphertext = Convert.ToBase64String(new byte[32]) });
        Assert.Equal(HttpStatusCode.Created, record.StatusCode);
        using var recordRetry = await client.PostAsJsonAsync("/api/vault/records", new { id = recordId, formatVersion = 1, encryptionAlgorithm = "xchacha20-poly1305", nonce = Convert.ToBase64String(new byte[24]), ciphertext = Convert.ToBase64String(new byte[32]) });
        Assert.Equal(HttpStatusCode.Created, recordRetry.StatusCode);
        var path = $"/api/subscriptions/{subscription.GetProperty("id").GetGuid()}/vault-links/{recordId}";
        var command = new { subscriptionConcurrencyToken = subscription.GetProperty("concurrencyToken").GetGuid(), recordRevision = 1 };
        client.DefaultRequestHeaders.Remove(TestAuthenticationHandler.UserHeader);
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserHeader, "foreign-user");
        using var denied = await client.PutAsJsonAsync(path, command);
        Assert.Equal(HttpStatusCode.NotFound, denied.StatusCode);
        client.DefaultRequestHeaders.Remove(TestAuthenticationHandler.UserHeader);
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserHeader, owner);
        using var stale = await client.PutAsJsonAsync(path, new { command.subscriptionConcurrencyToken, recordRevision = 2 });
        Assert.Equal(HttpStatusCode.Conflict, stale.StatusCode);
        using var linked = await client.PutAsJsonAsync(path, command);
        Assert.Equal(HttpStatusCode.NoContent, linked.StatusCode);
        using var duplicate = await client.PutAsJsonAsync(path, command);
        Assert.Equal(HttpStatusCode.NoContent, duplicate.StatusCode);
        using var deleted = await client.DeleteAsync($"/api/vault/records/{recordId}?expectedRevision=1");
        Assert.Equal(HttpStatusCode.OK, deleted.StatusCode);
        using var invalidated = await client.PutAsJsonAsync(path, command);
        Assert.Equal(HttpStatusCode.NotFound, invalidated.StatusCode);
        using var links = await client.GetAsync(path[..path.LastIndexOf('/')]);
        Assert.Empty((await links.Content.ReadFromJsonAsync<JsonElement>()).EnumerateArray());
    }

    [Fact]
    public async Task Membership_IsServerAuthoritativeAndUnconfiguredCheckoutCannotGrantPro()
    {
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserHeader, Guid.NewGuid().ToString());
        using var profile = await client.PutAsJsonAsync("/api/profile", new { displayName = "Name", plan = "Pro", validUntilUtc = "2099-01-01" });
        Assert.Equal(HttpStatusCode.OK, profile.StatusCode);
        var membership = await client.GetFromJsonAsync<JsonElement>("/api/membership");
        Assert.Equal("Free", membership.GetProperty("plan").GetString());
        Assert.False(membership.GetProperty("checkoutAvailable").GetBoolean());
        using var checkout = await client.PostAsJsonAsync("/api/membership/checkout", new { plan = "Pro" });
        Assert.Equal(HttpStatusCode.BadRequest, checkout.StatusCode);
        using var webhook = await client.PostAsJsonAsync("/api/membership/stripe-webhook", new { plan = "Pro" });
        Assert.Equal(HttpStatusCode.Unauthorized, webhook.StatusCode);
    }

    [Fact]
    public void StripeSignatures_RejectTamperingExpiredReplayAndMalformedValues()
    {
        var now = new DateTimeOffset(2030, 1, 1, 0, 0, 0, TimeSpan.Zero);
        const string body = "{\"id\":\"evt_test\"}";
        const string secret = "test-only-signature-secret";
        var timestamp = now.ToUnixTimeSeconds();
        var hash = Convert.ToHexString(HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes($"{timestamp}.{body}")));
        var signature = $"t={timestamp},v1={hash}";
        Assert.True(StripeSignature.Verify(body, signature, secret, now));
        Assert.False(StripeSignature.Verify(body + " ", signature, secret, now));
        Assert.False(StripeSignature.Verify(body, signature, secret, now.AddMinutes(6)));
        Assert.False(StripeSignature.Verify(body, "t=0,v1=xyz", secret, now));
    }

    [Fact]
    public void Expiry_RemovesProWithoutRemovingVaultOwnershipOrData()
    {
        var membership = new AccountMembership("owner");
        var now = DateTimeOffset.UtcNow;
        membership.AttachCustomer("Stripe", "cus_test");
        membership.ApplyVerifiedEvent("Active", now.AddHours(1), now);
        Assert.True(membership.HasPro(now));
        Assert.False(membership.HasPro(now.AddHours(2)));
        Assert.Equal("owner", membership.UserId);
        membership.ApplyVerifiedEvent("Free", null, now.AddMinutes(-1));
        Assert.True(membership.HasPro(now));
    }
}
