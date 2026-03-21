// Order Tracking Page JavaScript

let currentOrders = [];
let selectedRating = 0;
let currentUser = null;

// Check if user is logged in
function checkLogin() {
  const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  
  if (userLoggedIn || adminLoggedIn) {
    // Try to get full user data from currentUser object first
    const savedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Build user object from localStorage, prioritizing currentUser object
    currentUser = {
      name: savedUser.name || localStorage.getItem('username') || localStorage.getItem('hoTen') || 'Khách hàng',
      phone: savedUser.phone || localStorage.getItem('userPhone') || localStorage.getItem('sdt') || '',
      email: savedUser.email || localStorage.getItem('userEmail') || localStorage.getItem('email') || '',
      type: savedUser.role || localStorage.getItem('userType') || 'user'
    };
    return true;
  }
  
  currentUser = null;
  return false;
}

// Get current user phone
function getCurrentUserPhone() {
  if (!currentUser) return null;
  // Try to get from currentUser object first, then from localStorage
  const savedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return currentUser.phone || savedUser.phone || localStorage.getItem('userPhone') || localStorage.getItem('sdt') || null;
}

// Get current user email
function getCurrentUserEmail() {
  if (!currentUser) return null;
  // Try to get from currentUser object first, then from localStorage
  const savedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return currentUser.email || savedUser.email || localStorage.getItem('userEmail') || localStorage.getItem('email') || null;
}

// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(value) + '₫';
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get status text
function getStatusText(status) {
  const statusMap = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao hàng',
    completed: 'Hoàn thành',
    cancelled: 'Đã huỷ'
  };
  return statusMap[status] || status;
}

// Get payment text
function getPaymentText(payment) {
  const paymentMap = {
    cod: 'Thanh toán khi nhận hàng',
    bank: 'Chuyển khoản ngân hàng'
  };
  return paymentMap[payment] || payment;
}

// Check if order already reviewed
function isOrderReviewed(orderId) {
  if (!orderId) return false;
  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  return reviews.some(r => {
    // Handle both 'orderId' and old typo 'oderId'
    const reviewOrderId = r.orderId || r.oderId;
    if (!reviewOrderId) return false;
    return reviewOrderId.toString() === orderId.toString();
  });
}

