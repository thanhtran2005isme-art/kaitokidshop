# MÔ TẢ BÀI TOÁN - WEBSITE BÁN QUẦN ÁO KAITO KID

## 1. Mô tả bài toán

### 1.1. Đặt vấn đề

Trong bối cảnh thương mại điện tử phát triển mạnh mẽ, nhu cầu mua sắm quần áo trực tuyến ngày càng tăng cao. Việc xây dựng một website bán quần áo giúp cửa hàng tiếp cận khách hàng rộng rãi hơn, giảm chi phí vận hành so với cửa hàng truyền thống, đồng thời mang lại trải nghiệm mua sắm tiện lợi cho người dùng.

### 1.2. Mục tiêu

Xây dựng website thương mại điện tử **KAITO KID** chuyên bán quần áo thời trang cho Nam, Nữ và Trẻ em với các mục tiêu:

- Cho phép khách hàng duyệt, tìm kiếm, xem chi tiết và mua sản phẩm trực tuyến
- Quản lý giỏ hàng, đặt hàng, theo dõi đơn hàng
- Cung cấp hệ thống quản trị cho admin: quản lý sản phẩm, đơn hàng, khách hàng, tồn kho, khuyến mãi, báo cáo thống kê
- Hỗ trợ các tính năng marketing: flash sale, mã giảm giá, lookbook, bộ sưu tập

### 1.3. Phạm vi

- **Đối tượng sử dụng:** Khách hàng mua sắm trực tuyến và quản trị viên cửa hàng
- **Loại sản phẩm:** Quần áo thời trang nam, nữ, trẻ em (áo, quần, váy, đầm, phụ kiện...)
- **Phương thức thanh toán:** COD, chuyển khoản ngân hàng, MoMo

---

## 2. Các vai trò (Actors)

### 2.1. Khách vãng lai (Guest)
- Duyệt sản phẩm theo danh mục (Nam / Nữ / Trẻ em)
- Tìm kiếm sản phẩm
- Xem chi tiết sản phẩm (hình ảnh, giá, mô tả, đánh giá)
- Xem bộ sưu tập, lookbook
- Thêm sản phẩm vào giỏ hàng

### 2.2. Khách hàng đã đăng nhập (Customer)
- Tất cả quyền của khách vãng lai
- Đặt hàng và thanh toán
- Theo dõi trạng thái đơn hàng
- Quản lý danh sách yêu thích (wishlist)
- Quản lý tài khoản cá nhân và địa chỉ giao hàng
- Đánh giá sản phẩm

### 2.3. Quản trị viên (Admin)
- Quản lý sản phẩm (thêm, sửa, xóa, tìm kiếm, lọc)
- Quản lý danh mục sản phẩm
- Quản lý đơn hàng (xem, cập nhật trạng thái, hủy)
- Quản lý khách hàng
- Quản lý tồn kho và cảnh báo hết hàng
- Quản lý mã giảm giá (coupon) và chương trình khuyến mãi
- Quản lý flash sale
- Quản lý đánh giá sản phẩm
- Xem báo cáo doanh thu và thống kê
- Quản lý nội dung trang chủ (banner, sản phẩm nổi bật)
- Quản lý lookbook, bộ sưu tập
- Cài đặt hệ thống

---

## 3. Các chức năng chính

### 3.1. Phía khách hàng (Frontend)

| STT | Chức năng | Mô tả |
|-----|-----------|-------|
| 1 | Trang chủ | Hiển thị banner, sản phẩm mới, sản phẩm sale, bán chạy nhất |
| 2 | Danh sách sản phẩm | Duyệt sản phẩm theo danh mục, giới tính, lọc và sắp xếp |
| 3 | Chi tiết sản phẩm | Xem ảnh, giá, mô tả, chọn size/màu, đánh giá, sản phẩm liên quan |
| 4 | Tìm kiếm | Tìm kiếm sản phẩm theo tên với gợi ý tự động |
| 5 | Giỏ hàng | Thêm/xóa sản phẩm, thay đổi số lượng, tính tổng tiền |
| 6 | Thanh toán | Nhập thông tin giao hàng, chọn phương thức thanh toán, áp mã giảm giá |
| 7 | Theo dõi đơn hàng | Tra cứu đơn hàng theo SĐT/email, xem trạng thái |
| 8 | Đăng ký / Đăng nhập | Tạo tài khoản, đăng nhập bằng email/SĐT |
| 9 | Tài khoản cá nhân | Xem và cập nhật thông tin cá nhân |
| 10 | Quản lý địa chỉ | Thêm, sửa, xóa địa chỉ giao hàng |
| 11 | Danh sách yêu thích | Lưu sản phẩm yêu thích để mua sau |
| 12 | Bộ sưu tập | Xem các bộ sưu tập thời trang theo chủ đề |
| 13 | Lookbook | Xem các bộ outfit gợi ý phối đồ |

