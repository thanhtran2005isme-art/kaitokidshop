using API.Customer.Data;
using API.Customer.Services;
using DbHelper;
using Shared.Extensions;

var builder = WebApplication.CreateBuilder(args);

// DbContext với AuditInterceptor từ DbHelper
builder.Services.AddSqlServerDb<CustomerDbContext>(builder.Configuration);

// JWT Authentication từ Shared
builder.Services.AddJwtAuthentication(builder.Configuration);

// CORS cho React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

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

// CORS phải đặt trước Authentication
app.UseCors("AllowFrontend");

// Middleware từ Shared
app.UseRequestLogging();
app.UseGlobalExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
