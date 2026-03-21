// Wishlist Management System
let wishlistItems = [];
let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Load user info
  loadUserInfo();
  
  // Load wishlist
  loadWishlist();
  
  // Setup filters
  setupFilters();
  
  // Update cart count
  updateCartCount();
  
  // Setup logout
  setupLogout();
});

// Load user info
function loadUserInfo() {
  if (currentUser) {
    // Update sidebar
    document.getElementById('sidebarUserName').textContent = currentUser.fullName || currentUser.username;
    document.getElementById('sidebarUserEmail').textContent = currentUser.email;
    
    // Show admin link if user is admin
    if (currentUser.role === 'admin') {
      const adminLink = document.getElementById('adminLink');
      if (adminLink) adminLink.style.display = 'flex';
      
      const adminMenuItem = document.getElementById('adminMenuItem');
      if (adminMenuItem) adminMenuItem.style.display = 'flex';
    }
    
    // Update header account dropdown
    const accountGuest = document.getElementById('accountGuest');
    const accountUser = document.getElementById('accountUser');
    
    if (accountGuest) accountGuest.style.display = 'none';
    if (accountUser) {
      accountUser.style.display = 'block';
      const userName = accountUser.querySelector('#userName');
      const userEmail = accountUser.querySelector('#userEmail');
      if (userName) userName.textContent = currentUser.fullName || currentUser.username;
      if (userEmail) userEmail.textContent = currentUser.email;
    }
  }
}

// Load wishlist from localStorage
function loadWishlist() {
  const userWishlistKey = `wishlist_${currentUser.username || currentUser.email}`;
  const savedWishlist = localStorage.getItem(userWishlistKey);
  
  if (savedWishlist) {
    const parsed = JSON.parse(savedWishlist);
    
    // Check if it's old format (array of IDs) and convert to new format
    if (parsed.length > 0 && typeof parsed[0] === 'number') {
      // Old format - convert to new format
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      wishlistItems = parsed.map(productId => {
        const product = products.find(p => p.id === productId);
        if (product) {
          return {
            id: product.id,
            name: product.name,
            price: product.salePrice || product.price,
            oldPrice: product.salePrice ? product.price : product.oldPrice,
            image: product.images?.[0] || product.image || '/images/placeholder.png',
            menu: product.menu || product.gender || 'Sản phẩm',
            category: product.category,
            stock: product.stock || 100,
            colors: product.colors || [],
            sizes: product.sizes || [],
            addedDate: new Date().toISOString()
          };
        }
        return null;
      }).filter(item => item !== null);
      
      // Save in new format
      saveWishlist();
    } else {
      // New format
      wishlistItems = parsed;
    }
  } else {
    wishlistItems = [];
  }
  
  displayWishlist();
  updateWishlistCount();
}