### 3.2. Phía quản trị (Admin Panel)

| STT | Chức năng | Mô tả |
|-----|-----------|-------|
| 1 | Dashboard | Tổng quan doanh thu, đơn hàng, thống kê theo ngày |
| 2 | Quản lý sản phẩm | CRUD sản phẩm, quản lý ảnh, thuộc tính (size, màu, SKU) |
| 3 | Quản lý danh mục | CRUD danh mục sản phẩm |
| 4 | Quản lý đơn hàng | Xem danh sách, chi tiết đơn, cập nhật trạng thái (chờ → xác nhận → giao hàng → hoàn thành / hủy) |
| 5 | Quản lý khách hàng | Xem danh sách, thông tin khách hàng |
| 6 | Quản lý tồn kho | Theo dõi số lượng tồn, lịch sử nhập/xuất, cảnh báo hết hàng |
| 7 | Quản lý mã giảm giá | Tạo coupon, thiết lập điều kiện áp dụng, thời hạn |
| 8 | Quản lý khuyến mãi | Tạo chương trình giảm giá theo sản phẩm/danh mục |
| 9 | Quản lý flash sale | Tạo đợt sale giới hạn thời gian |
| 10 | Quản lý đánh giá | Duyệt, phản hồi đánh giá của khách hàng |
| 11 | Báo cáo thống kê | Doanh thu theo ngày/tháng, sản phẩm bán chạy, phân tích đơn hàng |
| 12 | Quản lý trang chủ | Cấu hình banner, sản phẩm nổi bật, nội dung hiển thị |
| 13 | Cài đặt hệ thống | Thông tin cửa hàng, cấu hình chung |

---

## 4. Kiến trúc hệ thống

### 4.1. Tổng quan kiến trúc

Hệ thống được xây dựng theo mô hình **Client-Server**, tách biệt giữa Frontend (React) và Backend (ASP.NET Core Web API), giao tiếp qua RESTful API.

```
┌───────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                           │
│                                                                │
│  ┌──────────────────┐          ┌────────────────────────────┐  │
│  │ Trang khách hàng  │          │     Trang quản trị         │  │
│  │ (React SPA)       │          │     (React SPA)            │  │
│  │                   │          │                            │  │
│  │ - Trang chủ       │          │  - Dashboard               │  │
│  │ - Sản phẩm        │          │  - Quản lý SP              │  │
│  │ - Giỏ hàng        │          │  - Quản lý đơn hàng        │  │
│  │ - Thanh toán       │          │  - Quản lý khách hàng      │  │
│  │ - Tài khoản        │          │  - Tồn kho, báo cáo        │  │
│  └────────┬──────────┘          └──────────────┬─────────────┘  │
│           │                                    │                │
│  ┌────────▼────────────────────────────────────▼─────────────┐  │
│  │           Service Layer (HTTP Client - Axios/Fetch)        │  │
│  │                                                            │  │
│  │  productService │ cartService │ authService │ orderService  │  │
│  └───────────────────────────┬────────────────────────────────┘  │
└──────────────────────────────┼───────────────────────────────────┘
                               │ HTTP/HTTPS (RESTful API)
                               │ JSON + JWT Token
┌──────────────────────────────┼───────────────────────────────────┐
│                     SERVER (ASP.NET Core)                         │
│                              │                                    │
│  ┌───────────────────────────▼────────────────────────────────┐  │
│  │                  API Controllers                            │  │
│  │                                                             │  │
│  │  ProductsController │ OrdersController │ AuthController     │  │
│  │  CategoriesController │ CustomersController │ CartController │  │
│  │  CouponsController │ ReportsController │ InventoryController│  │
│  └───────────────────────────┬─────────────────────────────────┘  │
│                              │                                    │
│  ┌───────────────────────────▼─────────────────────────────────┐  │
│  │                  Business Logic Layer                        │  │
│  │                                                              │  │
│  │  ProductService │ OrderService │ AuthService │ CartService   │  │
│  │  CouponService │ InventoryService │ ReportService           │  │
│  └───────────────────────────┬──────────────────────────────────┘  │
│                              │                                    │
│  ┌───────────────────────────▼─────────────────────────────────┐  │
│  │                  Data Access Layer (EF Core)                 │  │
│  │                                                              │  │
│  │  DbContext │ Repositories │ Migrations                       │  │
│  └───────────────────────────┬──────────────────────────────────┘  │
└──────────────────────────────┼────────────────────────────────────┘
                               │
                ┌──────────────▼──────────────┐
                │      SQL Server Database     │
                │                              │
                │  Products │ Categories       │
                │  Orders │ OrderDetails       │
                │  Users │ Addresses           │
                │  Carts │ CartItems           │
                │  Coupons │ FlashSales        │
                │  Reviews │ Inventory         │
                └──────────────────────────────┘
```

