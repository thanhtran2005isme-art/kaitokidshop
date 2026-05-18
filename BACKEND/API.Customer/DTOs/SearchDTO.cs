namespace API.Customer.DTOs;

public class SearchRequestDTO
{
    public string? Query { get; set; }
    public string? Category { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    /// <summary>CSV: "S,M,L"</summary>
    public string? Sizes { get; set; }
    /// <summary>CSV: "Đen,Trắng"</summary>
    public string? Colors { get; set; }
    public int? MinRating { get; set; }
    public string? SortBy { get; set; } // newest | price-asc | price-desc | bestseller | rating
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 24;
}

public class SearchFacetsDTO
{
    /// <summary>Đếm số SP cho mỗi giá trị từng filter, đã loại bỏ filter đó khỏi query (multi-select facet).</summary>
    public Dictionary<string, int> Categories { get; set; } = new();
    public Dictionary<string, int> Sizes { get; set; } = new();
    public Dictionary<string, int> Colors { get; set; } = new();
    public Dictionary<string, int> PriceRanges { get; set; } = new();
}

public class SearchResultDTO
{
    public List<ProductDTO> Items { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public SearchFacetsDTO Facets { get; set; } = new();
    /// <summary>Gợi ý "did you mean" — null nếu không có match gần đúng.</summary>
    public string? DidYouMean { get; set; }
}

public class SuggestionDTO
{
    public List<string> Suggestions { get; set; } = new();
    public List<ProductDTO> Products { get; set; } = new();
}
