using System.Security.Claims;
using API.Customer.Data;
using API.Customer.DTOs;
using API.Customer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Customer.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountController(CustomerDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<AccountDTO>> GetProfile()
    {
        var user = await db.Users.FindAsync(UserId);
        if (user is null) return NotFound();

        var totalOrders = await db.Orders.CountAsync(o => o.UserId == UserId);
        var (nextTier, threshold) = ResolveNextTier(user.MemberTier);

        return Ok(new AccountDTO
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Avatar = user.Avatar,
            CreatedAt = user.CreatedAt,
            LoyaltyPoints = user.LoyaltyPoints,
            MemberTier = user.MemberTier,
            TotalSpent = user.TotalSpent,
            Birthday = user.Birthday,
            NextTier = nextTier,
            NextTierAt = threshold,
            AmountToNextTier = Math.Max(0, threshold - user.TotalSpent),
            TotalOrders = totalOrders,
        });
    }

    [HttpPut]
    public async Task<ActionResult<AccountDTO>> UpdateProfile([FromBody] UpdateAccountDTO dto)
    {
        var user = await db.Users.FindAsync(UserId);
        if (user is null) return NotFound();

        if (dto.Name is not null) user.Name = dto.Name;
        if (dto.Phone is not null) user.Phone = dto.Phone;
        if (dto.Avatar is not null) user.Avatar = dto.Avatar;
        if (dto.Birthday is not null) user.Birthday = dto.Birthday;

        await db.SaveChangesAsync();
        return await GetProfile();
    }

    [HttpGet("points-history")]
    public async Task<ActionResult<List<PointsHistoryDTO>>> GetPointsHistory(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var q = from p in db.PointsHistories
                where p.UserId == UserId
                orderby p.CreatedAt descending
                join o in db.Orders on p.OrderId equals o.Id into og
                from o in og.DefaultIfEmpty()
                select new PointsHistoryDTO
                {
                    Id = p.Id,
                    Type = p.Type,
                    Points = p.Points,
                    BalanceAfter = p.BalanceAfter,
                    OrderId = p.OrderId,
                    OrderCode = o == null ? null : o.OrderCode,
                    Description = p.Description,
                    CreatedAt = p.CreatedAt,
                };

        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return Ok(items);
    }

    /// <summary>
    /// Đổi điểm sang voucher: 100 điểm = 10.000đ. Voucher tự sinh + thêm vào MaGiamGia.
    /// </summary>
    [HttpPost("redeem")]
    public async Task<ActionResult<RedeemResultDTO>> RedeemPoints([FromBody] RedeemPointsDTO dto)
    {
        if (dto.Points <= 0 || dto.Points % 100 != 0)
            return BadRequest(new { message = "Số điểm phải là bội số của 100." });

        var user = await db.Users.FindAsync(UserId);
        if (user is null) return NotFound();
        if (user.LoyaltyPoints < dto.Points)
            return BadRequest(new { message = "Không đủ điểm thưởng để đổi." });

        var discountValue = (dto.Points / 100) * 10_000m;
        var couponCode = $"PT{user.Id}-{DateTime.UtcNow:yyMMdd}-{Random.Shared.Next(1000, 9999)}";
        var expiresAt = DateTime.UtcNow.AddDays(60);

        // Tạo coupon cá nhân (đã có bảng MaGiamGia)
        db.Coupons.Add(new Coupon
        {
            Code = couponCode,
            Type = "fixed",
            Value = discountValue,
            MinOrderAmount = discountValue * 2,
            UsageLimit = 1,
            UsedCount = 0,
            StartDate = DateTime.UtcNow,
            EndDate = expiresAt,
            IsActive = true,
        });

        user.LoyaltyPoints -= dto.Points;
        db.PointsHistories.Add(new PointsHistory
        {
            UserId = user.Id,
            Type = "redeem",
            Points = -dto.Points,
            BalanceAfter = user.LoyaltyPoints,
            Description = $"Đổi {dto.Points} điểm lấy voucher giảm {discountValue:N0}đ — mã {couponCode}",
        });

        await db.SaveChangesAsync();

        return Ok(new RedeemResultDTO
        {
            CouponCode = couponCode,
            DiscountValue = discountValue,
            RemainingPoints = user.LoyaltyPoints,
            ExpiresAt = expiresAt,
        });
    }

    /// <summary>
    /// Voucher cá nhân của user (sinh nhật, cấp bậc, redeem...).
    /// </summary>
    [HttpGet("vouchers")]
    public async Task<IActionResult> GetMyVouchers()
    {
        var user = await db.Users.FindAsync(UserId);
        if (user is null) return NotFound();

        // Lấy mã coupon đã sinh từ redeem (PT{userId}-...) còn hạn
        var prefix = $"PT{user.Id}-";
        var personalCoupons = await db.Coupons
            .Where(c => c.Code.StartsWith(prefix) && c.IsActive && c.EndDate >= DateTime.UtcNow && c.UsedCount < c.UsageLimit)
            .OrderByDescending(c => c.StartDate)
            .ToListAsync();

        return Ok(personalCoupons.Select(c => new
        {
            code = c.Code,
            type = c.Type,
            value = c.Value,
            minOrderAmount = c.MinOrderAmount,
            startDate = c.StartDate,
            endDate = c.EndDate,
            isActive = c.IsActive,
            description = $"Voucher cá nhân — giảm {c.Value:N0}đ cho đơn từ {c.MinOrderAmount:N0}đ",
        }));
    }

    private static (string nextTier, decimal threshold) ResolveNextTier(string current) => current switch
    {
        "Member" => ("Silver", 2_000_000m),
        "Silver" => ("Gold", 5_000_000m),
        "Gold" => ("Diamond", 10_000_000m),
        _ => ("Diamond", 10_000_000m),
    };
}
