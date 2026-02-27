using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DbHelper;

/// <summary>
/// Base class cho database seeder — tự động migrate + seed data khi khởi động
/// </summary>
public abstract class DbSeeder<TContext>(IServiceProvider serviceProvider, ILogger logger)
    : IHostedService where TContext : DbContext
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<TContext>();

        try
        {
            logger.LogInformation("Applying migrations for {Context}...", typeof(TContext).Name);
            await db.Database.MigrateAsync(cancellationToken);
            logger.LogInformation("Migrations applied successfully");

            if (!await HasDataAsync(db))
            {
                logger.LogInformation("Seeding initial data...");
                await SeedAsync(db, cancellationToken);
                await db.SaveChangesAsync(cancellationToken);
                logger.LogInformation("Data seeded successfully");
            }
            else
            {
                logger.LogInformation("Database already has data, skipping seed");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during database initialization for {Context}", typeof(TContext).Name);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    /// <summary>
    /// Kiểm tra DB đã có data chưa — override để custom logic
    /// </summary>
    protected abstract Task<bool> HasDataAsync(TContext db);

    /// <summary>
    /// Seed data ban đầu — override để thêm data
    /// </summary>
    protected abstract Task SeedAsync(TContext db, CancellationToken cancellationToken);
}
