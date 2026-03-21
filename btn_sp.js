// ============================================================
// FILE: btn_sp.js - XỬ LÝ THÊM SẢN PHẨM VÀO GIỎ HÀNG
// ============================================================

// KHỞI TẠO: Nếu chưa có giỏ hàng trong localStorage → tạo mảng rỗng
if (!localStorage.getItem("cart")) {
  localStorage.setItem("cart", JSON.stringify([]));
}

// ============================================================
// HÀM CHÍNH: THÊM SẢN PHẨM VÀO GIỎ HÀNG
// ============================================================
function addToCart(element) {
  // Tìm thẻ cha chứa thông tin sản phẩm
  const productContainer = element.closest(".bg_sp");

  // LẤY THÔNG TIN SẢN PHẨM TỪ HTML
  const imgSrc = productContainer.querySelector(".img-baosp img").src;
  const productName = productContainer.querySelector(".text-sp b").innerText.trim();
  const productPrice = productContainer.querySelector(".price b").innerText.trim();
  const specs = productContainer.querySelector(".thongso p").innerText.trim();

  // TẠO OBJECT SẢN PHẨM
  const product = {
    id: generateProductId(productName),
    imgSrc: imgSrc,
    name: productName,
    price: productPrice,
    specs: specs,
    quantity: 1,
  };

  // *** QUAN TRỌNG: LẤY GIỎ HÀNG TỪ LOCALSTORAGE ***
  // JSON.parse() chuyển chuỗi "[{...}]" thành mảng JavaScript
  const cart = JSON.parse(localStorage.getItem("cart"));

  // *** QUAN TRỌNG: KIỂM TRA SẢN PHẨM ĐÃ CÓ TRONG GIỎ CHƯA ***
  // findIndex() trả về vị trí nếu tìm thấy, trả về -1 nếu không có
  const existingProductIndex = cart.findIndex((item) => item.id === product.id);

  // *** QUAN TRỌNG: THÊM HOẶC CẬP NHẬT SẢN PHẨM ***
  if (existingProductIndex > -1) {
    // Đã có → tăng số lượng
    cart[existingProductIndex].quantity += 1;
  } else {
    // Chưa có → thêm mới vào mảng
    cart.push(product);
  }

  // *** QUAN TRỌNG: LƯU GIỎ HÀNG VÀO LOCALSTORAGE ***
  // JSON.stringify() chuyển mảng thành chuỗi để lưu
  localStorage.setItem("cart", JSON.stringify(cart));

  showAddToCartConfirmation(productName);
}

// Tạo ID từ tên sản phẩm (bỏ dấu, thay khoảng trắng bằng "-")
function generateProductId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 30);
}

// Hiển thị thông báo "Đã thêm vào giỏ hàng"
function showAddToCartConfirmation(productName) {
  const notification = document.createElement("div");
  notification.classList.add("cart-notification");
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fa-solid fa-check"></i>
      <span>Đã thêm "${productName.substring(0, 30)}..." vào giỏ hàng</span>
    </div>
  `;

  const style = document.createElement("style");
  style.innerHTML = `
    .cart-notification {
      position: fixed; top: 20px; right: 20px;
      background-color: #4CAF50; color: white;
      padding: 15px; border-radius: 5px; z-index: 1000;
      animation: slideIn 0.3s, fadeOut 0.5s 2.5s forwards;
    }
    .notification-content { display: flex; align-items: center; }
    .notification-content i { margin-right: 10px; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
  `;

  document.head.appendChild(style);
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 1000);
  updateCartCounter();
}

// Cập nhật số lượng hiển thị trên icon giỏ hàng
function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem("cart"));
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const cartIcon = document.querySelector("#top-tops-topright a:nth-child(3)");

  if (cartIcon) {
    let counter = cartIcon.querySelector(".cart-counter");
    if (!counter && totalItems > 0) {
      counter = document.createElement("span");
      counter.classList.add("cart-counter");
      cartIcon.appendChild(counter);
    }
    if (counter) {
      counter.textContent = totalItems > 0 ? totalItems : "";
      if (totalItems === 0) counter.remove();
    }
  }
}

// GẮN SỰ KIỆN CLICK CHO CÁC NÚT "THÊM VÀO GIỎ"
document.addEventListener("DOMContentLoaded", function () {
  const addToCartButtons = document.querySelectorAll(".a-them");
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault(); // Ngăn chuyển trang
      addToCart(this);    // Gọi hàm thêm vào giỏ
    });
  });
  updateCartCounter();
});
