using System.Globalization;

namespace Shared.Helpers;

/// <summary>
/// Format tiền VNĐ, ngày tháng, mã đơn hàng
/// </summary>
public static class FormatHelper
{
    /// <summary>
    /// Format tiền VNĐ: 1500000 → "1.500.000₫"
    /// </summary>
    public static string FormatCurrency(decimal amount)
    {
        return amount.ToString("N0", new CultureInfo("vi-VN")) + "₫";
    }

    /// <summary>
    /// Format ngày: "26/03/2025 14:30"
    /// </summary>
    public static string FormatDate(DateTime date)
    {
        return date.ToString("dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture);
    }

    /// <summary>
    /// Tạo mã đơn hàng: KK-20250326-A1B2C3
    /// </summary>
    public static string GenerateOrderCode()
    {
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        var randomPart = Guid.NewGuid().ToString("N")[..6].ToUpper();
        return $"KK-{datePart}-{randomPart}";
    }

    /// <summary>
    /// Tạo SKU: KK-AO-001
    /// </summary>
    public static string GenerateSku(string category, int sequence)
    {
        var prefix = category.Length >= 2 ? category[..2].ToUpper() : category.ToUpper();
        return $"KK-{prefix}-{sequence:D3}";
    }
}