### 4.2. Kiến trúc phần mềm (N-Layer Architecture)

| Tầng | Mô tả | Công nghệ |
|------|--------|-----------|
| **Presentation (Frontend)** | Giao diện người dùng SPA | React 18 + TypeScript |
| **API Layer** | Tiếp nhận request, xác thực, trả response | ASP.NET Core Web API Controllers |
| **Business Logic Layer** | Xử lý nghiệp vụ, validation, tính toán | C# Services |
| **Data Access Layer** | Truy vấn và thao tác CSDL | Entity Framework Core |
| **Database** | Lưu trữ dữ liệu | SQL Server |

### 4.3. Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| **Frontend** | |
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Routing | React Router v6 |
| State Management | React Context API |
| HTTP Client | Axios |
| Styling | CSS3, Google Fonts, Font Awesome |
| Icons | React Icons |
| **Backend** | |
| Framework | ASP.NET Core Web API (.NET 8) |
| ORM | Entity Framework Core |
| Authentication | JWT (JSON Web Token) |
| API Documentation | Swagger / Swashbuckle |
| **Database** | |
| RDBMS | SQL Server |
| **Khác** | |
| Version Control | Git |

### 4.4. Giao tiếp Frontend - Backend

Frontend gọi Backend thông qua RESTful API với các quy ước:

| Phương thức | Mục đích | Ví dụ |
|-------------|----------|-------|
| `GET` | Lấy dữ liệu | `GET /api/products` |
| `POST` | Tạo mới | `POST /api/orders` |
| `PUT` | Cập nhật | `PUT /api/products/{id}` |
| `DELETE` | Xóa | `DELETE /api/products/{id}` |

Xác thực sử dụng JWT Token:
- Đăng nhập → Server trả về Access Token
- Mỗi request gửi kèm header: `Authorization: Bearer <token>`
- Server xác thực token và phân quyền (Admin / Customer)

### 4.5. Luồng dữ liệu chính

```
Đặt hàng:
  Khách hàng → Duyệt SP → Thêm giỏ hàng → Thanh toán → Gửi request POST /api/orders
       │                                                          │
       │                                                          ▼
       │                                                   ASP.NET Core API
       │                                                          │
       │                                                          ▼
       │                                                   SQL Server (lưu đơn)
       │                                                          │
  Admin ← Dashboard ← GET /api/reports ← Cập nhật trạng thái ←──┘

Xác thực:
  Người dùng → POST /api/auth/login → Server kiểm tra CSDL → Trả JWT Token
                                                                    │
                                          ┌─────────────────────────┼──────────┐
                                          ▼                                    ▼
                                    role = "Customer"                  role = "Admin"
                                   → Trang khách hàng               → Trang quản trị
```

### 4.6. Danh sách API Endpoints chính

