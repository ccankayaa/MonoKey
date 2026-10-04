using Microsoft.EntityFrameworkCore;
using MonoKey.Application.Profiles;
using MonoKey.Domain.Profiles;

namespace MonoKey.Infrastructure.Persistence.Repositories;

internal sealed class UserProfileRepository(MonoKeyDbContext context) : IUserProfileRepository
{
    public Task<UserProfile?> GetAsync(string userId, CancellationToken cancellationToken) =>
        context.UserProfiles.SingleOrDefaultAsync(profile => profile.UserId == userId, cancellationToken);

    public Task AddAsync(UserProfile profile, CancellationToken cancellationToken) =>
        context.UserProfiles.AddAsync(profile, cancellationToken).AsTask();

    public Task SaveChangesAsync(CancellationToken cancellationToken) => context.SaveChangesAsync(cancellationToken);
}
