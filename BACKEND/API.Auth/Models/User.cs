using System.ComponentModel.DataAnnotations.Schema;

namespace API.Auth.Models;

[Table("NguoiDung")]
public class User
{
    public int Id { get; set; }

    [Column("HoTen")]
    public string Name { get; set; } = string.Empty;

    [Column("Email")]
    public string Email { get; set; } = string.Empty;

    [Column("MatKhauHash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("SoDienThoai")]
    public string? Phone { get; set; }

    [Column("AnhDaiDien")]
    public string? Avatar { get; set; }

    [Column("VaiTro")]
    public string Role { get; set; } = "user";

    [Column("RefreshToken")]
    public string? RefreshToken { get; set; }

    [Column("HanRefreshToken")]
    public DateTime? RefreshTokenExpiry { get; set; }

    [Column("TrangThai")]
    public bool IsActive { get; set; } = true;

    [Column("NgayTao")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("NgayCapNhat")]
    public DateTime? UpdatedAt { get; set; }
}
