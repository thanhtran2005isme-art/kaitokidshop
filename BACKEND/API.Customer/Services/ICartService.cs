using API.Customer.DTOs;

namespace API.Customer.Services;

public interface ICartService
{
    Task<List<CartItemDTO>> GetCartAsync(int userId);
    Task<CartItemDTO> AddToCartAsync(int userId, AddToCartDTO dto);
    Task<CartItemDTO?> UpdateQuantityAsync(int userId, int cartItemId, int quantity);
    Task<bool> RemoveFromCartAsync(int userId, int cartItemId);
    Task ClearCartAsync(int userId);
}
