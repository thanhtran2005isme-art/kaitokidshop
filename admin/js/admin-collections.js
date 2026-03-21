// Collections Management
let collections = [];
let editingCollectionId = null;
let selectedImage = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadCollections();
  setupImageUpload();
  setupFormHandler();
});

// Load collections
function loadCollections() {
  const saved = localStorage.getItem('collections');
  if (saved) {
    collections = JSON.parse(saved);
  } else {
    // Default collections
    collections = [
      {
        id: 1,
        name: 'Summer 2024',
        desc: 'Bộ sưu tập mùa hè với những thiết kế tươi mới, năng động',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Cdefs%3E%3ClinearGradient id="a" x1="0" y1="0" x2="1" y2="1"%3E%3Cstop offset="0%25" stop-color="%23667eea"/%3E%3Cstop offset="100%25" stop-color="%23764ba2"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="200" fill="url(%23a)"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24" font-family="Arial"%3ESummer 2024%3C/text%3E%3C/svg%3E',
        order: 1,
        status: 'active',
        productCount: 24
      },
      {
        id: 2,
        name: 'Office Style',
        desc: 'Phong cách công sở thanh lịch, chuyên nghiệp',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Cdefs%3E%3ClinearGradient id="b" x1="0" y1="0" x2="1" y2="1"%3E%3Cstop offset="0%25" stop-color="%2310b981"/%3E%3Cstop offset="100%25" stop-color="%23059669"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="200" fill="url(%23b)"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24" font-family="Arial"%3EOffice Style%3C/text%3E%3C/svg%3E',
        order: 2,
        status: 'active',
        productCount: 18
      },
      {
        id: 3,
        name: 'Street Wear',
        desc: 'Thời trang đường phố cá tính, phá cách',
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Cdefs%3E%3ClinearGradient id="c" x1="0" y1="0" x2="1" y2="1"%3E%3Cstop offset="0%25" stop-color="%23f59e0b"/%3E%3Cstop offset="100%25" stop-color="%23f97316"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="400" height="200" fill="url(%23c)"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24" font-family="Arial"%3EStreet Wear%3C/text%3E%3C/svg%3E',
        order: 3,
        status: 'active',
        productCount: 32
      }
    ];
  }
  
  renderCollections();
}

// Render collections
function renderCollections() {
  const grid = document.getElementById('collectionsGrid');
  
  if (collections.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fa fa-layer-group"></i>
        <h3>Chưa có bộ sưu tập nào</h3>
        <p>Tạo bộ sưu tập đầu tiên để nhóm sản phẩm theo chủ đề</p>
        <button class="btn-primary" onclick="openCollectionModal()">
          <i class="fa fa-plus"></i> Thêm bộ sưu tập
        </button>
      </div>
    `;
    return;
  }
  
  // Sort by order
  collections.sort((a, b) => a.order - b.order);
  
  grid.innerHTML = collections.map(collection => `
    <div class="collection-card">
      <img src="${collection.image}" alt="${collection.name}" class="collection-image" onerror="this.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E'">
      <div class="collection-content">
        <div class="collection-header">
          <h3 class="collection-name">${collection.name}</h3>
          <span class="collection-status ${collection.status}">
            ${collection.status === 'active' ? 'Hiển thị' : 'Ẩn'}
          </span>
        </div>
        <p class="collection-desc">${collection.desc || 'Chưa có mô tả'}</p>
        <div class="collection-meta">
          <div class="collection-meta-item">
            <i class="fa fa-box"></i>
            <span>${collection.productCount || 0} sản phẩm</span>
          </div>
          <div class="collection-meta-item">
            <i class="fa fa-sort"></i>
            <span>Thứ tự: ${collection.order}</span>
          </div>
        </div>
        <div class="collection-actions">
          <button class="btn-action edit" onclick="editCollection(${collection.id})">
            <i class="fa fa-edit"></i> Sửa
          </button>
          <button class="btn-action delete" onclick="deleteCollection(${collection.id})">
            <i class="fa fa-trash"></i> Xóa
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Setup image upload
function setupImageUpload() {
  const imageInput = document.getElementById('collectionImage');
  
  imageInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        selectedImage = e.target.result;
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `<img src="${selectedImage}" alt="Preview">`;
        preview.classList.add('show');
      };
      reader.readAsDataURL(file);
    }
  });
}

// Setup form handler
function setupFormHandler() {
  const form = document.getElementById('collectionForm');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('collectionName').value.trim(),
      desc: document.getElementById('collectionDesc').value.trim(),
      image: selectedImage || '/images/placeholder.jpg',
      order: parseInt(document.getElementById('collectionOrder').value),
      status: document.getElementById('collectionStatus').value,
      productCount: 0
    };
    
    if (!formData.name) {
      showNotification('Vui lòng nhập tên bộ sưu tập', 'error');
      return;
    }
    
    if (editingCollectionId) {
      // Update
      const collection = collections.find(c => c.id === editingCollectionId);
      if (collection) {
        Object.assign(collection, formData);
        showNotification('Đã cập nhật bộ sưu tập', 'success');
      }
    } else {
      // Add new
      const newId = Math.max(...collections.map(c => c.id), 0) + 1;
      collections.push({ id: newId, ...formData });
      showNotification('Đã thêm bộ sưu tập mới', 'success');
    }
    
    saveCollections();
    renderCollections();
    closeCollectionModal();
  });
}

// Open modal
function openCollectionModal() {
  editingCollectionId = null;
  selectedImage = null;
  document.getElementById('modalTitle').textContent = 'Thêm bộ sưu tập';
  document.getElementById('collectionForm').reset();
  document.getElementById('imagePreview').classList.remove('show');
  document.getElementById('collectionModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Edit collection
function editCollection(id) {
  const collection = collections.find(c => c.id === id);
  if (!collection) return;
  
  editingCollectionId = id;
  selectedImage = collection.image;
  
  document.getElementById('modalTitle').textContent = 'Sửa bộ sưu tập';
  document.getElementById('collectionName').value = collection.name;
  document.getElementById('collectionDesc').value = collection.desc || '';
  document.getElementById('collectionOrder').value = collection.order;
  document.getElementById('collectionStatus').value = collection.status;
  
  const preview = document.getElementById('imagePreview');
  preview.innerHTML = `<img src="${collection.image}" alt="Preview">`;
  preview.classList.add('show');
  
  document.getElementById('collectionModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Delete collection
function deleteCollection(id) {
  if (!confirm('Bạn có chắc muốn xóa bộ sưu tập này?')) return;
  
  collections = collections.filter(c => c.id !== id);
  saveCollections();
  renderCollections();
  showNotification('Đã xóa bộ sưu tập', 'success');
}

// Close modal
function closeCollectionModal() {
  document.getElementById('collectionModal').classList.remove('active');
  document.body.style.overflow = '';
  editingCollectionId = null;
  selectedImage = null;
}

// Save collections
function saveCollections() {
  localStorage.setItem('collections', JSON.stringify(collections));
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

// Close modal on outside click
document.addEventListener('click', function(e) {
  const modal = document.getElementById('collectionModal');
  if (e.target === modal) {
    closeCollectionModal();
  }
});
