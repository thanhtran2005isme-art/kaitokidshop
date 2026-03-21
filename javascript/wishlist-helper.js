// Wishlist Helper Functions
// This file provides wishlist functionality for product pages

// Get current user
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

// Get user's wishlist
function getUserWishlist() {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  
  const userWishlistKey = `wishlist_${currentUser.username}`;
  const savedWishlist = localStorage.getItem(userWishlistKey);
  return savedWishlist ? JSON.parse(savedWishlist) : [];
}

// Save user's wishlist
function saveUserWishlist(wishlist) {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  const userWishlistKey = `wishlist_${currentUser.username}`;
  localStorage.setItem(userWishlistKey, JSON.stringify(wishlist));
  return true;
}

// Check if product is in wishlist
function isInWishlist(productId) {
  const wishlist = getUserWishlist();
  return wishlist.some(item => item.id === productId);
}

// Toggle wishlist
function toggleWishlist(product) {
  const currentUser = getCurrentUser();
  
  // Check if user is logged in
  if (!currentUser) {
    if (confirm('Bạn cần đăng nhập để thêm sản phẩm yêu thích. Đăng nhập ngay?')) {
      window.location.href = 'login.html';
    }
    return false;
  }
  
  let wishlist = getUserWishlist();
  const existingIndex = wishlist.findIndex(item => item.id === product.id);
  
  if (existingIndex > -1) {
    // Remove from wishlist
    wishlist.splice(existingIndex, 1);
    saveUserWishlist(wishlist);
    updateWishlistUI();
    showWishlistNotification('Đã xóa khỏi yêu thích', 'info');
    return false;
  } else {
    // Add to wishlist
    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.image,
      menu: product.menu,
      category: product.category,
      stock: product.stock,
      colors: product.colors,
      sizes: product.sizes,
      addedDate: new Date().toISOString()
    };
    
    wishlist.push(wishlistItem);
    saveUserWishlist(wishlist);
    updateWishlistUI();
    showWishlistNotification('Đã thêm vào yêu thích', 'success');
    return true;
  }
}

// Update wishlist UI (heart icons and counts)
function updateWishlistUI() {
  const wishlist = getUserWishlist();
  
  // Update all wishlist buttons
  document.querySelectorAll('.btn-wishlist').forEach(btn => {
    const productId = btn.getAttribute('data-product-id');
    const isLiked = wishlist.some(item => item.id === productId);
    
    if (isLiked) {
      btn.classList.add('active');
      btn.innerHTML = '<i class="fa fa-heart"></i>';
      btn.title = 'Xóa khỏi yêu thích';
    } else {
      btn.classList.remove('active');
      btn.innerHTML = '<i class="fa fa-heart"></i>';
      btn.title = 'Thêm vào yêu thích';
    }
  });
  
  // Update wishlist count in header
  updateWishlistCount();
}

// Update wishlist count badge
function updateWishlistCount() {
  const wishlist = getUserWishlist();
  const badges = document.querySelectorAll('#wishlist-count, .wishlist-badge');
  
  badges.forEach(badge => {
    badge.textContent = wishlist.length;
    badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
  });
}

// Show wishlist notification
function showWishlistNotification(message, type = 'success') {
  // Remove existing notifications
  const existing = document.querySelector('.wishlist-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `wishlist-notification ${type}`;
  notification.innerHTML = `
    <i class="fa fa-${type === 'success' ? 'check-circle' : type === 'info' ? 'info-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  // Add styles if not already present
  if (!document.getElementById('wishlist-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'wishlist-notification-styles';
    style.textContent = `
      .wishlist-notification {
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 16px 24px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease-out;
        font-family: 'Inter', sans-serif;
      }
      
      .wishlist-notification.show {
        opacity: 1;
        transform: translateY(0);
      }
      
      .wishlist-notification.success {
        border-left: 4px solid #48bb78;
      }
      
      .wishlist-notification.success i {
        color: #48bb78;
        font-size: 20px;
      }
      
      .wishlist-notification.info {
        border-left: 4px solid #4299e1;
      }
      
      .wishlist-notification.info i {
        color: #4299e1;
        font-size: 20px;
      }
      
      .wishlist-notification span {
        font-size: 14px;
        font-weight: 500;
        color: #2d3748;
      }
      
      @media (max-width: 768px) {
        .wishlist-notification {
          right: 15px;
          left: 15px;
          bottom: 15px;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add wishlist button to product card
function addWishlistButton(productCard, product) {
  const isLiked = isInWishlist(product.id);
  
  const btn = document.createElement('button');
  btn.className = `btn-wishlist ${isLiked ? 'active' : ''}`;
  btn.setAttribute('data-product-id', product.id);
  btn.title = isLiked ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích';
  btn.innerHTML = '<i class="fa fa-heart"></i>';
  
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  });
  
  return btn;
}

// Initialize wishlist on page load
document.addEventListener('DOMContentLoaded', function() {
  updateWishlistCount();
  updateWishlistUI();
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCurrentUser,
    getUserWishlist,
    saveUserWishlist,
    isInWishlist,
    toggleWishlist,
    updateWishlistUI,
    updateWishlistCount,
    showWishlistNotification,
    addWishlistButton
  };
}

