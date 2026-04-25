using System.Security.Claims;
using API.Customer.DTOs;
using API.Customer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Customer.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController(IReviewService reviewService) : ControllerBase
{
    [HttpGet("product/{productId:int}")]
    public async Task<ActionResult<List<ReviewDTO>>> GetByProduct(int productId)
    {
        return Ok(await reviewService.GetByProductAsync(productId));
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReviewDTO>> Create([FromBody] CreateReviewDTO dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var customerName = User.FindFirstValue(ClaimTypes.Name) ?? "Khách hàng";
        var review = await reviewService.CreateAsync(userId, customerName, dto);
        return Ok(review);
    }
}
