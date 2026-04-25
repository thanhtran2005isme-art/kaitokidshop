using API.Customer.Data;
using API.Customer.DTOs;
using API.Customer.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Customer.Services;

public class ReviewService(CustomerDbContext db) : IReviewService
{
    public async Task<List<ReviewDTO>> GetByProductAsync(int productId)
    {
        return await db.Reviews
            .Where(r => r.ProductId == productId && r.Status == "approved")
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDTO
            {
                Id = r.Id,
                ProductId = r.ProductId,
                CustomerName = r.CustomerName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<ReviewDTO> CreateAsync(int userId, string customerName, CreateReviewDTO dto)
    {
        var review = new Review
        {
            ProductId = dto.ProductId,
            UserId = userId,
            CustomerName = customerName,
            OrderId = dto.OrderId,
            Rating = Math.Clamp(dto.Rating, 1, 5),
            Comment = dto.Comment,
            Status = "pending"
        };

        db.Reviews.Add(review);
        await db.SaveChangesAsync();

        // Cập nhật rating trung bình
        var avgRating = await db.Reviews
            .Where(r => r.ProductId == dto.ProductId && r.Status == "approved")
            .AverageAsync(r => (double?)r.Rating) ?? 0;

        var product = await db.Products.FindAsync(dto.ProductId);
        if (product is not null)
        {
            product.Rating = Math.Round(avgRating, 1);
            await db.SaveChangesAsync();
        }

        return new ReviewDTO
        {
            Id = review.Id,
            ProductId = review.ProductId,
            CustomerName = review.CustomerName,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt
        };
    }
}
// fix: clamp rating trong khoang 1-5
