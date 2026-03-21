// Coupons Management
let coupons = [];
let editingCouponId = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadCoupons();
  setupFormHandler();
});

// Load coupons
function loadCoupons() {
  const saved = localStorage.getItem('coupons');
  if (saved) {
    coupons = JSON.parse(saved);
  } else {
    // Demo data
    coupons = [
      {
        id: 1,
        code: 'SUMMER2024',
        discountType: 'percent',
        discountValue: 20,
        minOrder: 500000,
        maxDiscount: 100000,
        startDate: '2024-06-01',
        endDate: '2024-08-31',
        quantity: 100,
        used: 45,
        description: 'Giảm 20% cho đơn hàng mùa hè',
        status: 'active'
      },
      {
        id: 2,
        code: 'FREESHIP50K',
        discountType: 'fixed',
        discountValue: 50000,
        minOrder: 300000,
        maxDiscount: null,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        quantity: 500,
        used: 234,
        description: 'Miễn phí vận chuyển 50k',
        status: 'active'
      },
      {
        id: 3,
        code: 'WELCOME10',
        discountType: 'percent',
        discountValue: 10,
        minOrder: 0,
        maxDiscount: 50000,
        startDate: '2024-01-01',
        endDate: '2024-05-31',
        quantity: 1000,
        used: 1000,
        description: 'Mã chào mừng khách hàng mới',
        status: 'expired'
      }
    ];
  }
  
  updateStats();
  renderCoupons();
}

// Update statistics
function updateStats() {
  const active = coupons.filter(c => c.status === 'active').length;
  const used = coupons.reduce((sum, c) => sum + c.used, 0);
  const expired = coupons.filter(c => c.status === 'expired').length;
  
  document.getElementById('activeCount').textContent = active;
  document.getElementById('usedCount').textContent = used;
  document.getElementById('expiredCount').textContent = expired;
}

