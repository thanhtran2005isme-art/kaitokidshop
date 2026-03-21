// Flash Sales Management
let flashSales = [];
let editingFlashSaleId = null;
let selectedProducts = [];
let availableProducts = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadAvailableProducts();
  loadFlashSales();
  setupFormHandler();
  startCountdownUpdates();
});

// Load products from localStorage (from admin products management)
function loadAvailableProducts() {
  const savedProducts = localStorage.getItem('products');
  if (savedProducts) {
    try {
      const products = JSON.parse(savedProducts);
      availableProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price || p.originalPrice || 0,
        image: p.image || p.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect fill="%23667eea" width="50" height="50"/%3E%3C/svg%3E'
      }));
      console.log('✅ Đã load', availableProducts.length, 'sản phẩm từ danh sách sản phẩm');
    } catch (error) {
      console.error('Lỗi khi load sản phẩm:', error);
      availableProducts = [];
    }
  } else {
    console.warn('⚠️ Chưa có sản phẩm nào trong hệ thống. Vui lòng thêm sản phẩm trước.');
    availableProducts = [];
  }
}

// Load flash sales
function loadFlashSales() {
  const saved = localStorage.getItem('flashSales');
  if (saved) {
    flashSales = JSON.parse(saved);
  } else {
    // No demo data - start with empty list
    flashSales = [];
  }
  
  renderFlashSales();
}

// Render flash sales
function renderFlashSales() {
  const now = new Date();
  
  // Current flash sale
  const current = flashSales.find(fs => {
    const start = new Date(fs.startTime);
    const end = new Date(start.getTime() + fs.duration * 60 * 60 * 1000);
    return start <= now && end >= now;
  });
  
  renderCurrentFlashSale(current);
  
  // Upcoming flash sales
  const upcoming = flashSales.filter(fs => new Date(fs.startTime) > now);
  renderUpcomingFlashSales(upcoming);
  
  // Past flash sales
  const past = flashSales.filter(fs => {
    const start = new Date(fs.startTime);
    const end = new Date(start.getTime() + fs.duration * 60 * 60 * 1000);
    return end < now;
  });
  renderPastFlashSales(past);
}

// Render current flash sale
function renderCurrentFlashSale(flashSale) {
  const container = document.getElementById('currentFlashSale');
  
  if (!flashSale) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa fa-bolt"></i>
        <h3>Không có Flash Sale nào đang diễn ra</h3>
        <p>Tạo Flash Sale mới để thu hút khách hàng</p>
        <button class="btn-primary" onclick="openFlashSaleModal()">
          <i class="fa fa-plus"></i> Tạo Flash Sale
        </button>
      </div>
    `;
    return;
  }
  
  const start = new Date(flashSale.startTime);
  const end = new Date(start.getTime() + flashSale.duration * 60 * 60 * 1000);
  
  container.innerHTML = `
    <div class="flash-sale-header">
      <div class="flash-sale-title">
        <h2>⚡ ${flashSale.name}</h2>
        <div class="flash-sale-time">
          ${formatDateTime(flashSale.startTime)} - ${formatTime(end)}
        </div>
      </div>
      <div class="flash-sale-status">
        <i class="fa fa-circle"></i>
        Đang diễn ra
      </div>
    </div>
    
    <div class="countdown-timer" id="countdown-${flashSale.id}">
      <div class="countdown-item">
        <span class="countdown-value" data-hours>00</span>
        <span class="countdown-label">Giờ</span>
      </div>
      <div class="countdown-item">
        <span class="countdown-value" data-minutes>00</span>
        <span class="countdown-label">Phút</span>
      </div>
      <div class="countdown-item">
        <span class="countdown-value" data-seconds>00</span>
        <span class="countdown-label">Giây</span>
      </div>
    </div>
    
    <div class="flash-sale-products">
      ${flashSale.products.map(product => `
        <div class="flash-product-card">
          <img src="${product.image}" alt="${product.name}" class="flash-product-image">
          <div class="flash-product-name">${product.name}</div>
          <div class="flash-product-discount">-${product.discount}%</div>
        </div>
      `).join('')}
    </div>
  `;
  
  updateCountdown(flashSale.id, end);
}

// Render upcoming flash sales
function renderUpcomingFlashSales(flashSales) {
  const container = document.getElementById('upcomingFlashSales');
  
  if (flashSales.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa fa-calendar"></i>
        <h3>Chưa có Flash Sale sắp diễn ra</h3>
        <p>Lên lịch Flash Sale để chuẩn bị trước</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = flashSales.map(fs => renderFlashSaleCard(fs, 'upcoming')).join('');
}

// Render past flash sales
function renderPastFlashSales(flashSales) {
  const container = document.getElementById('pastFlashSales');
  
  if (flashSales.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa fa-history"></i>
        <h3>Chưa có Flash Sale nào kết thúc</h3>
      </div>
    `;
    return;
  }
  
  container.innerHTML = flashSales.map(fs => renderFlashSaleCard(fs, 'past')).join('');
}

