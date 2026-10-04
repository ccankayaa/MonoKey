using MonoKey.Domain.Common;

namespace MonoKey.Domain.Devices;

public sealed class DeviceRecord : AuditableEntity
{
    private DeviceRecord()
    {
    }

    public DeviceRecord(
        string userId,
        string deviceIdentifier,
        string name,
        DevicePlatform platform,
        DateTimeOffset lastSeenAtUtc)
    {
        UserId = RequireText(userId, nameof(userId), 128);
        DeviceIdentifier = RequireText(deviceIdentifier, nameof(deviceIdentifier), 200);
        Update(name, platform, lastSeenAtUtc);
    }

    public string UserId { get; private set; } = string.Empty;

    public string DeviceIdentifier { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;

    public DevicePlatform Platform { get; private set; }

    public DateTimeOffset LastSeenAtUtc { get; private set; }

    public void Update(string name, DevicePlatform platform, DateTimeOffset lastSeenAtUtc)
    {
        if (!Enum.IsDefined(platform))
        {
            throw new ArgumentOutOfRangeException(nameof(platform));
        }

        if (lastSeenAtUtc.Offset != TimeSpan.Zero)
        {
            throw new ArgumentException("Last-seen timestamp must use UTC.", nameof(lastSeenAtUtc));
        }

        Name = RequireText(name, nameof(name), 100);
        Platform = platform;
        LastSeenAtUtc = lastSeenAtUtc;
    }

    private static string RequireText(string value, string parameterName, int maximumLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("Value is required.", parameterName);
        }

        var trimmed = value.Trim();
        if (trimmed.Length > maximumLength)
        {
            throw new ArgumentException($"Value cannot exceed {maximumLength} characters.", parameterName);
        }

        return trimmed;
    }
}