// Render coupons
function renderCoupons() {
  const grid = document.getElementById('couponsGrid');
  
  if (coupons.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fa fa-ticket"></i>
        <h3>Chưa có mã giảm giá nào</h3>
        <p>Tạo mã giảm giá đầu tiên để thu hút khách hàng</p>
        <button class="btn-primary" onclick="openCouponModal()">
          <i class="fa fa-plus"></i> Tạo mã giảm giá
        </button>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = coupons.map(coupon => {
    const isExpired = coupon.status === 'expired' || new Date(coupon.endDate) < new Date();
    const remaining = coupon.quantity - coupon.used;
    const usagePercent = Math.round((coupon.used / coupon.quantity) * 100);
    
    return `
      <div class="coupon-card ${isExpired ? 'expired' : 'active'}">
        <div class="coupon-header">
          <h3 class="coupon-code">${coupon.code}</h3>
          <p class="coupon-discount">
            ${getDiscountText(coupon)}
          </p>
          <span class="coupon-status">
            ${isExpired ? 'Hết hạn' : 'Đang hoạt động'}
          </span>
        </div>
        <div class="coupon-body">
          <div class="coupon-info">
            <div class="coupon-info-item">
              <i class="fa fa-calendar"></i>
              <span>Từ ${formatDate(coupon.startDate)} đến ${formatDate(coupon.endDate)}</span>
            </div>
            ${coupon.minOrder > 0 ? `
              <div class="coupon-info-item">
                <i class="fa fa-shopping-cart"></i>
                <span>Đơn tối thiểu: <strong>${formatPrice(coupon.minOrder)}</strong></span>
              </div>
            ` : ''}
            ${coupon.maxDiscount ? `
              <div class="coupon-info-item">
                <i class="fa fa-tag"></i>
                <span>Giảm tối đa: <strong>${formatPrice(coupon.maxDiscount)}</strong></span>
              </div>
            ` : ''}
          </div>
          
          ${coupon.description ? `
            <div class="coupon-description">${coupon.description}</div>
          ` : ''}
          
          <div class="coupon-stats">
            <div class="coupon-stat">
              <div class="coupon-stat-value">${coupon.used}</div>
              <div class="coupon-stat-label">Đã dùng</div>
            </div>
            <div class="coupon-stat">
              <div class="coupon-stat-value">${remaining}</div>
              <div class="coupon-stat-label">Còn lại</div>
            </div>
            <div class="coupon-stat">
              <div class="coupon-stat-value">${usagePercent}%</div>
              <div class="coupon-stat-label">Tỷ lệ</div>
            </div>
          </div>
          
          <div class="coupon-actions">
            <button class="btn-coupon-action copy" onclick="copyCouponCode('${coupon.code}')" title="Sao chép mã">
              <i class="fa fa-copy"></i> Sao chép
            </button>
            <button class="btn-coupon-action edit" onclick="editCoupon(${coupon.id})" title="Chỉnh sửa">
              <i class="fa fa-edit"></i> Sửa
            </button>
            <button class="btn-coupon-action delete" onclick="deleteCoupon(${coupon.id})" title="Xóa">
              <i class="fa fa-trash"></i> Xóa
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Setup form handler
function setupFormHandler() {
  const form = document.getElementById('couponForm');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
      code: document.getElementById('couponCode').value.toUpperCase().trim(),
      discountType: document.getElementById('discountType').value,
      discountValue: parseFloat(document.getElementById('discountValue').value),
      minOrder: parseFloat(document.getElementById('minOrder').value) || 0,
      maxDiscount: parseFloat(document.getElementById('maxDiscount').value) || null,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      quantity: parseInt(document.getElementById('quantity').value),
      description: document.getElementById('description').value.trim(),
      isPublic: document.getElementById('isPublic').checked,
      used: 0,
      status: 'active'
    };
    
    // Validation
    if (!formData.code) {
      showNotification('Vui lòng nhập mã code', 'error');
      return;
    }
    
    if (formData.discountValue <= 0) {
      showNotification('Giá trị giảm giá phải lớn hơn 0', 'error');
      return;
    }
    
    if (formData.discountType === 'percent' && formData.discountValue > 100) {
      showNotification('Giảm giá phần trăm không được vượt quá 100%', 'error');
      return;
    }
    
    if (editingCouponId) {
      // Update
      const coupon = coupons.find(c => c.id === editingCouponId);
      if (coupon) {
        Object.assign(coupon, formData);
        showNotification('Đã cập nhật mã giảm giá', 'success');
      }
    } else {
      // Add new
      const newId = Math.max(...coupons.map(c => c.id), 0) + 1;
      coupons.push({ id: newId, ...formData });
      showNotification('Đã tạo mã giảm giá mới', 'success');
    }
    
    saveCoupons();
    updateStats();
    renderCoupons();
    closeCouponModal();
  });
}

// Open modal
function openCouponModal() {
  editingCouponId = null;
  document.getElementById('modalTitle').textContent = 'Tạo mã giảm giá';
  document.getElementById('couponForm').reset();
  
  // Set default dates
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const endDate = nextMonth.toISOString().split('T')[0];
  
  document.getElementById('startDate').value = today;
  document.getElementById('endDate').value = endDate;
  document.getElementById('isPublic').checked = false;
  
  document.getElementById('couponModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Edit coupon
function editCoupon(id) {
  const coupon = coupons.find(c => c.id === id);
  if (!coupon) return;
  
  editingCouponId = id;
  document.getElementById('modalTitle').textContent = 'Chỉnh sửa mã giảm giá';
  document.getElementById('couponCode').value = coupon.code;
  document.getElementById('discountType').value = coupon.discountType;
  document.getElementById('discountValue').value = coupon.discountValue;
  document.getElementById('minOrder').value = coupon.minOrder;
  document.getElementById('maxDiscount').value = coupon.maxDiscount || '';
  document.getElementById('startDate').value = coupon.startDate;
  document.getElementById('endDate').value = coupon.endDate;
  document.getElementById('quantity').value = coupon.quantity;
  document.getElementById('description').value = coupon.description;
  document.getElementById('isPublic').checked = coupon.isPublic || false;
  
  document.getElementById('couponModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Delete coupon
function deleteCoupon(id) {
  if (!confirm('Bạn có chắc muốn xóa mã giảm giá này?')) return;
  
  coupons = coupons.filter(c => c.id !== id);
  saveCoupons();
  updateStats();
  renderCoupons();
  showNotification('Đã xóa mã giảm giá', 'success');
}

// Close modal
function closeCouponModal() {
  document.getElementById('couponModal').classList.remove('active');
  document.body.style.overflow = '';
  editingCouponId = null;
}

// Generate random code
function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById('couponCode').value = code;
}

// Copy coupon code
function copyCouponCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    showNotification(`Đã sao chép mã: ${code}`, 'success');
  });
}

// Save coupons
function saveCoupons() {
  localStorage.setItem('coupons', JSON.stringify(coupons));
}

// Helper functions
function getDiscountText(coupon) {
  if (coupon.discountType === 'percent') {
    return `Giảm ${coupon.discountValue}%`;
  } else {
    return `Giảm ${formatPrice(coupon.discountValue)}`;
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

// Notification
function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification-toast ${type}`;
  notification.innerHTML = `
    <i class="fa fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Close modal on outside click
document.addEventListener('click', function(e) {
  const modal = document.getElementById('couponModal');
  if (e.target === modal) {
    closeCouponModal();
  }
});
