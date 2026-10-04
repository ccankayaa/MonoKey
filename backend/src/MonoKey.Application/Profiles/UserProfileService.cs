using FluentValidation;
using MonoKey.Application.Common;
using MonoKey.Domain.Profiles;

namespace MonoKey.Application.Profiles;

public sealed class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand>
{
    public UpdateUserProfileCommandValidator()
    {
        RuleFor(command => command.DisplayName).MaximumLength(200);
    }
}

internal sealed class UserProfileService(
    IUserProfileRepository repository,
    IUserContext userContext,
    IValidator<UpdateUserProfileCommand> validator) : IUserProfileService
{
    public async Task<UserProfileDto> GetAsync(CancellationToken cancellationToken)
    {
        var profile = await repository.GetAsync(userContext.UserId, cancellationToken)
            ?? throw new NotFoundException("User profile was not found.");
        return Map(profile);
    }

    public async Task<UserProfileDto> UpsertAsync(
        UpdateUserProfileCommand command,
        CancellationToken cancellationToken)
    {
        await validator.ValidateAndThrowAsync(command, cancellationToken);
        var profile = await repository.GetAsync(userContext.UserId, cancellationToken);
        if (profile is null)
        {
            profile = new UserProfile(userContext.UserId, command.DisplayName);
            await repository.AddAsync(profile, cancellationToken);
        }
        else
        {
            profile.Update(command.DisplayName);
        }

        await repository.SaveChangesAsync(cancellationToken);
        return Map(profile);
    }

    private static UserProfileDto Map(UserProfile profile) => new(
        profile.Id,
        profile.DisplayName,
        profile.CreatedAtUtc,
        profile.UpdatedAtUtc);
}
