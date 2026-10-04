using System.Net;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace MonoKey.IntegrationTests;

public sealed class FirebaseJwtBoundaryTests
{
    [Theory]
    [InlineData("none", "vaultx-1ee62")]
    [InlineData("RS256", "demo-monokey")]
    [InlineData("RS256", "future-production")]
    public async Task Staging_RejectsUnsignedAndWrongProjectTokens(string algorithm, string project)
    {
        using var rsa = RSA.Create(2048);
        var key = new RsaSecurityKey(rsa) { KeyId = "test-fixture-key" };
        await using var factory = new RealJwtFactory(key);
        using var client = factory.CreateClient();
        var now = DateTimeOffset.UtcNow;
        var token = new JwtSecurityToken($"https://securetoken.google.com/{project}", project,
            [new Claim("sub", "fixture-owner"), new Claim("iat", now.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64), new Claim("auth_time", now.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)],
            now.AddMinutes(-1).UtcDateTime, now.AddMinutes(5).UtcDateTime, algorithm == "none" ? null : new SigningCredentials(key, SecurityAlgorithms.RsaSha256));
        client.DefaultRequestHeaders.Authorization = new("Bearer", new JwtSecurityTokenHandler().WriteToken(token));
        using var response = await client.GetAsync("/api/membership");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
    private sealed class RealJwtFactory(SecurityKey key) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Staging");
            builder.UseSetting("Authentication:Firebase:ProjectId", "vaultx-1ee62");
            builder.UseSetting("Authentication:Firebase:UseEmulator", "false");
            builder.UseSetting("ConnectionStrings:MonoKeyDatabase", "Host=monokeydb.postgres.database.azure.com;Database=monokey_test;Username=monokey_test_app;SSL Mode=VerifyFull;MaxPoolSize=10");
            builder.ConfigureTestServices(services => services.PostConfigure<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme, options =>
            {
                var metadata = new OpenIdConnectConfiguration { Issuer = "https://securetoken.google.com/vaultx-1ee62" };
                metadata.SigningKeys.Add(key);
                options.ConfigurationManager = new StaticConfigurationManager<OpenIdConnectConfiguration>(metadata);
            }));
        }
    }
}
