namespace MonoKey.Domain.Vault;

public static class VaultProtocol
{
    public const int CurrentFormatVersion = 1;
    public const string KdfAlgorithm = "argon2id";
    public const string EncryptionAlgorithm = "xchacha20-poly1305";
    public const int SaltLength = 16;
    public const int NonceLength = 24;
    public const int WrappedKeyLength = 48;
    public const int MinimumCiphertextLength = 16;
    public const int MaximumCiphertextLength = 262_160;
    public const int MinimumKdfMemoryKiB = 32 * 1024;
    public const int MaximumKdfMemoryKiB = 256 * 1024;
    public const int MinimumKdfIterations = 2;
    public const int MaximumKdfIterations = 10;
    public const int MinimumKdfParallelism = 1;
    public const int MaximumKdfParallelism = 4;
}
