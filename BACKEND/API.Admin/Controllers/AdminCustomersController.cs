using API.Admin.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Admin.Controllers;

[ApiController]
[Route("api/admin/customers")]
[Authorize(Roles = "admin")]
public class AdminCustomersController(AdminDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var q = db.NguoiDung.Where(n => n.VaiTro == "user").AsQueryable();
        if (!string.IsNullOrEmpty(search))
            q = q.Where(n => n.HoTen.Contains(search) || n.Email.Contains(search) || (n.SoDienThoai != null && n.SoDienThoai.Contains(search)));

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(n => n.NgayTao)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(n => new { n.Id, n.HoTen, n.Email, n.SoDienThoai, n.VaiTro, n.TrangThai, n.NgayTao })
            .ToListAsync();
        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var nd = await db.NguoiDung.FindAsync(id);
        if (nd is null) return NotFound();
        var orderCount = await db.DonHang.CountAsync(d => d.NguoiDungId == id);
        var totalSpent = await db.DonHang.Where(d => d.NguoiDungId == id && d.TrangThai == "completed").SumAsync(d => d.TongTien);
        return Ok(new { nd.Id, nd.HoTen, nd.Email, nd.SoDienThoai, nd.VaiTro, nd.TrangThai, nd.NgayTao, orderCount, totalSpent });
    }

    [HttpPut("{id}/toggle-status")]
    public async Task<IActionResult> ToggleStatus(int id)
    {
        var nd = await db.NguoiDung.FindAsync(id);
        if (nd is null) return NotFound();
        nd.TrangThai = !nd.TrangThai;
        nd.NgayCapNhat = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(new { nd.Id, nd.TrangThai });
    }
}
