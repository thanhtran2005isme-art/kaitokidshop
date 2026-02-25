using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

namespace DbHelper;

/// <summary>
/// Repository cho entity có soft delete — tự động filter IsDeleted = false
/// </summary>
public class SoftDeleteRepository<T>(DbContext context) : Repository<T>(context) where T : SoftDeleteEntity
{
    public override async Task<T?> GetByIdAsync(int id)
    {
        return await DbSet.FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);
    }

    public override async Task<List<T>> GetAllAsync()
    {
        return await DbSet.Where(e => !e.IsDeleted).ToListAsync();
    }

    public override async Task<List<T>> FindAsync(Expression<Func<T, bool>> predicate)
    {
        return await DbSet.Where(e => !e.IsDeleted).Where(predicate).ToListAsync();
    }

    public override async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
    {
        return await DbSet.Where(e => !e.IsDeleted).FirstOrDefaultAsync(predicate);
    }

    public override async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null)
    {
        var query = DbSet.Where(e => !e.IsDeleted);
        return predicate is null
            ? await query.CountAsync()
            : await query.CountAsync(predicate);
    }

    /// <summary>
    /// Soft delete — đánh dấu IsDeleted thay vì xóa thật
    /// </summary>
    public void SoftDelete(T entity)
    {
        entity.IsDeleted = true;
        entity.DeletedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        DbSet.Update(entity);
    }

    /// <summary>
    /// Khôi phục entity đã soft delete
    /// </summary>
    public void Restore(T entity)
    {
        entity.IsDeleted = false;
        entity.DeletedAt = null;
        entity.UpdatedAt = DateTime.UtcNow;
        DbSet.Update(entity);
    }
}
