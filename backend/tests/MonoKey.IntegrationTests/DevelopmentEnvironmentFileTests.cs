using MonoKey.Infrastructure.Configuration;

namespace MonoKey.IntegrationTests;

public sealed class DevelopmentEnvironmentFileTests
{
    [Fact]
    public void Read_NormalizesEnvironmentKeysAndPreservesConnectionStringValues()
    {
        var path = Path.Combine(Path.GetTempPath(), $"vaultx-env-{Guid.NewGuid():N}");
        try
        {
            File.WriteAllLines(
                path,
                [
                    "# Development test",
                    "ConnectionStrings__MonoKeyDatabase=Host=localhost;Database=vaultx_test;Password=a=b#c",
                    "Cors__AllowedOrigins__0=http://localhost:5173",
                ]);

            var values = DevelopmentEnvironmentFile.Read(path);

            Assert.Equal(
                "Host=localhost;Database=vaultx_test;Password=a=b#c",
                values["ConnectionStrings:MonoKeyDatabase"]);
            Assert.Equal("http://localhost:5173", values["Cors:AllowedOrigins:0"]);
        }
        finally
        {
            File.Delete(path);
        }
    }
}
