using System.Globalization;
using System.Security.Cryptography;
using System.Text;

namespace MonoKey.Infrastructure.Membership;

public static class StripeSignature
{
    public static bool Verify(string body, string signature, string secret, DateTimeOffset now)
    {
        var parts = signature.Split(',').Select(part => part.Split('=', 2)).Where(part => part.Length == 2).ToArray();
        var timestampText = parts.FirstOrDefault(part => part[0] == "t")?[1];
        if (!long.TryParse(timestampText, NumberStyles.None, CultureInfo.InvariantCulture, out var timestamp) ||
            Math.Abs((decimal)now.ToUnixTimeSeconds() - timestamp) > 300) return false;
        var expected = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes($"{timestamp}.{body}"));
        foreach (var part in parts.Where(part => part[0] == "v1"))
        {
            try
            {
                if (CryptographicOperations.FixedTimeEquals(expected, Convert.FromHexString(part[1]))) return true;
            }
            catch (FormatException) { }
        }

        return false;
    }
}
