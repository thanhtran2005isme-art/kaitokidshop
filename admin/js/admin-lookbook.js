// Admin Lookbook Management

let lookbooks = [];
let products = [];
let selectedProductIds = [];

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
  loadLookbooks();
  loadProducts();
  renderLookbooks();
  updateStats();
});

// Load lookbooks from localStorage
function loadLookbooks() {
  const saved = localStorage.getItem('lookbooks');
  lookbooks = saved ? JSON.parse(saved) : [];
  // Don't auto-save empty array to avoid overwriting
}

// Save lookbooks to localStorage
function saveLookbooks() {
  localStorage.setItem('lookbooks', JSON.stringify(lookbooks));
}

// Load products from localStorage
function loadProducts() {
  const saved = localStorage.getItem('products');
  products = saved ? JSON.parse(saved) : [];
}



// Update stats
function updateStats() {
  document.getElementById('totalLookbooks').textContent = lookbooks.length;
  document.getElementById('activeLookbooks').textContent = lookbooks.filter(l => l.status === 'active').length;
  
  let totalProducts = 0;
  lookbooks.forEach(l => totalProducts += (l.products || []).length);
  document.getElementById('totalProducts').textContent = totalProducts;
}

// Render lookbooks grid
function renderLookbooks() {
  const grid = document.getElementById('lookbookGrid');
  
  if (lookbooks.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fa fa-images"></i>
        <h3>Chưa có Lookbook nào</h3>
        <p>Tạo lookbook đầu tiên để gợi ý outfit cho khách hàng</p>
        <button class="btn btn-primary" onclick="openAddModal()">
          <i class="fa fa-plus"></i> Thêm Lookbook
        </button>
      </div>
    `;
    return;
  }

  grid.innerHTML = lookbooks.map(lookbook => {
    const productCount = (lookbook.products || []).length;
    const totalPrice = calculateTotalPrice(lookbook.products || []);
    
    return `
      <div class="lookbook-card ${lookbook.status === 'inactive' ? 'inactive' : ''}">
        <div class="lookbook-image">
          <img src="${lookbook.image || '/images/placeholder.png'}" alt="${lookbook.name}" onerror="this.src='/images/placeholder.png'">
          <div class="lookbook-overlay">
            <button class="btn-icon" onclick="editLookbook(${lookbook.id})" title="Sửa">
              <i class="fa fa-edit"></i>
            </button>
            <button class="btn-icon btn-danger" onclick="deleteLookbook(${lookbook.id})" title="Xóa">
              <i class="fa fa-trash"></i>
            </button>
          </div>
          <span class="style-badge style-${lookbook.style}">${getStyleName(lookbook.style)}</span>
        </div>
        <div class="lookbook-info">
          <h3>${lookbook.name}</h3>
          <p>${lookbook.description || 'Chưa có mô tả'}</p>
          <div class="lookbook-meta">
            <span><i class="fa fa-box"></i> ${productCount} sản phẩm</span>
            <span><i class="fa fa-tag"></i> ${formatPrice(totalPrice)}</span>
          </div>
          <div class="lookbook-actions">
            <label class="toggle-switch">
              <input type="checkbox" ${lookbook.status === 'active' ? 'checked' : ''} onchange="toggleStatus(${lookbook.id})">
              <span class="toggle-slider"></span>
            </label>
            <span class="status-text">${lookbook.status === 'active' ? 'Hiển thị' : 'Ẩn'}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Get style name
function getStyleName(style) {
  const styles = {
    'office': 'Office Chic',
    'street': 'Street Style',
    'casual': 'Casual',
    'party': 'Party',
    'weekend': 'Weekend Chill',
    'sport': 'Sporty'
  };
  return styles[style] || style;
}

// Calculate total price
function calculateTotalPrice(productIds) {
  let total = 0;
  productIds.forEach(id => {
    const product = products.find(p => p.id === id);
    if (product) {
      total += product.salePrice || product.price || 0;
    }
  });
  return total;
}

// Format price
function formatPrice(price) {
  return price.toLocaleString('vi-VN') + '₫';
}

// Open add modal
function openAddModal() {
  document.getElementById('modalTitle').innerHTML = '<i class="fa fa-plus"></i> Thêm Lookbook mới';
  document.getElementById('lookbookForm').reset();
  document.getElementById('lookbookId').value = '';
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('uploadPlaceholder').style.display = 'flex';
  selectedProductIds = [];
  renderSelectedProducts();
  renderProductSelectGrid();
  document.getElementById('lookbookModal').classList.add('active');
}

// Edit lookbook
function editLookbook(id) {
  const lookbook = lookbooks.find(l => l.id === id);
  if (!lookbook) return;

  document.getElementById('modalTitle').innerHTML = '<i class="fa fa-edit"></i> Sửa Lookbook';
  document.getElementById('lookbookId').value = lookbook.id;
  document.getElementById('lookbookName').value = lookbook.name;
  document.getElementById('lookbookStyle').value = lookbook.style;
  document.getElementById('lookbookDesc').value = lookbook.description || '';
  document.getElementById('lookbookStatus').value = lookbook.status;
  
  // Image preview
  if (lookbook.image) {
    document.getElementById('imagePreview').src = lookbook.image;
    document.getElementById('imagePreview').style.display = 'block';
    document.getElementById('uploadPlaceholder').style.display = 'none';
  }
  
  selectedProductIds = [...(lookbook.products || [])];
  renderSelectedProducts();
  renderProductSelectGrid();
  
  document.getElementById('lookbookModal').classList.add('active');
}

// Close modal
function closeModal() {
  document.getElementById('lookbookModal').classList.remove('active');
}

// Preview image
function previewImage(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('imagePreview').src = e.target.result;
      document.getElementById('imagePreview').style.display = 'block';
      document.getElementById('uploadPlaceholder').style.display = 'none';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Render product select grid
function renderProductSelectGrid(searchTerm = '') {
  const grid = document.getElementById('productSelectGrid');
  
  let filteredProducts = products.filter(p => p.status === 'active');
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(term) ||
      (p.category && p.category.toLowerCase().includes(term))
    );
  }

  if (filteredProducts.length === 0) {
    grid.innerHTML = '<p class="empty-text">Không tìm thấy sản phẩm</p>';
    return;
  }

  grid.innerHTML = filteredProducts.slice(0, 20).map(product => {
    const isSelected = selectedProductIds.includes(product.id);
    const image = product.images?.[0] || product.image || '/images/placeholder.png';
    
    return `
      <div class="product-select-item ${isSelected ? 'selected' : ''}" onclick="toggleProduct(${product.id})">
        <img src="${image}" alt="${product.name}" onerror="this.src='/images/placeholder.png'">
        <div class="product-select-info">
          <span class="product-select-name">${product.name}</span>
          <span class="product-select-price">${formatPrice(product.salePrice || product.price)}</span>
        </div>
        <div class="product-select-check">
          <i class="fa ${isSelected ? 'fa-check-circle' : 'fa-circle'}"></i>
        </div>
      </div>
    `;
  }).join('');
}

// Search products
function searchProducts() {
  const term = document.getElementById('productSearch').value;
  renderProductSelectGrid(term);
}

// Toggle product selection
function toggleProduct(productId) {
  const index = selectedProductIds.indexOf(productId);
  if (index > -1) {
    selectedProductIds.splice(index, 1);
  } else {
    selectedProductIds.push(productId);
  }
  renderSelectedProducts();
  renderProductSelectGrid(document.getElementById('productSearch').value);
}

// Render selected products
function renderSelectedProducts() {
  const container = document.getElementById('selectedProducts');
  document.getElementById('selectedCount').textContent = selectedProductIds.length;
  
  if (selectedProductIds.length === 0) {
    container.innerHTML = '<p class="empty-text">Chưa chọn sản phẩm nào</p>';
    document.getElementById('totalPrice').value = '0₫';
    return;
  }

  let totalPrice = 0;
  container.innerHTML = selectedProductIds.map(id => {
    const product = products.find(p => p.id === id);
    if (!product) return '';
    
    const price = product.salePrice || product.price || 0;
    totalPrice += price;
    const image = product.images?.[0] || product.image || '/images/placeholder.png';
    
    return `
      <div class="selected-product-item">
        <img src="${image}" alt="${product.name}" onerror="this.src='/images/placeholder.png'">
        <div class="selected-product-info">
          <span class="selected-product-name">${product.name}</span>
          <span class="selected-product-price">${formatPrice(price)}</span>
        </div>
        <button class="btn-remove" onclick="toggleProduct(${product.id})">
          <i class="fa fa-times"></i>
        </button>
      </div>
    `;
  }).join('');

  document.getElementById('totalPrice').value = formatPrice(totalPrice);
}

// Save lookbook
function saveLookbook() {
  const id = document.getElementById('lookbookId').value;
  const name = document.getElementById('lookbookName').value.trim();
  const style = document.getElementById('lookbookStyle').value;
  const description = document.getElementById('lookbookDesc').value.trim();
  const status = document.getElementById('lookbookStatus').value;
  
  if (!name) {
    alert('Vui lòng nhập tên Lookbook');
    return;
  }

  // Get image
  let image = '';
  const imagePreview = document.getElementById('imagePreview');
  if (imagePreview.style.display !== 'none') {
    image = imagePreview.src;
  }

  const lookbookData = {
    name,
    style,
    description,
    image,
    products: selectedProductIds,
    status
  };

  if (id) {
    // Update existing
    const index = lookbooks.findIndex(l => l.id === parseInt(id));
    if (index > -1) {
      lookbooks[index] = { ...lookbooks[index], ...lookbookData };
    }
  } else {
    // Add new
    lookbookData.id = Date.now();
    lookbookData.createdAt = new Date().toISOString();
    lookbooks.push(lookbookData);
  }

  saveLookbooks();
  renderLookbooks();
  updateStats();
  closeModal();
  
  alert(id ? 'Đã cập nhật Lookbook!' : 'Đã thêm Lookbook mới!');
}

// Delete lookbook
function deleteLookbook(id) {
  if (!confirm('Bạn có chắc muốn xóa Lookbook này?')) return;
  
  lookbooks = lookbooks.filter(l => l.id !== id);
  saveLookbooks();
  renderLookbooks();
  updateStats();
}

// Toggle status
function toggleStatus(id) {
  const lookbook = lookbooks.find(l => l.id === id);
  if (lookbook) {
    lookbook.status = lookbook.status === 'active' ? 'inactive' : 'active';
    saveLookbooks();
    renderLookbooks();
    updateStats();
  }
}

// Export functions
window.openAddModal = openAddModal;
window.editLookbook = editLookbook;
window.closeModal = closeModal;
window.previewImage = previewImage;
window.searchProducts = searchProducts;
window.toggleProduct = toggleProduct;
window.saveLookbook = saveLookbook;
window.deleteLookbook = deleteLookbook;
window.toggleStatus = toggleStatus;
