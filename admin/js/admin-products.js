// Admin Products JavaScript

// Load products from localStorage or use sample data
function loadProducts() {
  const saved = localStorage.getItem('products');
  if (saved) {
    return JSON.parse(saved);
  }
  return getSampleProducts();
}

// Save products to localStorage
function saveProducts() {
  localStorage.setItem('products', JSON.stringify(products));
  console.log('✅ Saved', products.length, 'products to localStorage');
}

// Sample Products Data with enhanced properties
function getSampleProducts() {
  return [
    {
      id: 1,
      name: 'Đầm Voan Hoa D42512',
      category: 'Đầm',
      gender: 'Nữ',
      price: 531000,
      oldPrice: 699000,
      stock: 25,
      status: 'active',
      image: 'https://product.hstatic.net/200000182297/product/11_c821d51146e546cbaf8c605697cb7a74_1024x1024.jpg',
      description: 'Đầm voan hoa thiết kế dáng chữ A dài qua gối',
      sku: 'D42512',
      isNew: true,
      isSale: true,
      isBestSeller: true,
      rating: 4.8,
      soldCount: 156
    },
    {
      id: 2,
      name: 'Chân Váy Bút Chì Z42732',
      category: 'Váy',
      gender: 'Nữ',
      price: 499000,
      oldPrice: null,
      stock: 18,
      status: 'active',
      image: 'https://product.hstatic.net/200000182297/product/10_a9fa3f3e4a404f829f751073d9f56d43_1024x1024.jpg',
      description: 'Chân váy bút chì dài qua gối, tone màu đen trơn',
      sku: 'Z42732',
      isNew: true,
      isSale: false,
      isBestSeller: true,
      rating: 4.5,
      soldCount: 89
    },
    {
      id: 3,
      name: 'Đầm Ren Cổ Ngọc D42712',
      category: 'Đầm',
      gender: 'Nữ',
      price: 759000,
      oldPrice: 899000,
      stock: 12,
      status: 'active',
      image: 'https://product.hstatic.net/200000182297/product/10_47203835b0064b44ae1d651c98d0a77f_1024x1024.jpg',
      description: 'Đầm ren dáng chữ A, tay bồng, cổ đính ngọc',
      sku: 'D42712',
      isNew: false,
      isSale: true,
      isBestSeller: true,
      rating: 4.9,
      soldCount: 234
    },
    {
      id: 4,
      name: 'Chân Váy Midi Z42722',
      category: 'Váy',
      gender: 'Nữ',
      price: 599000,
      oldPrice: null,
      stock: 0,
      status: 'out-of-stock',
      image: 'https://product.hstatic.net/200000182297/product/5_7c48d76a561a40dfa59242943ecdcf06_1024x1024.jpg',
      description: 'Chân váy dáng chữ A, dài qua gối',
      sku: 'Z42722',
      isNew: false,
      isSale: false,
      isBestSeller: false,
      rating: 4.3,
      soldCount: 45
    }
  ];
}

// Categories
const categories = ['Áo', 'Quần', 'Váy', 'Đầm', 'Áo khoác', 'Phụ kiện'];

// Category data by menu (same as product-add.js)
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

// Current page
let currentPage = 1;
// Initialize products from localStorage
let products = loadProducts();
const itemsPerPage = 10;
let filteredProducts = [...products];

// Save initial data if first time
if (!localStorage.getItem('products')) {
  saveProducts();
  products = loadProducts(); // Reload after save
  filteredProducts = [...products];
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  products = loadProducts();
  loadCategories();
  renderProducts();
  setupEventListeners();
});

// Load Categories
function loadCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  const productCategory = document.getElementById('productCategory');
  
  categories.forEach(cat => {
    if (categoryFilter) {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    }
    
    if (productCategory) {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      productCategory.appendChild(option);
    }
  });
}

