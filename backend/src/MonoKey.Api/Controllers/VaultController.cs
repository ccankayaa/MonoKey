using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MonoKey.Application.Common;
using MonoKey.Application.Vault;

namespace MonoKey.Api.Controllers;

[ApiController]
[Authorize]
[EnableRateLimiting("vault")]
[RequestSizeLimit(350_000)]
[Route("api/vault")]
public sealed class VaultController(IVaultService service) : ControllerBase
{
    [HttpGet("key-envelope")]
    public async Task<ActionResult<VaultKeyEnvelopeDto>> GetKeyEnvelope(CancellationToken cancellationToken)
    {
        var result = await service.GetKeyEnvelopeAsync(cancellationToken);
        SetRevisionEtag(result.Revision);
        return Ok(result);
    }

    [HttpPut("key-envelope")]
    public async Task<ActionResult<VaultKeyEnvelopeDto>> PutKeyEnvelope(
        PutVaultKeyEnvelopeRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.PutKeyEnvelopeAsync(request.ToCommand(), cancellationToken);
        SetRevisionEtag(result.Revision);
        return Ok(result);
    }

    [HttpPost("records")]
    public async Task<ActionResult<VaultRecordDto>> CreateRecord(
        CreateVaultRecordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.CreateRecordAsync(request.ToCommand(), cancellationToken);
        SetRevisionEtag(result.Revision);
        return CreatedAtAction(nameof(GetRecord), new { id = result.Id }, result);
    }

    [HttpGet("records")]
    public async Task<ActionResult<PagedResult<VaultRecordDto>>> ListRecords(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 100,
        CancellationToken cancellationToken = default) =>
        Ok(await service.ListRecordsAsync(page, pageSize, cancellationToken));

    [HttpGet("records/{id:guid}")]
    public async Task<ActionResult<VaultRecordDto>> GetRecord(Guid id, CancellationToken cancellationToken)
    {
        var result = await service.GetRecordAsync(id, cancellationToken);
        SetRevisionEtag(result.Revision);
        return Ok(result);
    }

    [HttpPut("records/{id:guid}")]
    public async Task<ActionResult<VaultRecordDto>> UpdateRecord(
        Guid id,
        UpdateVaultRecordRequest request,
        CancellationToken cancellationToken)
    {
        var result = await service.UpdateRecordAsync(id, request.ToCommand(), cancellationToken);
        SetRevisionEtag(result.Revision);
        return Ok(result);
    }

    [HttpDelete("records/{id:guid}")]
    public async Task<ActionResult<VaultRecordDto>> DeleteRecord(
        Guid id,
        [FromQuery] long expectedRevision,
        CancellationToken cancellationToken)
    {
        var result = await service.DeleteRecordAsync(id, expectedRevision, cancellationToken);
        SetRevisionEtag(result.Revision);
        return Ok(result);
    }

    private void SetRevisionEtag(long revision) => Response.Headers.ETag = $"\"{revision}\"";
}

public sealed record PutVaultKeyEnvelopeRequest(
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
    long? ExpectedRevision)
{
    public PutVaultKeyEnvelopeCommand ToCommand() => new(
        FormatVersion,
        KdfAlgorithm,
        KdfMemoryKiB,
        KdfIterations,
        KdfParallelism,
        Salt,
        EncryptionAlgorithm,
        MasterWrapNonce,
        MasterWrappedKey,
        RecoveryWrapNonce,
        RecoveryWrappedKey,
        ExpectedRevision);
}

public sealed record CreateVaultRecordRequest(
    Guid Id,
    int FormatVersion,
    string EncryptionAlgorithm,
    string Nonce,
    string Ciphertext)
{
    public CreateVaultRecordCommand ToCommand() => new(
        Id,
        FormatVersion,
        EncryptionAlgorithm,
        Nonce,
        Ciphertext);
}

public sealed record UpdateVaultRecordRequest(
    int FormatVersion,
    string EncryptionAlgorithm,
    string Nonce,
    string Ciphertext,
    long ExpectedRevision)
{
    public UpdateVaultRecordCommand ToCommand() => new(
        FormatVersion,
        EncryptionAlgorithm,
        Nonce,
        Ciphertext,
        ExpectedRevision);
}
