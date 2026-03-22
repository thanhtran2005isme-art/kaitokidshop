using API.Admin.Data;
using API.Admin.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Admin.Controllers;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "admin")]
public class AdminProductsController(AdminDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] string? category,
        [FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var q = db.SanPham.AsQueryable();
        if (!string.IsNullOrEmpty(search))
            q = q.Where(p => p.TenSanPham.Contains(search) || p.MaSanPham.Contains(search));
        if (!string.IsNullOrEmpty(category)) q = q.Where(p => p.DanhMuc == category);
        if (!string.IsNullOrEmpty(status)) q = q.Where(p => p.TrangThai == status);

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(p => p.NgayTao)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var sp = await db.SanPham.FindAsync(id);
        return sp is null ? NotFound() : Ok(sp);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SanPham sp)
    {
        sp.NgayTao = DateTime.UtcNow;
        db.SanPham.Add(sp);
        await db.SaveChangesAsync();
        return Ok(sp);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] SanPham dto)
    {
        var sp = await db.SanPham.FindAsync(id);
        if (sp is null) return NotFound();

        sp.TenSanPham = dto.TenSanPham; sp.DanhMucId = dto.DanhMucId; sp.DanhMuc = dto.DanhMuc;
        sp.DanhMucPhu = dto.DanhMucPhu; sp.PhongCach = dto.PhongCach; sp.GioiTinh = dto.GioiTinh;
        sp.Gia = dto.Gia; sp.GiaCu = dto.GiaCu; sp.TonKho = dto.TonKho; sp.TrangThai = dto.TrangThai;
        sp.HinhAnh = dto.HinhAnh; sp.DanhSachAnh = dto.DanhSachAnh; sp.MoTaNgan = dto.MoTaNgan;
        sp.MoTaChiTiet = dto.MoTaChiTiet; sp.MaSanPham = dto.MaSanPham; sp.Slug = dto.Slug;
        sp.LaSanPhamMoi = dto.LaSanPhamMoi; sp.DangGiamGia = dto.DangGiamGia;
        sp.BanChayNhat = dto.BanChayNhat; sp.DanhSachMau = dto.DanhSachMau;
        sp.DanhSachSize = dto.DanhSachSize; sp.BienThe = dto.BienThe;
        sp.ThongSoKyThuat = dto.ThongSoKyThuat; sp.BoSuuTapId = dto.BoSuuTapId;
        sp.MetaTitle = dto.MetaTitle; sp.MetaDescription = dto.MetaDescription;
        sp.NgayCapNhat = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(sp);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var sp = await db.SanPham.FindAsync(id);
        if (sp is null) return NotFound();
        db.SanPham.Remove(sp);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
// v1.1: Them GET chi tiet, POST tao moi
