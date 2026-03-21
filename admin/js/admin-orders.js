// Orders Management
let orders = [];

// Load orders from localStorage
function loadOrdersFromStorage() {
  const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  
  // Convert stored orders to admin format
  orders = storedOrders.map(order => ({
    id: order.id.toString(),
    customer: {
      name: order.customer?.name || 'Khách hàng',
      phone: order.customer?.phone || '',
      email: order.customer?.email || ''
    },
    date: order.createdAt ? order.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    total: order.total || 0,
    payment: order.paymentMethod || 'cod',
    paymentLabel: order.paymentLabel || 'COD',
    status: order.status || 'pending',
    paymentStatus: order.paymentStatus || 'pending',
    deliveryMethod: order.deliveryMethod || 'delivery',
    address: order.address || '',
    note: order.note || '',
    items: (order.items || []).map(item => ({
      name: item.name || 'Sản phẩm',
      variant: `${item.color || ''} ${item.size ? ', Size ' + item.size : ''}`.trim() || 'Mặc định',
      price: parseInt(item.price) || 0,
      qty: item.quantity || 1,
      image: item.image || item.imgSrc || '/images/placeholder.png'
    }))
  }));
  
  // Sort by date (newest first)
  orders.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  console.log('Loaded orders from localStorage:', orders.length);
}

let currentPage = 1;
let itemsPerPage = 10;
let filteredOrders = [...orders];
let currentStatusFilter = '';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadOrdersFromStorage(); // Load orders from localStorage first
  updateStats();
  setupFilters();
  loadFromURL(); // Load filter from URL parameter
});

// Load filter from URL parameter
function loadFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const statusParam = urlParams.get('status');
  
  if (statusParam) {
    currentStatusFilter = statusParam;
    document.getElementById('statusFilter').value = statusParam;
    console.log('Loaded status from URL:', statusParam);
  }
  
  // Apply filters after loading from URL
  applyFilters();
}

// Update statistics
function updateStats() {
  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    shipping: orders.filter(o => o.status === 'shipping' || o.status === 'confirmed').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };
  
  document.getElementById('pendingCount').textContent = stats.pending;
  document.getElementById('shippingCount').textContent = stats.shipping;
  document.getElementById('completedCount').textContent = stats.completed;
  document.getElementById('cancelledCount').textContent = stats.cancelled;
}

