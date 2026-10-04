using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using MonoKey.Api.Infrastructure;

namespace MonoKey.IntegrationTests;

public sealed class EnvironmentBoundaryTests
{
    [Theory]
    [InlineData("Staging", "vaultx-1ee62", true)]
    [InlineData("Staging", "demo-monokey", false)]
    [InlineData("Production", "vaultx-1ee62", false)]
    [InlineData("Production", "demo-monokey", false)]
    [InlineData("Development", "vaultx-1ee62", true)]
    public void WrongProjectOrRemoteEmulator_FailsBeforeAnyDatabaseConnection(string name, string project, bool emulator)
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Authentication:Firebase:ProjectId"] = project,
            ["Authentication:Firebase:UseEmulator"] = emulator.ToString(),
            ["ConnectionStrings:MonoKeyDatabase"] = "not-a-credential",
        }).Build();
        var exception = Assert.Throws<InvalidOperationException>(() => EnvironmentConfiguration.Validate(configuration, new TestEnvironment(name)));
        Assert.DoesNotContain("not-a-credential", exception.Message, StringComparison.Ordinal);
    }
    [Theory]
    [InlineData("Database=postgres")]
    [InlineData("Database=monokey_prod")]
    [InlineData("Database=monokey_test;Username=admin_ccan")]
    [InlineData("Database=monokey_test;Username=monokey_test_app;SSL Mode=Disable")]
    public void Staging_RejectsWrongDatabaseRuntimeRoleAndTls(string fragment)
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Authentication:Firebase:ProjectId"] = "vaultx-1ee62",
            ["ConnectionStrings:MonoKeyDatabase"] = "Host=monokeydb.postgres.database.azure.com;MaxPoolSize=10;" + fragment,
        }).Build();
        Assert.Throws<InvalidOperationException>(() => EnvironmentConfiguration.Validate(configuration, new TestEnvironment("Staging")));
    }
    private sealed class TestEnvironment(string name) : IHostEnvironment
    {
        public string EnvironmentName { get; set; } = name;
        public string ApplicationName { get; set; } = "MonoKey.Api";
        public string ContentRootPath { get; set; } = string.Empty;
        public IFileProvider ContentRootFileProvider { get; set; } = new NullFileProvider();
    }
}
