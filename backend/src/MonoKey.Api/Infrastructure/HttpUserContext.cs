using System.Security.Claims;
using MonoKey.Application.Common;

namespace MonoKey.Api.Infrastructure;

internal sealed class HttpUserContext(IHttpContextAccessor accessor) : IUserContext
{
    public string UserId
    {
        get
        {
            var userId = accessor.HttpContext?.User.FindFirstValue("sub")
                ?? accessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return !string.IsNullOrWhiteSpace(userId)
                ? userId
                : throw new UnauthorizedAccessException("An authenticated user identifier is required.");
        }
    }
}
