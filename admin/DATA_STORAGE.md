# Hướng dẫn Lưu trữ Dữ liệu Admin Panel

## Tổng quan

Trang admin lưu **tất cả dữ liệu vào LocalStorage của trình duyệt**. Đây là phương thức lưu trữ phía client, dữ liệu chỉ tồn tại trên máy tính của bạn.

## Các Key trong LocalStorage

### 1. **Sản phẩm (Products)**
- **Key:** `adminProducts`
- **Kiểu dữ liệu:** Array of Objects
- **Vị trí lưu:** `admin/js/admin-products.js`
- **Cấu trúc:**
```javascript
[
  {
    id: "SP123456",
    name: "ĐẦM THIẾT KẾ D16442",
    category: "Đầm",
    price: 1599000,
    oldPrice: 1999999,
    stock: 50,
    status: "active",
    image: "/images/product.jpg",
    description: "Mô tả sản phẩm",
    specs: "Chất liệu: vải thô",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z"
  }
]
```

### 2. **Danh mục (Categories)**
- **Key:** `adminCategories`
- **Kiểu dữ liệu:** Array of Objects
- **Vị trí lưu:** `admin/js/admin-categories.js`
- **Cấu trúc:**
```javascript
[
  {
    id: "cat1",
    name: "Áo sơ mi",
    description: "Áo sơ mi và áo kiểu",
    icon: "fas fa-tshirt",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z"
  }
]
```

### 3. **Đơn hàng (Orders)**
- **Key:** `adminOrders`
- **Kiểu dữ liệu:** Array of Objects
- **Vị trí lưu:** `admin/js/admin-orders.js`
- **Cấu trúc:**
```javascript
[
  {
    id: "ORD123456",
    customerName: "Nguyễn Văn A",
    customerPhone: "0900000000",
    customerEmail: "customer@example.com",
    customerAddress: "123 Đường ABC",
    items: [
      {
        id: "SP1",
        name: "Tên sản phẩm",
        price: 500000,
        quantity: 2,
        imgSrc: "/images/product.jpg"
      }
    ],
    total: 1000000,
    status: "pending", // pending, processing, completed, cancelled
    note: "Ghi chú",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z"
  }
]
```

### 4. **Thông tin đăng nhập Admin**
- **Key:** `adminCredentials`
- **Kiểu dữ liệu:** Object
- **Vị trí khởi tạo:** `javascript/login.js`
- **Cấu trúc:**
```javascript
{
  username: "admin",
  password: "admin123"
}
```

### 5. **Trạng thái đăng nhập Admin**
- **Key:** `adminLoggedIn`
- **Kiểu dữ liệu:** String ("true" hoặc null)
- **Key:** `adminUser`
- **Kiểu dữ liệu:** String (tên đăng nhập)

## Cách xem dữ liệu trong LocalStorage

### Trong trình duyệt:
1. Mở **Developer Tools** (F12)
2. Chọn tab **Application** (Chrome) hoặc **Storage** (Firefox)
3. Trong sidebar, chọn **Local Storage**
4. Chọn domain của website
5. Xem các key và value

### Hoặc dùng JavaScript Console:
```javascript
// Xem tất cả sản phẩm
console.log(JSON.parse(localStorage.getItem('adminProducts')));

// Xem tất cả danh mục
console.log(JSON.parse(localStorage.getItem('adminCategories')));

// Xem tất cả đơn hàng
console.log(JSON.parse(localStorage.getItem('adminOrders')));
```

## Lưu ý quan trọng

⚠️ **Nhược điểm của LocalStorage:**
- Dữ liệu chỉ tồn tại trên trình duyệt cụ thể
- Xóa cache/clear data sẽ mất toàn bộ dữ liệu
- Không đồng bộ giữa các thiết bị
- Giới hạn dung lượng (thường 5-10MB)

✅ **Để sử dụng trong production:**
- Nên kết nối với **Backend API** (Node.js, PHP, Python...)
- Sử dụng **Database** (MySQL, PostgreSQL, MongoDB...)
- Lưu trữ trên server thay vì client

## Các hàm lưu/đọc dữ liệu chính

### Sản phẩm:
- `localStorage.getItem('adminProducts')` - Đọc danh sách sản phẩm
- `localStorage.setItem('adminProducts', JSON.stringify(products))` - Lưu danh sách sản phẩm

### Danh mục:
- `localStorage.getItem('adminCategories')` - Đọc danh sách danh mục
- `localStorage.setItem('adminCategories', JSON.stringify(categories))` - Lưu danh mục

### Đơn hàng:
- `localStorage.getItem('adminOrders')` - Đọc danh sách đơn hàng
- `localStorage.setItem('adminOrders', JSON.stringify(orders))` - Lưu đơn hàng

## Export/Import dữ liệu

Bạn có thể xuất dữ liệu để backup:

```javascript
// Export tất cả dữ liệu admin
const adminData = {
  products: JSON.parse(localStorage.getItem('adminProducts') || '[]'),
  categories: JSON.parse(localStorage.getItem('adminCategories') || '[]'),
  orders: JSON.parse(localStorage.getItem('adminOrders') || '[]')
};

// Copy dữ liệu JSON
console.log(JSON.stringify(adminData, null, 2));
```

Để import lại:
```javascript
// Import dữ liệu
const adminData = { /* paste dữ liệu JSON ở đây */ };
localStorage.setItem('adminProducts', JSON.stringify(adminData.products));
localStorage.setItem('adminCategories', JSON.stringify(adminData.categories));
localStorage.setItem('adminOrders', JSON.stringify(adminData.orders));
```
