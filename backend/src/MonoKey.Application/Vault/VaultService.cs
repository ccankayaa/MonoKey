using FluentValidation;
using MonoKey.Application.Common;
using MonoKey.Domain.Vault;
using MonoKey.Application.Membership;

namespace MonoKey.Application.Vault;

internal sealed class VaultService(IVaultRepository repository, IUserContext userContext, IMembershipService membership) : IVaultService
{
    public async Task<VaultKeyEnvelopeDto> GetKeyEnvelopeAsync(CancellationToken cancellationToken)
    {
        var envelope = await repository.GetKeyEnvelopeAsync(userContext.UserId, false, cancellationToken)
            ?? throw new NotFoundException("The vault key envelope was not found.");
        return Map(envelope);
    }

    public async Task<VaultKeyEnvelopeDto> PutKeyEnvelopeAsync(
        PutVaultKeyEnvelopeCommand command,
        CancellationToken cancellationToken)
    {
        var existing = await repository.GetKeyEnvelopeAsync(userContext.UserId, true, cancellationToken);
        var material = Decode(command);

        if (existing is null)
        {
            if (command.ExpectedRevision.HasValue)
            {
                throw new ConflictException("The vault key envelope does not exist at the expected revision.");
            }

            existing = new VaultKeyEnvelope(
                userContext.UserId,
                command.FormatVersion,
                command.KdfAlgorithm,
                command.KdfMemoryKiB,
                command.KdfIterations,
                command.KdfParallelism,
                material.Salt,
                command.EncryptionAlgorithm,
                material.MasterWrapNonce,
                material.MasterWrappedKey,
                material.RecoveryWrapNonce,
                material.RecoveryWrappedKey);
            await repository.AddKeyEnvelopeAsync(existing, cancellationToken);
        }
        else
        {
            if (command.ExpectedRevision is null && existing.Revision == 1 && existing.FormatVersion == command.FormatVersion &&
                existing.KdfAlgorithm == command.KdfAlgorithm && existing.KdfMemoryKiB == command.KdfMemoryKiB && existing.KdfIterations == command.KdfIterations && existing.KdfParallelism == command.KdfParallelism && existing.EncryptionAlgorithm == command.EncryptionAlgorithm &&
                existing.Salt.AsSpan().SequenceEqual(material.Salt) && existing.MasterWrapNonce.AsSpan().SequenceEqual(material.MasterWrapNonce) && existing.MasterWrappedKey.AsSpan().SequenceEqual(material.MasterWrappedKey) &&
                existing.RecoveryWrapNonce.AsSpan().SequenceEqual(material.RecoveryWrapNonce) && existing.RecoveryWrappedKey.AsSpan().SequenceEqual(material.RecoveryWrappedKey)) return Map(existing);
            EnsureRevision(existing.Revision, command.ExpectedRevision);
            existing.Replace(
                command.FormatVersion,
                command.KdfAlgorithm,
                command.KdfMemoryKiB,
                command.KdfIterations,
                command.KdfParallelism,
                material.Salt,
                command.EncryptionAlgorithm,
                material.MasterWrapNonce,
                material.MasterWrappedKey,
                material.RecoveryWrapNonce,
                material.RecoveryWrappedKey);
        }

        await repository.SaveChangesAsync(cancellationToken);
        return Map(existing);
    }

    public async Task<VaultRecordDto> CreateRecordAsync(
        CreateVaultRecordCommand command,
        CancellationToken cancellationToken)
    {
        if (command.Id == Guid.Empty)
        {
            throw new ValidationException("A non-empty opaque record ID is required.");
        }

        var existing = await repository.GetRecordAsync(userContext.UserId, command.Id, false, cancellationToken);
        if (existing is not null)
        {
            if (!existing.IsDeleted && existing.Revision == 1 && existing.FormatVersion == command.FormatVersion
                && existing.EncryptionAlgorithm == command.EncryptionAlgorithm
                && existing.Nonce.AsSpan().SequenceEqual(DecodeBase64(command.Nonce, nameof(command.Nonce)))
                && existing.Ciphertext.AsSpan().SequenceEqual(DecodeBase64(command.Ciphertext, nameof(command.Ciphertext))))
            {
                return Map(existing);
            }
            throw new ConflictException("A vault record with this ID already exists.");
        }

        await membership.EnsureCanCreateAsync(true, cancellationToken);
        var record = new VaultRecord(
            command.Id,
            userContext.UserId,
            command.FormatVersion,
            command.EncryptionAlgorithm,
            DecodeBase64(command.Nonce, nameof(command.Nonce)),
            DecodeBase64(command.Ciphertext, nameof(command.Ciphertext)));
        await repository.AddRecordAsync(record, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return Map(record);
    }

    public async Task<PagedResult<VaultRecordDto>> ListRecordsAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        if (page <= 0 || pageSize is <= 0 or > 500)
        {
            throw new ValidationException("Page must be positive and page size must be between 1 and 500.");
        }

        var (items, totalCount) = await repository.ListRecordsAsync(
            userContext.UserId,
            (page - 1) * pageSize,
            pageSize,
            cancellationToken);
        return new PagedResult<VaultRecordDto>(items.Select(Map).ToArray(), page, pageSize, totalCount);
    }