// Render flash sale card
function renderFlashSaleCard(flashSale, type) {
  const start = new Date(flashSale.startTime);
  const end = new Date(start.getTime() + flashSale.duration * 60 * 60 * 1000);
  
  return `
    <div class="flash-sale-card ${type}">
      <div class="flash-card-header">
        <h3>${flashSale.name}</h3>
        <div class="flash-card-time">
          <i class="fa fa-clock"></i>
          ${formatDateTime(flashSale.startTime)} - ${formatTime(end)}
        </div>
      </div>
      <div class="flash-card-body">
        <div class="flash-card-info">
          <div class="flash-info-item">
            <i class="fa fa-hourglass-half"></i>
            <span>Thời lượng: <strong>${flashSale.duration} giờ</strong></span>
          </div>
          <div class="flash-info-item">
            <i class="fa fa-box"></i>
            <span>Sản phẩm: <strong>${flashSale.products.length}</strong></span>
          </div>
          <div class="flash-info-item">
            <i class="fa fa-tag"></i>
            <span>Giảm: <strong>${Math.max(...flashSale.products.map(p => p.discount))}%</strong></span>
          </div>
        </div>
        <div class="flash-card-actions">
          <button class="btn-flash-action view" onclick="viewFlashSale(${flashSale.id})" title="Xem chi tiết">
            <i class="fa fa-eye"></i> Xem
          </button>
          ${type === 'upcoming' ? `
            <button class="btn-flash-action edit" onclick="editFlashSale(${flashSale.id})" title="Chỉnh sửa">
              <i class="fa fa-edit"></i> Sửa
            </button>
          ` : ''}
          <button class="btn-flash-action delete" onclick="deleteFlashSale(${flashSale.id})" title="Xóa">
            <i class="fa fa-trash"></i> Xóa
          </button>
        </div>
      </div>
    </div>
  `;
}

// Update countdown
function updateCountdown(flashSaleId, endTime) {
  const countdownEl = document.getElementById(`countdown-${flashSaleId}`);
  if (!countdownEl) return;
  
  const interval = setInterval(() => {
    const now = new Date();
    const diff = endTime - now;
    
    if (diff <= 0) {
      clearInterval(interval);
      renderFlashSales();
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    const hoursEl = countdownEl.querySelector('[data-hours]');
    const minutesEl = countdownEl.querySelector('[data-minutes]');
    const secondsEl = countdownEl.querySelector('[data-seconds]');
    
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }, 1000);
}

// Start countdown updates
function startCountdownUpdates() {
  setInterval(() => {
    const now = new Date();
    flashSales.forEach(fs => {
      const start = new Date(fs.startTime);
      const end = new Date(start.getTime() + fs.duration * 60 * 60 * 1000);
      if (start <= now && end >= now) {
        updateCountdown(fs.id, end);
      }
    });
  }, 1000);
}

// Setup form handler
function setupFormHandler() {
  const form = document.getElementById('flashSaleForm');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const defaultDiscount = parseInt(document.getElementById('defaultDiscount').value) || 50;
    
    const formData = {
      name: document.getElementById('flashSaleName').value.trim(),
      startTime: document.getElementById('startTime').value,
      duration: parseInt(document.getElementById('duration').value),
      products: selectedProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        discount: parseInt(p.discount) || defaultDiscount
      })),
      showCountdown: document.getElementById('showCountdown').checked,
      notifyCustomers: document.getElementById('notifyCustomers').checked,
      status: 'upcoming'
    };
    
    console.log('📝 Form data:', formData);
    
    if (!formData.name) {
      showNotification('Vui lòng nhập tên Flash Sale', 'error');
      return;
    }
    
    if (!formData.startTime) {
      showNotification('Vui lòng chọn thời gian bắt đầu', 'error');
      return;
    }
    
    if (formData.products.length === 0) {
      showNotification('Vui lòng chọn ít nhất 1 sản phẩm', 'error');
      return;
    }
    
    if (editingFlashSaleId) {
      const index = flashSales.findIndex(f => f.id === editingFlashSaleId);
      if (index > -1) {
        flashSales[index] = { id: editingFlashSaleId, ...formData };
        showNotification('Đã cập nhật Flash Sale', 'success');
      }
    } else {
      const newId = flashSales.length > 0 ? Math.max(...flashSales.map(f => f.id)) + 1 : 1;
      flashSales.push({ id: newId, ...formData });
      console.log('✅ Đã thêm Flash Sale mới với ID:', newId);
      showNotification('Đã tạo Flash Sale mới', 'success');
    }
    
    saveFlashSales();
    console.log('💾 Đã lưu flashSales:', flashSales);
    renderFlashSales();
    closeFlashSaleModal();
  });
}

