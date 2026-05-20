using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Shared.Authorization;

// =============================================================
//  PERMISSION-BASED AUTHORIZATION (RBAC granular)
//  Thay cho [Authorize(Roles = "admin")] cứng — cho phép nhân viên
//  truy cập đúng những endpoint mà vai trò của họ được cấp quyền.
//
//  Quy tắc cho phép (theo thứ tự, chỉ cần 1 điều kiện đúng):
//   1. Super admin nhân viên   → claim is_super_admin = "true"
//   2. Admin "kế thừa"          → role = "admin" (tài khoản NguoiDung admin cũ
//                                  hoặc super admin staff cũng mang role admin)
//   3. Nhân viên có quyền       → claim "permission" = mã quyền yêu cầu
// =============================================================

/// <summary>Requirement chứa mã quyền cần kiểm tra (vd "orders.view").</summary>
public sealed class PermissionRequirement(string permission) : IAuthorizationRequirement
{
    public string Permission { get; } = permission;
}

/// <summary>Đánh dấu action/controller yêu cầu một mã quyền cụ thể.</summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true)]
public sealed class HasPermissionAttribute : AuthorizeAttribute
{
    public const string PolicyPrefix = "PERM:";

    public HasPermissionAttribute(string permission) : base($"{PolicyPrefix}{permission}")
    {
    }
}

/// <summary>
/// Handler quyết định cho phép hay không dựa trên claim của JWT.
/// </summary>
public sealed class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        var user = context.User;

        // 1) Super admin nhân viên → toàn quyền
        if (user.HasClaim("is_super_admin", "true"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // 2) Tài khoản mang role "admin" (NguoiDung admin cũ / super admin staff)
        if (user.IsInRole("admin"))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        // 3) Nhân viên được cấp đúng mã quyền
        if (user.HasClaim("permission", requirement.Permission))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}

/// <summary>
/// Policy provider động: tự sinh policy cho mọi mã quyền "PERM:xxx"
/// mà không cần khai báo tay từng policy trong Program.cs.
/// Các policy khác (không bắt đầu bằng PERM:) rơi về provider mặc định.
/// </summary>
public sealed class PermissionPolicyProvider : IAuthorizationPolicyProvider
{
    private readonly DefaultAuthorizationPolicyProvider _fallback;

    public PermissionPolicyProvider(IOptions<AuthorizationOptions> options)
    {
        _fallback = new DefaultAuthorizationPolicyProvider(options);
    }

    public Task<AuthorizationPolicy> GetDefaultPolicyAsync() => _fallback.GetDefaultPolicyAsync();

    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync() => _fallback.GetFallbackPolicyAsync();

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        if (policyName.StartsWith(HasPermissionAttribute.PolicyPrefix, StringComparison.Ordinal))
        {
            var permission = policyName[HasPermissionAttribute.PolicyPrefix.Length..];
            var policy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .AddRequirements(new PermissionRequirement(permission))
                .Build();
            return Task.FromResult<AuthorizationPolicy?>(policy);
        }

        return _fallback.GetPolicyAsync(policyName);
    }
}

/// <summary>Extension đăng ký toàn bộ hạ tầng permission authorization.</summary>
public static class PermissionAuthorizationExtensions
{
    public static IServiceCollection AddPermissionAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization();
        services.AddSingleton<IAuthorizationPolicyProvider, PermissionPolicyProvider>();
        services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();
        return services;
    }
}
