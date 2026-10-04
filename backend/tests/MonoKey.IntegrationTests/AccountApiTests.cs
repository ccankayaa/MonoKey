using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using MonoKey.IntegrationTests.Infrastructure;

namespace MonoKey.IntegrationTests;

public sealed class AccountApiTests(MonoKeyWebApplicationFactory factory)
    : IClassFixture<MonoKeyWebApplicationFactory>
{
    [Fact]
    public async Task ProfileDeviceAndNotificationPreferenceEndpoints_PersistAccountScopedSettings()
    {
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthenticationHandler.UserHeader, $"account-{Guid.NewGuid()}");

        using var profileUpdate = await client.PutAsJsonAsync(
            "/api/profile",
            new { displayName = "MonoKey User" },
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.OK, profileUpdate.StatusCode);
        using var profileGet = await client.GetAsync("/api/profile", CancellationToken.None);
        Assert.Equal(HttpStatusCode.OK, profileGet.StatusCode);

        using var preferenceUpdate = await client.PutAsJsonAsync(
            "/api/notification-preferences",
            new { renewalRemindersEnabled = true, daysBeforeRenewal = 7 },
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.OK, preferenceUpdate.StatusCode);
        using var preferenceGet = await client.GetAsync(
            "/api/notification-preferences",
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.OK, preferenceGet.StatusCode);

        using var deviceRegister = await client.PostAsJsonAsync(
            "/api/devices",
            new { deviceIdentifier = "browser-installation-1", name = "Main browser", platform = 5 },
            CancellationToken.None);
        Assert.Equal(HttpStatusCode.OK, deviceRegister.StatusCode);
        using var deviceDocument = JsonDocument.Parse(
            await deviceRegister.Content.ReadAsStringAsync(CancellationToken.None));
        var deviceId = deviceDocument.RootElement.GetProperty("id").GetGuid();

        using var deviceList = await client.GetAsync("/api/devices", CancellationToken.None);
        Assert.Equal(HttpStatusCode.OK, deviceList.StatusCode);
        var listBody = await deviceList.Content.ReadAsStringAsync(CancellationToken.None);
        Assert.Contains("browser-installation-1", listBody, StringComparison.Ordinal);

        using var deviceDelete = await client.DeleteAsync($"/api/devices/{deviceId}", CancellationToken.None);
        Assert.Equal(HttpStatusCode.NoContent, deviceDelete.StatusCode);
    }
}
