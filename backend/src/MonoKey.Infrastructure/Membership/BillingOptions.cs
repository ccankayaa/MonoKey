namespace MonoKey.Infrastructure.Membership;

public sealed class BillingOptions
{
    public bool Enabled { get; set; }
    public string? StripeSecretKey { get; set; }
    public string? StripeWebhookSecret { get; set; }
    public string? StripePriceId { get; set; }
    public string? WebOrigin { get; set; }
    public string? DisplayPrice { get; set; }
    public int? FreeSubscriptionLimit { get; set; }
    public int? FreeVaultRecordLimit { get; set; }
    public bool IsConfigured => Enabled && StripeSecretKey?.StartsWith("sk_test_", StringComparison.Ordinal) == true &&
        StripeWebhookSecret?.StartsWith("whsec_", StringComparison.Ordinal) == true &&
        StripePriceId?.StartsWith("price_", StringComparison.Ordinal) == true &&
        Uri.TryCreate(WebOrigin, UriKind.Absolute, out var origin) && origin.Scheme == "https" && origin.AbsolutePath == "/";
}
