// Menu Management System
let menuItems = [];
let editingMenuItemId = null;

// Load menu items on page load
document.addEventListener('DOMContentLoaded', function() {
  // Load from localStorage or use default
  const savedMenuItems = localStorage.getItem('menuItems');
  if (savedMenuItems) {
    menuItems = JSON.parse(savedMenuItems);
  } else {
    // Default menu items
    menuItems = [
      { id: 1, name: 'Trang chủ', link: '/', order: 1, target: '_self' },
      { id: 2, name: 'Sản phẩm', link: '/allsp.html', order: 2, target: '_self' },
      { id: 3, name: 'Bộ sưu tập', link: '/bosuutap.html', order: 3, target: '_self' },
      { id: 4, name: 'Sale', link: '/samphamsale.html', order: 4, target: '_self' },
      { id: 5, name: 'Liên hệ', link: '/contact.html', order: 5, target: '_self' }
    ];
  }
  
  loadMenuItems();
  setupFormHandler();
  loadFooterData();
});

// Load and display menu items
function loadMenuItems() {
  const container = document.getElementById('menuItemsList');
  if (!container) return;
  
  // Sort by order
  menuItems.sort((a, b) => a.order - b.order);
  
  container.innerHTML = '';
  
  menuItems.forEach(item => {
    const menuCard = document.createElement('div');
    menuCard.className = 'menu-item-card';
    menuCard.setAttribute('data-id', item.id);
    menuCard.innerHTML = `
      <div class="menu-item-handle">
        <i class="fa fa-grip-vertical"></i>
      </div>
      <div class="menu-item-info">
        <div class="menu-item-name">${item.name}</div>
        <div class="menu-item-link">${item.link}</div>
        <div class="menu-item-meta">
          <span class="badge">Thứ tự: ${item.order}</span>
          <span class="badge">${item.target === '_blank' ? 'Tab mới' : 'Cùng tab'}</span>
        </div>
      </div>
      <div class="menu-item-actions">
        <button class="btn-icon btn-edit" data-id="${item.id}" title="Sửa">
          <i class="fa fa-edit"></i>
        </button>
        <button class="btn-icon btn-danger btn-delete" data-id="${item.id}" title="Xóa">
          <i class="fa fa-trash"></i>
        </button>
      </div>
    `;
    
    // Add event listeners
    const editBtn = menuCard.querySelector('.btn-edit');
    const deleteBtn = menuCard.querySelector('.btn-delete');
    
    editBtn.addEventListener('click', () => editMenuItem(item.id));
    deleteBtn.addEventListener('click', () => deleteMenuItem(item.id));
    
    container.appendChild(menuCard);
  });
}

// Add new menu item
function addMenuItem() {
  editingMenuItemId = null;
  document.getElementById('menuItemModalTitle').textContent = 'Thêm mục menu';
  document.getElementById('menuItemForm').reset();
  document.getElementById('menuItemId').value = '';
  document.getElementById('menuItemOrder').value = menuItems.length + 1;
  openMenuItemModal();
}

// Edit menu item
function editMenuItem(id) {
  const item = menuItems.find(m => m.id === id);
  if (!item) return;
  
  editingMenuItemId = id;
  document.getElementById('menuItemModalTitle').textContent = 'Sửa mục menu';
  document.getElementById('menuItemId').value = item.id;
  document.getElementById('menuItemName').value = item.name;
  document.getElementById('menuItemLink').value = item.link;
  document.getElementById('menuItemOrder').value = item.order;
  document.getElementById('menuItemTarget').value = item.target;
  openMenuItemModal();
}

// Delete menu item
function deleteMenuItem(id) {
  if (!confirm('Bạn có chắc muốn xóa mục menu này?')) return;
  
  // Remove from array
  menuItems = menuItems.filter(m => m.id !== id);
  
  // Save to localStorage immediately
  localStorage.setItem('menuItems', JSON.stringify(menuItems));
  
  // Reload display
  loadMenuItems();
  showNotification('Đã xóa mục menu', 'success');
}

// Setup form handler
function setupFormHandler() {
  const form = document.getElementById('menuItemForm');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('menuItemName').value.trim(),
      link: document.getElementById('menuItemLink').value.trim(),
      order: parseInt(document.getElementById('menuItemOrder').value),
      target: document.getElementById('menuItemTarget').value
    };
    
    if (!formData.name || !formData.link) {
      showNotification('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }
    
    if (editingMenuItemId) {
      // Update existing item
      const item = menuItems.find(m => m.id === editingMenuItemId);
      if (item) {
        Object.assign(item, formData);
        showNotification('Đã cập nhật mục menu', 'success');
      }
    } else {
      // Add new item
      const newId = Math.max(...menuItems.map(m => m.id), 0) + 1;
      menuItems.push({ id: newId, ...formData });
      showNotification('Đã thêm mục menu mới', 'success');
    }
    
    // Save to localStorage immediately
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    
    loadMenuItems();
    closeMenuItemModal();
  });
}

// Modal functions
function openMenuItemModal() {
  document.getElementById('menuItemModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMenuItemModal() {
  document.getElementById('menuItemModal').classList.remove('active');
  document.body.style.overflow = '';
  editingMenuItemId = null;
}

// Load footer data
function loadFooterData() {
  const savedFooterData = localStorage.getItem('footerData');
  if (savedFooterData) {
    const footerData = JSON.parse(savedFooterData);
    document.getElementById('footerCol1Title').value = footerData.col1Title || '';
    document.getElementById('footerCol2Title').value = footerData.col2Title || '';
    document.getElementById('footerCol1Content').value = footerData.col1Content || '';
    document.getElementById('footerCol2Content').value = footerData.col2Content || '';
    document.getElementById('footerCopyright').value = footerData.copyright || '';
  }
}

// Save all menus
function saveMenus() {
  // Get footer data
  const footerData = {
    col1Title: document.getElementById('footerCol1Title').value,
    col2Title: document.getElementById('footerCol2Title').value,
    col1Content: document.getElementById('footerCol1Content').value,
    col2Content: document.getElementById('footerCol2Content').value,
    copyright: document.getElementById('footerCopyright').value
  };
  
  // In real app, this would save to backend
  console.log('Saving menus:', menuItems);
  console.log('Saving footer:', footerData);
  
  // Save to localStorage for demo
  localStorage.setItem('menuItems', JSON.stringify(menuItems));
  localStorage.setItem('footerData', JSON.stringify(footerData));
  
  showNotification('Đã lưu thay đổi thành công! Menu sẽ hiển thị trên trang chủ.', 'success');
}

// Notification helper
function showNotification(message, type = 'info') {
  // Remove existing notifications
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

// Close modal on outside click
document.addEventListener('click', function(e) {
  const modal = document.getElementById('menuItemModal');
  if (e.target === modal) {
    closeMenuItemModal();
  }
});
