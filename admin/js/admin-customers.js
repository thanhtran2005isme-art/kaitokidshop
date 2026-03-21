// Customers Management
let customers = [];
let filteredCustomers = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadCustomers();
  updateStats();
  renderCustomers();
  setupFilters();
});

// Load customers from localStorage (registered users only)
function loadCustomers() {
  // Get registered users from localStorage
  const registeredUsers = JSON.parse(localStorage.getItem('users') || '[]');
  
  // Convert registered users to customer format
  customers = registeredUsers.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    tier: 'new',
    orders: 0,
    spending: 0,
    joinDate: user.createdAt ? user.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
    status: 'active'
  }));
  
  filteredCustomers = [...customers];
}

// Update statistics
function updateStats() {
  const total = customers.length;
  const vip = customers.filter(c => c.tier === 'vip').length;
  const newThisMonth = customers.filter(c => {
    const joinDate = new Date(c.joinDate);
    const now = new Date();
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
  }).length;
  const totalOrders = customers.reduce((sum, c) => sum + c.orders, 0);
  
  document.getElementById('totalCustomers').textContent = total;
  document.getElementById('vipCustomers').textContent = vip;
  document.getElementById('newCustomers').textContent = newThisMonth;
  document.getElementById('totalOrders').textContent = totalOrders;
}

// Render customers
function renderCustomers() {
  const tbody = document.getElementById('customersTableBody');
  
  if (filteredCustomers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="loading-row"><i class="fa fa-inbox"></i> Không tìm thấy khách hàng</td></tr>`;
    return;
  }
  
  tbody.innerHTML = filteredCustomers.map(customer => `
    <tr>
      <td>
        <div class="customer-info">
          <div class="customer-avatar">${customer.name.charAt(0)}</div>
          <div class="customer-details">
            <div class="customer-name">${customer.name}</div>
            <div class="customer-email">${customer.email}</div>
          </div>
        </div>
      </td>
      <td>${customer.phone}</td>
      <td>
        <span class="tier-badge ${customer.tier}">
          <i class="fa fa-${customer.tier === 'vip' ? 'crown' : customer.tier === 'new' ? 'star' : 'user'}"></i>
          ${getTierText(customer.tier)}
        </span>
      </td>
      <td><span class="order-count">${customer.orders}</span></td>
      <td><span class="spending-amount">${formatPrice(customer.spending)}</span></td>
      <td><span class="join-date">${formatDate(customer.joinDate)}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn-action view" onclick="viewCustomer(${customer.id})" title="Xem chi tiết">
            <i class="fa fa-eye"></i>
          </button>
          <button class="btn-action edit" onclick="editCustomer(${customer.id})" title="Chỉnh sửa">
            <i class="fa fa-edit"></i>
          </button>
          <button class="btn-action delete" onclick="deleteCustomer(${customer.id})" title="Xóa">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Setup filters
function setupFilters() {
  document.getElementById('tierFilter').addEventListener('change', applyFilters);
  document.getElementById('statusFilter').addEventListener('change', applyFilters);
}

// Apply filters
function applyFilters() {
  const tier = document.getElementById('tierFilter').value;
  const status = document.getElementById('statusFilter').value;
  
  filteredCustomers = customers.filter(c => {
    return (!tier || c.tier === tier) && (!status || c.status === status);
  });
  
  renderCustomers();
}

// Reset filters
function resetFilters() {
  document.getElementById('tierFilter').value = '';
  document.getElementById('statusFilter').value = '';
  filteredCustomers = [...customers];
  renderCustomers();
}

// View customer
function viewCustomer(id) {
  const customer = customers.find(c => c.id === id);
  if (!customer) return;
  
  const content = document.getElementById('customerDetailContent');
  content.innerHTML = `
    <div class="customer-detail-header">
      <div class="customer-detail-avatar">${customer.name.charAt(0)}</div>
      <div class="customer-detail-info">
        <h2>${customer.name}</h2>
        <div class="customer-detail-meta">
          <span><i class="fa fa-envelope"></i> ${customer.email}</span>
          <span><i class="fa fa-phone"></i> ${customer.phone}</span>
        </div>
      </div>
    </div>
    <div class="detail-grid">
      <div class="detail-section">
        <h4>Thông tin chung</h4>
        <div class="detail-row"><span class="detail-label">Hạng:</span><span class="detail-value">${getTierText(customer.tier)}</span></div>
        <div class="detail-row"><span class="detail-label">Trạng thái:</span><span class="detail-value">${customer.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}</span></div>
        <div class="detail-row"><span class="detail-label">Ngày tham gia:</span><span class="detail-value">${formatDate(customer.joinDate)}</span></div>
      </div>
      <div class="detail-section">
        <h4>Thống kê mua hàng</h4>
        <div class="detail-row"><span class="detail-label">Tổng đơn:</span><span class="detail-value">${customer.orders} đơn</span></div>
        <div class="detail-row"><span class="detail-label">Tổng chi tiêu:</span><span class="detail-value">${formatPrice(customer.spending)}</span></div>
        <div class="detail-row"><span class="detail-label">Trung bình/đơn:</span><span class="detail-value">${formatPrice(customer.spending / customer.orders)}</span></div>
      </div>
    </div>
  `;
  
  document.getElementById('customerModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close modal
function closeCustomerModal() {
  document.getElementById('customerModal').classList.remove('active');
  document.body.style.overflow = '';
}

// Edit customer
function editCustomer(id) {
  alert('Chức năng chỉnh sửa khách hàng #' + id);
}

// Delete customer
function deleteCustomer(id) {
  if (!confirm('Bạn có chắc muốn xóa khách hàng này?')) return;
  customers = customers.filter(c => c.id !== id);
  filteredCustomers = filteredCustomers.filter(c => c.id !== id);
  updateStats();
  renderCustomers();
  showNotification('Đã xóa khách hàng', 'success');
}

// Open customer modal
function openCustomerModal() {
  alert('Chức năng thêm khách hàng');
}

// Export customers
function exportCustomers() {
  alert('Chức năng xuất Excel');
}

// Helper functions
function getTierText(tier) {
  const tiers = { vip: 'VIP', regular: 'Thường', new: 'Mới' };
  return tiers[tier] || tier;
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification-toast ${type}`;
  notification.innerHTML = `<i class="fa fa-check-circle"></i><span>${message}</span>`;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

document.addEventListener('click', function(e) {
  const modal = document.getElementById('customerModal');
  if (e.target === modal) closeCustomerModal();
});
