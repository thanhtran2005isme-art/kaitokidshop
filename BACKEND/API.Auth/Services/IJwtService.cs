using API.Auth.Models;

namespace API.Auth.Services;

public interface IJwtService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    int? ValidateRefreshTokenAndGetUserId(string token);
}
