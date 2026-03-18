using API.Customer.Data;
using API.Customer.Services;
using DbHelper;
using Shared.Extensions;

var builder = WebApplication.CreateBuilder(args);

// DbContext với AuditInterceptor từ DbHelper
builder.Services.AddSqlServerDb<CustomerDbContext>(builder.Configuration);

// JWT Authentication từ Shared
builder.Services.AddJwtAuthentication(builder.Configuration);

// Services DI
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IWishlistService, WishlistService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<IAddressService, AddressService>();
builder.Services.AddScoped<ICouponService, CouponService>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Middleware từ Shared
app.UseRequestLogging();
app.UseGlobalExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
