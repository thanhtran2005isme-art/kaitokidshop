using API.Customer.Data;
using API.Customer.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Customer.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LookbooksController(CustomerDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<LookbookDTO>>> GetAll()
    {
        var lookbooks = await db.Lookbooks
            .Where(l => l.Status == "active")
            .OrderBy(l => l.SortOrder)
            .Select(l => new LookbookDTO
            {
                Id = l.Id,
                Title = l.Title,
                Subtitle = l.Subtitle,
                Description = l.Description,
                Image = l.Image,
                Link = l.Link,
                SortOrder = l.SortOrder
            })
            .ToListAsync();

        return Ok(lookbooks);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<LookbookDTO>> GetById(int id)
    {
        var lookbook = await db.Lookbooks
            .Where(l => l.Id == id && l.Status == "active")
            .Select(l => new LookbookDTO
            {
                Id = l.Id,
                Title = l.Title,
                Subtitle = l.Subtitle,
                Description = l.Description,
                Image = l.Image,
                Link = l.Link,
                SortOrder = l.SortOrder
            })
            .FirstOrDefaultAsync();

        return lookbook is null ? NotFound() : Ok(lookbook);
    }
}
