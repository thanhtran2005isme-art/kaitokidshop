// Promotions Management
let promotions = [];
let editingPromotionId = null;
let selectedBanner = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadPromotions();
  setupFormHandler();
  setupBannerUpload();
});

// Load promotions
function loadPromotions() {
  const saved = localStorage.getItem('promotions');
  if (saved) {
    promotions = JSON.parse(saved);
  } else {
    // Demo data
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    promotions = [
      {
        id: 1,
        name: 'Giảm giá mùa hè 2024',
        description: 'Giảm giá 30% toàn bộ sản phẩm mùa hè',
        type: 'discount',
        discountPercent: 30,
        startDate: now.toISOString().slice(0, 16),
        endDate: nextWeek.toISOString().slice(0, 16),
        applyTo: 'all',
        banner: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Cdefs%3E%3ClinearGradient id="a" x1="0" y1="0" x2="1" y2="1"%3E%3Cstop offset="0%25" stop-color="%23f59e0b"/%3E%3Cstop offset="100%25" stop-color="%23f97316"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="200" fill="url(%23a)"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24" font-family="Arial"%3ESummer Sale%3C/text%3E%3C/svg%3E',
        showOnHomepage: true,
        status: 'active'
      },
      {
        id: 2,
        name: 'Mua 2 tặng 1',
        description: 'Mua 2 sản phẩm bất kỳ, tặng 1 sản phẩm giá trị thấp nhất',
        type: 'buy-x-get-y',
        discountPercent: 0,
        startDate: tomorrow.toISOString().slice(0, 16),
        endDate: nextWeek.toISOString().slice(0, 16),
        applyTo: 'category',
        banner: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Cdefs%3E%3ClinearGradient id="b" x1="0" y1="0" x2="1" y2="1"%3E%3Cstop offset="0%25" stop-color="%2310b981"/%3E%3Cstop offset="100%25" stop-color="%23059669"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="200" fill="url(%23b)"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24" font-family="Arial"%3EBuy 2 Get 1%3C/text%3E%3C/svg%3E',
        showOnHomepage: false,
        status: 'scheduled'
      },
      {
        id: 3,
        name: 'Black Friday 2023',
        description: 'Giảm giá khủng dịp Black Friday',
        type: 'discount',
        discountPercent: 50,
        startDate: lastMonth.toISOString().slice(0, 16),
        endDate: now.toISOString().slice(0, 16),
        applyTo: 'all',
        banner: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect width="400" height="200" fill="%23000"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24" font-family="Arial"%3EBlack Friday%3C/text%3E%3C/svg%3E',
        showOnHomepage: false,
        status: 'ended'
      }
    ];
  }
  
  updateStats();
  renderPromotions();
}

// Update statistics
function updateStats() {
  const now = new Date();
  const active = promotions.filter(p => {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    return start <= now && end >= now;
  }).length;
  
  const scheduled = promotions.filter(p => new Date(p.startDate) > now).length;
  const ended = promotions.filter(p => new Date(p.endDate) < now).length;
  
  document.getElementById('activeCount').textContent = active;
  document.getElementById('scheduledCount').textContent = scheduled;
  document.getElementById('endedCount').textContent = ended;
}

