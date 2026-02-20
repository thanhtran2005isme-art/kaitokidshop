using Shared.Constants;

namespace Shared.DTOs;

/// <summary>
/// Base class cho tất cả request có phân trang
/// </summary>
public class PagedRequest
{
    private int _page = AppConstants.DefaultPage;
    private int _pageSize = AppConstants.DefaultPageSize;

    public int Page
    {
        get => _page;
        set => _page = value < 1 ? 1 : value;
    }

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value < 1 ? AppConstants.DefaultPageSize
            : value > AppConstants.MaxPageSize ? AppConstants.MaxPageSize
            : value;
    }

    public int Skip => (Page - 1) * PageSize;
}

/// <summary>
/// Response chuẩn cho phân trang
/// </summary>
public class PagedResponse<T>
{
    public List<T> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;

    public static PagedResponse<T> Create(List<T> items, int totalCount, int page, int pageSize) => new()
    {
        Items = items,
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize
    };
}