// Open modal
function openFlashSaleModal() {
  editingFlashSaleId = null;
  selectedProducts = [];
  document.getElementById('flashSaleForm').reset();
  
  // Set default start time to now (so flash sale starts immediately)
  const now = new Date();
  // Adjust for timezone offset to get local time in ISO format
  const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  document.getElementById('startTime').value = localISOTime;
  document.getElementById('defaultDiscount').value = 50;
  document.getElementById('showCountdown').checked = true;
  
  renderSelectedProducts();
  document.getElementById('flashSaleModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Edit flash sale
function editFlashSale(id) {
  const fs = flashSales.find(f => f.id === id);
  if (!fs) return;
  
  editingFlashSaleId = id;
  selectedProducts = [...fs.products];
  
  document.getElementById('flashSaleName').value = fs.name;
  document.getElementById('startTime').value = fs.startTime;
  document.getElementById('duration').value = fs.duration;
  document.getElementById('showCountdown').checked = fs.showCountdown;
  document.getElementById('notifyCustomers').checked = fs.notifyCustomers;
  
  renderSelectedProducts();
  document.getElementById('flashSaleModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// View flash sale
function viewFlashSale(id) {
  const fs = flashSales.find(f => f.id === id);
  if (!fs) return;
  
  const start = new Date(fs.startTime);
  const end = new Date(start.getTime() + fs.duration * 60 * 60 * 1000);
  const now = new Date();
  
  let status = 'Sắp diễn ra';
  let statusClass = 'upcoming';
  if (start <= now && end >= now) {
    status = 'Đang diễn ra';
    statusClass = 'active';
  } else if (end < now) {
    status = 'Đã kết thúc';
    statusClass = 'ended';
  }
  
  // Create detail modal HTML
  const detailHTML = `
    <div class="modal active" id="flashSaleDetailModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h3>⚡ Chi tiết Flash Sale</h3>
            <button class="modal-close" onclick="closeDetailModal()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="detail-header">
              <h2>${fs.name}</h2>
              <span class="detail-status ${statusClass}">${status}</span>
            </div>
            
            <div class="detail-info-grid">
              <div class="detail-info-item">
                <i class="fa fa-calendar"></i>
                <div>
                  <label>Thời gian bắt đầu</label>
                  <span>${formatDateTime(fs.startTime)}</span>
                </div>
              </div>
              <div class="detail-info-item">
                <i class="fa fa-clock"></i>
                <div>
                  <label>Thời gian kết thúc</label>
                  <span>${formatDateTime(end.toISOString())}</span>
                </div>
              </div>
              <div class="detail-info-item">
                <i class="fa fa-hourglass-half"></i>
                <div>
                  <label>Thời lượng</label>
                  <span>${fs.duration} giờ</span>
                </div>
              </div>
              <div class="detail-info-item">
                <i class="fa fa-box"></i>
                <div>
                  <label>Số sản phẩm</label>
                  <span>${fs.products.length} sản phẩm</span>
                </div>
              </div>
            </div>
            
            <div class="detail-products">
              <h4>Danh sách sản phẩm</h4>
              <div class="detail-products-grid">
                ${fs.products.map(product => {
                  const salePrice = Math.round(product.price * (1 - product.discount / 100));
                  return `
                    <div class="detail-product-card">
                      <img src="${product.image}" alt="${product.name}">
                      <div class="detail-product-info">
                        <h5>${product.name}</h5>
                        <div class="detail-product-prices">
                          <span class="sale-price">${formatPrice(salePrice)}</span>
                          <span class="original-price">${formatPrice(product.price)}</span>
                        </div>
                        <span class="discount-badge">-${product.discount}%</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
            
            <div class="detail-settings">
              <h4>Cài đặt</h4>
              <div class="detail-settings-list">
                <div class="setting-item">
                  <i class="fa fa-${fs.showCountdown ? 'check-circle text-success' : 'times-circle text-muted'}"></i>
                  <span>Hiển thị đếm ngược</span>
                </div>
                <div class="setting-item">
                  <i class="fa fa-${fs.notifyCustomers ? 'check-circle text-success' : 'times-circle text-muted'}"></i>
                  <span>Thông báo khách hàng</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" onclick="closeDetailModal()">Đóng</button>
            ${statusClass === 'upcoming' ? `<button class="btn-primary" onclick="closeDetailModal(); editFlashSale(${fs.id})"><i class="fa fa-edit"></i> Chỉnh sửa</button>` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remove existing detail modal if any
  const existingModal = document.getElementById('flashSaleDetailModal');
  if (existingModal) existingModal.remove();
  
  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', detailHTML);
  document.body.style.overflow = 'hidden';
}

// Close detail modal
function closeDetailModal() {
  const modal = document.getElementById('flashSaleDetailModal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

// Delete flash sale
function deleteFlashSale(id) {
  if (!confirm('Bạn có chắc muốn xóa Flash Sale này?')) return;
  
  flashSales = flashSales.filter(f => f.id !== id);
  saveFlashSales();
  renderFlashSales();
  showNotification('Đã xóa Flash Sale', 'success');
}

// Close modal
function closeFlashSaleModal() {
  document.getElementById('flashSaleModal').classList.remove('active');
  document.body.style.overflow = '';
  editingFlashSaleId = null;
  selectedProducts = [];
}

// Select products
function selectProducts() {
  renderProductList();
  document.getElementById('productSelectorModal').classList.add('active');
}

// Render product list
function renderProductList() {
  const list = document.getElementById('productList');
  
  if (availableProducts.length === 0) {
    list.innerHTML = `
      <div class="empty-product-list">
        <i class="fa fa-box-open"></i>
        <p>Chưa có sản phẩm nào trong hệ thống</p>
        <a href="products.html" class="btn-add-products">Thêm sản phẩm</a>
      </div>
    `;
    return;
  }
  
  list.innerHTML = availableProducts.map(product => {
    const isSelected = selectedProducts.some(p => p.id === product.id);
    return `
      <div class="product-list-item ${isSelected ? 'selected' : ''}" onclick="toggleProduct(${product.id})">
        <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleProduct(${product.id})">
        <img src="${product.image}" alt="${product.name}" class="product-list-image">
        <div class="product-list-info">
          <div class="product-list-name">${product.name}</div>
          <div class="product-list-price">${formatPrice(product.price)}</div>
        </div>
      </div>
    `;
  }).join('');
}

// Toggle product selection
function toggleProduct(productId) {
  const product = availableProducts.find(p => p.id === productId);
  if (!product) return;
  
  const index = selectedProducts.findIndex(p => p.id === productId);
  if (index > -1) {
    selectedProducts.splice(index, 1);
  } else {
    selectedProducts.push({ ...product, discount: 50 });
  }
  
  renderProductList();
}

// Confirm product selection
function confirmProductSelection() {
  renderSelectedProducts();
  closeProductSelector();
  showNotification(`Đã chọn ${selectedProducts.length} sản phẩm`, 'success');
}

// Close product selector
function closeProductSelector() {
  document.getElementById('productSelectorModal').classList.remove('active');
}

// Render selected products
function renderSelectedProducts() {
  const container = document.getElementById('selectedProducts');
  
  if (selectedProducts.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#9ca3af;padding:20px 0;">Chưa chọn sản phẩm nào</p>';
    return;
  }
  
  container.innerHTML = selectedProducts.map((product, index) => `
    <div class="selected-product-item">
      <img src="${product.image}" alt="${product.name}" class="selected-product-image">
      <div class="selected-product-info">
        <div class="selected-product-name">${product.name}</div>
        <div class="selected-product-discount">
          <span>Giảm:</span>
          <input type="number" value="${product.discount}" min="1" max="90" 
                 onchange="updateProductDiscount(${index}, this.value)">
          <span>%</span>
        </div>
      </div>
      <button type="button" class="btn-remove-product" onclick="removeProduct(${index})">
        <i class="fa fa-times"></i>
      </button>
    </div>
  `).join('');
}

// Update product discount
function updateProductDiscount(index, discount) {
  if (selectedProducts[index]) {
    selectedProducts[index].discount = parseInt(discount);
  }
}

// Remove product
function removeProduct(index) {
  selectedProducts.splice(index, 1);
  renderSelectedProducts();
}

// Save flash sales
function saveFlashSales() {
  localStorage.setItem('flashSales', JSON.stringify(flashSales));
}

// Helper functions
function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatTime(date) {
  return date.toLocaleTimeString('vi-VN', { 
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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

// Close modals on outside click
document.addEventListener('click', function(e) {
  const flashSaleModal = document.getElementById('flashSaleModal');
  const productModal = document.getElementById('productSelectorModal');
  
  if (e.target === flashSaleModal) closeFlashSaleModal();
  if (e.target === productModal) closeProductSelector();
});
