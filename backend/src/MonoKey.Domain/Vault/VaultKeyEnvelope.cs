using MonoKey.Domain.Common;

namespace MonoKey.Domain.Vault;

public sealed class VaultKeyEnvelope : AuditableEntity
{
    private VaultKeyEnvelope()
    {
    }

    public VaultKeyEnvelope(
        string userId,
        int formatVersion,
        string kdfAlgorithm,
        int kdfMemoryKiB,
        int kdfIterations,
        int kdfParallelism,
        byte[] salt,
        string encryptionAlgorithm,
        byte[] masterWrapNonce,
        byte[] masterWrappedKey,
        byte[] recoveryWrapNonce,
        byte[] recoveryWrappedKey)
    {
        UserId = RequireUserId(userId);
        Apply(
            formatVersion,
            kdfAlgorithm,
            kdfMemoryKiB,
            kdfIterations,
            kdfParallelism,
            salt,
            encryptionAlgorithm,
            masterWrapNonce,
            masterWrappedKey,
            recoveryWrapNonce,
            recoveryWrappedKey);
    }

    public string UserId { get; private set; } = string.Empty;

    public int FormatVersion { get; private set; }

    public string KdfAlgorithm { get; private set; } = string.Empty;

    public int KdfMemoryKiB { get; private set; }

    public int KdfIterations { get; private set; }

    public int KdfParallelism { get; private set; }

    public byte[] Salt { get; private set; } = [];

    public string EncryptionAlgorithm { get; private set; } = string.Empty;

    public byte[] MasterWrapNonce { get; private set; } = [];

    public byte[] MasterWrappedKey { get; private set; } = [];

    public byte[] RecoveryWrapNonce { get; private set; } = [];

    public byte[] RecoveryWrappedKey { get; private set; } = [];

    public long Revision { get; private set; } = 1;

    public Guid ConcurrencyToken { get; private set; } = Guid.CreateVersion7();

    public void Replace(
        int formatVersion,
        string kdfAlgorithm,
        int kdfMemoryKiB,
        int kdfIterations,
        int kdfParallelism,
        byte[] salt,
        string encryptionAlgorithm,
        byte[] masterWrapNonce,
        byte[] masterWrappedKey,
        byte[] recoveryWrapNonce,
        byte[] recoveryWrappedKey)
    {
        Apply(
            formatVersion,
            kdfAlgorithm,
            kdfMemoryKiB,
            kdfIterations,
            kdfParallelism,
            salt,
            encryptionAlgorithm,
            masterWrapNonce,
            masterWrappedKey,
            recoveryWrapNonce,
            recoveryWrappedKey);
        Revision++;
        ConcurrencyToken = Guid.CreateVersion7();
    }

    private void Apply(
        int formatVersion,
        string kdfAlgorithm,
        int kdfMemoryKiB,
        int kdfIterations,
        int kdfParallelism,
        byte[] salt,
        string encryptionAlgorithm,
        byte[] masterWrapNonce,
        byte[] masterWrappedKey,
        byte[] recoveryWrapNonce,
        byte[] recoveryWrappedKey)
    {
        if (formatVersion != VaultProtocol.CurrentFormatVersion)
        {
            throw new ArgumentOutOfRangeException(nameof(formatVersion), "The vault format version is unsupported.");
        }

        if (!string.Equals(kdfAlgorithm, VaultProtocol.KdfAlgorithm, StringComparison.Ordinal))
        {
            throw new ArgumentException("The KDF algorithm is unsupported.", nameof(kdfAlgorithm));
        }

        if (kdfMemoryKiB is < VaultProtocol.MinimumKdfMemoryKiB or > VaultProtocol.MaximumKdfMemoryKiB)
        {
            throw new ArgumentOutOfRangeException(nameof(kdfMemoryKiB));
        }

        if (kdfIterations is < VaultProtocol.MinimumKdfIterations or > VaultProtocol.MaximumKdfIterations)
        {
            throw new ArgumentOutOfRangeException(nameof(kdfIterations));
        }

        if (kdfParallelism is < VaultProtocol.MinimumKdfParallelism or > VaultProtocol.MaximumKdfParallelism)
        {
            throw new ArgumentOutOfRangeException(nameof(kdfParallelism));
        }

        if (!string.Equals(encryptionAlgorithm, VaultProtocol.EncryptionAlgorithm, StringComparison.Ordinal))
        {
            throw new ArgumentException("The encryption algorithm is unsupported.", nameof(encryptionAlgorithm));
        }

        FormatVersion = formatVersion;
        KdfAlgorithm = kdfAlgorithm;
        KdfMemoryKiB = kdfMemoryKiB;
        KdfIterations = kdfIterations;
        KdfParallelism = kdfParallelism;
        Salt = RequireLength(salt, VaultProtocol.SaltLength, nameof(salt));
        EncryptionAlgorithm = encryptionAlgorithm;
        MasterWrapNonce = RequireLength(masterWrapNonce, VaultProtocol.NonceLength, nameof(masterWrapNonce));
        MasterWrappedKey = RequireLength(masterWrappedKey, VaultProtocol.WrappedKeyLength, nameof(masterWrappedKey));
        RecoveryWrapNonce = RequireLength(recoveryWrapNonce, VaultProtocol.NonceLength, nameof(recoveryWrapNonce));
        RecoveryWrappedKey = RequireLength(recoveryWrappedKey, VaultProtocol.WrappedKeyLength, nameof(recoveryWrappedKey));
    }

    private static string RequireUserId(string value) =>
        string.IsNullOrWhiteSpace(value)
            ? throw new ArgumentException("A user ID is required.", nameof(value))
            : value.Trim();

    private static byte[] RequireLength(byte[] value, int length, string parameterName)
    {
        ArgumentNullException.ThrowIfNull(value);
        if (value.Length != length)
        {
            throw new ArgumentException($"The value must contain exactly {length} bytes.", parameterName);
        }

        return value.ToArray();
    }
}
