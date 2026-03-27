using API.Auth.Data;
using API.Auth.DTOs;
using API.Auth.Models;
using Microsoft.EntityFrameworkCore;

namespace API.Auth.Services;

public class AuthService(AuthDbContext db, IJwtService jwtService, IConfiguration config) : IAuthService
{
    private readonly int _refreshTokenDays = int.Parse(config["Jwt:RefreshTokenDays"] ?? "7");

    public async Task<TokenDTO> RegisterAsync(RegisterDTO dto)
    {
        // Kiểm tra email đã tồn tại
        var exists = await db.Users.AnyAsync(u => u.Email == dto.Email);
        if (exists)
            throw new InvalidOperationException("Email đã được sử dụng");

        // Validate
        if (string.IsNullOrWhiteSpace(dto.Name))
            throw new InvalidOperationException("Tên không được để trống");

        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6)
            throw new InvalidOperationException("Mật khẩu phải có ít nhất 6 ký tự");

        var user = new User
        {
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone = dto.Phone?.Trim(),
            Role = "user"
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return GenerateTokenResponse(user);
    }

    public async Task<TokenDTO> LoginAsync(LoginDTO dto)
    {
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email.Trim().ToLower());

        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng");

        return GenerateTokenResponse(user);
    }

    public async Task<TokenDTO> RefreshTokenAsync(string refreshToken)
    {
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken
                && u.RefreshTokenExpiry > DateTime.UtcNow);

        if (user is null)
            throw new UnauthorizedAccessException("Refresh token không hợp lệ hoặc đã hết hạn");

        return GenerateTokenResponse(user);
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordDTO dto)
    {
        var user = await db.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("Không tìm thấy tài khoản");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new InvalidOperationException("Mật khẩu hiện tại không đúng");

        if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
            throw new InvalidOperationException("Mật khẩu mới phải có ít nhất 6 ký tự");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        // Xóa refresh token cũ — buộc đăng nhập lại
        user.RefreshToken = null;
        user.RefreshTokenExpiry = null;

        await db.SaveChangesAsync();
    }

    public async Task<UserInfoDTO> GetProfileAsync(int userId)
    {
        var user = await db.Users.FindAsync(userId)
            ?? throw new InvalidOperationException("Không tìm thấy tài khoản");

        return MapToUserInfo(user);
    }

    private TokenDTO GenerateTokenResponse(User user)
    {
        var accessToken = jwtService.GenerateAccessToken(user);
        var refreshToken = jwtService.GenerateRefreshToken();

        // Lưu refresh token vào DB
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(_refreshTokenDays);
        user.UpdatedAt = DateTime.UtcNow;
        db.SaveChanges();

        var expiryMinutes = int.Parse(config["Jwt:ExpiryMinutes"] ?? "60");

        return new TokenDTO
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiryMinutes),
            User = MapToUserInfo(user)
        };
    }

    private static UserInfoDTO MapToUserInfo(User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Phone = user.Phone,
        Avatar = user.Avatar,
        Role = user.Role,
        CreatedAt = user.CreatedAt
    };
}
// v1.1: Them refresh token va doi mat khau
// fix: validate ten khong duoc trong khi dang ky
// fix: validate mat khau toi thieu 6 ky tu
// fix: xoa refresh token cu khi doi mat khau
