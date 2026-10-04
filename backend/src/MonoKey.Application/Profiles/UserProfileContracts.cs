using MonoKey.Application.Common;
using MonoKey.Domain.Profiles;

namespace MonoKey.Application.Profiles;

public sealed record UpdateUserProfileCommand(string? DisplayName);

public sealed record UserProfileDto(
    Guid Id,
    string? DisplayName,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset UpdatedAtUtc);

public interface IUserProfileRepository
{
    Task<UserProfile?> GetAsync(string userId, CancellationToken cancellationToken);

    Task AddAsync(UserProfile profile, CancellationToken cancellationToken);

    Task SaveChangesAsync(CancellationToken cancellationToken);
}

public interface IUserProfileService
{
    Task<UserProfileDto> GetAsync(CancellationToken cancellationToken);

    Task<UserProfileDto> UpsertAsync(UpdateUserProfileCommand command, CancellationToken cancellationToken);
}
