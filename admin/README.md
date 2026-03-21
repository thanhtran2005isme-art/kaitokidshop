# Trang Quản Trị - Kaito Kid Shop

## Hướng dẫn sử dụng

### Đăng nhập
- Mở file `login.html` (trang đăng nhập chính) trong trình duyệt
- Tài khoản mặc định:
  - **Tên đăng nhập:** `admin`
  - **Mật khẩu:** `admin123`
- Sau khi đăng nhập với tài khoản admin, sẽ tự động chuyển đến trang admin dashboard

### Các tính năng chính

#### 1. Dashboard
- Xem tổng quan thống kê: số sản phẩm, đơn hàng, doanh thu
- Xem đơn hàng và sản phẩm mới nhất

#### 2. Quản lý Sản phẩm
- **Thêm sản phẩm mới:** Click nút "Thêm sản phẩm mới"
- **Sửa sản phẩm:** Click nút "Sửa" trên từng sản phẩm
- **Xóa sản phẩm:** Click nút "Xóa" và xác nhận
- **Tìm kiếm:** Nhập tên sản phẩm vào ô tìm kiếm
- **Lọc theo danh mục:** Chọn danh mục từ dropdown

#### 3. Quản lý Danh mục
- **Thêm danh mục mới:** Click nút "Thêm danh mục mới"
- **Sửa danh mục:** Click nút "Sửa" trên từng danh mục
- **Xóa danh mục:** Chỉ xóa được khi không còn sản phẩm nào thuộc danh mục đó

#### 4. Quản lý Đơn hàng
- **Xem chi tiết:** Click nút "Xem" để xem thông tin đầy đủ
- **Cập nhật trạng thái:** Chọn trạng thái mới từ dropdown
- **Lọc theo trạng thái:** Sử dụng filter ở header

### Lưu ý
- Tất cả dữ liệu được lưu trong localStorage của trình duyệt
- Để bảo mật, nên thay đổi mật khẩu mặc định
- Khi xóa trình duyệt hoặc dữ liệu, tất cả thông tin sẽ bị mất

## Cấu trúc thư mục

```
admin/
├── dashboard.html      # Trang dashboard
├── products.html       # Trang quản lý sản phẩm
├── categories.html     # Trang quản lý danh mục
├── orders.html         # Trang quản lý đơn hàng
├── css/
│   ├── admin-dashboard.css
│   ├── admin-products.css
│   ├── admin-categories.css
│   └── admin-orders.css
└── js/
    ├── admin-dashboard.js
    ├── admin-products.js
    ├── admin-categories.js
    ├── admin-orders.js
    └── admin-common.js
```

**Lưu ý:** Trang đăng nhập được sử dụng chung từ `login.html` ở thư mục gốc.
