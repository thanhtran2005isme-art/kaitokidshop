// Categories Management System - Simplified
// ============================================================
// HỆ THỐNG QUẢN LÝ DANH MỤC SẢN PHẨM
// Sử dụng localStorage để lưu trữ dữ liệu
// ============================================================

let categories = [];           // Mảng chứa danh sách danh mục
let editingCategoryId = null;  // ID danh mục đang sửa
let deletingCategoryId = null; // ID danh mục đang xóa
let currentMenuFilter = 'all'; // Bộ lọc menu hiện tại
let selectedIcon = 'fa-folder'; // Icon được chọn

// ============================================================
// BƯỚC 4: KHỞI CHẠY KHI TRANG LOAD XONG
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
  loadCategories();    // Gọi hàm load dữ liệu từ localStorage
  setupFormHandler();  // Setup xử lý form
  setupSearch();       // Setup tìm kiếm
});

// ============================================================
// BƯỚC 1: LẤY DỮ LIỆU TỪ LOCALSTORAGE
// ============================================================
// Hàm này lấy danh sách danh mục từ localStorage
// - localStorage.getItem('categories') trả về STRING hoặc null
// - JSON.parse() chuyển STRING thành ARRAY
// - Nếu chưa có dữ liệu thì tạo dữ liệu mặc định
function loadCategories() {
  const saved = localStorage.getItem('categories'); // Lấy string từ localStorage
  
  if (saved) {
    categories = JSON.parse(saved); // Chuyển string -> array
  } else {
    // Default categories - simplified
    categories = [
      // Nữ
      { id: 'cat_1', name: 'Áo thun', icon: 'fa-tshirt', menu: 'nu', description: 'Áo thun nữ các loại', status: 'active', productCount: 15, createdAt: new Date().toISOString() },
      { id: 'cat_2', name: 'Áo sơ mi', icon: 'fa-shirt', menu: 'nu', description: 'Áo sơ mi nữ công sở', status: 'active', productCount: 12, createdAt: new Date().toISOString() },
      { id: 'cat_3', name: 'Áo kiểu', icon: 'fa-vest', menu: 'nu', description: 'Áo kiểu nữ thời trang', status: 'active', productCount: 8, createdAt: new Date().toISOString() },
      { id: 'cat_4', name: 'Quần jeans', icon: 'fa-socks', menu: 'nu', description: 'Quần jeans nữ', status: 'active', productCount: 20, createdAt: new Date().toISOString() },
      { id: 'cat_5', name: 'Quần tây', icon: 'fa-user-tie', menu: 'nu', description: 'Quần tây nữ công sở', status: 'active', productCount: 10, createdAt: new Date().toISOString() },
      { id: 'cat_6', name: 'Váy', icon: 'fa-child-dress', menu: 'nu', description: 'Váy các loại', status: 'active', productCount: 18, createdAt: new Date().toISOString() },
      { id: 'cat_7', name: 'Đầm', icon: 'fa-gem', menu: 'nu', description: 'Đầm công sở, dự tiệc', status: 'active', productCount: 14, createdAt: new Date().toISOString() },
      { id: 'cat_8', name: 'chân váy', icon: 'fa-gem', menu: 'nu', description: 'Đầm công sở, dự tiệc', status: 'active', productCount: 14, createdAt: new Date().toISOString() },
      
      // Nam
      { id: 'cat_8', name: 'Áo thun', icon: 'fa-tshirt', menu: 'nam', description: 'Áo thun nam', status: 'active', productCount: 22, createdAt: new Date().toISOString() },
      { id: 'cat_9', name: 'Áo sơ mi', icon: 'fa-shirt', menu: 'nam', description: 'Áo sơ mi nam', status: 'active', productCount: 16, createdAt: new Date().toISOString() },
      { id: 'cat_10', name: 'Áo polo', icon: 'fa-tshirt', menu: 'nam', description: 'Áo polo nam', status: 'active', productCount: 11, createdAt: new Date().toISOString() },
      { id: 'cat_11', name: 'Quần jeans', icon: 'fa-socks', menu: 'nam', description: 'Quần jeans nam', status: 'active', productCount: 19, createdAt: new Date().toISOString() },
      { id: 'cat_12', name: 'Quần tây', icon: 'fa-user-tie', menu: 'nam', description: 'Quần tây nam công sở', status: 'active', productCount: 13, createdAt: new Date().toISOString() },
      { id: 'cat_13', name: 'Quần short', icon: 'fa-socks', menu: 'nam', description: 'Quần short nam', status: 'active', productCount: 9, createdAt: new Date().toISOString() },
      
      // Trẻ em
      { id: 'cat_14', name: 'Bé gái', icon: 'fa-child-dress', menu: 'treem', description: 'Quần áo bé gái', status: 'active', productCount: 25, createdAt: new Date().toISOString() },
      { id: 'cat_15', name: 'Bé trai', icon: 'fa-child', menu: 'treem', description: 'Quần áo bé trai', status: 'active', productCount: 23, createdAt: new Date().toISOString() },
      { id: 'cat_16', name: 'Sơ sinh', icon: 'fa-baby', menu: 'treem', description: 'Quần áo sơ sinh', status: 'active', productCount: 17, createdAt: new Date().toISOString() }
    ];
    saveCategories();
  }
  
  displayCategories();
  updateStats();
}

