using API.Customer.Data;
using API.Customer.Services;
using API.Customer.Services.Shipping;
using DbHelper;
using Shared.Extensions;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSqlServerDb<CustomerDbContext>(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);

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
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IWishlistService, WishlistService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IAddressService, AddressService>();
builder.Services.AddScoped<ICouponService, CouponService>();

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
