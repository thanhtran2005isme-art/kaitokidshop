# GIẢI THÍCH CHI TIẾT CODE THÊM SẢN PHẨM VÀO GIỎ HÀNG

## TỔNG QUAN

Code sử dụng **localStorage** để lưu trữ giỏ hàng. localStorage là bộ nhớ của trình duyệt, dữ liệu vẫn còn khi tắt trình duyệt.

---

## 1. KHỞI TẠO GIỎ HÀNG RỖNG

```javascript
if (!localStorage.getItem("cart")) {
    localStorage.setItem("cart", JSON.stringify([]));
}
```

**Giải thích từng dòng:**
- `localStorage.getItem("cart")` - Lấy dữ liệu giỏ hàng từ localStorage
- `!localStorage.getItem("cart")` - Nếu CHƯA CÓ giỏ hàng (trả về null)
- `JSON.stringify([])` - Chuyển mảng rỗng `[]` thành chuỗi `"[]"`
- `localStorage.setItem("cart", ...)` - Lưu chuỗi `"[]"` vào localStorage với key là "cart"

**Tại sao cần JSON.stringify?**
- localStorage chỉ lưu được **chuỗi (string)**
- Mảng/Object phải chuyển thành chuỗi JSON trước khi lưu

---

## 2. HÀM THÊM SẢN PHẨM VÀO GIỎ HÀNG

```javascript
function addToCart(productId) {
    // BƯỚC 1: Lấy danh sách sản phẩm
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    // BƯỚC 2: Kiểm tra sản phẩm có tồn tại không
    if (!product) {
        alert('Không tìm thấy sản phẩm');
        return;  // Dừng hàm, không chạy tiếp
    }
    
    // BƯỚC 3: Kiểm tra còn hàng không
    if (product.stock === 0) {
        alert('Sản phẩm đã hết hàng');
        return;
    }
    
    // BƯỚC 4: Lấy giỏ hàng hiện tại từ localStorage
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // BƯỚC 5: Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItem = cart.find(item => item.id === productId);
    
    // BƯỚC 6: Nếu đã có -> tăng số lượng, chưa có -> thêm mới
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.salePrice || product.price,
            image: getProductImage(product),
            quantity: 1
        });
    }
    
    // BƯỚC 7: Lưu giỏ hàng đã cập nhật vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // BƯỚC 8: Cập nhật số lượng hiển thị trên icon giỏ hàng
    updateCartCount();
    
    // BƯỚC 9: Thông báo cho người dùng
    alert('Đã thêm sản phẩm vào giỏ hàng!');
}
```

---

## 3. GIẢI THÍCH CHI TIẾT TỪNG BƯỚC

### BƯỚC 4: Lấy giỏ hàng từ localStorage

```javascript
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
```

**Phân tích:**
- `localStorage.getItem('cart')` - Lấy chuỗi JSON từ localStorage
- `|| '[]'` - Nếu không có (null), dùng chuỗi `'[]'` thay thế
- `JSON.parse(...)` - Chuyển chuỗi JSON thành mảng JavaScript

**Ví dụ:**
```javascript
// Trong localStorage: '[]'
// Sau JSON.parse: []

// Trong localStorage: '[{"id":1,"name":"Áo","quantity":2}]'
// Sau JSON.parse: [{id:1, name:"Áo", quantity:2}]
```

---

### BƯỚC 5: Tìm sản phẩm trong giỏ hàng

```javascript
const existingItem = cart.find(item => item.id === productId);
```

**Giải thích:**
- `cart.find()` - Tìm phần tử đầu tiên thỏa điều kiện
- `item => item.id === productId` - Arrow function kiểm tra id có trùng không
- Nếu tìm thấy: trả về object sản phẩm
- Nếu không tìm thấy: trả về `undefined`

**Ví dụ:**
```javascript
const cart = [
    {id: 1, name: "Áo", quantity: 2},
    {id: 2, name: "Quần", quantity: 1}
];

cart.find(item => item.id === 1);  // {id: 1, name: "Áo", quantity: 2}
cart.find(item => item.id === 5);  // undefined
```

---

### BƯỚC 6: Thêm hoặc cập nhật sản phẩm

```javascript
if (existingItem) {
    // Sản phẩm ĐÃ CÓ trong giỏ -> Tăng số lượng lên 1
    existingItem.quantity += 1;
} else {
    // Sản phẩm CHƯA CÓ -> Thêm mới vào mảng
    cart.push({
        id: product.id,
        name: product.name,
        price: product.salePrice || product.price,
        image: getProductImage(product),
        quantity: 1
    });
}
```

**Giải thích `cart.push()`:**
- `push()` - Thêm phần tử vào cuối mảng
- Object được thêm chứa: id, name, price, image, quantity

**Giải thích `product.salePrice || product.price`:**
- Nếu có giá sale -> dùng giá sale
- Nếu không có giá sale -> dùng giá gốc

---

### BƯỚC 7: Lưu giỏ hàng vào localStorage

```javascript
localStorage.setItem('cart', JSON.stringify(cart));
```

**Giải thích:**
- `JSON.stringify(cart)` - Chuyển mảng thành chuỗi JSON
- `localStorage.setItem('cart', ...)` - Lưu vào localStorage với key "cart"

**Ví dụ:**
```javascript
const cart = [{id: 1, name: "Áo", quantity: 2}];
JSON.stringify(cart);  // '[{"id":1,"name":"Áo","quantity":2}]'
```

