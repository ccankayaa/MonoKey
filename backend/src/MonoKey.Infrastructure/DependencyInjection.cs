using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using MonoKey.Application.Devices;
using MonoKey.Application.Notifications;
using MonoKey.Application.Profiles;
using MonoKey.Application.Subscriptions;
using MonoKey.Application.Vault;
using MonoKey.Application.Membership;
using MonoKey.Infrastructure.Membership;
using Microsoft.Extensions.Configuration;
using MonoKey.Infrastructure.Persistence;
using MonoKey.Infrastructure.Persistence.Repositories;

namespace MonoKey.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string? connectionString, BillingOptions? billingOptions = null, RevenueCatOptions? revenueCatOptions = null)
    {
        services.TryAddSingleton(TimeProvider.System);
        services.AddScoped<AuditSaveChangesInterceptor>();
        services.AddScoped<PlanCreationInterceptor>();
        services.AddDbContext<MonoKeyDbContext>((serviceProvider, options) =>
            options
                .UseNpgsql(connectionString)
                .AddInterceptors(serviceProvider.GetRequiredService<AuditSaveChangesInterceptor>(), serviceProvider.GetRequiredService<PlanCreationInterceptor>()));

        services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
        services.AddScoped<IUserProfileRepository, UserProfileRepository>();
        services.AddScoped<IDeviceRepository, DeviceRepository>();
        services.AddScoped<INotificationPreferenceRepository, NotificationPreferenceRepository>();
        services.AddScoped<IVaultRepository, VaultRepository>();
        services.AddScoped<ISubscriptionLinkService, SubscriptionLinkService>();
        services.AddScoped<IMembershipService, MembershipService>();
        services.AddScoped<IMobileMembershipService, MobileMembershipService>();
        services.AddScoped<IMobileEntitlementProvider, RevenueCatEntitlementProvider>();
        services.AddSingleton(Microsoft.Extensions.Options.Options.Create(revenueCatOptions ?? new RevenueCatOptions()));
        services.AddSingleton(Microsoft.Extensions.Options.Options.Create(billingOptions ?? new BillingOptions()));
        services.AddSingleton(new HttpClient { BaseAddress = new Uri("https://api.stripe.com/v1/"), Timeout = TimeSpan.FromSeconds(15) });
        return services;
    }
}