// Render promotions
function renderPromotions() {
  const list = document.getElementById('promotionsList');
  
  if (promotions.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <i class="fa fa-bullhorn"></i>
        <h3>Chưa có chương trình khuyến mãi</h3>
        <p>Tạo chương trình khuyến mãi để tăng doanh số</p>
        <button class="btn-primary" onclick="openPromotionModal()">
          <i class="fa fa-plus"></i> Tạo chương trình
        </button>
      </div>
    `;
    return;
  }
  
  list.innerHTML = promotions.map(promo => {
    const status = getPromotionStatus(promo);
    const startDate = new Date(promo.startDate);
    const endDate = new Date(promo.endDate);
    const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    return `
      <div class="promotion-item ${status.class}">
        <div class="promotion-banner">
          <img src="${promo.banner}" alt="${promo.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22%3E%3Crect fill=%22%23667eea%22 width=%22400%22 height=%22200%22/%3E%3C/svg%3E'">
          <div class="promotion-badge ${status.class}">
            <i class="fa fa-${status.icon}"></i>
            ${status.text}
          </div>
        </div>
        <div class="promotion-content">
          <div class="promotion-header">
            <h3>${promo.name}</h3>
            <div class="promotion-type-badge">
              <i class="fa fa-${getTypeIcon(promo.type)}"></i>
              ${getTypeText(promo.type)}
            </div>
          </div>
          
          ${promo.description ? `<p class="promotion-description">${promo.description}</p>` : ''}
          
          <div class="promotion-details">
            <div class="promotion-detail-item">
              <i class="fa fa-calendar"></i>
              <span>${formatDateTime(promo.startDate)} - ${formatDateTime(promo.endDate)}</span>
            </div>
            <div class="promotion-detail-item">
              <i class="fa fa-clock"></i>
              <span>${duration} ngày</span>
            </div>
            ${promo.discountPercent > 0 ? `
              <div class="promotion-detail-item">
                <i class="fa fa-tag"></i>
                <span>Giảm ${promo.discountPercent}%</span>
              </div>
            ` : ''}
            <div class="promotion-detail-item">
              <i class="fa fa-${promo.applyTo === 'all' ? 'globe' : promo.applyTo === 'category' ? 'folder' : 'box'}"></i>
              <span>${getApplyToText(promo.applyTo)}</span>
            </div>
          </div>
          
          ${promo.showOnHomepage ? `
            <div class="promotion-homepage-badge">
              <i class="fa fa-home"></i> Hiển thị trang chủ
            </div>
          ` : ''}
          
          <div class="promotion-actions">
            <button class="btn-promo-action view" onclick="viewPromotion(${promo.id})" title="Xem chi tiết">
              <i class="fa fa-eye"></i> Xem
            </button>
            <button class="btn-promo-action edit" onclick="editPromotion(${promo.id})" title="Chỉnh sửa">
              <i class="fa fa-edit"></i> Sửa
            </button>
            <button class="btn-promo-action delete" onclick="deletePromotion(${promo.id})" title="Xóa">
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
  const form = document.getElementById('promotionForm');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('promotionName').value.trim(),
      description: document.getElementById('promotionDesc').value.trim(),
      type: document.getElementById('promotionType').value,
      discountPercent: parseInt(document.getElementById('discountPercent').value) || 0,
      startDate: document.getElementById('startDate').value,
      endDate: document.getElementById('endDate').value,
      applyTo: document.getElementById('applyTo').value,
      banner: selectedBanner || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22200%22%3E%3Crect fill=%22%23667eea%22 width=%22400%22 height=%22200%22/%3E%3C/svg%3E',
      showOnHomepage: document.getElementById('showOnHomepage').checked,
      status: 'active'
    };
    
    if (!formData.name) {
      showNotification('Vui lòng nhập tên chương trình', 'error');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      showNotification('Vui lòng chọn thời gian', 'error');
      return;
    }
    
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      showNotification('Ngày kết thúc phải sau ngày bắt đầu', 'error');
      return;
    }
    
    if (editingPromotionId) {
      const promo = promotions.find(p => p.id === editingPromotionId);
      if (promo) {
        Object.assign(promo, formData);
        showNotification('Đã cập nhật chương trình', 'success');
      }
    } else {
      const newId = Math.max(...promotions.map(p => p.id), 0) + 1;
      promotions.push({ id: newId, ...formData });
      showNotification('Đã tạo chương trình mới', 'success');
    }
    
    savePromotions();
    updateStats();
    renderPromotions();
    closePromotionModal();
  });
}