---

## 4. HÀM CẬP NHẬT SỐ LƯỢNG TRÊN ICON GIỎ HÀNG

```javascript
function updateCartCount() {
    // Lấy giỏ hàng
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Tính tổng số lượng sản phẩm
    let totalItems = 0;
    cart.forEach(item => {
        totalItems += item.quantity;
    });
    
    // Tìm element hiển thị số lượng
    const countElement = document.getElementById('cart-count');
    
    // Cập nhật hiển thị
    if (countElement) {
        if (totalItems > 0) {
            countElement.textContent = totalItems;
            countElement.style.display = 'inline';
        } else {
            countElement.style.display = 'none';
        }
    }
}
```

**Giải thích `forEach`:**
```javascript
cart.forEach(item => {
    totalItems += item.quantity;
});
```
- Duyệt qua từng phần tử trong mảng cart
- Cộng dồn quantity của mỗi sản phẩm vào totalItems

**Ví dụ:**
```javascript
const cart = [
    {name: "Áo", quantity: 2},
    {name: "Quần", quantity: 3}
];
// totalItems = 2 + 3 = 5
```

---

## 5. GẮN SỰ KIỆN CLICK CHO NÚT "THÊM VÀO GIỎ"

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Lấy tất cả các nút "Thêm vào giỏ"
    const addToCartButtons = document.querySelectorAll('.a-them');
    
    // Gắn sự kiện click cho từng nút
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();  // Ngăn chặn hành vi mặc định (chuyển trang)
            addToCart(this);     // Gọi hàm thêm vào giỏ
        });
    });
});
```

**Giải thích:**
- `DOMContentLoaded` - Chạy code khi HTML đã load xong
- `querySelectorAll('.a-them')` - Lấy TẤT CẢ các element có class "a-them"
- `e.preventDefault()` - Ngăn thẻ `<a>` chuyển trang
- `this` - Tham chiếu đến nút được click

---

## 6. SƠ ĐỒ LUỒNG XỬ LÝ

```
Người dùng click "Thêm vào giỏ"
            ↓
    Lấy thông tin sản phẩm
            ↓
    Kiểm tra sản phẩm tồn tại?
        ↓ KHÔNG → Thông báo lỗi → DỪNG
        ↓ CÓ
    Kiểm tra còn hàng?
        ↓ KHÔNG → Thông báo hết hàng → DỪNG
        ↓ CÓ
    Lấy giỏ hàng từ localStorage
            ↓
    Sản phẩm đã có trong giỏ?
        ↓ CÓ → Tăng quantity + 1
        ↓ KHÔNG → Thêm sản phẩm mới (quantity = 1)
            ↓
    Lưu giỏ hàng vào localStorage
            ↓
    Cập nhật số lượng trên icon
            ↓
    Thông báo "Đã thêm vào giỏ hàng"
```

---

## 7. CẤU TRÚC DỮ LIỆU GIỎ HÀNG

```javascript
// Giỏ hàng là một MẢNG các OBJECT
const cart = [
    {
        id: "ao-thun-01",           // ID sản phẩm (duy nhất)
        name: "Áo thun nam",        // Tên sản phẩm
        price: 250000,              // Giá (số)
        image: "/images/ao.jpg",    // Đường dẫn ảnh
        quantity: 2                 // Số lượng
    },
    {
        id: "quan-jean-02",
        name: "Quần jean nữ",
        price: 450000,
        image: "/images/quan.jpg",
        quantity: 1
    }
];
```

---

## 8. CÁC PHƯƠNG THỨC QUAN TRỌNG CẦN NHỚ

| Phương thức | Công dụng | Ví dụ |
|-------------|-----------|-------|
| `localStorage.getItem(key)` | Lấy dữ liệu | `localStorage.getItem('cart')` |
| `localStorage.setItem(key, value)` | Lưu dữ liệu | `localStorage.setItem('cart', '[]')` |
| `JSON.stringify(obj)` | Object → Chuỗi JSON | `JSON.stringify([1,2,3])` → `'[1,2,3]'` |
| `JSON.parse(str)` | Chuỗi JSON → Object | `JSON.parse('[1,2,3]')` → `[1,2,3]` |
| `array.find(fn)` | Tìm phần tử đầu tiên | `cart.find(x => x.id === 1)` |
| `array.push(item)` | Thêm vào cuối mảng | `cart.push({id: 1})` |
| `array.forEach(fn)` | Duyệt qua từng phần tử | `cart.forEach(x => console.log(x))` |

---

## 9. CÂU HỎI THƯỜNG GẶP

**Q: Tại sao dùng localStorage mà không dùng biến thường?**
A: Biến thường sẽ mất khi refresh trang. localStorage giữ dữ liệu ngay cả khi tắt trình duyệt.

**Q: Tại sao cần JSON.stringify và JSON.parse?**
A: localStorage chỉ lưu được chuỗi. Phải chuyển đổi qua lại giữa Object và chuỗi.

**Q: `e.preventDefault()` dùng để làm gì?**
A: Ngăn hành vi mặc định của thẻ `<a>` (chuyển trang). Chỉ chạy code JavaScript.

**Q: `||` trong `localStorage.getItem('cart') || '[]'` nghĩa là gì?**
A: Toán tử OR. Nếu vế trái là null/undefined, dùng vế phải thay thế.