// ============================================================
// LƯU DỮ LIỆU VÀO LOCALSTORAGE
// ============================================================
// Hàm này lưu mảng categories vào localStorage
// - JSON.stringify() chuyển ARRAY thành STRING
// - localStorage.setItem() lưu string vào localStorage
function saveCategories() {
  localStorage.setItem('categories', JSON.stringify(categories));
}

// ============================================================
// BƯỚC 2: RENDER (ĐỔ) DỮ LIỆU LÊN GIAO DIỆN HTML
// ============================================================
// Hàm này đổ danh sách danh mục lên giao diện
// Quy trình:
// 1. Lấy container bằng document.getElementById('categoriesGrid')
// 2. Lọc và sắp xếp dữ liệu
// 3. Dùng .map() để tạo HTML cho từng danh mục
// 4. Dùng .join('') để nối mảng HTML thành 1 string
// 5. Gán vào grid.innerHTML để hiển thị
function displayCategories() {
  // Lấy container HTML theo ID
  const grid = document.getElementById('categoriesGrid');
  const emptyState = document.getElementById('emptyState');
  
  if (!grid) return;
  
  // Lọc theo menu (Nữ/Nam/Trẻ em)
  let filteredCategories = [...categories];
  if (currentMenuFilter !== 'all') {
    filteredCategories = filteredCategories.filter(cat => cat.menu === currentMenuFilter);
  }
  
  // Lọc theo từ khóa tìm kiếm
  const searchInput = document.getElementById('searchInput');
  if (searchInput && searchInput.value.trim()) {
    const search = searchInput.value.trim().toLowerCase();
    filteredCategories = filteredCategories.filter(cat => 
      cat.name.toLowerCase().includes(search) ||
      (cat.description && cat.description.toLowerCase().includes(search))
    );
  }
  
  // Sắp xếp theo tên trong mỗi menu
  filteredCategories.sort((a, b) => {
    if (a.menu !== b.menu) {
      const menuOrder = { 'nu': 1, 'nam': 2, 'treem': 3 };
      return menuOrder[a.menu] - menuOrder[b.menu];
    }
    return a.name.localeCompare(b.name);
  });
  
  // Nếu không có dữ liệu thì hiển thị trạng thái rỗng
  if (filteredCategories.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  // ĐỔ DỮ LIỆU LÊN HTML:
  // - filteredCategories.map(cat => createCategoryCard(cat)): Tạo mảng HTML
  // - .join(''): Nối mảng thành 1 string HTML
  // - grid.innerHTML = ...: Gán HTML vào container để hiển thị
  grid.innerHTML = filteredCategories.map(cat => createCategoryCard(cat)).join('');
}

// ============================================================
// BƯỚC 3: TẠO HTML CHO MỖI DANH MỤC
// ============================================================
// Hàm này nhận vào 1 object danh mục và trả về string HTML
// Sử dụng Template Literal (``) để tạo HTML động
function createCategoryCard(category) {
  const menuLabels = {
    'nu': 'Nữ',
    'nam': 'Nam',
    'treem': 'Trẻ em'
  };
  
  const menuLabel = menuLabels[category.menu] || category.menu;
  const statusClass = category.status === 'active' ? 'badge-active' : 'badge-inactive';
  const statusLabel = category.status === 'active' ? 'Hiển thị' : 'Ẩn';
  const iconClass = category.icon || 'fa-folder';
  
  return `
    <div class="category-card ${category.status !== 'active' ? 'inactive' : ''}" data-id="${category.id}">
      <div class="category-card-header">
        <div class="category-image">
          <i class="fa ${iconClass}"></i>
        </div>
        <div class="category-badges">
          <span class="badge badge-${category.menu}">${menuLabel}</span>
          <span class="badge ${statusClass}">${statusLabel}</span>
        </div>
      </div>
      
      <div class="category-info">
        <h4 class="category-name">${category.name}</h4>
        ${category.description ? `<p class="category-description">${category.description}</p>` : ''}
      </div>
      
      <div class="category-meta">
        <div class="meta-item">
          <i class="fa fa-box"></i>
          <span>${category.productCount || 0} sản phẩm</span>
        </div>
      </div>
      
      <div class="category-actions">
        <button class="btn-action btn-edit" onclick="editCategory('${category.id}')">
          <i class="fa fa-edit"></i> Sửa
        </button>
        <button class="btn-action btn-delete" onclick="deleteCategory('${category.id}')">
          <i class="fa fa-trash"></i> Xóa
        </button>
      </div>
    </div>
  `;
}

// Update stats
function updateStats() {
  const total = categories.length;
  const active = categories.filter(c => c.status === 'active').length;
  const withProducts = categories.filter(c => c.productCount > 0).length;
  
  const el1 = document.getElementById('totalCategories');
  const el2 = document.getElementById('activeCategories');
  const el3 = document.getElementById('withProducts');
  
  if (el1) el1.textContent = total;
  if (el2) el2.textContent = active;
  if (el3) el3.textContent = withProducts;
}

// Filter by menu
function filterByMenu(menu) {
  currentMenuFilter = menu;
  
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.menu === menu);
  });
  
  displayCategories();
}

