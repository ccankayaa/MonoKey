using MonoKey.Domain.Common;

namespace MonoKey.Domain.Vault;

public sealed class VaultRecord : AuditableEntity
{
    private VaultRecord()
    {
    }

    public VaultRecord(
        Guid id,
        string userId,
        int formatVersion,
        string encryptionAlgorithm,
        byte[] nonce,
        byte[] ciphertext)
        : base(id)
    {
        UserId = string.IsNullOrWhiteSpace(userId)
            ? throw new ArgumentException("A user ID is required.", nameof(userId))
            : userId.Trim();
        ReplaceEncryptedPayload(formatVersion, encryptionAlgorithm, nonce, ciphertext, incrementRevision: false);
    }

    public string UserId { get; private set; } = string.Empty;

    public int FormatVersion { get; private set; }

    public string EncryptionAlgorithm { get; private set; } = string.Empty;

    public byte[] Nonce { get; private set; } = [];

    public byte[] Ciphertext { get; private set; } = [];

    public long Revision { get; private set; } = 1;

    public bool IsDeleted { get; private set; }

    public Guid ConcurrencyToken { get; private set; } = Guid.CreateVersion7();

    public void ReplaceEncryptedPayload(
        int formatVersion,
        string encryptionAlgorithm,
        byte[] nonce,
        byte[] ciphertext) =>
        ReplaceEncryptedPayload(formatVersion, encryptionAlgorithm, nonce, ciphertext, incrementRevision: true);

    public void MarkDeleted()
    {
        if (IsDeleted)
        {
            return;
        }

        IsDeleted = true;
        Nonce = [];
        Ciphertext = [];
        Revision++;
        ConcurrencyToken = Guid.CreateVersion7();
    }

    private void ReplaceEncryptedPayload(
        int formatVersion,
        string encryptionAlgorithm,
        byte[] nonce,
        byte[] ciphertext,
        bool incrementRevision)
    {
        if (formatVersion != VaultProtocol.CurrentFormatVersion)
        {
            throw new ArgumentOutOfRangeException(nameof(formatVersion), "The vault format version is unsupported.");
        }

        if (!string.Equals(encryptionAlgorithm, VaultProtocol.EncryptionAlgorithm, StringComparison.Ordinal))
        {
            throw new ArgumentException("The encryption algorithm is unsupported.", nameof(encryptionAlgorithm));
        }

        ArgumentNullException.ThrowIfNull(nonce);
        ArgumentNullException.ThrowIfNull(ciphertext);
        if (nonce.Length != VaultProtocol.NonceLength)
        {
            throw new ArgumentException($"The nonce must contain exactly {VaultProtocol.NonceLength} bytes.", nameof(nonce));
        }

        if (ciphertext.Length is < VaultProtocol.MinimumCiphertextLength or > VaultProtocol.MaximumCiphertextLength)
        {
            throw new ArgumentOutOfRangeException(nameof(ciphertext), "The encrypted payload size is invalid.");
        }

        FormatVersion = formatVersion;
        EncryptionAlgorithm = encryptionAlgorithm;
        Nonce = nonce.ToArray();
        Ciphertext = ciphertext.ToArray();
        IsDeleted = false;
        if (incrementRevision)
        {
            Revision++;
            ConcurrencyToken = Guid.CreateVersion7();
        }
    }
}