// Render Products
function renderProducts() {
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;

  if (filteredProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="loading-row">
          <i class="fa fa-inbox"></i> Không tìm thấy sản phẩm nào
        </td>
      </tr>
    `;
    return;
  }

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageProducts = filteredProducts.slice(start, end);

  tbody.innerHTML = pageProducts.map(product => `
    <tr>
      <td>
        <input type="checkbox" class="product-checkbox" data-id="${product.id}">
      </td>
      <td>
        <img src="${getProductImage(product)}" 
             alt="${product.name}" 
             class="product-img"
             onerror="this.src='/images/placeholder.png'; this.onerror=null;">
      </td>
      <td>
        <div class="product-name-cell">${product.name}</div>
        <span class="product-sku">SKU: ${product.sku}</span>
      </td>
      <td>${product.category}</td>
      <td>
        <strong>${formatCurrency(product.price)}</strong>
        ${product.oldPrice ? `<br><del style="color: #999; font-size: 12px;">${formatCurrency(product.oldPrice)}</del>` : ''}
      </td>
      <td>
        <span style="color: ${product.stock > 10 ? '#059669' : product.stock > 0 ? '#d97706' : '#dc2626'}">
          ${product.stock}
        </span>
      </td>
      <td>
        <span class="status-badge ${product.status}">
          <i class="fa fa-circle"></i>
          ${getStatusText(product.status)}
        </span>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" onclick="editProduct(${product.id})" title="Sửa">
            <i class="fa fa-edit"></i>
          </button>
          <button class="btn-action btn-delete" onclick="deleteProduct(${product.id})" title="Xóa">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  updateTableInfo();
  renderPagination();
}

// Get Status Text
function getStatusText(status) {
  const statusMap = {
    'active': 'Đang bán',
    'inactive': 'Ngừng bán',
    'out-of-stock': 'Hết hàng'
  };
  return statusMap[status] || status;
}

// Get Product Image (support both single image and images array)
function getProductImage(product) {
  // If product has images array (from new product-add form)
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  // If product has single image (from old format or sample data)
  if (product.image) {
    return product.image;
  }
  // Fallback to placeholder
  return '/images/placeholder.png';
}

// Update Table Info
function updateTableInfo() {
  const showingCount = document.getElementById('showingCount');
  const totalCount = document.getElementById('totalCount');
  
  if (showingCount) {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, filteredProducts.length);
    showingCount.textContent = `${start}-${end}`;
  }
  
  if (totalCount) {
    totalCount.textContent = filteredProducts.length;
  }
}

// Render Pagination
function renderPagination() {
  const pagination = document.getElementById('pagination');
  if (!pagination) return;

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  let html = '';
  
  // Previous button
  html += `
    <button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
      <i class="fa fa-chevron-left"></i>
    </button>
  `;
  
  // Page numbers
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
  
  // Next button
  html += `
    <button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
      <i class="fa fa-chevron-right"></i>
    </button>
  `;
  
  pagination.innerHTML = html;
}

// Change Page
function changePage(page) {
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  if (page < 1 || page > totalPages) return;
  
  currentPage = page;
  renderProducts();
}

// Setup Event Listeners
function setupEventListeners() {
  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.sku.toLowerCase().includes(query)
      );
      currentPage = 1;
      renderProducts();
    });
  }

  // Category Filter
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilters);
  }

  // Status Filter
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', applyFilters);
  }

  // Image Preview
  const productImage = document.getElementById('productImage');
  if (productImage) {
    productImage.addEventListener('input', (e) => {
      const preview = document.getElementById('imagePreview');
      const url = e.target.value;
      
      if (url) {
        preview.innerHTML = `<img src="${url}" alt="Preview" onerror="this.src='https://via.placeholder.com/200'">`;
        preview.classList.add('active');
      } else {
        preview.classList.remove('active');
      }
    });
  }

  // Product Form
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', handleProductSubmit);
  }

  // Menu change - update category dropdown
  const productMenu = document.getElementById('productMenu');
  if (productMenu) {
    productMenu.addEventListener('change', function() {
      updateCategoryDropdown(this.value);
    });
  }
}

// Update category dropdown based on selected menu
function updateCategoryDropdown(selectedMenu, selectedCategory = '') {
  const categorySelect = document.getElementById('productCategory');
  
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
        if (item === selectedCategory) {
          option.selected = true;
        }
        optgroup.appendChild(option);
      });
      
      categorySelect.appendChild(optgroup);
    }
  } else {
    categorySelect.disabled = true;
    categorySelect.innerHTML = '<option value="">Chọn menu trước</option>';
  }
}

// Apply Filters
function applyFilters() {
  const categoryFilter = document.getElementById('categoryFilter').value;
  const statusFilter = document.getElementById('statusFilter').value;
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();

  filteredProducts = products.filter(p => {
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    const matchStatus = !statusFilter || p.status === statusFilter;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery) || p.sku.toLowerCase().includes(searchQuery);
    
    return matchCategory && matchStatus && matchSearch;
  });

  currentPage = 1;
  renderProducts();
}

