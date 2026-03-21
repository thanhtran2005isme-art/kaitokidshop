// Homepage Sections Management

// Section data - stores selected product IDs for each section
let homepageSections = {
  newArrivals: [],
  saleProducts: [],
  bestSellers: []
};

let currentSection = null;
let tempSelectedProducts = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadHomepageSections();
  renderAllSections();
  setupSearch();
});

// Load sections from localStorage
function loadHomepageSections() {
  const saved = localStorage.getItem('homepageSections');
  if (saved) {
    homepageSections = JSON.parse(saved);
  }
}

// Save sections to localStorage
function saveHomepageSections() {
  localStorage.setItem('homepageSections', JSON.stringify(homepageSections));
}

// Get all products from localStorage
function getAllProducts() {
  const saved = localStorage.getItem('products');
  return saved ? JSON.parse(saved) : [];
}

// Get product image
function getProductImage(product) {
  if (product.images && product.images.length > 0) return product.images[0];
  if (product.image) return product.image;
  return '/images/placeholder.png';
}

// Format price
function formatPrice(price) {
  return price.toLocaleString('vi-VN') + '₫';
}

// Render all sections
function renderAllSections() {
  renderSection('newArrivals');
  renderSection('saleProducts');
  renderSection('bestSellers');
}

// Render a single section
function renderSection(sectionKey) {
  const container = document.getElementById(`${sectionKey}-products`);
  if (!container) return;

  const productIds = homepageSections[sectionKey] || [];
  const allProducts = getAllProducts();

  if (productIds.length === 0) {
    container.innerHTML = '<p class="empty-text">Chưa có sản phẩm nào được chọn</p>';
    return;
  }

  const products = productIds
    .map(id => allProducts.find(p => p.id === id))
    .filter(p => p);

  if (products.length === 0) {
    container.innerHTML = '<p class="empty-text">Chưa có sản phẩm nào được chọn</p>';
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="product-item">
      <button class="remove-btn" onclick="removeProduct('${sectionKey}', ${product.id})">
        <i class="fa fa-times"></i>
      </button>
      <img src="${getProductImage(product)}" alt="${product.name}" onerror="this.src='/images/placeholder.png'">
      <h4>${product.name}</h4>
      <span class="price">${formatPrice(product.salePrice || product.price)}</span>
    </div>
  `).join('');
}

// Remove product from section
function removeProduct(sectionKey, productId) {
  homepageSections[sectionKey] = homepageSections[sectionKey].filter(id => id !== productId);
  saveHomepageSections();
  renderSection(sectionKey);
  showNotification('Đã xóa sản phẩm khỏi section', 'success');
}

// Open product picker modal
function openProductPicker(sectionKey) {
  currentSection = sectionKey;
  tempSelectedProducts = [...(homepageSections[sectionKey] || [])];

  const titles = {
    newArrivals: 'Chọn sản phẩm cho NEW ARRIVALS',
    saleProducts: 'Chọn sản phẩm cho ĐANG GIẢM GIÁ',
    bestSellers: 'Chọn sản phẩm cho BEST SELLERS'
  };

  document.getElementById('pickerTitle').textContent = titles[sectionKey];
  renderPickerProducts();
  document.getElementById('productPickerModal').classList.add('active');
}

// Close product picker modal
function closeProductPicker() {
  document.getElementById('productPickerModal').classList.remove('active');
  currentSection = null;
  tempSelectedProducts = [];
}

// Render products in picker
function renderPickerProducts(searchQuery = '') {
  const container = document.getElementById('pickerProducts');
  let products = getAllProducts().filter(p => p.status === 'active');

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    products = products.filter(p => p.name.toLowerCase().includes(query));
  }

  if (products.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#6b7280;padding:40px;">Không tìm thấy sản phẩm</p>';
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="picker-item ${tempSelectedProducts.includes(product.id) ? 'selected' : ''}" 
         onclick="toggleProductSelection(${product.id})">
      <img src="${getProductImage(product)}" alt="${product.name}" onerror="this.src='/images/placeholder.png'">
      <h4>${product.name}</h4>
      <span class="price">${formatPrice(product.salePrice || product.price)}</span>
    </div>
  `).join('');
}

// Toggle product selection
function toggleProductSelection(productId) {
  const index = tempSelectedProducts.indexOf(productId);
  if (index > -1) {
    tempSelectedProducts.splice(index, 1);
  } else {
    tempSelectedProducts.push(productId);
  }
  renderPickerProducts(document.getElementById('pickerSearch').value);
}

// Save selected products
function saveSelectedProducts() {
  if (!currentSection) return;

  homepageSections[currentSection] = [...tempSelectedProducts];
  saveHomepageSections();
  renderSection(currentSection);
  closeProductPicker();
  showNotification('Đã lưu sản phẩm thành công!', 'success');
}

// Setup search
function setupSearch() {
  const searchInput = document.getElementById('pickerSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderPickerProducts(e.target.value);
    });
  }
}

// Notification
function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `notification-toast ${type}`;
  notification.innerHTML = `
    <i class="fa fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
