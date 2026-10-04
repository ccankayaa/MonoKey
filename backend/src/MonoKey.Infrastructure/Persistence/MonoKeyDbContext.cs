using Microsoft.EntityFrameworkCore;
using MonoKey.Domain.Devices;
using MonoKey.Domain.Notifications;
using MonoKey.Domain.Profiles;
using MonoKey.Domain.Subscriptions;
using MonoKey.Domain.Vault;
using MonoKey.Domain.Membership;

namespace MonoKey.Infrastructure.Persistence;

public sealed class MonoKeyDbContext(DbContextOptions<MonoKeyDbContext> options) : DbContext(options)
{
    public DbSet<Subscription> Subscriptions => Set<Subscription>();

    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();

    public DbSet<DeviceRecord> Devices => Set<DeviceRecord>();

    public DbSet<NotificationPreference> NotificationPreferences => Set<NotificationPreference>();

    public DbSet<VaultKeyEnvelope> VaultKeyEnvelopes => Set<VaultKeyEnvelope>();

    public DbSet<VaultRecord> VaultRecords => Set<VaultRecord>();
    public DbSet<SubscriptionVaultLink> SubscriptionVaultLinks => Set<SubscriptionVaultLink>();
    public DbSet<AccountMembership> Memberships => Set<AccountMembership>();
    public DbSet<BillingEvent> BillingEvents => Set<BillingEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("monokey");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MonoKeyDbContext).Assembly);
        var links = modelBuilder.Entity<SubscriptionVaultLink>();
        links.ToTable("subscription_vault_links");
        links.HasKey(item => item.Id);
        links.Property(item => item.UserId).HasMaxLength(128);
        links.HasIndex(item => new { item.UserId, item.SubscriptionId, item.VaultRecordId }).IsUnique();
        modelBuilder.Entity<Subscription>().HasAlternateKey(item => new { item.Id, item.UserId });
        modelBuilder.Entity<VaultRecord>().HasAlternateKey(item => new { item.Id, item.UserId });
        links.HasOne<Subscription>().WithMany().HasForeignKey(item => new { item.SubscriptionId, item.UserId }).HasPrincipalKey(item => new { item.Id, item.UserId }).OnDelete(DeleteBehavior.Cascade);
        links.HasOne<VaultRecord>().WithMany().HasForeignKey(item => new { item.VaultRecordId, item.UserId }).HasPrincipalKey(item => new { item.Id, item.UserId }).OnDelete(DeleteBehavior.Cascade);
        var memberships = modelBuilder.Entity<AccountMembership>();
        memberships.ToTable("account_memberships");
        memberships.HasKey(item => item.Id);
        memberships.Property(item => item.UserId).HasMaxLength(128);
        memberships.Property(item => item.Provider).HasMaxLength(32);
        memberships.Property(item => item.CustomerReference).HasMaxLength(200);
        memberships.Property(item => item.Status).HasMaxLength(32);
        memberships.Property(item => item.LastProviderEventUtc).IsConcurrencyToken();
        memberships.HasIndex(item => item.UserId).IsUnique();
        memberships.HasIndex(item => new { item.Provider, item.CustomerReference }).IsUnique();
        var events = modelBuilder.Entity<BillingEvent>();
        events.ToTable("billing_events");
        events.HasKey(item => item.Id);
        events.Property(item => item.Provider).HasMaxLength(32);
        events.Property(item => item.ExternalId).HasMaxLength(200);
        events.HasIndex(item => new { item.Provider, item.ExternalId }).IsUnique();
        events.HasOne<AccountMembership>().WithMany().HasForeignKey(item => item.MembershipId).OnDelete(DeleteBehavior.Restrict);
    }
}