// Render orders table
function renderOrders() {
  const tbody = document.getElementById('ordersTableBody');
  
  if (filteredOrders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="loading-row">
          <i class="fa fa-inbox"></i> Không tìm thấy đơn hàng nào
        </td>
      </tr>
    `;
    return;
  }
  
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageOrders = filteredOrders.slice(start, end);
  
  tbody.innerHTML = pageOrders.map(order => `
    <tr>
      <td><span class="order-id">#${order.id}</span></td>
      <td>
        <div class="customer-info">
          <span class="customer-name">${order.customer.name}</span>
          <span class="customer-phone">${order.customer.phone}</span>
        </div>
      </td>
      <td>${formatDate(order.date)}</td>
      <td><span class="order-price">${formatPrice(order.total)}</span></td>
      <td>
        <span class="payment-badge ${order.payment}">
          <i class="fa fa-${getPaymentIcon(order.payment)}"></i>
          ${getPaymentText(order.payment)}
        </span>
      </td>
      <td>
        <span class="status-badge ${order.status}">
          <i class="fa fa-circle"></i>
          ${getStatusText(order.status)}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn-action view" onclick="viewOrder('${order.id}')" title="Xem chi tiết">
            <i class="fa fa-eye"></i>
          </button>
          <button class="btn-action edit" onclick="editOrder('${order.id}')" title="Chỉnh sửa">
            <i class="fa fa-edit"></i>
          </button>
          <button class="btn-action delete" onclick="deleteOrder('${order.id}')" title="Xóa">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  
  updatePagination();
  updateTableInfo();
}

// Setup filters
function setupFilters() {
  const searchInput = document.querySelector('.filters-bar .search-input');
  const statusFilter = document.getElementById('statusFilter');
  const paymentFilter = document.getElementById('paymentFilter');
  
  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  paymentFilter.addEventListener('change', applyFilters);
}

// Apply filters
function applyFilters() {
  const searchTerm = document.querySelector('.filters-bar .search-input').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;
  const paymentFilter = document.getElementById('paymentFilter').value;
  
  // Update currentStatusFilter from dropdown
  currentStatusFilter = statusFilter;
  
  filteredOrders = orders.filter(order => {
    const matchSearch = !searchTerm || 
      order.id.toLowerCase().includes(searchTerm) ||
      order.customer.name.toLowerCase().includes(searchTerm) ||
      order.customer.phone.includes(searchTerm);
    
    const matchStatus = !statusFilter || order.status === statusFilter;
    const matchPayment = !paymentFilter || order.payment === paymentFilter;
    
    return matchSearch && matchStatus && matchPayment;
  });
  
  currentPage = 1;
  renderOrders();
  updateActiveStatCard();
  
  console.log('Filtered orders:', filteredOrders.length, 'Status:', statusFilter);
}

// Filter by status (from stat cards)
function filterByStatus(status) {
  // Toggle filter: if clicking same status, clear it
  if (currentStatusFilter === status) {
    currentStatusFilter = '';
  } else {
    currentStatusFilter = status;
  }
  
  // Update select dropdown
  document.getElementById('statusFilter').value = currentStatusFilter;
  
  // Apply filters
  applyFilters();
  
  console.log('Filter by status:', status, 'Current filter:', currentStatusFilter);
}

// Update active stat card
function updateActiveStatCard() {
  const cards = document.querySelectorAll('.stat-card-small');
  cards.forEach(card => card.classList.remove('active'));
  
  if (currentStatusFilter) {
    const statusMap = {
      'pending': 0,
      'shipping': 1,
      'completed': 2,
      'cancelled': 3
    };
    const index = statusMap[currentStatusFilter];
    if (index !== undefined) {
      cards[index].classList.add('active');
    }
  }
}

// Reset filters
function resetFilters() {
  document.querySelector('.filters-bar .search-input').value = '';
  document.getElementById('statusFilter').value = '';
  document.getElementById('paymentFilter').value = '';
  currentStatusFilter = '';
  loadOrdersFromStorage(); // Reload from storage
  filteredOrders = [...orders];
  currentPage = 1;
  updateStats();
  renderOrders();
  updateActiveStatCard();
}

// View order detail
function viewOrder(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const modal = document.getElementById('orderModal');
  const content = document.getElementById('orderDetailContent');
  
  content.innerHTML = `
    <div class="order-detail-grid">
      <div class="detail-section">
        <h4>Thông tin đơn hàng</h4>
        <div class="detail-row">
          <span class="detail-label">Mã đơn:</span>
          <span class="detail-value">#${order.id}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ngày đặt:</span>
          <span class="detail-value">${formatDate(order.date)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Trạng thái:</span>
          <span class="status-badge ${order.status}">
            <i class="fa fa-circle"></i>
            ${getStatusText(order.status)}
          </span>
        </div>
      </div>
      
      <div class="detail-section">
        <h4>Thông tin khách hàng</h4>
        <div class="detail-row">
          <span class="detail-label">Họ tên:</span>
          <span class="detail-value">${order.customer.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Số điện thoại:</span>
          <span class="detail-value">${order.customer.phone}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Thanh toán:</span>
          <span class="payment-badge ${order.payment}">
            <i class="fa fa-${getPaymentIcon(order.payment)}"></i>
            ${getPaymentText(order.payment)}
          </span>
        </div>
      </div>
    </div>
    
    <div class="order-items">
      <h4>Sản phẩm (${order.items.length})</h4>
      ${order.items.map(item => `
        <div class="order-item">
          <img src="${item.image}" alt="${item.name}" class="item-image" onerror="this.src='/images/placeholder.jpg'">
          <div class="item-info">
            <div class="item-name">${item.name}</div>
            <div class="item-variant">${item.variant} × ${item.qty}</div>
            <div class="item-price">${formatPrice(item.price)}</div>
          </div>
        </div>
      `).join('')}
      
      <div class="detail-section" style="margin-top: 16px;">
        <div class="detail-row">
          <span class="detail-label">Tạm tính:</span>
          <span class="detail-value">${formatPrice(order.total)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Phí vận chuyển:</span>
          <span class="detail-value">Miễn phí</span>
        </div>
        <div class="detail-row" style="border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 8px;">
          <span class="detail-label" style="font-weight: 600; font-size: 16px;">Tổng cộng:</span>
          <span class="detail-value" style="font-weight: 700; font-size: 18px; color: #667eea;">${formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  `;
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close modal
function closeOrderModal() {
  const modal = document.getElementById('orderModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Edit order - Show status change modal
function editOrder(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const modal = document.getElementById('editOrderModal');
  if (!modal) {
    // Create modal if not exists
    createEditModal();
  }
  
  // Set current values
  document.getElementById('editOrderId').value = orderId;
  document.getElementById('editOrderStatus').value = order.status;
  document.getElementById('editOrderIdDisplay').textContent = '#' + orderId;
  
  // Show modal
  document.getElementById('editOrderModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Create edit modal
function createEditModal() {
  const modalHtml = `
    <div id="editOrderModal" class="modal">
      <div class="modal-content" style="max-width: 450px;">
        <div class="modal-header">
          <h3>Cập nhật trạng thái đơn hàng</h3>
          <button class="modal-close" onclick="closeEditModal()">
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="editOrderId">
          <div class="form-group">
            <label>Mã đơn hàng</label>
            <p id="editOrderIdDisplay" style="font-weight: 600; color: #667eea; font-size: 18px;"></p>
          </div>
          <div class="form-group">
            <label>Trạng thái đơn hàng</label>
            <select id="editOrderStatus" class="form-control" style="width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 15px;">
              <option value="pending">⏳ Chờ xác nhận</option>
              <option value="confirmed">✅ Đã xác nhận</option>
              <option value="shipping">🚚 Đang giao hàng</option>
              <option value="completed">✔️ Hoàn thành</option>
              <option value="cancelled">❌ Đã huỷ</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="closeEditModal()" style="padding: 10px 20px; background: #f3f4f6; border: none; border-radius: 8px; cursor: pointer;">Huỷ</button>
          <button class="btn-primary" onclick="saveOrderStatus()" style="padding: 10px 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer;">Lưu thay đổi</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Close edit modal
function closeEditModal() {
  const modal = document.getElementById('editOrderModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Save order status
function saveOrderStatus() {
  const orderId = document.getElementById('editOrderId').value;
  const newStatus = document.getElementById('editOrderStatus').value;
  
  // Update in orders array
  const orderIndex = orders.findIndex(o => o.id === orderId);
  if (orderIndex !== -1) {
    orders[orderIndex].status = newStatus;
  }
  
  // Update in localStorage
  const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  const storedIndex = storedOrders.findIndex(o => o.id.toString() === orderId);
  if (storedIndex !== -1) {
    storedOrders[storedIndex].status = newStatus;
    localStorage.setItem('orders', JSON.stringify(storedOrders));
  }
  
  // Update filtered orders
  const filteredIndex = filteredOrders.findIndex(o => o.id === orderId);
  if (filteredIndex !== -1) {
    filteredOrders[filteredIndex].status = newStatus;
  }
  
  // Close modal and refresh
  closeEditModal();
  updateStats();
  renderOrders();
  
  // Show notification
  showNotification(`Đã cập nhật trạng thái đơn hàng #${orderId} thành "${getStatusText(newStatus)}"`, 'success');
}

// Show notification
function showNotification(message, type = 'info') {
  const existingNotification = document.querySelector('.notification-toast');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notification = document.createElement('div');
  notification.className = `notification-toast notification-${type}`;
  
  const icon = type === 'success' ? 'fa-check-circle' : 
               type === 'error' ? 'fa-exclamation-circle' : 
               'fa-info-circle';
  
  notification.innerHTML = `
    <i class="fa ${icon}"></i>
    <span>${message}</span>
  `;
  
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 30px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #667eea, #764ba2)'};
    color: white;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);

  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Delete order
function deleteOrder(orderId) {
  if (!confirm('Bạn có chắc muốn xóa đơn hàng #' + orderId + '?')) return;
  
  orders = orders.filter(o => o.id !== orderId);
  filteredOrders = filteredOrders.filter(o => o.id !== orderId);
  
  // Also remove from localStorage
  const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  const updatedOrders = storedOrders.filter(o => o.id.toString() !== orderId);
  localStorage.setItem('orders', JSON.stringify(updatedOrders));
  
  updateStats();
  renderOrders();
}

// Update pagination
function updatePagination() {
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const pagination = document.getElementById('pagination');
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let html = `
    <button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
      <i class="fa fa-chevron-left"></i>
    </button>
  `;
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `
        <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
          ${i}
        </button>
      `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span style="padding: 0 8px;">...</span>`;
    }
  }
  
  html += `
    <button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
      <i class="fa fa-chevron-right"></i>
    </button>
  `;
  
  pagination.innerHTML = html;
}

// Change page
function changePage(page) {
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderOrders();
}

// Update table info
function updateTableInfo() {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(start + itemsPerPage - 1, filteredOrders.length);
  
  document.getElementById('showingCount').textContent = `${start}-${end}`;
  document.getElementById('totalCount').textContent = filteredOrders.length;
}

// Helper functions
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN');
}

function getStatusText(status) {
  const statusMap = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã huỷ'
  };
  return statusMap[status] || status;
}

function getPaymentText(payment) {
  const paymentMap = {
    cod: 'COD',
    bank: 'Chuyển khoản',
    momo: 'MoMo'
  };
  return paymentMap[payment] || payment;
}

function getPaymentIcon(payment) {
  const iconMap = {
    cod: 'money-bill-wave',
    bank: 'university',
    momo: 'wallet'
  };
  return iconMap[payment] || 'credit-card';
}

// Close modal on outside click
document.addEventListener('click', function(e) {
  const modal = document.getElementById('orderModal');
  if (e.target === modal) {
    closeOrderModal();
  }
});