| Nhóm | Endpoint | Mô tả |
|------|----------|-------|
| **Auth** | `POST /api/auth/login` | Đăng nhập |
| | `POST /api/auth/register` | Đăng ký |
| **Products** | `GET /api/products` | Danh sách SP (hỗ trợ filter, search, paging) |
| | `GET /api/products/{id}` | Chi tiết SP |
| | `POST /api/products` | Thêm SP (Admin) |
| | `PUT /api/products/{id}` | Sửa SP (Admin) |
| | `DELETE /api/products/{id}` | Xóa SP (Admin) |
| **Categories** | `GET /api/categories` | Danh sách danh mục |
| | `POST /api/categories` | Thêm danh mục (Admin) |
| **Cart** | `GET /api/cart` | Lấy giỏ hàng |
| | `POST /api/cart/items` | Thêm SP vào giỏ |
| | `PUT /api/cart/items/{id}` | Cập nhật số lượng |
| | `DELETE /api/cart/items/{id}` | Xóa SP khỏi giỏ |
| **Orders** | `POST /api/orders` | Đặt hàng |
| | `GET /api/orders` | Danh sách đơn (Admin) |
| | `GET /api/orders/my` | Đơn hàng của tôi |
| | `PUT /api/orders/{id}/status` | Cập nhật trạng thái (Admin) |
| **Customers** | `GET /api/customers` | Danh sách KH (Admin) |
| **Inventory** | `GET /api/inventory` | Tồn kho (Admin) |
| **Coupons** | `GET /api/coupons/validate/{code}` | Kiểm tra mã giảm giá |
| **Reports** | `GET /api/reports/revenue` | Báo cáo doanh thu (Admin) |

---

## 5. Cấu trúc dự án

### 5.1. Frontend - React (kaito-kid-react/)