    public async Task<VaultRecordDto> GetRecordAsync(Guid id, CancellationToken cancellationToken) =>
        Map(await FindOwnedRecordAsync(id, false, cancellationToken));

    public async Task<VaultRecordDto> UpdateRecordAsync(
        Guid id,
        UpdateVaultRecordCommand command,
        CancellationToken cancellationToken)
    {
        var record = await FindOwnedRecordAsync(id, true, cancellationToken);
        EnsureRevision(record.Revision, command.ExpectedRevision);
        record.ReplaceEncryptedPayload(
            command.FormatVersion,
            command.EncryptionAlgorithm,
            DecodeBase64(command.Nonce, nameof(command.Nonce)),
            DecodeBase64(command.Ciphertext, nameof(command.Ciphertext)));
        await repository.SaveChangesAsync(cancellationToken);
        return Map(record);
    }

    public async Task<VaultRecordDto> DeleteRecordAsync(
        Guid id,
        long expectedRevision,
        CancellationToken cancellationToken)
    {
        var record = await FindOwnedRecordAsync(id, true, cancellationToken);
        EnsureRevision(record.Revision, expectedRevision);
        record.MarkDeleted();
        await repository.SaveChangesAsync(cancellationToken);
        return Map(record);
    }

    private async Task<VaultRecord> FindOwnedRecordAsync(
        Guid id,
        bool trackChanges,
        CancellationToken cancellationToken) =>
        await repository.GetRecordAsync(userContext.UserId, id, trackChanges, cancellationToken)
            ?? throw new NotFoundException("The vault record was not found.");

    private static void EnsureRevision(long actualRevision, long? expectedRevision)
    {
        if (!expectedRevision.HasValue || expectedRevision.Value <= 0)
        {
            throw new ValidationException("A positive expected revision is required.");
        }

        if (actualRevision != expectedRevision.Value)
        {
            throw new ConflictException("The encrypted vault item was changed by another request.");
        }
    }

    private static KeyMaterial Decode(PutVaultKeyEnvelopeCommand command) => new(
        DecodeBase64(command.Salt, nameof(command.Salt)),
        DecodeBase64(command.MasterWrapNonce, nameof(command.MasterWrapNonce)),
        DecodeBase64(command.MasterWrappedKey, nameof(command.MasterWrappedKey)),
        DecodeBase64(command.RecoveryWrapNonce, nameof(command.RecoveryWrapNonce)),
        DecodeBase64(command.RecoveryWrappedKey, nameof(command.RecoveryWrappedKey)));

    private static byte[] DecodeBase64(string value, string field)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ValidationException($"{field} is required.");
        }

        try
        {
            return Convert.FromBase64String(value);
        }
        catch (FormatException)
        {
            throw new ValidationException($"{field} must be valid Base64.");
        }
    }

    private static VaultKeyEnvelopeDto Map(VaultKeyEnvelope envelope) => new(
        envelope.FormatVersion,
        envelope.KdfAlgorithm,
        envelope.KdfMemoryKiB,
        envelope.KdfIterations,
        envelope.KdfParallelism,
        Convert.ToBase64String(envelope.Salt),
        envelope.EncryptionAlgorithm,
        Convert.ToBase64String(envelope.MasterWrapNonce),
        Convert.ToBase64String(envelope.MasterWrappedKey),
        Convert.ToBase64String(envelope.RecoveryWrapNonce),
        Convert.ToBase64String(envelope.RecoveryWrappedKey),
        envelope.Revision,
        envelope.CreatedAtUtc,
        envelope.UpdatedAtUtc);

    private static VaultRecordDto Map(VaultRecord record) => new(
        record.Id,
        record.FormatVersion,
        record.EncryptionAlgorithm,
        Convert.ToBase64String(record.Nonce),
        Convert.ToBase64String(record.Ciphertext),
        record.Revision,
        record.IsDeleted,
        record.CreatedAtUtc,
        record.UpdatedAtUtc);

    private sealed record KeyMaterial(
        byte[] Salt,
        byte[] MasterWrapNonce,
        byte[] MasterWrappedKey,
        byte[] RecoveryWrapNonce,
        byte[] RecoveryWrappedKey);
}