// Display wishlist items
function displayWishlist() {
  const container = document.getElementById('wishlistContent');
  const emptyState = document.getElementById('emptyWishlist');
  const countElement = document.getElementById('wishlistCount');
  
  if (!container) return;
  
  // Apply filters
  let filteredItems = [...wishlistItems];
  
  const categoryFilter = document.getElementById('categoryFilter')?.value;
  const sortFilter = document.getElementById('sortFilter')?.value;
  
  // Filter by category
  if (categoryFilter) {
    filteredItems = filteredItems.filter(item => item.menu === categoryFilter);
  }
  
  // Sort
  if (sortFilter === 'newest') {
    filteredItems.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
  } else if (sortFilter === 'price-asc') {
    filteredItems.sort((a, b) => a.price - b.price);
  } else if (sortFilter === 'price-desc') {
    filteredItems.sort((a, b) => b.price - a.price);
  } else if (sortFilter === 'name') {
    filteredItems.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  // Update count
  if (countElement) {
    countElement.textContent = wishlistItems.length;
  }
  
  // Show/hide empty state
  if (filteredItems.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  // Create grid
  const grid = document.createElement('div');
  grid.className = 'wishlist-grid';
  
  filteredItems.forEach(item => {
    const card = createWishlistCard(item);
    grid.appendChild(card);
  });
  
  container.innerHTML = '';
  container.appendChild(grid);
}

// Create wishlist card
function createWishlistCard(item) {
  const card = document.createElement('div');
  card.className = 'wishlist-item';
  
  const hasDiscount = item.oldPrice && item.oldPrice > item.price;
  const discountPercent = hasDiscount ? Math.round((1 - item.price / item.oldPrice) * 100) : 0;
  const isInStock = item.stock > 0;
  
  card.innerHTML = `
    <div class="wishlist-item-image">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='/images/placeholder.png'">
      ${hasDiscount ? `<span class="wishlist-item-badge sale">-${discountPercent}%</span>` : ''}
      <button class="btn-remove-wishlist" onclick="removeFromWishlist('${item.id}')" title="Xóa khỏi yêu thích">
        <i class="fa fa-heart-crack"></i>
      </button>
    </div>
    <div class="wishlist-item-info">
      <div class="wishlist-item-category">${item.menu || 'Sản phẩm'}</div>
      <h3 class="wishlist-item-name">${item.name}</h3>
      <div class="wishlist-item-price">
        <span class="current-price">${formatPrice(item.price)}</span>
        ${item.oldPrice ? `<span class="old-price">${formatPrice(item.oldPrice)}</span>` : ''}
      </div>
      <div class="wishlist-item-stock ${isInStock ? 'in-stock' : 'out-of-stock'}">
        <i class="fa ${isInStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
        ${isInStock ? `Còn ${item.stock} sản phẩm` : 'Hết hàng'}
      </div>
      <div class="wishlist-item-actions">
        <button class="btn-add-to-cart" onclick="addToCartFromWishlist('${item.id}')" ${!isInStock ? 'disabled' : ''}>
          <i class="fa fa-shopping-cart"></i>
          ${isInStock ? 'Thêm vào giỏ' : 'Hết hàng'}
        </button>
        <button class="btn-view-product" onclick="viewProduct('${item.id}')" title="Xem chi tiết">
          <i class="fa fa-eye"></i>
        </button>
      </div>
      <div class="wishlist-item-date">
        Đã thêm: ${formatDate(item.addedDate)}
      </div>
    </div>
  `;
  
  return card;
}

// Remove from wishlist
function removeFromWishlist(productId) {
  if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?')) return;
  
  wishlistItems = wishlistItems.filter(item => item.id !== productId);
  saveWishlist();
  displayWishlist();
  updateWishlistCount();
  
  showNotification('Đã xóa khỏi yêu thích', 'success');
}

// Clear all wishlist
function clearAllWishlist() {
  if (!wishlistItems.length) {
    showNotification('Danh sách yêu thích đang trống', 'error');
    return;
  }
  
  if (!confirm('Bạn có chắc muốn xóa tất cả sản phẩm yêu thích?')) return;
  
  wishlistItems = [];
  saveWishlist();
  displayWishlist();
  updateWishlistCount();
  
  showNotification('Đã xóa tất cả sản phẩm yêu thích', 'success');
}

// Add to cart from wishlist
function addToCartFromWishlist(productId) {
  const item = wishlistItems.find(i => i.id === productId);
  if (!item) return;
  
  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Check if product already in cart
  const existingItem = cart.find(cartItem => cartItem.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      oldPrice: item.oldPrice,
      image: item.image,
      quantity: 1,
      color: item.colors?.[0] || 'Mặc định',
      size: item.sizes?.[0] || 'M'
    });
  }
  
  // Save cart
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count
  updateCartCount();
  
  showNotification('Đã thêm vào giỏ hàng', 'success');
}

// View product detail
function viewProduct(productId) {
  window.location.href = `chitietsanpham.html?id=${productId}`;
}

// Save wishlist to localStorage
function saveWishlist() {
  const userWishlistKey = `wishlist_${currentUser.username || currentUser.email}`;
  localStorage.setItem(userWishlistKey, JSON.stringify(wishlistItems));
}

// Update wishlist count
function updateWishlistCount() {
  const badge = document.getElementById('wishlist-count');
  if (badge) {
    badge.textContent = wishlistItems.length;
    badge.style.display = wishlistItems.length > 0 ? 'flex' : 'none';
  }
}

// Update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  let totalItems = 0;
  cart.forEach(item => {
    totalItems += item.quantity;
  });
  
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    countElement.textContent = totalItems;
    countElement.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Setup filters
function setupFilters() {
  const categoryFilter = document.getElementById('categoryFilter');
  const sortFilter = document.getElementById('sortFilter');
  
  if (categoryFilter) {
    categoryFilter.addEventListener('change', displayWishlist);
  }
  
  if (sortFilter) {
    sortFilter.addEventListener('change', displayWishlist);
  }
}

// Setup logout
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  const logoutBtnSidebar = document.getElementById('logoutBtnSidebar');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
  
  if (logoutBtnSidebar) {
    logoutBtnSidebar.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
}

function logout() {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
  }
}

// Format price
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  
  return date.toLocaleDateString('vi-VN');
}

// Show notification
function showNotification(message, type = 'success') {
  // Remove existing notifications
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification-toast ${type}`;
  notification.innerHTML = `
    <i class="fa fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <div class="message">
      <strong>${type === 'success' ? 'Thành công!' : 'Thông báo'}</strong>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Account dropdown toggle
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

// Back to top button
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });
  
  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

