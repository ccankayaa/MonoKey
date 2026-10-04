namespace MonoKey.Infrastructure.Configuration;

public static class DevelopmentEnvironmentFile
{
    public const string FileName = ".env.development.local";

    public static IReadOnlyDictionary<string, string?> Read(string path)
    {
        if (!File.Exists(path))
        {
            return new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        }

        var values = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        foreach (var line in File.ReadLines(path))
        {
            var trimmedLine = line.Trim();
            if (trimmedLine.Length == 0 || trimmedLine.StartsWith('#'))
            {
                continue;
            }

            var separatorIndex = trimmedLine.IndexOf('=');
            if (separatorIndex <= 0)
            {
                throw new InvalidOperationException(
                    $"Development environment file '{path}' contains an invalid entry.");
            }

            var key = trimmedLine[..separatorIndex].Trim().Replace("__", ":", StringComparison.Ordinal);
            var value = trimmedLine[(separatorIndex + 1)..].Trim();
            if (value.Length >= 2 && value[0] == '"' && value[^1] == '"')
            {
                value = value[1..^1];
            }

            values[key] = value;
        }

        return values;
    }

    public static string? FindFromRepository(string startDirectory)
    {
        var directory = new DirectoryInfo(startDirectory);
        while (directory is not null)
        {
            if (File.Exists(Path.Combine(directory.FullName, "MonoKeyBackend.slnx")))
            {
                return Path.Combine(
                    directory.FullName,
                    "backend",
                    "src",
                    "MonoKey.Api",
                    FileName);
            }

            directory = directory.Parent;
        }

        return null;
    }
}
