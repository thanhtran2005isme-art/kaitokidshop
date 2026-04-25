namespace API.Customer.DTOs;

public class LookbookDTO
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? Description { get; set; }
    public string Image { get; set; } = string.Empty;
    public string? Link { get; set; }
    public int SortOrder { get; set; }
}
