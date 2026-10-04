using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Net;

namespace MonoKey.Api.Infrastructure;

internal sealed class FirebaseTokenEvents(TimeProvider timeProvider) : JwtBearerEvents
{
    public override Task TokenValidated(TokenValidatedContext context)
    {
        var environment = context.HttpContext.RequestServices.GetRequiredService<IHostEnvironment>();
        var configuration = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>();
        if (configuration.GetValue<bool>("Authentication:Firebase:UseEmulator") &&
            (!environment.IsDevelopment() ||
             context.HttpContext.Connection.RemoteIpAddress is not { } address ||
             !IPAddress.IsLoopback(address) && !configuration.GetValue<bool>("Development:AllowLan")))
        {
            context.Fail("Emulator authentication is outside the local boundary.");
            return Task.CompletedTask;
        }
        var subject = context.Principal?.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(subject) || subject.Length > 128)
        {
            context.Fail("The Firebase subject claim is invalid.");
            return Task.CompletedTask;
        }

        var now = timeProvider.GetUtcNow().ToUnixTimeSeconds();
        if (!IsPastUnixTimestamp(context.Principal?.FindFirst("iat")?.Value, now) ||
            !IsPastUnixTimestamp(context.Principal?.FindFirst("auth_time")?.Value, now))
        {
            context.Fail("The Firebase token timestamps are invalid.");
        }

        return Task.CompletedTask;
    }

    private static bool IsPastUnixTimestamp(string? value, long now) =>
        long.TryParse(value, out var timestamp) && timestamp > 0 && timestamp <= now + 30;
}
