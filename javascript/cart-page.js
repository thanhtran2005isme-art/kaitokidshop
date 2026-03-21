// ============================================================
// TRANG GIỎ HÀNG - Cart Page JavaScript
// Sử dụng localStorage để lưu trữ giỏ hàng
// ============================================================

// Hàm format tiền tệ VND
function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(value) + '₫';
}

// Hàm lấy ảnh sản phẩm
function getProductImage(item) {
  if (item.image) return item.image;
  if (item.imgSrc) return item.imgSrc;
  return '/images/placeholder.png';
}

// ============================================================
// HÀM CHÍNH: LOAD VÀ HIỂN THỊ GIỎ HÀNG
// ============================================================
// Quy trình đổ dữ liệu từ localStorage lên giao diện:
// BƯỚC 1: Lấy dữ liệu từ localStorage bằng localStorage.getItem('cart')
// BƯỚC 2: Chuyển string sang array bằng JSON.parse()
// BƯỚC 3: Lấy container HTML bằng document.getElementById()
// BƯỚC 4: Dùng .map() để tạo HTML cho từng sản phẩm
// BƯỚC 5: Dùng .join('') để nối mảng HTML thành 1 string
// BƯỚC 6: Gán vào container.innerHTML để hiển thị
function loadCart() {
  // BƯỚC 1 + 2: Lấy dữ liệu từ localStorage và parse sang array
  // localStorage.getItem('cart') trả về STRING hoặc null
  // JSON.parse() chuyển STRING thành ARRAY
  // || [] nghĩa là nếu null thì trả về mảng rỗng
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // BƯỚC 3: Lấy các container HTML
  const container = document.getElementById('cart-items'); // Tbody của bảng giỏ hàng
  const emptyCart = document.getElementById('empty-cart'); // Thông báo giỏ hàng trống
  const cartTable = document.querySelector('.cart-table'); // Bảng giỏ hàng
  
  // Nếu giỏ hàng rỗng thì hiển thị thông báo
  if (cart.length === 0) {
    if (cartTable) cartTable.style.display = 'none';
    if (emptyCart) emptyCart.style.display = 'block';
    updateSummary(0);
    return;
  }
  
  // Nếu có sản phẩm thì hiển thị bảng
  if (cartTable) cartTable.style.display = 'table';
  if (emptyCart) emptyCart.style.display = 'none';
  
  let subtotal = 0; // Tổng tiền tạm tính
  
  // BƯỚC 4 + 5 + 6: Tạo HTML và đổ lên giao diện
  // cart.map((item, index) => {...}): Lặp qua từng sản phẩm, tạo HTML
  // .join(''): Nối mảng HTML thành 1 string
  // container.innerHTML = ...: Gán HTML vào tbody để hiển thị
  container.innerHTML = cart.map((item, index) => {
    const price = parseInt(item.price) || 0;
    const quantity = item.quantity || 1;
    const total = price * quantity;
    subtotal += total;
    
    const itemId = item.id + '_' + (item.size || '') + '_' + (item.color || '');
    
    // Template Literal (``) để tạo HTML động
    // ${...} để chèn biến JavaScript vào HTML
    return `
      <tr>
        <td>
          <div class="product-cell">
            <img src="${getProductImage(item)}" alt="${item.name}" onerror="this.src='/images/placeholder.png'">
            <div class="product-info">
              <h4>${item.name}</h4>
              ${item.size ? `<p>Size: ${item.size}</p>` : ''}
              ${item.color ? `<p>Màu: ${item.color}</p>` : ''}
            </div>
          </div>
        </td>
        <td class="price-cell">${formatCurrency(price)}</td>
        <td>
          <div class="quantity-cell">
            <button class="qty-btn" onclick="changeQty(${index}, -1)">−</button>
            <input type="number" class="qty-input" value="${quantity}" min="1" onchange="setQty(${index}, this.value)">
            <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
          </div>
        </td>
        <td class="total-cell">${formatCurrency(total)}</td>
        <td>
          <button class="remove-btn" onclick="removeItem(${index})">
            <i class="fa fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join(''); // Nối mảng HTML thành 1 string
  
  updateSummary(subtotal); // Cập nhật tổng tiền
  updateCartCount();       // Cập nhật số lượng trên icon giỏ hàng
}

function updateSummary(subtotal) {
  document.getElementById('subtotal').textContent = formatCurrency(subtotal);
  
  // Free shipping for orders over 499K
  const shipping = subtotal >= 499000 ? 0 : 30000;
  document.getElementById('shipping').textContent = shipping === 0 ? 'Miễn phí' : formatCurrency(shipping);
  
  const total = subtotal + shipping;
  document.getElementById('total').textContent = formatCurrency(total);
}

// ============================================================
// CÁC HÀM CẬP NHẬT GIỎ HÀNG
// ============================================================
// Quy trình cập nhật:
// 1. Lấy dữ liệu từ localStorage
// 2. Sửa đổi dữ liệu (thêm/xóa/sửa số lượng)
// 3. Lưu lại vào localStorage
// 4. Gọi loadCart() để render lại giao diện

// Thay đổi số lượng sản phẩm (tăng/giảm)
function changeQty(index, delta) {
  const cart = JSON.parse(localStorage.getItem('cart')) || []; // Lấy giỏ hàng
  if (!cart[index]) return;
  
  cart[index].quantity = Math.max(1, (cart[index].quantity || 1) + delta); // Cập nhật số lượng
  localStorage.setItem('cart', JSON.stringify(cart)); // Lưu lại vào localStorage
  loadCart(); // Render lại giao diện
}

// Đặt số lượng sản phẩm (nhập trực tiếp)
function setQty(index, value) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (!cart[index]) return;
  
  cart[index].quantity = Math.max(1, parseInt(value) || 1);
  localStorage.setItem('cart', JSON.stringify(cart)); // Lưu lại
  loadCart(); // Render lại
}

// Xóa 1 sản phẩm khỏi giỏ hàng
function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart.splice(index, 1); // Xóa phần tử tại vị trí index
  localStorage.setItem('cart', JSON.stringify(cart)); // Lưu lại
  loadCart(); // Render lại
}

// Xóa toàn bộ giỏ hàng
function clearCart() {
  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
    localStorage.setItem('cart', JSON.stringify([])); // Lưu mảng rỗng
    loadCart(); // Render lại
  }
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let total = 0;
  cart.forEach(item => total += (item.quantity || 1));
  
  const countEl = document.getElementById('cart-count');
  if (countEl) {
    countEl.textContent = total;
    countEl.style.display = total > 0 ? 'flex' : 'none';
  }
}

// ============================================================
// KHỞI CHẠY KHI TRANG LOAD XONG
// ============================================================
// DOMContentLoaded: Sự kiện khi HTML đã load xong
// Khi trang load xong sẽ tự động gọi loadCart() để đổ dữ liệu
document.addEventListener('DOMContentLoaded', () => {
  loadCart(); // Gọi hàm load giỏ hàng từ localStorage
});

// Export functions
window.changeQty = changeQty;
window.setQty = setQty;
window.removeItem = removeItem;
window.clearCart = clearCart;