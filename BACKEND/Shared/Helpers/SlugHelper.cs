using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Shared.Helpers;

/// <summary>
/// Tạo slug URL-friendly từ tiếng Việt
/// "Áo Thun Nam Cổ Tròn" → "ao-thun-nam-co-tron"
/// </summary>
public static partial class SlugHelper
{
    private static readonly Dictionary<char, string> VietnameseMap = new()
    {
        ['à'] = "a", ['á'] = "a", ['ả'] = "a", ['ã'] = "a", ['ạ'] = "a",
        ['ă'] = "a", ['ằ'] = "a", ['ắ'] = "a", ['ẳ'] = "a", ['ẵ'] = "a", ['ặ'] = "a",
        ['â'] = "a", ['ầ'] = "a", ['ấ'] = "a", ['ẩ'] = "a", ['ẫ'] = "a", ['ậ'] = "a",
        ['đ'] = "d",
        ['è'] = "e", ['é'] = "e", ['ẻ'] = "e", ['ẽ'] = "e", ['ẹ'] = "e",
        ['ê'] = "e", ['ề'] = "e", ['ế'] = "e", ['ể'] = "e", ['ễ'] = "e", ['ệ'] = "e",
        ['ì'] = "i", ['í'] = "i", ['ỉ'] = "i", ['ĩ'] = "i", ['ị'] = "i",
        ['ò'] = "o", ['ó'] = "o", ['ỏ'] = "o", ['õ'] = "o", ['ọ'] = "o",
        ['ô'] = "o", ['ồ'] = "o", ['ố'] = "o", ['ổ'] = "o", ['ỗ'] = "o", ['ộ'] = "o",
        ['ơ'] = "o", ['ờ'] = "o", ['ớ'] = "o", ['ở'] = "o", ['ỡ'] = "o", ['ợ'] = "o",
        ['ù'] = "u", ['ú'] = "u", ['ủ'] = "u", ['ũ'] = "u", ['ụ'] = "u",
        ['ư'] = "u", ['ừ'] = "u", ['ứ'] = "u", ['ử'] = "u", ['ữ'] = "u", ['ự'] = "u",
        ['ỳ'] = "y", ['ý'] = "y", ['ỷ'] = "y", ['ỹ'] = "y", ['ỵ'] = "y"
    };

    public static string ToSlug(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;

        var sb = new StringBuilder(input.Length);
        foreach (var c in input.ToLower())
        {
            if (VietnameseMap.TryGetValue(c, out var replacement))
                sb.Append(replacement);
            else
                sb.Append(c);
        }

        var normalized = sb.ToString().Normalize(NormalizationForm.FormD);
        var result = new StringBuilder(normalized.Length);

        foreach (var c in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(c);
            if (category != UnicodeCategory.NonSpacingMark)
                result.Append(c);
        }

        var slug = result.ToString().Normalize(NormalizationForm.FormC);
        slug = NonAlphaNumRegex().Replace(slug, "-");
        slug = MultipleDashRegex().Replace(slug, "-");
        slug = slug.Trim('-');

        return slug;
    }

    [GeneratedRegex("[^a-z0-9]+")]
    private static partial Regex NonAlphaNumRegex();

    [GeneratedRegex("-{2,}")]
    private static partial Regex MultipleDashRegex();
}
