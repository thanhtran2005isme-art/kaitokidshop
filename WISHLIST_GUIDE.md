# HƯỚNG DẪN SỬ DỤNG CHỨC NĂNG YÊU THÍCH

## 📋 Tổng quan

Chức năng yêu thích cho phép người dùng lưu các sản phẩm yêu thích để xem lại sau. Dữ liệu được lưu trong localStorage theo từng user.

## 📁 Các file đã tạo

1. **yeuthich.html** - Trang hiển thị danh sách sản phẩm yêu thích
2. **css/wishlist.css** - Styles cho trang yêu thích
3. **javascript/wishlist.js** - Logic xử lý trang yêu thích
4. **javascript/wishlist-helper.js** - Helper functions để thêm/xóa yêu thích từ các trang khác

## 🎯 Chức năng

### Trang Yêu Thích (yeuthich.html)
- ✅ Hiển thị grid sản phẩm yêu thích
- ✅ Filter theo danh mục (Nữ/Nam/Trẻ em)
- ✅ Sắp xếp (Mới nhất, Giá, Tên)
- ✅ Xóa từng sản phẩm
- ✅ Xóa tất cả
- ✅ Thêm vào giỏ hàng
- ✅ Xem chi tiết sản phẩm
- ✅ Hiển thị ngày thêm
- ✅ Hiển thị trạng thái tồn kho
- ✅ Empty state khi chưa có sản phẩm

### Helper Functions (wishlist-helper.js)
- `getUserWishlist()` - Lấy danh sách yêu thích của user
- `isInWishlist(productId)` - Kiểm tra sản phẩm có trong wishlist không
- `toggleWishlist(product)` - Thêm/xóa sản phẩm khỏi wishlist
- `updateWishlistUI()` - Cập nhật UI (heart icons)
- `updateWishlistCount()` - Cập nhật số lượng badge
- `addWishlistButton(productCard, product)` - Thêm nút wishlist vào product card

## 🔧 Cách tích hợp vào các trang sản phẩm

### 1. Thêm script vào trang HTML

```html
<!-- Thêm vào cuối body, trước các script khác -->
<script src="/javascript/wishlist-helper.js"></script>
```

### 2. Thêm badge wishlist vào header (nếu chưa có)

```html
<a href="yeuthich.html" class="icon-link">
  <i class="fa fa-heart"></i>
  <span id="wishlist-count" class="cart-badge">0</span>
</a>
```

### 3. Thêm nút wishlist vào product card

#### Cách 1: Thêm HTML trực tiếp
```html
<button class="btn-wishlist" data-product-id="${product.id}" 
        onclick="toggleWishlist(${JSON.stringify(product).replace(/"/g, '&quot;')})">
  <i class="fa fa-heart"></i>
</button>
```

#### Cách 2: Dùng JavaScript
```javascript
// Trong file JavaScript render sản phẩm
const wishlistBtn = addWishlistButton(productCard, product);
productCard.appendChild(wishlistBtn);
```

### 4. Thêm CSS cho nút wishlist

```css
.btn-wishlist {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #cbd5e0;
  font-size: 18px;
  z-index: 10;
}

.btn-wishlist:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-wishlist.active {
  color: #e53e3e;
  background: #fff5f5;
}

.btn-wishlist.active:hover {
  color: #c53030;
}
```

## 💾 Cấu trúc dữ liệu

### Wishlist Item
```javascript
{
  id: "product_123",
  name: "Áo thun basic",
  price: 299000,
  oldPrice: 399000,
  image: "/images/product.jpg",
  menu: "Nữ",
  category: "Áo",
  stock: 50,
  colors: ["Trắng", "Đen"],
  sizes: ["S", "M", "L"],
  addedDate: "2025-01-15T10:30:00.000Z"
}
```

### LocalStorage Keys
- `wishlist_[username]` - Danh sách yêu thích của từng user
- Ví dụ: `wishlist_admin`, `wishlist_user123`

## 📝 Ví dụ sử dụng

### Thêm sản phẩm vào wishlist
```javascript
const product = {
  id: 'prod_001',
  name: 'Áo sơ mi trắng',
  price: 350000,
  oldPrice: 450000,
  image: '/images/shirt.jpg',
  menu: 'Nam',
  category: 'Áo',
  stock: 100
};

toggleWishlist(product);
```

### Kiểm tra sản phẩm có trong wishlist
```javascript
if (isInWishlist('prod_001')) {
  console.log('Sản phẩm đã có trong wishlist');
}
```

### Lấy tất cả sản phẩm yêu thích
```javascript
const wishlist = getUserWishlist();
console.log('Có', wishlist.length, 'sản phẩm yêu thích');
```

## 🎨 Tùy chỉnh giao diện

### Thay đổi màu sắc
Sửa trong `css/wishlist.css`:

```css
/* Màu chính */
.btn-add-to-cart {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Màu nút xóa */
.btn-clear-all {
  background: #e53e3e;
}

/* Màu heart khi active */
.btn-wishlist.active {
  color: #e53e3e;
}
```

## ⚠️ Lưu ý

1. **Yêu cầu đăng nhập**: User phải đăng nhập mới có thể thêm sản phẩm yêu thích
2. **Dữ liệu local**: Dữ liệu lưu trong localStorage, sẽ mất khi clear browser data
3. **Tích hợp backend**: Hiện tại dùng localStorage, cần tích hợp API khi có backend
4. **Responsive**: Giao diện đã responsive cho mobile/tablet

## 🚀 Các bước tiếp theo

1. Thêm nút wishlist vào các trang sản phẩm:
   - `index.html` - Trang chủ
   - `allsp.html` - Tất cả sản phẩm
   - `chitietsanpham.html` - Chi tiết sản phẩm
   - `sanphamnu.html`, `sanphamnam.html`, `sanphamtreem.html`
   - `samphammoi.html`, `samphamsale.html`

2. Cập nhật menu dropdown trong header để link đến trang yêu thích

3. Test chức năng:
   - Thêm/xóa sản phẩm
   - Filter và sort
   - Thêm vào giỏ hàng
   - Xem chi tiết

## 📞 Hỗ trợ

Nếu có vấn đề, kiểm tra:
1. Console log có lỗi không
2. LocalStorage có dữ liệu không (F12 > Application > Local Storage)
3. User đã đăng nhập chưa
4. Script đã được load đúng thứ tự chưa

