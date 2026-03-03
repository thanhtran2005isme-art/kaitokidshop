using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using API.Auth.Models;
using Microsoft.IdentityModel.Tokens;

namespace API.Auth.Services;

public class JwtService(IConfiguration config) : IJwtService
{
    private readonly string _key = config["Jwt:Key"] ?? "KaitoKidSuperSecretKey2025!@#$%^&*()";
    private readonly string _issuer = config["Jwt:Issuer"] ?? "KaitoKid.API.Auth";
    private readonly string _audience = config["Jwt:Audience"] ?? "KaitoKid.Client";
    private readonly int _expiryMinutes = int.Parse(config["Jwt:ExpiryMinutes"] ?? "60");

    public string GenerateAccessToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_expiryMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public int? ValidateRefreshTokenAndGetUserId(string token)
    {
        // Refresh token validation is done by matching against DB
        // This method is a placeholder for any additional validation
        return null;
    }
}
