using MonoKey.Application.Common;

namespace MonoKey.Application.Vault;

public sealed record PutVaultKeyEnvelopeCommand(
    int FormatVersion,
    string KdfAlgorithm,
    int KdfMemoryKiB,
    int KdfIterations,
    int KdfParallelism,
    string Salt,
    string EncryptionAlgorithm,
    string MasterWrapNonce,
    string MasterWrappedKey,
    string RecoveryWrapNonce,
    string RecoveryWrappedKey,
    long? ExpectedRevision);

public sealed record VaultKeyEnvelopeDto(
    int FormatVersion,
    string KdfAlgorithm,
    int KdfMemoryKiB,
    int KdfIterations,
    int KdfParallelism,
    string Salt,
    string EncryptionAlgorithm,
    string MasterWrapNonce,
    string MasterWrappedKey,
    string RecoveryWrapNonce,
    string RecoveryWrappedKey,
    long Revision,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public sealed record CreateVaultRecordCommand(
    Guid Id,
    int FormatVersion,
    string EncryptionAlgorithm,
    string Nonce,
    string Ciphertext);

public sealed record UpdateVaultRecordCommand(
    int FormatVersion,
    string EncryptionAlgorithm,
    string Nonce,
    string Ciphertext,
    long ExpectedRevision);

public sealed record VaultRecordDto(
    Guid Id,
    int FormatVersion,
    string EncryptionAlgorithm,
    string Nonce,
    string Ciphertext,
    long Revision,
    bool IsDeleted,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public interface IVaultService
{
    Task<VaultKeyEnvelopeDto> GetKeyEnvelopeAsync(CancellationToken cancellationToken);

    Task<VaultKeyEnvelopeDto> PutKeyEnvelopeAsync(
        PutVaultKeyEnvelopeCommand command,
        CancellationToken cancellationToken);

    Task<VaultRecordDto> CreateRecordAsync(
        CreateVaultRecordCommand command,
        CancellationToken cancellationToken);

    Task<PagedResult<VaultRecordDto>> ListRecordsAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<VaultRecordDto> GetRecordAsync(Guid id, CancellationToken cancellationToken);

    Task<VaultRecordDto> UpdateRecordAsync(
        Guid id,
        UpdateVaultRecordCommand command,
        CancellationToken cancellationToken);

    Task<VaultRecordDto> DeleteRecordAsync(
        Guid id,
        long expectedRevision,
        CancellationToken cancellationToken);
}
