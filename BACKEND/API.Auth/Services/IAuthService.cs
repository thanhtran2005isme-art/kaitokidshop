using API.Auth.DTOs;

namespace API.Auth.Services;

public interface IAuthService
{
    Task<TokenDTO> RegisterAsync(RegisterDTO dto);
    Task<TokenDTO> LoginAsync(LoginDTO dto);
    Task<TokenDTO> RefreshTokenAsync(string refreshToken);
    Task ChangePasswordAsync(int userId, ChangePasswordDTO dto);
    Task<UserInfoDTO> GetProfileAsync(int userId);
}
