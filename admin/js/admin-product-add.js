// Product Add Management
let selectedImages = [];
let selectedSizes = [];
let selectedColors = [];
let variantInventory = {}; // {size_color: quantity}

// Category data by menu
const categoryData = {
  nu: {
    'Áo': ['Áo thun', 'Áo sơ mi', 'Áo kiểu', 'Áo len', 'Áo polo'],
    'Quần': ['Quần jeans', 'Quần tây', 'Quần short', 'Quần kaki', 'Quần legging'],
    'Váy & Đầm': ['Váy midi', 'Váy maxi', 'Đầm công sở', 'Đầm dự tiệc', 'Đầm suông'],
    'Outerwear': ['Áo khoác blazer', 'Áo khoác dạ', 'Áo khoác jean', 'Áo khoác bomber', 'Áo cardigan'],
    'Phong cách': ['Đồ công sở', 'Đồ basic', 'Đồ dự tiệc', 'Đồ thể thao', 'Đồ mặc nhà']
  },
  nam: {
    'Áo': ['Áo thun', 'Áo sơ mi', 'Áo polo', 'Áo len', 'Áo hoodie'],
    'Quần': ['Quần jeans', 'Quần tây', 'Quần short', 'Quần kaki', 'Quần jogger'],
    'Outerwear': ['Áo khoác blazer', 'Áo khoác dạ', 'Áo khoác jean', 'Áo khoác bomber', 'Áo khoác gió'],
    'Phụ kiện': ['Cà vạt', 'Thắt lưng', 'Ví', 'Túi xách', 'Mũ nón'],
    'Phong cách': ['Đồ công sở', 'Đồ basic', 'Đồ thể thao', 'Đồ streetwear', 'Đồ mặc nhà']
  },
  treem: {
    'Bé gái': ['Áo bé gái', 'Quần bé gái', 'Váy đầm', 'Đồ bộ bé gái', 'Áo khoác bé gái'],
    'Bé trai': ['Áo bé trai', 'Quần bé trai', 'Đồ bộ bé trai', 'Áo khoác bé trai', 'Đồ thể thao'],
    'Theo độ tuổi': ['0-2 tuổi', '3-5 tuổi', '6-8 tuổi', '9-12 tuổi', '13-16 tuổi']
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  setupImageUpload();
  setupImageTabs();
  setupPriceCalculation();
  setupColorPicker();
  setupSizeSelection();
  setupStockMonitor();
  setupSlugGeneration();
  setupMenuCategorySelection();
});

// Image Tabs (Upload / URL)
function setupImageTabs() {
  const tabs = document.querySelectorAll('.image-tab');
  const uploadBox = document.getElementById('imageUploadBox');
  const urlBox = document.getElementById('imageUrlBox');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      // Add active to clicked tab
      this.classList.add('active');
      
      const tabType = this.dataset.tab;
      
      if (tabType === 'upload') {
        uploadBox.style.display = 'flex';
        urlBox.style.display = 'none';
      } else {
        uploadBox.style.display = 'none';
        urlBox.style.display = 'block';
      }
    });
  });
}

// Add image from URL
function addImageFromUrl() {
  const urlInput = document.getElementById('imageUrlInput');
  const url = urlInput.value.trim();
  
  if (!url) {
    showNotification('Vui lòng nhập URL hình ảnh', 'error');
    return;
  }
  
  // Validate URL format
  if (!url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i) && !url.match(/^https?:\/\/.+/i)) {
    showNotification('URL không hợp lệ', 'error');
    return;
  }
  
  // Test if image loads
  const testImg = new Image();
  testImg.onload = function() {
    selectedImages.push({
      file: null,
      url: url,
      isUrl: true
    });
    renderImagePreviews();
    urlInput.value = '';
    showNotification('Đã thêm hình ảnh từ URL', 'success');
  };
  testImg.onerror = function() {
    showNotification('Không thể tải hình ảnh từ URL này', 'error');
  };
  testImg.src = url;
}

// Menu & Category Selection
function setupMenuCategorySelection() {
  const menuSelect = document.getElementById('productMenu');
  const categorySelect = document.getElementById('productCategory');
  
  menuSelect.addEventListener('change', function() {
    const selectedMenu = this.value;
    
    // Reset category
    categorySelect.innerHTML = '<option value="">Chọn danh mục</option>';
    
    if (selectedMenu && categoryData[selectedMenu]) {
      categorySelect.disabled = false;
      
      const categories = categoryData[selectedMenu];
      
      for (const [groupName, items] of Object.entries(categories)) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = groupName;
        
        items.forEach(item => {
          const option = document.createElement('option');
          option.value = item;
          option.textContent = item;
          optgroup.appendChild(option);
        });
        
        categorySelect.appendChild(optgroup);
      }
    } else {
      categorySelect.disabled = true;
      categorySelect.innerHTML = '<option value="">Chọn menu trước</option>';
    }
  });
}

