using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

namespace DbHelper;

/// <summary>
/// Extension methods cho IQueryable — phân trang, sắp xếp
/// </summary>
public static class QueryExtensions
{
    /// <summary>
    /// Phân trang: query.Paginate(page, pageSize)
    /// </summary>
    public static async Task<(List<T> Items, int TotalCount)> PaginateAsync<T>(
        this IQueryable<T> query, int page, int pageSize)
    {
        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (items, totalCount);
    }

    /// <summary>
    /// Sắp xếp động theo tên property: query.OrderByProperty("Price", descending: true)
    /// </summary>
    public static IQueryable<T> OrderByProperty<T>(this IQueryable<T> query, string propertyName, bool descending = false)
    {
        var parameter = Expression.Parameter(typeof(T), "x");
        var property = Expression.Property(parameter, propertyName);
        var lambda = Expression.Lambda(property, parameter);

        var methodName = descending ? "OrderByDescending" : "OrderBy";
        var method = typeof(Queryable).GetMethods()
            .First(m => m.Name == methodName && m.GetParameters().Length == 2)
            .MakeGenericMethod(typeof(T), property.Type);

        return (IQueryable<T>)method.Invoke(null, [query, lambda])!;
    }

    /// <summary>
    /// Lọc có điều kiện: query.WhereIf(hasFilter, x => x.Name == filter)
    /// </summary>
    public static IQueryable<T> WhereIf<T>(this IQueryable<T> query, bool condition, Expression<Func<T, bool>> predicate)
    {
        return condition ? query.Where(predicate) : query;
    }
}
