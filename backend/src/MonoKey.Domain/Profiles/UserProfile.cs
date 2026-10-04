using MonoKey.Domain.Common;

namespace MonoKey.Domain.Profiles;

public sealed class UserProfile : AuditableEntity
{
    private UserProfile()
    {
    }

    public UserProfile(string userId, string? displayName)
    {
        UserId = RequireUserId(userId);
        Update(displayName);
    }

    public string UserId { get; private set; } = string.Empty;

    public string? DisplayName { get; private set; }

    public void Update(string? displayName)
    {
        var normalized = string.IsNullOrWhiteSpace(displayName) ? null : displayName.Trim();
        if (normalized?.Length > 200)
        {
            throw new ArgumentException("Display name cannot exceed 200 characters.", nameof(displayName));
        }

        DisplayName = normalized;
    }

    private static string RequireUserId(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId) || userId.Length > 128)
        {
            throw new ArgumentException("A valid user identifier is required.", nameof(userId));
        }

        return userId;
    }
}