// Render orders list
function renderOrders() {
  const container = document.getElementById('ordersList');
  
  if (currentOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-orders">
        <i class="fa fa-inbox"></i>
        <p>Bạn chưa có đơn hàng nào</p>
        <a href="index.html" style="color: #667eea; text-decoration: none; font-size: 14px; margin-top: 12px; display: inline-block;">
          <i class="fa fa-shopping-bag"></i> Mua sắm ngay
        </a>
      </div>
    `;
    return;
  }
  
  container.innerHTML = currentOrders.map(order => {
    const items = order.items || [];
    const canReview = order.status === 'completed' && !isOrderReviewed(order.id);
    const alreadyReviewed = isOrderReviewed(order.id);
    
    return `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <span class="order-id">#${order.id}</span>
            <span class="order-date"> - ${formatDate(order.createdAt)}</span>
          </div>
          <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
        </div>
        
        <div class="order-items-preview">
          ${items.slice(0, 4).map(item => `
            <img src="${item.image || item.imgSrc || '/images/placeholder.png'}" 
                 alt="${item.name}" 
                 onerror="this.src='/images/placeholder.png'">
          `).join('')}
          ${items.length > 4 ? `<span style="display:flex;align-items:center;color:#6b7280;font-size:13px;">+${items.length - 4}</span>` : ''}
        </div>
        
        <div class="order-card-footer">
          <span class="order-total">${formatCurrency(order.total || 0)}</span>
          <div class="order-actions">
            <button class="btn-view-order" onclick="viewOrderDetail('${order.id}')">
              <i class="fa fa-eye"></i> Chi tiết
            </button>
            ${canReview ? `
              <button class="btn-review" onclick="openReviewModal('${order.id}')">
                <i class="fa fa-star"></i> Đánh giá
              </button>
            ` : ''}
            ${alreadyReviewed ? `
              <span style="color: #10b981; font-size: 13px; display: flex; align-items: center; gap: 4px;">
                <i class="fa fa-check-circle"></i> Đã đánh giá
              </span>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// View order detail
function viewOrderDetail(orderId) {
  const order = currentOrders.find(o => o.id.toString() === orderId.toString());
  if (!order) return;
  
  const items = order.items || [];
  
  const content = document.getElementById('orderDetailContent');
  content.innerHTML = `
    <div class="detail-row">
      <span class="detail-label">Mã đơn hàng</span>
      <span class="detail-value" style="color: #667eea; font-weight: 600;">#${order.id}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Ngày đặt</span>
      <span class="detail-value">${formatDate(order.createdAt)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Trạng thái</span>
      <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Thanh toán</span>
      <span class="detail-value">${getPaymentText(order.paymentMethod)}</span>
    </div>
    ${order.address ? `
      <div class="detail-row">
        <span class="detail-label">Địa chỉ</span>
        <span class="detail-value">${order.address}</span>
      </div>
    ` : ''}
    ${order.note ? `
      <div class="detail-row">
        <span class="detail-label">Ghi chú</span>
        <span class="detail-value">${order.note}</span>
      </div>
    ` : ''}
    
    <h4 style="margin: 20px 0 12px; font-size: 15px; color: #1f2937;">
      <i class="fa fa-box" style="color: #667eea;"></i> Sản phẩm (${items.length})
    </h4>
    
    ${items.map(item => `
      <div class="order-item">
        <img src="${item.image || item.imgSrc || '/images/placeholder.png'}" 
             alt="${item.name}"
             onerror="this.src='/images/placeholder.png'">
        <div class="order-item-info">
          <div class="order-item-name">${item.name}</div>
          <div class="order-item-variant">${item.color || ''} ${item.size ? ', Size ' + item.size : ''} × ${item.quantity || 1}</div>
          <div class="order-item-price">${formatCurrency(item.price || 0)}</div>
        </div>
      </div>
    `).join('')}
    
    <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #e5e7eb;">
      <div class="detail-row">
        <span class="detail-label">Tạm tính</span>
        <span class="detail-value">${formatCurrency(order.subtotal || order.total || 0)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Phí vận chuyển</span>
        <span class="detail-value">${order.shipping === 0 ? 'Miễn phí' : formatCurrency(order.shipping || 0)}</span>
      </div>
      <div class="detail-row" style="font-size: 16px;">
        <span class="detail-label" style="font-weight: 600;">Tổng cộng</span>
        <span class="detail-value" style="color: #667eea; font-weight: 700;">${formatCurrency(order.total || 0)}</span>
      </div>
    </div>
  `;
  
  document.getElementById('orderDetailModal').classList.add('active');
}

// Close order modal
function closeOrderModal() {
  document.getElementById('orderDetailModal').classList.remove('active');
}

// Open review modal
function openReviewModal(orderId) {
  const order = currentOrders.find(o => o.id.toString() === orderId.toString());
  if (!order || !order.items || order.items.length === 0) return;
  
  // Check if already reviewed
  if (isOrderReviewed(orderId)) {
    alert('Bạn đã đánh giá đơn hàng này rồi!');
    return;
  }
  
  // For simplicity, review first item
  const item = order.items[0];
  
  document.getElementById('reviewOrderId').value = orderId;
  document.getElementById('reviewProductName').value = item.name;
  
  document.getElementById('reviewProductInfo').innerHTML = `
    <img src="${item.image || item.imgSrc || '/images/placeholder.png'}" 
         alt="${item.name}"
         onerror="this.src='/images/placeholder.png'">
    <div>
      <div style="font-weight: 600; color: #1f2937;">${item.name}</div>
      <div style="font-size: 13px; color: #6b7280;">${item.color || ''} ${item.size ? ', Size ' + item.size : ''}</div>
    </div>
  `;
  
  // Reset rating
  selectedRating = 0;
  updateStars();
  document.getElementById('reviewComment').value = '';
  
  document.getElementById('reviewModal').classList.add('active');
}

// Close review modal
function closeReviewModal() {
  document.getElementById('reviewModal').classList.remove('active');
}

// Update stars display
function updateStars() {
  const stars = document.querySelectorAll('#ratingStars i');
  stars.forEach((star, index) => {
    star.classList.toggle('active', index < selectedRating);
  });
}

// Setup star rating
function setupStarRating() {
  const stars = document.querySelectorAll('#ratingStars i');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.rating);
      updateStars();
    });
    
    star.addEventListener('mouseenter', () => {
      const rating = parseInt(star.dataset.rating);
      stars.forEach((s, index) => {
        s.classList.toggle('active', index < rating);
      });
    });
    
    star.addEventListener('mouseleave', () => {
      updateStars();
    });
  });
}

// Submit review
function submitReview() {
  const orderId = document.getElementById('reviewOrderId').value;
  const productName = document.getElementById('reviewProductName').value;
  const comment = document.getElementById('reviewComment').value.trim();
  
  if (selectedRating === 0) {
    alert('Vui lòng chọn số sao đánh giá!');
    return;
  }
  
  // Get customer name
  const customerName = currentUser?.name || localStorage.getItem('username') || 'Khách hàng';
  
  // Create review object
  const review = {
    id: Date.now(),
    orderId: orderId, // Fixed typo: was 'oderId'
    productName: productName,
    customerName: customerName,
    userId: currentUser?.email || localStorage.getItem('username'),
    rating: selectedRating,
    comment: comment,
    createdAt: new Date().toISOString()
  };
  
  // Save to localStorage
  let reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  reviews.push(review);
  localStorage.setItem('reviews', JSON.stringify(reviews));
  
  console.log('Review saved:', review);
  console.log('All reviews:', reviews);
  
  // Close modal and refresh
  closeReviewModal();
  renderOrders(); // Refresh to show "Đã đánh giá"
  alert('🎉 Cảm ơn bạn đã đánh giá!\n\nĐánh giá của bạn đã được ghi nhận.');
}

// Load orders for logged in user
function loadUserOrders() {
  const userPhone = getCurrentUserPhone();
  const userEmail = getCurrentUserEmail();
  const userName = currentUser?.name || localStorage.getItem('username');
  
  // Get all orders from localStorage
  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  
  console.log('Loading orders...', {
    userPhone,
    userEmail,
    userName,
    totalOrders: allOrders.length
  });
  
  // Filter by user's phone, email, or name (same logic for all users including admin)
  currentOrders = allOrders.filter(order => {
    const orderPhone = order.customer?.phone || '';
    const orderEmail = order.customer?.email || '';
    const orderName = order.customer?.name || '';
    
    // Match by phone
    if (userPhone && orderPhone) {
      const normalizedUserPhone = userPhone.replace(/\D/g, '');
      const normalizedOrderPhone = orderPhone.replace(/\D/g, '');
      if (normalizedOrderPhone.includes(normalizedUserPhone) || normalizedUserPhone.includes(normalizedOrderPhone)) {
        return true;
      }
    }
    
    // Match by email
    if (userEmail && orderEmail && userEmail.toLowerCase() === orderEmail.toLowerCase()) {
      return true;
    }
    
    // Match by name (for users who ordered before login system)
    if (userName && orderName && userName.toLowerCase() === orderName.toLowerCase()) {
      return true;
    }
    
    return false;
  });
  
  // Sort by date (newest first)
  currentOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  
  console.log('Orders to display:', currentOrders.length);
  
  // Render orders
  renderOrders();
}

// Show logged in view
function showLoggedInView() {
  const userSection = document.getElementById('userSection');
  const userName = currentUser?.name || localStorage.getItem('username') || 'Khách hàng';
  const userPhone = getCurrentUserPhone();
  const userEmail = getCurrentUserEmail();
  const isAdmin = currentUser?.type === 'admin' || localStorage.getItem('adminLoggedIn') === 'true';
  
  if (userSection) {
    userSection.innerHTML = `
      <div class="user-info-box">
        <div class="user-avatar">
          <i class="fa fa-${isAdmin ? 'user-shield' : 'user'}"></i>
        </div>
        <div class="user-details">
          <h3>Xin chào, ${userName}${isAdmin ? ' (Admin)' : ''}</h3>
          <p>${userPhone || userEmail || 'Lịch sử đơn hàng của bạn'}</p>
        </div>
      </div>
    `;
  }
  
  // Show orders section
  document.getElementById('ordersSection').style.display = 'block';
}

// Show login required view
function showLoginRequired() {
  const userSection = document.getElementById('userSection');
  if (userSection) {
    userSection.innerHTML = `
      <div class="login-required-box">
        <i class="fa fa-lock"></i>
        <h3>Vui lòng đăng nhập</h3>
        <p>Bạn cần đăng nhập để xem lịch sử đơn hàng</p>
        <a href="index.html" class="btn-login">
          <i class="fa fa-sign-in-alt"></i> Đăng nhập
        </a>
      </div>
    `;
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  setupStarRating();
  
  // Check if user is logged in
  if (checkLogin()) {
    showLoggedInView();
    loadUserOrders();
  } else {
    showLoginRequired();
  }
});

// Close modals on outside click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});
