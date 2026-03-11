namespace API.Customer.DTOs;

public class ReviewDTO
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class CreateReviewDTO
{
    public int ProductId { get; set; }
    public int OrderId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
}
