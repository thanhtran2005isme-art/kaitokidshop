using System.ComponentModel.DataAnnotations.Schema;

namespace API.Customer.Models;

[Table("DonHang")]
public class Order
{
    public int Id { get; set; }
    [Column("MaDonHang")] public string OrderCode { get; set; } = string.Empty;
    [Column("NguoiDungId")] public int UserId { get; set; }
    [Column("TenNguoiNhan")] public string CustomerName { get; set; } = string.Empty;
    [Column("SoDienThoai")] public string CustomerPhone { get; set; } = string.Empty;
    [Column("Email")] public string CustomerEmail { get; set; } = string.Empty;
    [Column("DiaChiGiao")] public string CustomerAddress { get; set; } = string.Empty;
    [Column("TamTinh", TypeName = "decimal(18,0)")] public decimal Subtotal { get; set; }
    [Column("PhiVanChuyen", TypeName = "decimal(18,0)")] public decimal ShippingFee { get; set; }
    [Column("GiamGia", TypeName = "decimal(18,0)")] public decimal Discount { get; set; }
    [Column("TongTien", TypeName = "decimal(18,0)")] public decimal Total { get; set; }
    [Column("MaGiamGia")] public string? CouponCode { get; set; }
    [Column("PhuongThucThanhToan")] public string PaymentMethod { get; set; } = "COD";
    [Column("TrangThai")] public string Status { get; set; } = "pending";
    [Column("GhiChu")] public string? Note { get; set; }
    [Column("NgayTao")] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    [Column("NgayCapNhat")] public DateTime? UpdatedAt { get; set; }

    public ICollection<OrderItem> Items { get; set; } = [];
}
