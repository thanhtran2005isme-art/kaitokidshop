using System.ComponentModel.DataAnnotations.Schema;

namespace API.Customer.Models;

[Table("Lookbook")]
public class Lookbook
{
    public int Id { get; set; }
    [Column("TieuDe")] public string Title { get; set; } = string.Empty;
    [Column("TieuDePhu")] public string? Subtitle { get; set; }
    [Column("MoTa")] public string? Description { get; set; }
    [Column("HinhAnh")] public string Image { get; set; } = string.Empty;
    [Column("LienKet")] public string? Link { get; set; }
    [Column("TrangThai")] public string Status { get; set; } = "active";
    [Column("ThuTu")] public int SortOrder { get; set; }
    [Column("NgayTao")] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
