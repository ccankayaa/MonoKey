using MonoKey.Domain.Vault;

namespace MonoKey.UnitTests.Vault;

public sealed class VaultRecordTests
{
    [Fact]
    public void Constructor_PreservesClientGeneratedOpaqueIdAndEncryptedBytes()
    {
        var id = Guid.CreateVersion7();
        var nonce = new byte[VaultProtocol.NonceLength];
        var ciphertext = new byte[VaultProtocol.MinimumCiphertextLength];

        var record = new VaultRecord(
            id,
            "user-1",
            VaultProtocol.CurrentFormatVersion,
            VaultProtocol.EncryptionAlgorithm,
            nonce,
            ciphertext);

        Assert.Equal(id, record.Id);
        Assert.Equal(nonce, record.Nonce);
        Assert.Equal(ciphertext, record.Ciphertext);
        Assert.Equal(1, record.Revision);
    }

    [Fact]
    public void MarkDeleted_RemovesEncryptedPayloadAndAdvancesRevision()
    {
        var record = new VaultRecord(
            Guid.CreateVersion7(),
            "user-1",
            VaultProtocol.CurrentFormatVersion,
            VaultProtocol.EncryptionAlgorithm,
            new byte[VaultProtocol.NonceLength],
            new byte[VaultProtocol.MinimumCiphertextLength]);

        record.MarkDeleted();

        Assert.True(record.IsDeleted);
        Assert.Empty(record.Nonce);
        Assert.Empty(record.Ciphertext);
        Assert.Equal(2, record.Revision);
    }

    [Fact]
    public void Constructor_RejectsPlaintextSizedOrMalformedEnvelope()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => new VaultRecord(
            Guid.CreateVersion7(),
            "user-1",
            VaultProtocol.CurrentFormatVersion,
            VaultProtocol.EncryptionAlgorithm,
            new byte[VaultProtocol.NonceLength],
            new byte[VaultProtocol.MinimumCiphertextLength - 1]));
    }
}