// Image Upload
function setupImageUpload() {
  const uploadBox = document.getElementById('imageUploadBox');
  const imageInput = document.getElementById('imageInput');
  
  uploadBox.addEventListener('click', () => imageInput.click());
  
  imageInput.addEventListener('change', function(e) {
    handleImageUpload(e.target.files);
  });
  
  // Drag and drop
  uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#667eea';
  });
  
  uploadBox.addEventListener('dragleave', () => {
    uploadBox.style.borderColor = '#d1d5db';
  });
  
  uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#d1d5db';
    handleImageUpload(e.dataTransfer.files);
  });
}

function handleImageUpload(files) {
  Array.from(files).forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        selectedImages.push({
          file: file,
          url: e.target.result
        });
        renderImagePreviews();
      };
      reader.readAsDataURL(file);
    }
  });
}

function renderImagePreviews() {
  const grid = document.getElementById('imagePreviewGrid');
  grid.innerHTML = selectedImages.map((img, index) => `
    <div class="image-preview-item">
      <img src="${img.url}" alt="Preview ${index + 1}">
      <button class="image-preview-remove" onclick="removeImage(${index})">
        <i class="fa fa-times"></i>
      </button>
    </div>
  `).join('');
}

function removeImage(index) {
  selectedImages.splice(index, 1);
  renderImagePreviews();
}

// Price Calculation
function setupPriceCalculation() {
  const priceInput = document.getElementById('productPrice');
  const salePriceInput = document.getElementById('productSalePrice');
  
  salePriceInput.addEventListener('input', calculateDiscount);
  priceInput.addEventListener('input', calculateDiscount);
}

function calculateDiscount() {
  const price = parseFloat(document.getElementById('productPrice').value) || 0;
  const salePrice = parseFloat(document.getElementById('productSalePrice').value) || 0;
  
  const preview = document.getElementById('discountPreview');
  
  if (salePrice > 0 && salePrice < price) {
    const discount = Math.round(((price - salePrice) / price) * 100);
    document.getElementById('discountPercent').textContent = discount + '%';
    preview.style.display = 'flex';
  } else {
    preview.style.display = 'none';
  }
}

// Color Picker
function setupColorPicker() {
  const colorBtns = document.querySelectorAll('.color-btn');
  
  colorBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      this.classList.toggle('active');
      const color = this.dataset.color;
      
      if (this.classList.contains('active')) {
        selectedColors.push(color);
      } else {
        selectedColors = selectedColors.filter(c => c !== color);
      }
      
      // Update variant inventory table
      renderVariantInventoryTable();
      console.log('Selected colors:', selectedColors);
    });
  });
}

// Size Selection with Variant Inventory
function setupSizeSelection() {
  const sizeCheckboxes = document.querySelectorAll('input[name="size"]');
  
  sizeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const size = this.value;
      
      if (this.checked) {
        if (!selectedSizes.includes(size)) {
          selectedSizes.push(size);
        }
      } else {
        selectedSizes = selectedSizes.filter(s => s !== size);
        // Remove related inventory entries
        Object.keys(variantInventory).forEach(key => {
          if (key.startsWith(size + '_')) {
            delete variantInventory[key];
          }
        });
      }
      
      // Sort sizes
      const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
      selectedSizes.sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));
      
      // Update variant inventory table
      renderVariantInventoryTable();
      console.log('Selected sizes:', selectedSizes);
    });
  });
}

// Render variant summary (Size x Color - no quantity input, managed in inventory page)
function renderVariantInventoryTable() {
  const container = document.getElementById('sizeQuantityContainer');
  
  // If no sizes or colors selected, show message
  if (selectedSizes.length === 0 && selectedColors.length === 0) {
    container.innerHTML = `
      <div class="variant-hint">
        <i class="fa fa-info-circle"></i>
        <span>Chọn kích thước và màu sắc cho sản phẩm</span>
      </div>
    `;
    return;
  }
  
  // Build summary display
  let summaryHTML = `
    <div class="variant-summary">
      <div class="variant-summary-header">
        <i class="fa fa-tags"></i>
        <span>Biến thể sản phẩm</span>
      </div>
      <div class="variant-summary-content">
  `;
  
  if (selectedSizes.length > 0) {
    summaryHTML += `
      <div class="variant-group">
        <label>Kích thước đã chọn:</label>
        <div class="variant-tags">
          ${selectedSizes.map(size => `<span class="variant-tag size-tag">${size}</span>`).join('')}
        </div>
      </div>
    `;
  }
  
  if (selectedColors.length > 0) {
    summaryHTML += `
      <div class="variant-group">
        <label>Màu sắc đã chọn:</label>
        <div class="variant-tags">
          ${selectedColors.map(color => `<span class="variant-tag color-tag">${getColorShortName(color)} ${color}</span>`).join('')}
        </div>
      </div>
    `;
  }
  
  if (selectedSizes.length > 0 && selectedColors.length > 0) {
    const totalVariants = selectedSizes.length * selectedColors.length;
    summaryHTML += `
      <div class="variant-count">
        <i class="fa fa-cubes"></i>
        <span>Tổng số biến thể: <strong>${totalVariants}</strong></span>
      </div>
      <div class="variant-note">
        <i class="fa fa-info-circle"></i>
        <span>Số lượng tồn kho sẽ được quản lý tại <a href="inventory.html">Kho hàng</a></span>
      </div>
    `;
  }
  
  summaryHTML += `</div></div>`;
  
  container.innerHTML = summaryHTML;
}

