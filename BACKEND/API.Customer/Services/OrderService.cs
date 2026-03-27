using API.Customer.Data;
using API.Customer.DTOs;
using API.Customer.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Customer.Services;

public class OrderService(CustomerDbContext db, ICouponService couponService) : IOrderService
{
    public async Task<OrderDTO> CreateOrderAsync(int userId, CreateOrderDTO dto)
    {
        // Lấy giỏ hàng
        var cartItems = await db.CartItems
            .Include(c => c.Product)
            .Where(c => c.UserId == userId)
            .ToListAsync();

        if (cartItems.Count == 0)
            throw new InvalidOperationException("Giỏ hàng trống");

        var subtotal = cartItems.Sum(c => c.Product.Price * c.Quantity);
        decimal discount = 0;

        // Áp dụng coupon
        if (!string.IsNullOrEmpty(dto.CouponCode))
        {
            var couponResult = await couponService.ValidateAsync(new CouponValidateDTO
            {
                Code = dto.CouponCode,
                OrderAmount = subtotal
            });

            if (couponResult.IsValid)
                discount = couponResult.DiscountAmount;
        }

        var total = subtotal - discount;
        if (total < 0) total = 0;

        // Tạo mã đơn hàng
        var orderCode = $"KK-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";

        var order = new Order
        {
            OrderCode = orderCode,
            UserId = userId,
            CustomerName = dto.CustomerName,
            CustomerPhone = dto.CustomerPhone,
            CustomerEmail = dto.CustomerEmail,
            CustomerAddress = dto.CustomerAddress,
            Subtotal = subtotal,
            ShippingFee = 0,
            Discount = discount,
            Total = total,
            CouponCode = dto.CouponCode,
            PaymentMethod = dto.PaymentMethod,
            Note = dto.Note,
            Items = cartItems.Select(c => new OrderItem
            {
                ProductId = c.ProductId,
                ProductName = c.Product.Name,
                ProductImage = c.Product.Image,
                Price = c.Product.Price,
                Size = c.Size,
                Color = c.Color,
                Quantity = c.Quantity
            }).ToList()
        };

        db.Orders.Add(order);

        // Trừ tồn kho
        foreach (var item in cartItems)
        {
            item.Product.Stock -= item.Quantity;
            item.Product.SoldCount += item.Quantity;
            if (item.Product.Stock <= 0)
                item.Product.Status = "out-of-stock";
        }

        // Xóa giỏ hàng
        db.CartItems.RemoveRange(cartItems);

        // Tăng usedCount coupon
        if (!string.IsNullOrEmpty(dto.CouponCode))
        {
            var coupon = await db.Coupons.FirstOrDefaultAsync(c => c.Code == dto.CouponCode);
            if (coupon is not null) coupon.UsedCount++;
        }

        await db.SaveChangesAsync();

        return MapToDTO(order);
    }

    public async Task<List<OrderDTO>> GetOrdersByUserAsync(int userId)
    {
        return await db.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.Items)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => MapToDTO(o))
            .ToListAsync();
    }

    public async Task<OrderDTO?> GetOrderByIdAsync(int userId, int orderId)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

        return order is null ? null : MapToDTO(order);
    }

    public async Task<bool> CancelOrderAsync(int userId, int orderId)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

        if (order is null || order.Status != "pending") return false;

        order.Status = "cancelled";
        order.UpdatedAt = DateTime.UtcNow;

        // Hoàn lại tồn kho
        foreach (var item in order.Items)
        {
            var product = await db.Products.FindAsync(item.ProductId);
            if (product is not null)
            {
                product.Stock += item.Quantity;
                product.SoldCount -= item.Quantity;
                if (product.Stock > 0 && product.Status == "out-of-stock")
                    product.Status = "active";
            }
        }

        await db.SaveChangesAsync();
        return true;
    }

    private static OrderDTO MapToDTO(Order o) => new()
    {
        Id = o.Id,
        OrderCode = o.OrderCode,
        CustomerName = o.CustomerName,
        CustomerPhone = o.CustomerPhone,
        CustomerEmail = o.CustomerEmail,
        CustomerAddress = o.CustomerAddress,
        Subtotal = o.Subtotal,
        ShippingFee = o.ShippingFee,
        Discount = o.Discount,
        Total = o.Total,
        CouponCode = o.CouponCode,
        PaymentMethod = o.PaymentMethod,
        Status = o.Status,
        Note = o.Note,
        CreatedAt = o.CreatedAt,
        Items = o.Items.Select(i => new OrderDetailDTO
        {
            ProductId = i.ProductId,
            ProductName = i.ProductName,
            ProductImage = i.ProductImage,
            Price = i.Price,
            Size = i.Size,
            Color = i.Color,
            Quantity = i.Quantity
        }).ToList()
    };
}
// v1.1: Tich hop coupon va hoan ton kho khi huy don
// v1.2: Xu ly tong tien am sau giam gia
// fix: tong tien co the am sau giam gia
