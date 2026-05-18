using API.Customer.DTOs;
using API.Customer.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Customer.Controllers;

/// <summary>
/// Search API: full search với facets + suggestions + did-you-mean.
/// FE Search.tsx gọi đây thay vì /api/products?search= để tận dụng facet count
/// và Levenshtein-based suggestions thật.
/// </summary>
[ApiController]
[Route("api/search")]
public class SearchController(ISearchService searchService) : ControllerBase
{
    /// <summary>Full search có filter, facet, did-you-mean.</summary>
    [HttpGet]
    public async Task<ActionResult<SearchResultDTO>> Search([FromQuery] SearchRequestDTO req)
    {
        return Ok(await searchService.SearchAsync(req));
    }

    /// <summary>Autocomplete: gợi ý từ khóa + SP cho dropdown khi đang gõ.</summary>
    [HttpGet("suggestions")]
    public async Task<ActionResult<SuggestionDTO>> Suggestions(
        [FromQuery] string q,
        [FromQuery] int limit = 6)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return Ok(new SuggestionDTO());
        return Ok(await searchService.GetSuggestionsAsync(q, Math.Clamp(limit, 1, 20)));
    }
}
