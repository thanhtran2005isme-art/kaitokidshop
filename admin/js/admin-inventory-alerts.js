// Inventory Alerts Management
let inventory = [
  { id: 1, name: 'Áo sơ mi trắng', sku: 'SP001', category: 'Áo nam', stock: 45, image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23667eea" width="60" height="60"/%3E%3C/svg%3E' },
  { id: 2, name: 'Quần jean xanh', sku: 'SP002', category: 'Quần nam', stock: 8, image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%2310b981" width="60" height="60"/%3E%3C/svg%3E' },
  { id: 3, name: 'Váy hoa nhí', sku: 'SP003', category: 'Váy đầm', stock: 0, image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23f59e0b" width="60" height="60"/%3E%3C/svg%3E' },
  { id: 4, name: 'Áo khoác dạ', sku: 'SP004', category: 'Áo nam', stock: 23, image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23ef4444" width="60" height="60"/%3E%3C/svg%3E' },
  { id: 5, name: 'Quần tây đen', sku: 'SP005', category: 'Quần nam', stock: 5, image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%233b82f6" width="60" height="60"/%3E%3C/svg%3E' },
  { id: 6, name: 'Đầm công sở', sku: 'SP006', category: 'Váy đầm', stock: 0, image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23ec4899" width="60" height="60"/%3E%3C/svg%3E' },
  { id: 7, name: 'Áo thun basic', sku: 'SP007', category: 'Áo nam', stock: 15, image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%238b5cf6" width="60" height="60"/%3E%3C/svg%3E' },
  { id: 8, name: 'Quần short kaki', sku: 'SP008', category: 'Quần nam', stock: 3, image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%2314b8a6" width="60" height="60"/%3E%3C/svg%3E' }
];

let settings = {
  warningThreshold: 10,
  lowThreshold: 20,
  emailNotification: true,
  pushNotification: true
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadSettings();
  renderAlerts();
  setupSettingsForm();
});

// Load settings
function loadSettings() {
  const saved = localStorage.getItem('alertSettings');
  if (saved) {
    settings = JSON.parse(saved);
  }
}

// Render alerts
function renderAlerts() {
  const critical = inventory.filter(p => p.stock === 0);
  const warning = inventory.filter(p => p.stock > 0 && p.stock <= settings.warningThreshold);
  const low = inventory.filter(p => p.stock > settings.warningThreshold && p.stock <= settings.lowThreshold);
  
  // Update counts
  document.getElementById('criticalCount').textContent = critical.length;
  document.getElementById('warningCount').textContent = warning.length;
  document.getElementById('lowCount').textContent = low.length;
  
  // Render sections
  renderAlertSection('criticalItems', critical, 'critical');
  renderAlertSection('warningItems', warning, 'warning');
  renderAlertSection('lowItems', low, 'low');
  
  // Show/hide sections
  document.getElementById('criticalSection').style.display = critical.length > 0 ? 'block' : 'none';
  document.getElementById('warningSection').style.display = warning.length > 0 ? 'block' : 'none';
  document.getElementById('lowSection').style.display = low.length > 0 ? 'block' : 'none';
}

// Render alert section
function renderAlertSection(containerId, items, level) {
  const container = document.getElementById(containerId);
  
  if (items.length === 0) {
    container.innerHTML = `
      <div class="alert-empty">
        <i class="fa fa-check-circle"></i>
        <p>Không có cảnh báo</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = items.map(item => `
    <div class="alert-item">
      <img src="${item.image}" alt="${item.name}" class="alert-item-image">
      <div class="alert-item-content">
        <div class="alert-item-header">
          <div>
            <h4 class="alert-item-name">${item.name}</h4>
            <span class="alert-item-sku">${item.sku}</span>
          </div>
          <div class="alert-item-stock">
            <span class="stock-number-large ${level}">${item.stock}</span>
            <span class="stock-label">sản phẩm</span>
          </div>
        </div>
        <div class="alert-item-meta">
          <div class="alert-meta-item">
            <i class="fa fa-tag"></i>
            <span>${item.category}</span>
          </div>
          ${level === 'critical' ? `
            <div class="alert-meta-item" style="color: #ef4444;">
              <i class="fa fa-exclamation-circle"></i>
              <span><strong>Cần nhập hàng ngay!</strong></span>
            </div>
          ` : ''}
        </div>
      </div>
      <div class="alert-item-actions">
        <button class="btn-quick-action primary" onclick="quickRestock(${item.id})">
          <i class="fa fa-plus"></i> Nhập hàng
        </button>
        <button class="btn-quick-action secondary" onclick="viewProduct(${item.id})">
          <i class="fa fa-eye"></i> Chi tiết
        </button>
      </div>
    </div>
  `).join('');
}

// Quick restock
function quickRestock(productId) {
  const product = inventory.find(p => p.id === productId);
  if (!product) return;
  
  const quantity = prompt(`Nhập số lượng cho "${product.name}":`, '50');
  if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
    product.stock += parseInt(quantity);
    renderAlerts();
    showNotification(`Đã nhập ${quantity} sản phẩm cho "${product.name}"`, 'success');
  }
}

// View product
function viewProduct(productId) {
  window.location.href = `inventory.html?product=${productId}`;
}

// Open settings modal
function openSettingsModal() {
  document.getElementById('warningThreshold').value = settings.warningThreshold;
  document.getElementById('lowThreshold').value = settings.lowThreshold;
  document.getElementById('emailNotification').checked = settings.emailNotification;
  document.getElementById('pushNotification').checked = settings.pushNotification;
  
  document.getElementById('settingsModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close settings modal
function closeSettingsModal() {
  document.getElementById('settingsModal').classList.remove('active');
  document.body.style.overflow = '';
}

// Setup settings form
function setupSettingsForm() {
  const form = document.getElementById('settingsForm');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    settings.warningThreshold = parseInt(document.getElementById('warningThreshold').value);
    settings.lowThreshold = parseInt(document.getElementById('lowThreshold').value);
    settings.emailNotification = document.getElementById('emailNotification').checked;
    settings.pushNotification = document.getElementById('pushNotification').checked;
    
    // Save settings
    localStorage.setItem('alertSettings', JSON.stringify(settings));
    
    renderAlerts();
    closeSettingsModal();
    showNotification('Đã lưu cài đặt cảnh báo', 'success');
  });
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
  const modal = document.getElementById('settingsModal');
  if (e.target === modal) {
    closeSettingsModal();
  }
});