```
kaito-kid-react/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Router chính, định nghĩa tất cả routes
│   ├── App.css                     # Styles toàn cục
│   │
│   ├── pages/                      # Trang khách hàng (13 trang)
│   │   ├── Home.tsx                # Trang chủ (hero, SP mới, sale, bán chạy)
│   │   ├── Products.tsx            # Danh sách sản phẩm
│   │   ├── ProductDetail.tsx       # Chi tiết sản phẩm
│   │   ├── Cart.tsx                # Giỏ hàng
│   │   ├── Checkout.tsx            # Thanh toán
│   │   ├── OrderTracking.tsx       # Theo dõi đơn hàng
│   │   ├── Login.tsx               # Đăng nhập / Đăng ký
│   │   ├── Account.tsx             # Tài khoản cá nhân
│   │   ├── Address.tsx             # Quản lý địa chỉ
│   │   ├── Wishlist.tsx            # Danh sách yêu thích
│   │   ├── Search.tsx              # Tìm kiếm sản phẩm
│   │   ├── Collections.tsx         # Bộ sưu tập
│   │   └── Lookbook.tsx            # Lookbook
│   │
│   ├── admin/                      # Trang quản trị (12 trang)
│   │   ├── Dashboard.tsx           # Tổng quan thống kê
│   │   ├── AdminProducts.tsx       # Quản lý sản phẩm
│   │   ├── AdminOrders.tsx         # Quản lý đơn hàng
│   │   ├── AdminCustomers.tsx      # Quản lý khách hàng
│   │   ├── AdminCategories.tsx     # Quản lý danh mục
│   │   ├── AdminInventory.tsx      # Quản lý tồn kho
│   │   ├── AdminCoupons.tsx        # Quản lý mã giảm giá
│   │   ├── AdminFlashSales.tsx     # Quản lý flash sale
│   │   ├── AdminReviews.tsx        # Quản lý đánh giá
│   │   ├── AdminReports.tsx        # Báo cáo thống kê
│   │   ├── AdminHomepage.tsx       # Quản lý trang chủ
│   │   └── AdminSettings.tsx       # Cài đặt hệ thống
│   │
│   ├── components/                 # Components tái sử dụng
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx      # Layout khách hàng (Header + Footer)
│   │   │   ├── Header.tsx          # Header với menu, search, cart icon
│   │   │   └── Footer.tsx          # Footer
│   │   ├── admin/
│   │   │   └── AdminLayout.tsx     # Layout admin (Sidebar + Content)
│   │   ├── product/
│   │   │   └── ProductCard.tsx     # Card hiển thị sản phẩm
│   │   └── ProtectedRoute.tsx      # Route bảo vệ (yêu cầu đăng nhập/admin)
│   │
│   ├── services/                   # Gọi API Backend
│   │   ├── api.ts                  # Axios instance (base URL, interceptors, JWT)
│   │   ├── productService.ts       # Gọi API sản phẩm
│   │   ├── cartService.ts          # Gọi API giỏ hàng
│   │   ├── authService.ts          # Gọi API xác thực
│   │   └── orderService.ts         # Gọi API đơn hàng
│   │
│   ├── context/                    # Quản lý state toàn cục
│   │   ├── AuthContext.tsx          # State xác thực (user, token, login, logout)
│   │   └── CartContext.tsx          # State giỏ hàng (items, total)
│   │
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces (Product, User, CartItem, Order)
│   │
│   └── utils/
│       ├── format.ts               # Format tiền tệ, ngày tháng
│       └── validation.ts           # Validate form input
│
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 5.2. Backend - ASP.NET Core Web API

```
KaitoKidAPI/
├── Controllers/                    # API Controllers
│   ├── AuthController.cs           # Đăng nhập, đăng ký, refresh token
│   ├── ProductsController.cs       # CRUD sản phẩm, tìm kiếm, lọc
│   ├── CategoriesController.cs     # CRUD danh mục
│   ├── CartController.cs           # Quản lý giỏ hàng
│   ├── OrdersController.cs         # Đặt hàng, cập nhật trạng thái
│   ├── CustomersController.cs      # Quản lý khách hàng
│   ├── InventoryController.cs      # Quản lý tồn kho
│   ├── CouponsController.cs        # Quản lý mã giảm giá
│   ├── ReviewsController.cs        # Quản lý đánh giá
│   └── ReportsController.cs        # Báo cáo thống kê
│
├── Models/                         # Entity Models (mapping DB tables)
│   ├── Product.cs
│   ├── Category.cs
│   ├── User.cs
│   ├── Order.cs
│   ├── OrderDetail.cs
│   ├── Cart.cs
│   ├── CartItem.cs
│   ├── Coupon.cs
│   ├── Review.cs
│   └── Inventory.cs
│
├── DTOs/                           # Data Transfer Objects
│   ├── LoginDTO.cs
│   ├── RegisterDTO.cs
│   ├── ProductDTO.cs
│   ├── OrderDTO.cs
│   └── ...
│
├── Services/                       # Business Logic
│   ├── IProductService.cs
│   ├── ProductService.cs
│   ├── IAuthService.cs
│   ├── AuthService.cs
│   ├── IOrderService.cs
│   ├── OrderService.cs
│   └── ...
│
├── Data/
│   ├── AppDbContext.cs              # EF Core DbContext
│   └── Migrations/                 # Database migrations
│
├── Helpers/
│   ├── JwtHelper.cs                # Tạo và xác thực JWT Token
│   └── MappingProfile.cs           # AutoMapper profiles
│
├── Program.cs                      # Cấu hình app, DI, middleware
├── appsettings.json                # Connection string, JWT settings
└── KaitoKidAPI.csproj
```

### 5.3. Cơ sở dữ liệu (SQL Server)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│  Categories   │       │    Products       │       │   Reviews     │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ Id (PK)      │◄──┐   │ Id (PK)          │◄──┐   │ Id (PK)      │
│ Name         │   │   │ Name             │   │   │ ProductId(FK)│──┐
│ Description  │   │   │ CategoryId (FK)  │───┘   │ UserId (FK)  │  │
│ Icon         │   │   │ Gender           │       │ Rating       │  │
│ CreatedAt    │   │   │ Price            │       │ Comment      │  │
└──────────────┘   │   │ OldPrice         │       │ CreatedAt    │  │
                   │   │ Stock            │       └──────────────┘  │
                   │   │ Status           │                         │
                   │   │ Image            │       ┌──────────────┐  │
                   │   │ Description      │       │   Users       │  │
                   │   │ SKU              │       ├──────────────┤  │
                   │   │ Rating           │       │ Id (PK)      │◄─┘
                   │   │ SoldCount        │       │ Name         │
                   │   │ IsNew            │       │ Email        │
                   │   │ IsSale           │       │ Phone        │
                   │   │ IsBestSeller     │       │ PasswordHash │
                   │   │ CreatedAt        │       │ Role         │
                   │   └──────────────────┘       │ CreatedAt    │
                   │                               └──────┬───────┘
                   │                                      │
┌──────────────┐   │   ┌──────────────────┐       ┌───────▼──────┐
│  Coupons      │   │   │   Orders          │       │  Addresses   │
├──────────────┤   │   ├──────────────────┤       ├──────────────┤
│ Id (PK)      │   │   │ Id (PK)          │       │ Id (PK)      │
│ Code         │   │   │ UserId (FK)      │───────│ UserId (FK)  │
│ DiscountType │   │   │ Total            │       │ FullName     │
│ DiscountValue│   │   │ Subtotal         │       │ Phone        │
│ MinOrder     │   │   │ ShippingFee      │       │ Address      │
│ MaxDiscount  │   │   │ Discount         │       │ IsDefault    │
│ StartDate    │   │   │ CouponCode       │       └──────────────┘
│ EndDate      │   │   │ PaymentMethod    │
│ UsageLimit   │   │   │ Status           │       ┌──────────────┐
│ UsedCount    │   │   │ Note             │       │ OrderDetails  │
└──────────────┘   │   │ CreatedAt        │       ├──────────────┤
                   │   └────────┬─────────┘       │ Id (PK)      │
                   │            │                  │ OrderId (FK) │
┌──────────────┐   │            └─────────────────▶│ ProductId(FK)│
│  Carts        │   │                              │ ProductName  │
├──────────────┤   │                              │ Price        │
│ Id (PK)      │   │                              │ Size         │
│ UserId (FK)  │   │                              │ Color        │
│ CreatedAt    │   │                              │ Quantity     │
└──────┬───────┘   │                              └──────────────┘
       │           │
       ▼           │
┌──────────────┐   │
│  CartItems    │   │
├──────────────┤   │
│ Id (PK)      │   │
│ CartId (FK)  │   │
│ ProductId(FK)│───┘
│ Size         │
│ Color        │
│ Quantity     │
└──────────────┘
```