// Setup banner upload
function setupBannerUpload() {
  const input = document.getElementById('bannerImage');
  
  input.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        selectedBanner = e.target.result;
        const preview = document.getElementById('bannerPreview');
        preview.innerHTML = `<img src="${selectedBanner}" alt="Banner">`;
        preview.classList.add('show');
      };
      reader.readAsDataURL(file);
    }
  });
}

// Open modal
function openPromotionModal() {
  editingPromotionId = null;
  selectedBanner = null;
  document.getElementById('modalTitle').textContent = 'Tạo chương trình khuyến mãi';
  document.getElementById('promotionForm').reset();
  document.getElementById('bannerPreview').classList.remove('show');
  
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  document.getElementById('startDate').value = now.toISOString().slice(0, 16);
  document.getElementById('endDate').value = nextWeek.toISOString().slice(0, 16);
  
  document.getElementById('promotionModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Edit promotion
function editPromotion(id) {
  const promo = promotions.find(p => p.id === id);
  if (!promo) return;
  
  editingPromotionId = id;
  selectedBanner = promo.banner;
  
  document.getElementById('modalTitle').textContent = 'Chỉnh sửa chương trình';
  document.getElementById('promotionName').value = promo.name;
  document.getElementById('promotionDesc').value = promo.description;
  document.getElementById('promotionType').value = promo.type;
  document.getElementById('discountPercent').value = promo.discountPercent;
  document.getElementById('startDate').value = promo.startDate;
  document.getElementById('endDate').value = promo.endDate;
  document.getElementById('applyTo').value = promo.applyTo;
  document.getElementById('showOnHomepage').checked = promo.showOnHomepage;
  
  const preview = document.getElementById('bannerPreview');
  preview.innerHTML = `<img src="${promo.banner}" alt="Banner">`;
  preview.classList.add('show');
  
  document.getElementById('promotionModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// View promotion
function viewPromotion(id) {
  alert('Xem chi tiết chương trình #' + id);
}

// Delete promotion
function deletePromotion(id) {
  if (!confirm('Bạn có chắc muốn xóa chương trình này?')) return;
  
  promotions = promotions.filter(p => p.id !== id);
  savePromotions();
  updateStats();
  renderPromotions();
  showNotification('Đã xóa chương trình', 'success');
}

// Close modal
function closePromotionModal() {
  document.getElementById('promotionModal').classList.remove('active');
  document.body.style.overflow = '';
  editingPromotionId = null;
  selectedBanner = null;
}

// Save promotions
function savePromotions() {
  localStorage.setItem('promotions', JSON.stringify(promotions));
}

// Helper functions
function getPromotionStatus(promo) {
  const now = new Date();
  const start = new Date(promo.startDate);
  const end = new Date(promo.endDate);
  
  if (end < now) {
    return { class: 'ended', text: 'Đã kết thúc', icon: 'check-circle' };
  } else if (start > now) {
    return { class: 'scheduled', text: 'Sắp diễn ra', icon: 'clock' };
  } else {
    return { class: 'active', text: 'Đang chạy', icon: 'play-circle' };
  }
}

function getTypeIcon(type) {
  const icons = {
    discount: 'percentage',
    'buy-x-get-y': 'gift',
    bundle: 'boxes',
    'free-shipping': 'truck'
  };
  return icons[type] || 'tag';
}

function getTypeText(type) {
  const types = {
    discount: 'Giảm giá',
    'buy-x-get-y': 'Mua X tặng Y',
    bundle: 'Combo',
    'free-shipping': 'Freeship'
  };
  return types[type] || type;
}

function getApplyToText(applyTo) {
  const texts = {
    all: 'Tất cả sản phẩm',
    category: 'Danh mục cụ thể',
    product: 'Sản phẩm cụ thể'
  };
  return texts[applyTo] || applyTo;
}

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

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

document.addEventListener('click', function(e) {
  const modal = document.getElementById('promotionModal');
  if (e.target === modal) closePromotionModal();
});
