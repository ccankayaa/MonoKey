using MonoKey.Domain.Vault;

namespace MonoKey.Application.Vault;

public interface IVaultRepository
{
    Task<VaultKeyEnvelope?> GetKeyEnvelopeAsync(
        string userId,
        bool trackChanges,
        CancellationToken cancellationToken);

    Task AddKeyEnvelopeAsync(VaultKeyEnvelope envelope, CancellationToken cancellationToken);

    Task<VaultRecord?> GetRecordAsync(
        string userId,
        Guid id,
        bool trackChanges,
        CancellationToken cancellationToken);

    Task<(IReadOnlyList<VaultRecord> Items, int TotalCount)> ListRecordsAsync(
        string userId,
        int skip,
        int take,
        CancellationToken cancellationToken);

    Task AddRecordAsync(VaultRecord record, CancellationToken cancellationToken);

    Task SaveChangesAsync(CancellationToken cancellationToken);
}
