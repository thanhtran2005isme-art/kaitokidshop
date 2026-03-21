// Script kiểm tra đăng nhập và cập nhật UI cho tất cả các trang
// Cho phép xem trang mà không cần đăng nhập (public pages)

// Kiểm tra trạng thái đăng nhập
function isLoggedIn() {
  return localStorage.getItem('userLoggedIn') === 'true';
}

// Lấy thông tin user hiện tại
function getCurrentUser() {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
}

// Hàm hiển thị thông tin tài khoản trong header
function displayAccountInfo() {
  const currentUser = getCurrentUser();
  const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
  
  // Cập nhật header account dropdown
  const accountGuest = document.getElementById('accountGuest');
  const accountUser = document.getElementById('accountUser');
  
  if (currentUser && isLoggedIn()) {
    // User đã đăng nhập
    if (accountGuest) accountGuest.style.display = 'none';
    if (accountUser) {
      accountUser.style.display = 'block';
      
      const userName = accountUser.querySelector('#userName');
      const userEmail = accountUser.querySelector('#userEmail');
      
      if (userName) userName.textContent = currentUser.name || currentUser.username || 'Người dùng';
      if (userEmail) userEmail.textContent = currentUser.email || '';
    }
    
    // Hiển thị link admin nếu là admin
    const adminMenuItem = document.getElementById('adminMenuItem');
    if (adminMenuItem) {
      adminMenuItem.style.display = currentUser.role === 'admin' || isAdmin ? 'flex' : 'none';
    }
  } else {
    // Chưa đăng nhập
    if (accountGuest) accountGuest.style.display = 'block';
    if (accountUser) accountUser.style.display = 'none';
  }
  
  // Cập nhật text tài khoản (cho các trang có menu kiểu cũ)
  const accountText = document.getElementById('accountText');
  if (accountText) {
    if (currentUser && isLoggedIn()) {
      accountText.textContent = currentUser.name || currentUser.username || 'Tài khoản';
    } else {
      accountText.textContent = 'Tài khoản';
    }
  }
  
  // Cập nhật menu tài khoản kiểu cũ
  const accountMenu = document.getElementById('accountMenu');
  if (accountMenu) {
    if (isLoggedIn()) {
      accountMenu.innerHTML = `
        <li><a href="taikhoan.html">Tài khoản của tôi</a></li>
        <li><a href="donhang.html">Đơn hàng</a></li>
        <li><a href="yeuthich.html">Yêu thích</a></li>
        <li><a href="#" onclick="logout()">Đăng xuất</a></li>
      `;
    } else {
      accountMenu.innerHTML = `
        <li><a href="login.html">Đăng Nhập</a></li>
        <li><a href="login.html">Đăng Ký</a></li>
      `;
    }
  }
  
  // Hiển thị nút admin nếu là admin
  const adminButtonContainer = document.getElementById('adminButtonContainer');
  if (adminButtonContainer) {
    adminButtonContainer.style.display = isAdmin || (currentUser && currentUser.role === 'admin') ? 'block' : 'none';
  }
}

// Cập nhật wishlist badge
function updateWishlistBadge() {
  const currentUser = getCurrentUser();
  let wishlist = [];
  
  if (currentUser) {
    // Đảm bảo key nhất quán với products-loader.js và wishlist.js
    const key = `wishlist_${currentUser.username || currentUser.email}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      const parsed = JSON.parse(saved);
      // Đếm items (có thể là array of IDs hoặc array of objects)
      wishlist = parsed;
    }
  }
  
  const badges = document.querySelectorAll('#wishlist-count, .wishlist-badge');
  badges.forEach(badge => {
    const count = Array.isArray(wishlist) ? wishlist.length : 0;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

// Cập nhật cart badge
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let totalItems = 0;
  cart.forEach(item => {
    totalItems += item.quantity || 1;
  });
  
  const badges = document.querySelectorAll('#cart-count, .cart-count');
  badges.forEach(badge => {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

// Hàm đăng xuất
function logout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('username');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('rememberLogin');
    window.location.href = 'login.html';
  }
}

// Setup logout buttons
function setupLogoutButtons() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
}

// Setup account dropdown toggle
function setupAccountDropdown() {
  const accountIcon = document.getElementById('accountIcon');
  const accountDropdown = document.getElementById('accountDropdown');
  
  if (accountIcon && accountDropdown) {
    accountIcon.addEventListener('click', function(e) {
      e.preventDefault();
      accountDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!accountIcon.contains(e.target) && !accountDropdown.contains(e.target)) {
        accountDropdown.classList.remove('active');
      }
    });
  }
}

// Tự động chạy khi trang được load
document.addEventListener('DOMContentLoaded', function() {
  displayAccountInfo();
  updateWishlistBadge();
  updateCartBadge();
  setupLogoutButtons();
  setupAccountDropdown();
});

// Export for global use
window.logout = logout;
window.isLoggedIn = isLoggedIn;
window.getCurrentUser = getCurrentUser;
window.updateWishlistBadge = updateWishlistBadge;
window.updateCartBadge = updateCartBadge;
