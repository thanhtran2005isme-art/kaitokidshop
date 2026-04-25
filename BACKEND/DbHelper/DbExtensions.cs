using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DbHelper;

/// <summary>
/// Extension methods để đăng ký DbContext + Repository dễ dàng trong Program.cs
/// </summary>
public static class DbExtensions
{
    /// <summary>
    /// Đăng ký DbContext với SQL Server + AuditInterceptor
    /// Usage: builder.Services.AddSqlServerDb&lt;MyDbContext&gt;(config);
    /// </summary>
    public static IServiceCollection AddSqlServerDb<TContext>(
        this IServiceCollection services,
        IConfiguration config,
        string connectionStringName = "DefaultConnection")
        where TContext : DbContext
    {
        var connectionString = config.GetConnectionString(connectionStringName)
            ?? throw new InvalidOperationException($"Connection string '{connectionStringName}' not found");

        services.AddDbContext<TContext>(options =>
        {
            options.UseSqlServer(connectionString);
            options.AddInterceptors(new AuditInterceptor());
        });

        return services;
    }

    /// <summary>
    /// Đăng ký generic repository cho một entity
    /// Usage: builder.Services.AddRepository&lt;Product&gt;();
    /// </summary>
    public static IServiceCollection AddRepository<T>(this IServiceCollection services)
        where T : BaseEntity
    {
        services.AddScoped<IRepository<T>, Repository<T>>();
        return services;
    }

    /// <summary>
    /// Đăng ký soft-delete repository cho một entity
    /// </summary>
    public static IServiceCollection AddSoftDeleteRepository<T>(this IServiceCollection services)
        where T : SoftDeleteEntity
    {
        services.AddScoped<IRepository<T>, SoftDeleteRepository<T>>();
        services.AddScoped<SoftDeleteRepository<T>>();
        return services;
    }
}
