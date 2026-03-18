using System.Security.Claims;
using API.Customer.Data;
using API.Customer.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Customer.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountController(CustomerDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<AccountDTO>> GetProfile()
    {
        var user = await db.Users.FindAsync(UserId);
        if (user is null) return NotFound();

        return Ok(new AccountDTO
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Avatar = user.Avatar,
            CreatedAt = user.CreatedAt
        });
    }

    [HttpPut]
    public async Task<ActionResult<AccountDTO>> UpdateProfile([FromBody] UpdateAccountDTO dto)
    {
        var user = await db.Users.FindAsync(UserId);
        if (user is null) return NotFound();

        if (dto.Name is not null) user.Name = dto.Name;
        if (dto.Phone is not null) user.Phone = dto.Phone;
        if (dto.Avatar is not null) user.Avatar = dto.Avatar;

        await db.SaveChangesAsync();

        return Ok(new AccountDTO
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Phone = user.Phone,
            Avatar = user.Avatar,
            CreatedAt = user.CreatedAt
        });
    }
}