// Reset Filters
function resetFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('categoryFilter').value = '';
  document.getElementById('statusFilter').value = '';
  
  filteredProducts = [...products];
  currentPage = 1;
  renderProducts();
}

// Open Product Modal
function openProductModal(productId = null) {
  const modal = document.getElementById('productModal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('productForm');
  
  form.reset();
  document.getElementById('imagePreview').classList.remove('active');
  document.getElementById('productCategory').disabled = true;
  document.getElementById('productCategory').innerHTML = '<option value="">Chọn menu trước</option>';
  
  if (productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
      modalTitle.textContent = 'Sửa sản phẩm';
      document.getElementById('productId').value = product.id;
      document.getElementById('productName').value = product.name;
      
      // Set menu and update category dropdown
      const menu = product.menu || getMenuFromGender(product.gender);
      document.getElementById('productMenu').value = menu;
      updateCategoryDropdown(menu, product.category);
      
      document.getElementById('productPrice').value = product.price;
      document.getElementById('productOldPrice').value = product.oldPrice || product.salePrice || '';
      document.getElementById('productStock').value = product.stock;
      document.getElementById('productStatus').value = product.status;
      
      // Get image URL (support both formats)
      const imageUrl = product.images && product.images.length > 0 ? product.images[0] : product.image;
      document.getElementById('productImage').value = imageUrl || '';
      document.getElementById('productDescription').value = product.description || product.shortDesc || '';
      
      // Trigger image preview
      if (imageUrl) {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
        preview.classList.add('active');
      }
      
    }
  } else {
    modalTitle.textContent = 'Thêm sản phẩm mới';
    document.getElementById('productMenu').value = '';
  }
  
  modal.classList.add('active');
}

// Get menu from gender (for old format products)
function getMenuFromGender(gender) {
  if (gender === 'Nữ') return 'nu';
  if (gender === 'Nam') return 'nam';
  if (gender === 'Trẻ em') return 'treem';
  return '';
}

// Close Product Modal
function closeProductModal() {
  const modal = document.getElementById('productModal');
  modal.classList.remove('active');
}

// Edit Product
function editProduct(id) {
  openProductModal(id);
}

// Delete Product
function deleteProduct(id) {
  if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
    products = products.filter(p => p.id !== id);
    filteredProducts = filteredProducts.filter(p => p.id !== id);
    saveProducts(); // Save to localStorage
    renderProducts();
    showNotification('Đã xóa sản phẩm thành công!', 'success');
  }
}

// Handle Product Submit
function handleProductSubmit(e) {
  e.preventDefault();
  
  const productId = document.getElementById('productId').value;
  const menu = document.getElementById('productMenu').value;
  const imageUrl = document.getElementById('productImage').value;
  
  const productData = {
    name: document.getElementById('productName').value,
    menu: menu,
    category: document.getElementById('productCategory').value,
    price: parseInt(document.getElementById('productPrice').value),
    oldPrice: parseInt(document.getElementById('productOldPrice').value) || null,
    stock: parseInt(document.getElementById('productStock').value),
    status: document.getElementById('productStatus').value,
    image: imageUrl,
    images: [imageUrl], // Also save as array for compatibility
    description: document.getElementById('productDescription').value
  };

  // Auto determine isSale based on oldPrice
  const hasOldPrice = productData.oldPrice && productData.oldPrice > 0;

  if (productId) {
    // Update existing product
    const index = products.findIndex(p => p.id === parseInt(productId));
    if (index !== -1) {
      products[index] = { 
        ...products[index], 
        ...productData,
        isSale: hasOldPrice // Auto set isSale if has oldPrice
      };
      console.log('Updated product:', products[index]);
      showNotification('Đã cập nhật sản phẩm thành công!', 'success');
    }
  } else {
    // Add new product - automatically isNew = true
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      sku: 'SP' + Date.now(),
      ...productData,
      isNew: true, // New products are always marked as new
      isSale: hasOldPrice, // Auto set isSale if has oldPrice
      isBestSeller: false,
      rating: 5,
      soldCount: 0
    };
    products.push(newProduct);
    console.log('Added new product:', newProduct);
    showNotification('Đã thêm sản phẩm thành công!', 'success');
  }

  // Save to localStorage
  saveProducts();
  
  // Update filtered products
  filteredProducts = [...products];
  
  closeProductModal();
  renderProducts();
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  const modal = document.getElementById('productModal');
  if (e.target === modal) {
    closeProductModal();
  }
});
