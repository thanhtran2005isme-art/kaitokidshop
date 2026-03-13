using API.Customer.Data;
using API.Customer.DTOs;
using Microsoft.EntityFrameworkCore;

namespace API.Customer.Services;

public class CartService(CustomerDbContext db) : ICartService
{
    public async Task<List<CartItemDTO>> GetCartAsync(int userId)
    {
        return await db.CartItems
            .Where(c => c.UserId == userId)
            .Include(c => c.Product)
            .Select(c => new CartItemDTO
            {
                Id = c.Id,
                ProductId = c.ProductId,
                Name = c.Product.Name,
                Price = c.Product.Price,
                Image = c.Product.Image,
                Size = c.Size,
                Color = c.Color,
                Quantity = c.Quantity
            })
            .ToListAsync();
    }

    public async Task<CartItemDTO> AddToCartAsync(int userId, AddToCartDTO dto)
    {
        // Kiểm tra đã có item trùng chưa
        var existing = await db.CartItems
            .FirstOrDefaultAsync(c => c.UserId == userId
                && c.ProductId == dto.ProductId
                && c.Size == dto.Size
                && c.Color == dto.Color);

        if (existing is not null)
        {
            existing.Quantity += dto.Quantity;
            await db.SaveChangesAsync();
        }
        else
        {
            existing = new Models.CartItem
            {
                UserId = userId,
                ProductId = dto.ProductId,
                Size = dto.Size,
                Color = dto.Color,
                Quantity = dto.Quantity
            };
            db.CartItems.Add(existing);
            await db.SaveChangesAsync();
        }

        var product = await db.Products.FindAsync(dto.ProductId);
        return new CartItemDTO
        {
            Id = existing.Id,
            ProductId = existing.ProductId,
            Name = product?.Name ?? "",
            Price = product?.Price ?? 0,
            Image = product?.Image ?? "",
            Size = existing.Size,
            Color = existing.Color,
            Quantity = existing.Quantity
        };
    }

    public async Task<CartItemDTO?> UpdateQuantityAsync(int userId, int cartItemId, int quantity)
    {
        var item = await db.CartItems
            .Include(c => c.Product)
            .FirstOrDefaultAsync(c => c.Id == cartItemId && c.UserId == userId);

        if (item is null) return null;

        item.Quantity = quantity;
        await db.SaveChangesAsync();

        return new CartItemDTO
        {
            Id = item.Id,
            ProductId = item.ProductId,
            Name = item.Product.Name,
            Price = item.Product.Price,
            Image = item.Product.Image,
            Size = item.Size,
            Color = item.Color,
            Quantity = item.Quantity
        };
    }

    public async Task<bool> RemoveFromCartAsync(int userId, int cartItemId)
    {
        var item = await db.CartItems
            .FirstOrDefaultAsync(c => c.Id == cartItemId && c.UserId == userId);

        if (item is null) return false;

        db.CartItems.Remove(item);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task ClearCartAsync(int userId)
    {
        var items = await db.CartItems.Where(c => c.UserId == userId).ToListAsync();
        db.CartItems.RemoveRange(items);
        await db.SaveChangesAsync();
    }
}
