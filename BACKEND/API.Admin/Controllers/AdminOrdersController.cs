using API.Admin.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Admin.Controllers;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "admin")]
public class AdminOrdersController(AdminDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? search,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var q = db.DonHang.Include(d => d.ChiTiet).AsQueryable();
        if (!string.IsNullOrEmpty(status)) q = q.Where(d => d.TrangThai == status);
        if (!string.IsNullOrEmpty(search))
            q = q.Where(d => d.MaDonHang.Contains(search) || d.TenNguoiNhan.Contains(search) || d.SoDienThoai.Contains(search));

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(d => d.NgayTao)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var dh = await db.DonHang.Include(d => d.ChiTiet).Include(d => d.NguoiDung)
            .FirstOrDefaultAsync(d => d.Id == id);
        return dh is null ? NotFound() : Ok(dh);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
    {
        var dh = await db.DonHang.FindAsync(id);
        if (dh is null) return NotFound();

        dh.TrangThai = dto.TrangThai;
        dh.GhiChuAdmin = dto.GhiChuAdmin;
        dh.NgayCapNhat = DateTime.UtcNow;

        if (dto.TrangThai == "confirmed") dh.NgayXacNhan = DateTime.UtcNow;
        if (dto.TrangThai == "shipping") dh.NgayGiaoHang = DateTime.UtcNow;
        if (dto.TrangThai == "completed") dh.NgayHoanThanh = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(dh);
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var total = await db.DonHang.CountAsync();
        var pending = await db.DonHang.CountAsync(d => d.TrangThai == "pending");
        var confirmed = await db.DonHang.CountAsync(d => d.TrangThai == "confirmed");
        var shipping = await db.DonHang.CountAsync(d => d.TrangThai == "shipping");
        var completed = await db.DonHang.CountAsync(d => d.TrangThai == "completed");
        var cancelled = await db.DonHang.CountAsync(d => d.TrangThai == "cancelled");
        var revenue = await db.DonHang.Where(d => d.TrangThai == "completed").SumAsync(d => d.TongTien);
        return Ok(new { total, pending, confirmed, shipping, completed, cancelled, revenue });
    }
}

public class UpdateStatusDto
{
    public string TrangThai { get; set; } = string.Empty;
    public string? GhiChuAdmin { get; set; }
}
// v1.1: Them cap nhat trang thai va thong ke
