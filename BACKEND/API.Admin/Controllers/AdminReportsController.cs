using API.Admin.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Admin.Controllers;

[ApiController]
[Route("api/admin/reports")]
[Authorize(Roles = "admin")]
public class AdminReportsController(AdminDbContext db) : ControllerBase
{
    /// <summary>Tổng quan dashboard</summary>
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var totalProducts = await db.SanPham.CountAsync();
        var totalOrders = await db.DonHang.CountAsync();
        var totalCustomers = await db.NguoiDung.CountAsync(n => n.VaiTro == "user");
        var totalRevenue = await db.DonHang.Where(d => d.TrangThai == "completed").SumAsync(d => d.TongTien);
        var pendingOrders = await db.DonHang.CountAsync(d => d.TrangThai == "pending");
        var lowStockProducts = await db.SanPham.CountAsync(p => p.TonKho <= 5 && p.TrangThai == "active");
        var pendingReviews = await db.DanhGia.CountAsync(d => d.TrangThai == "pending");

        return Ok(new { totalProducts, totalOrders, totalCustomers, totalRevenue, pendingOrders, lowStockProducts, pendingReviews });
    }

    /// <summary>Doanh thu theo ngày (30 ngày gần nhất)</summary>
    [HttpGet("revenue")]
    public async Task<IActionResult> Revenue([FromQuery] int days = 30)
    {
        var fromDate = DateTime.UtcNow.AddDays(-days);
        var data = await db.DonHang
            .Where(d => d.TrangThai == "completed" && d.NgayTao >= fromDate)
            .GroupBy(d => d.NgayTao.Date)
            .Select(g => new { date = g.Key, revenue = g.Sum(d => d.TongTien), orders = g.Count() })
            .OrderBy(x => x.date)
            .ToListAsync();
        return Ok(data);
    }

    /// <summary>Top sản phẩm bán chạy</summary>
    [HttpGet("top-products")]
    public async Task<IActionResult> TopProducts([FromQuery] int count = 10)
    {
        var items = await db.SanPham
            .Where(p => p.TrangThai == "active")
            .OrderByDescending(p => p.SoLuongDaBan)
            .Take(count)
            .Select(p => new { p.Id, p.TenSanPham, p.MaSanPham, p.HinhAnh, p.Gia, p.SoLuongDaBan, p.TonKho })
            .ToListAsync();
        return Ok(items);
    }

    /// <summary>Thống kê đơn hàng theo trạng thái</summary>
    [HttpGet("order-stats")]
    public async Task<IActionResult> OrderStats()
    {
        var stats = await db.DonHang
            .GroupBy(d => d.TrangThai)
            .Select(g => new { status = g.Key, count = g.Count(), total = g.Sum(d => d.TongTien) })
            .ToListAsync();
        return Ok(stats);
    }
}