// Get short color name/emoji
function getColorShortName(color) {
  const colorMap = {
    'Trắng': '⚪',
    'Đen': '⚫',
    'Xám': '🔘',
    'Xanh navy': '🔵',
    'Xanh dương': '💙',
    'Đỏ': '🔴',
    'Hồng': '💗',
    'Vàng': '💛'
  };
  return colorMap[color] || '🔵';
}

// Stock Monitor (simplified - stock managed in inventory page)
function setupStockMonitor() {
  // Stock will be managed in inventory page
  // This is just for initial stock when creating product
}

// Slug Generation
function setupSlugGeneration() {
  const nameInput = document.getElementById('productName');
  const slugInput = document.getElementById('productSlug');
  
  nameInput.addEventListener('input', function() {
    if (!slugInput.value) {
      slugInput.value = generateSlug(this.value);
    }
  });
}

function generateSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Save Product
function saveProduct() {
  const form = document.getElementById('productForm');
  
  // Validate
  const name = document.getElementById('productName').value.trim();
  const price = document.getElementById('productPrice').value;
  const category = document.getElementById('productCategory').value;
  
  if (!name) {
    showNotification('Vui lòng nhập tên sản phẩm', 'error');
    return;
  }
  
  if (!price || price <= 0) {
    showNotification('Vui lòng nhập giá sản phẩm hợp lệ', 'error');
    return;
  }
  
  if (!category) {
    showNotification('Vui lòng chọn danh mục', 'error');
    return;
  }
  
  if (selectedImages.length === 0) {
    showNotification('Vui lòng tải lên ít nhất 1 hình ảnh', 'error');
    return;
  }
  
  // Get menu value
  const menu = document.getElementById('productMenu').value;
  
  if (!menu) {
    showNotification('Vui lòng chọn menu', 'error');
    return;
  }
  
  // Collect data
  const productData = {
    name: name,
    shortDesc: document.getElementById('productShortDesc').value,
    description: document.getElementById('productDesc').value,
    price: parseFloat(price),
    salePrice: parseFloat(document.getElementById('productSalePrice').value) || null,
    menu: menu,
    category: category,
    collection: document.getElementById('productCollection').value,
    status: document.getElementById('productStatus').value,
    featured: false,
    isNew: true, // New products are always marked as new
    isSale: parseFloat(document.getElementById('productSalePrice').value) > 0, // Auto set if has sale price
    sku: document.getElementById('productSKU').value || generateSKU(),
    stock: 0, // Stock will be managed in inventory page
    slug: document.getElementById('productSlug').value || generateSlug(name),
    metaTitle: document.getElementById('productMetaTitle').value,
    metaDesc: document.getElementById('productMetaDesc').value,
    sizes: selectedSizes,
    colors: selectedColors,
    images: selectedImages.map(img => img.url),
    variants: {}, // Variants quantity managed in inventory page
    totalStock: 0
  };
  
  console.log('Product data:', productData);
  
  // Save to localStorage (demo)
  let products = JSON.parse(localStorage.getItem('products') || '[]');
  productData.id = Date.now();
  products.push(productData);
  localStorage.setItem('products', JSON.stringify(products));
  
  showNotification('Đã thêm sản phẩm thành công!', 'success');
  
  // Redirect after 1.5s
  setTimeout(() => {
    window.location.href = 'products.html';
  }, 1500);
}

// Generate SKU
function generateSKU() {
  const prefix = 'SP';
  const timestamp = Date.now().toString().slice(-6);
  return prefix + timestamp;
}

// Notification
function showNotification(message, type = 'info') {
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification-toast ${type}`;
  notification.innerHTML = `
    <i class="fa fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
