using API.Customer.Data;
using API.Customer.Services;
using API.Customer.Services.Shipping;
using DbHelper;
using Shared.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSqlServerDb<CustomerDbContext>(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);

// SignalR cho chat real-time. Cho phép đọc access_token từ query string khi kết nối hub
// (WebSocket không gửi được header Authorization) — chỉ áp dụng cho path /hubs.
builder.Services.Configure<Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerOptions>(
    Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme,
    options =>
    {
        options.Events ??= new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents();
        options.Events.OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        };
    });

builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:3000",
                "http://127.0.0.1:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ISearchService, SearchService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IComboDiscountService, ComboDiscountService>();
builder.Services.AddScoped<API.Customer.Services.Email.IEmailService, API.Customer.Services.Email.SmtpEmailService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IWishlistService, WishlistService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IAddressService, AddressService>();
builder.Services.AddScoped<ICouponService, CouponService>();

// ===== Chat (live chat + chatbot) =====
// Các skill rule-based truy DB
builder.Services.AddScoped<API.Customer.Services.Bot.IChatSkill, API.Customer.Services.Bot.Skills.OrderLookupSkill>();
builder.Services.AddScoped<API.Customer.Services.Bot.IChatSkill, API.Customer.Services.Bot.Skills.StockCheckSkill>();
builder.Services.AddScoped<API.Customer.Services.Bot.IChatSkill, API.Customer.Services.Bot.Skills.CouponSkill>();
builder.Services.AddScoped<API.Customer.Services.Bot.IChatSkill, API.Customer.Services.Bot.Skills.FaqSkill>();

// Chatbot: nếu có cấu hình LLM thì dùng LlmChatBot, ngược lại rule-based (giống pattern Email Brevo/Console)
var chatLlmKey = builder.Configuration["Chat:Llm:ApiKey"];
if (!string.IsNullOrWhiteSpace(chatLlmKey))
{
    builder.Services.AddHttpClient<API.Customer.Services.Bot.IChatBot, API.Customer.Services.Bot.LlmChatBot>();
}
else
{
    builder.Services.AddScoped<API.Customer.Services.Bot.IChatBot, API.Customer.Services.Bot.RuleBasedChatBot>();
}

builder.Services.AddScoped<IChatService, ChatService>();

// Shipping providers — Mock luôn bật, GHTK/GHN bật khi có token
// Shipping config service (singleton để cache nhẹ trong process)
builder.Services.AddSingleton<IShippingConfigService, ShippingConfigService>();
builder.Services.AddHttpClient<IGhnMasterDataService, GhnMasterDataService>(c =>
{
    c.Timeout = TimeSpan.FromSeconds(15);
});

builder.Services.AddScoped<IShippingProvider, MockShippingProvider>();
builder.Services.AddHttpClient<IShippingProvider, GhtkShippingProvider>(c =>
{
    var baseUrl = builder.Configuration["GHTK:BaseUrl"]
        ?? "https://services.giaohangtietkiem.vn";
    c.BaseAddress = new Uri(baseUrl);
    c.Timeout = TimeSpan.FromSeconds(15);
});
builder.Services.AddHttpClient<IShippingProvider, GhnShippingProvider>(c =>
{
    // Mặc định trỏ vào DEV endpoint của GHN — token production sẽ trả 401, không thể tạo đơn thật.
    var baseUrl = builder.Configuration["GHN:BaseUrl"]
        ?? "https://dev-online-gateway.ghn.vn";
    c.BaseAddress = new Uri(baseUrl);
    c.Timeout = TimeSpan.FromSeconds(15);
});
builder.Services.AddScoped<IShippingService, ShippingService>();

builder.Services.AddHostedService<ShippingStatusSimulator>();
builder.Services.AddHostedService<API.Customer.Services.PaymentExpirySweeper>();
builder.Services.AddHostedService<API.Customer.Services.CartReservationSweeper>();
builder.Services.AddHostedService<API.Customer.Services.ChatIdleSweeper>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseStaticFiles();
app.UseCors("AllowFrontend");
app.UseRequestLogging();
app.UseGlobalExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<API.Customer.Hubs.ChatHub>("/hubs/chat");

// Banner an toàn ở console khi khởi động
var shippingMode = (app.Configuration["Shipping:Mode"] ?? "dev").ToLowerInvariant();
var allowRealCreate = bool.TryParse(app.Configuration["Shipping:AllowRealCreate"], out var v) && v;
var ghnBase = app.Configuration["GHN:BaseUrl"] ?? "(default dev)";
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("=========================================================");
logger.LogInformation(" SHIPPING MODE   : {Mode}", shippingMode.ToUpperInvariant());
logger.LogInformation(" REAL CREATE     : {Allow}", allowRealCreate ? "ALLOWED" : "BLOCKED (safe)");
logger.LogInformation(" GHN BASE URL    : {Url}", ghnBase);
logger.LogInformation(" → KHÔNG có hàm gọi /shipping-order/create. Đơn luôn sinh mã giả lập.");
logger.LogInformation("=========================================================");

app.Run();