### 5.4. Mô hình dữ liệu chính (Entity Models)

| Bảng | Mô tả | Quan hệ |
|------|--------|---------|
| **Users** | Tài khoản người dùng (Customer + Admin) | 1-N với Orders, Addresses, Reviews, Carts |
| **Products** | Sản phẩm quần áo | N-1 với Categories, 1-N với Reviews, OrderDetails |
| **Categories** | Danh mục sản phẩm | 1-N với Products |
| **Orders** | Đơn hàng | N-1 với Users, 1-N với OrderDetails |
| **OrderDetails** | Chi tiết đơn hàng (từng sản phẩm) | N-1 với Orders, N-1 với Products |
| **Carts** | Giỏ hàng | N-1 với Users, 1-N với CartItems |
| **CartItems** | Sản phẩm trong giỏ | N-1 với Carts, N-1 với Products |
| **Coupons** | Mã giảm giá | Độc lập |
| **Reviews** | Đánh giá sản phẩm | N-1 với Users, N-1 với Products |
| **Addresses** | Địa chỉ giao hàng | N-1 với Users |

---

## 6. Tổng kết

Website KAITO KID là một hệ thống thương mại điện tử hoàn chỉnh cho lĩnh vực thời trang, bao gồm:

- **3 vai trò:** Khách vãng lai, Khách hàng, Quản trị viên
- **25+ chức năng** phía khách hàng và quản trị
- **Kiến trúc Client-Server:** Frontend React giao tiếp với Backend ASP.NET Core Web API qua RESTful API
- **Cơ sở dữ liệu:** SQL Server với Entity Framework Core, 10+ bảng dữ liệu có quan hệ
- **Bảo mật:** JWT Authentication, phân quyền Admin/Customer
