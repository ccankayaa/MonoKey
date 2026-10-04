namespace MonoKey.Infrastructure.Membership;

public sealed class RevenueCatOptions
{
    public bool Enabled { get; set; }
    public string? SecretKey { get; set; }
    public string? WebhookAuthorization { get; set; }
    public string? EntitlementId { get; set; }
    public bool IsConfigured => Enabled && !string.IsNullOrWhiteSpace(SecretKey) &&
        WebhookAuthorization?.Length >= 32 && !string.IsNullOrWhiteSpace(EntitlementId);
}