// Setup search
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(displayCategories, 300));
  }
}

// Toggle icon picker
function toggleIconPicker() {
  const grid = document.getElementById('iconGrid');
  if (grid) {
    grid.style.display = grid.style.display === 'none' ? 'grid' : 'none';
  }
}

// Select icon
function selectIcon(icon) {
  selectedIcon = icon;
  const iconInput = document.getElementById('categoryIcon');
  const selectedIconEl = document.getElementById('selectedIcon');
  
  if (iconInput) iconInput.value = icon;
  if (selectedIconEl) {
    selectedIconEl.className = 'fa ' + icon;
  }
  
  // Update selected state
  document.querySelectorAll('.icon-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.icon === icon);
  });
  
  // Close picker
  const grid = document.getElementById('iconGrid');
  if (grid) grid.style.display = 'none';
}

// Open category modal
function openCategoryModal(categoryId = null) {
  const modal = document.getElementById('categoryModal');
  const form = document.getElementById('categoryForm');
  const title = document.getElementById('modalTitle');
  
  // Reset form
  form.reset();
  selectedIcon = 'fa-folder';
  
  // Reset icon picker
  const selectedIconEl = document.getElementById('selectedIcon');
  if (selectedIconEl) selectedIconEl.className = 'fa fa-folder';
  const iconInput = document.getElementById('categoryIcon');
  if (iconInput) iconInput.value = 'fa-folder';
  
  if (categoryId) {
    // Edit mode
    editingCategoryId = categoryId;
    title.textContent = 'Sửa danh mục';
    
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      document.getElementById('categoryId').value = category.id;
      document.getElementById('categoryName').value = category.name;
      document.getElementById('categoryMenu').value = category.menu;
      document.getElementById('categoryDescription').value = category.description || '';
      document.getElementById('categoryStatus').value = category.status;
      
      // Set icon
      if (category.icon) {
        selectedIcon = category.icon;
        if (selectedIconEl) selectedIconEl.className = 'fa ' + category.icon;
        if (iconInput) iconInput.value = category.icon;
      }
    }
  } else {
    // Add mode
    editingCategoryId = null;
    title.textContent = 'Thêm danh mục mới';
    document.getElementById('categoryId').value = '';
  }
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close category modal
function closeCategoryModal() {
  const modal = document.getElementById('categoryModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  editingCategoryId = null;
  
  // Close icon picker if open
  const grid = document.getElementById('iconGrid');
  if (grid) grid.style.display = 'none';
}

// Setup form handler
function setupFormHandler() {
  const form = document.getElementById('categoryForm');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('categoryName').value.trim();
    const menu = document.getElementById('categoryMenu').value;
    const description = document.getElementById('categoryDescription').value.trim();
    const status = document.getElementById('categoryStatus').value;
    const icon = document.getElementById('categoryIcon').value || 'fa-folder';
    
    // Validate
    if (!name) {
      showNotification('Vui lòng nhập tên danh mục', 'error');
      return;
    }
    
    if (!menu) {
      showNotification('Vui lòng chọn nhóm danh mục', 'error');
      return;
    }
    
    // Check duplicate name in same menu
    const duplicate = categories.find(c => 
      c.name.toLowerCase() === name.toLowerCase() && 
      c.menu === menu && 
      c.id !== editingCategoryId
    );
    
    if (duplicate) {
      showNotification('Danh mục này đã tồn tại trong nhóm đã chọn', 'error');
      return;
    }
    
    if (editingCategoryId) {
      // Update existing category
      const index = categories.findIndex(c => c.id === editingCategoryId);
      if (index > -1) {
        categories[index] = {
          ...categories[index],
          name,
          menu,
          description,
          status,
          icon,
          updatedAt: new Date().toISOString()
        };
        showNotification('Đã cập nhật danh mục thành công!', 'success');
      }
    } else {
      // Add new category
      const newCategory = {
        id: 'cat_' + Date.now(),
        name,
        menu,
        description,
        status,
        icon,
        productCount: 0,
        createdAt: new Date().toISOString()
      };
      categories.push(newCategory);
      showNotification('Đã thêm danh mục mới thành công!', 'success');
    }
    
    saveCategories();
    displayCategories();
    updateStats();
    closeCategoryModal();
  });
}

