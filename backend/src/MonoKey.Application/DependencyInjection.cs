using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using MonoKey.Application.Devices;
using MonoKey.Application.Notifications;
using MonoKey.Application.Profiles;
using MonoKey.Application.Subscriptions;
using MonoKey.Application.Vault;

namespace MonoKey.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssemblyContaining(typeof(DependencyInjection));
        services.AddScoped<ISubscriptionService, SubscriptionService>();
        services.AddScoped<IUserProfileService, UserProfileService>();
        services.AddScoped<IDeviceService, DeviceService>();
        services.AddScoped<INotificationPreferenceService, NotificationPreferenceService>();
        services.AddScoped<IVaultService, VaultService>();
        return services;
    }
}
