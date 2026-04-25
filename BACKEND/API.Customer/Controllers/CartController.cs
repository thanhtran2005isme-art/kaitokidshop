using System.Security.Claims;
using API.Customer.DTOs;
using API.Customer.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Customer.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController(ICartService cartService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<CartItemDTO>>> GetCart()
    {
        return Ok(await cartService.GetCartAsync(UserId));
    }

    [HttpPost]
    public async Task<ActionResult<CartItemDTO>> AddToCart([FromBody] AddToCartDTO dto)
    {
        var item = await cartService.AddToCartAsync(UserId, dto);
        return Ok(item);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CartItemDTO>> UpdateQuantity(int id, [FromBody] UpdateCartDTO dto)
    {
        var item = await cartService.UpdateQuantityAsync(UserId, id, dto.Quantity);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Remove(int id)
    {
        var result = await cartService.RemoveFromCartAsync(UserId, id);
        return result ? NoContent() : NotFound();
    }

    [HttpDelete]
    public async Task<IActionResult> Clear()
    {
        await cartService.ClearCartAsync(UserId);
        return NoContent();
    }
}