// Edit category
function editCategory(categoryId) {
  openCategoryModal(categoryId);
}

// Delete category
function deleteCategory(categoryId) {
  deletingCategoryId = categoryId;
  const modal = document.getElementById('deleteModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close delete modal
function closeDeleteModal() {
  const modal = document.getElementById('deleteModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  deletingCategoryId = null;
}

// Confirm delete
function confirmDelete() {
  if (!deletingCategoryId) return;
  
  const category = categories.find(c => c.id === deletingCategoryId);
  
  // Check if category has products
  if (category && category.productCount > 0) {
    showNotification(`Không thể xóa! Danh mục có ${category.productCount} sản phẩm`, 'error');
    closeDeleteModal();
    return;
  }
  
  categories = categories.filter(c => c.id !== deletingCategoryId);
  
  saveCategories();
  displayCategories();
  updateStats();
  closeDeleteModal();
  showNotification('Đã xóa danh mục thành công!', 'success');
}

// Show notification
function showNotification(message, type = 'success') {
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

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Close modal on outside click
document.addEventListener('click', function(e) {
  const categoryModal = document.getElementById('categoryModal');
  const deleteModal = document.getElementById('deleteModal');
  const iconPicker = document.getElementById('iconPicker');
  
  if (e.target === categoryModal) {
    closeCategoryModal();
  }
  if (e.target === deleteModal) {
    closeDeleteModal();
  }
  
  // Close icon picker when clicking outside
  if (iconPicker && !iconPicker.contains(e.target)) {
    const grid = document.getElementById('iconGrid');
    if (grid) grid.style.display = 'none';
  }
});

// Export functions
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.filterByMenu = filterByMenu;
window.toggleIconPicker = toggleIconPicker;
window.selectIcon = selectIcon;
