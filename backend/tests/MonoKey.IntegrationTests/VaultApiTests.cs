using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MonoKey.Infrastructure.Persistence;
using MonoKey.IntegrationTests.Infrastructure;

namespace MonoKey.IntegrationTests;

public sealed class VaultApiTests(MonoKeyWebApplicationFactory factory)
    : IClassFixture<MonoKeyWebApplicationFactory>
{
    [Fact]
    public async Task VaultEndpoints_StoreOpaqueCiphertextAndEnforceOwnershipRevisionAndTombstones()
    {
        var owner = $"vault-owner-{Guid.NewGuid()}";
        var recordId = Guid.CreateVersion7();
        var nonce = Enumerable.Range(0, 24).Select(value => (byte)value).ToArray();
        var ciphertext = Encoding.UTF8.GetBytes("opaque-encrypted-payload-with-authentication-tag");
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserHeader, owner);

        using var envelopeResponse = await client.PutAsJsonAsync(
            "/api/vault/key-envelope",
            CreateKeyEnvelopeRequest(),
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.OK, envelopeResponse.StatusCode);
        Assert.Equal("\"1\"", envelopeResponse.Headers.ETag?.Tag);

        using var createResponse = await client.PostAsJsonAsync(
            "/api/vault/records",
            new
            {
                id = recordId,
                formatVersion = 1,
                encryptionAlgorithm = "xchacha20-poly1305",
                nonce = Convert.ToBase64String(nonce),
                ciphertext = Convert.ToBase64String(ciphertext),
                title = "must-not-be-persisted",
                username = "must-not-be-persisted",
                password = "must-not-be-persisted",
            },
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        Assert.Equal("\"1\"", createResponse.Headers.ETag?.Tag);

        await using (var scope = factory.Services.CreateAsyncScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<MonoKeyDbContext>();
            var persisted = await context.VaultRecords.SingleAsync(
                item => item.Id == recordId,
                CancellationToken.None);
            Assert.Equal(owner, persisted.UserId);
            Assert.Equal(nonce, persisted.Nonce);
            Assert.Equal(ciphertext, persisted.Ciphertext);
            Assert.DoesNotContain("must-not-be-persisted", Encoding.UTF8.GetString(persisted.Ciphertext));
        }

        client.DefaultRequestHeaders.Remove(TestAuthenticationHandler.UserHeader);
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserHeader, "different-user");
        using var crossUserGet = await client.GetAsync($"/api/vault/records/{recordId}", CancellationToken.None);
        Assert.Equal(HttpStatusCode.NotFound, crossUserGet.StatusCode);

        client.DefaultRequestHeaders.Remove(TestAuthenticationHandler.UserHeader);
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserHeader, owner);
        using var updateResponse = await client.PutAsJsonAsync(
            $"/api/vault/records/{recordId}",
            new
            {
                formatVersion = 1,
                encryptionAlgorithm = "xchacha20-poly1305",
                nonce = Convert.ToBase64String(nonce.Reverse().ToArray()),
                ciphertext = Convert.ToBase64String(ciphertext.Concat(new byte[] { 1 }).ToArray()),
                expectedRevision = 1,
            },
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);
        Assert.Equal("\"2\"", updateResponse.Headers.ETag?.Tag);

        using var staleUpdate = await client.PutAsJsonAsync(
            $"/api/vault/records/{recordId}",
            new
            {
                formatVersion = 1,
                encryptionAlgorithm = "xchacha20-poly1305",
                nonce = Convert.ToBase64String(nonce),
                ciphertext = Convert.ToBase64String(ciphertext),
                expectedRevision = 1,
            },
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.Conflict, staleUpdate.StatusCode);

        using var deleteResponse = await client.DeleteAsync(
            $"/api/vault/records/{recordId}?expectedRevision=2",
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.OK, deleteResponse.StatusCode);
        using var deleted = JsonDocument.Parse(await deleteResponse.Content.ReadAsStringAsync(CancellationToken.None));
        Assert.True(deleted.RootElement.GetProperty("isDeleted").GetBoolean());
        Assert.Equal(string.Empty, deleted.RootElement.GetProperty("ciphertext").GetString());

        using var listResponse = await client.GetAsync("/api/vault/records", CancellationToken.None);
        using var list = JsonDocument.Parse(await listResponse.Content.ReadAsStringAsync(CancellationToken.None));
        Assert.Contains(
            list.RootElement.GetProperty("items").EnumerateArray(),
            item => item.GetProperty("id").GetGuid() == recordId && item.GetProperty("isDeleted").GetBoolean());
    }

    [Fact]
    public async Task VaultEndpoint_InvalidBase64_ReturnsSafeProblemDetailsWithoutEchoingInput()
    {
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserHeader, $"invalid-{Guid.NewGuid()}");
        const string invalidSensitiveValue = "not-base64-sensitive-input";

        using var response = await client.PostAsJsonAsync(
            "/api/vault/records",
            new
            {
                id = Guid.CreateVersion7(),
                formatVersion = 1,
                encryptionAlgorithm = "xchacha20-poly1305",
                nonce = invalidSensitiveValue,
                ciphertext = invalidSensitiveValue,
            },
            CancellationToken.None);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var body = await response.Content.ReadAsStringAsync(CancellationToken.None);
        Assert.DoesNotContain(invalidSensitiveValue, body, StringComparison.Ordinal);
    }

    private static object CreateKeyEnvelopeRequest() => new
    {
        formatVersion = 1,
        kdfAlgorithm = "argon2id",
        kdfMemoryKiB = 65_536,
        kdfIterations = 3,
        kdfParallelism = 1,
        salt = Convert.ToBase64String(new byte[16]),
        encryptionAlgorithm = "xchacha20-poly1305",
        masterWrapNonce = Convert.ToBase64String(new byte[24]),
        masterWrappedKey = Convert.ToBase64String(new byte[48]),
        recoveryWrapNonce = Convert.ToBase64String(Enumerable.Repeat((byte)1, 24).ToArray()),
        recoveryWrappedKey = Convert.ToBase64String(Enumerable.Repeat((byte)2, 48).ToArray()),
        expectedRevision = (long?)null,
    };
}
