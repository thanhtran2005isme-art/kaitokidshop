// Admin Banners JavaScript

let banners = [];
let currentTab = 'slider';
let editingBannerId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadBanners();
  setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
  const bannerImage = document.getElementById('bannerImage');
  if (bannerImage) {
    bannerImage.addEventListener('input', updateImagePreview);
  }
  
  const bannerForm = document.getElementById('bannerForm');
  if (bannerForm) {
    bannerForm.addEventListener('submit', saveBanner);
  }
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filterBanners);
  }
}

// Switch Tab
function switchTab(tab) {
  currentTab = tab;
  
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tab) {
      btn.classList.add('active');
    }
  });
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  const targetSection = document.getElementById(tab + 'Section');
  if (targetSection) {
    targetSection.classList.add('active');
  }
  
  displayBanners();
}

// Load Banners
function loadBanners() {
  banners = JSON.parse(localStorage.getItem('banners') || '[]');
  
  // Create sample data if empty
  if (banners.length === 0) {
    banners = [
      {
        id: 'BAN' + Date.now(),
        type: 'slider',
        title: 'Spring Summer 2025',
        description: 'Everyday Essentials',
        image: '../slide_1.jpg',
        link: '/bosuutap.html',
        position: 'homepage',
        order: 1,
        status: 'active',
        startDate: null,
        endDate: null,
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('banners', JSON.stringify(banners));
  }
  
  displayBanners();
}

// Display Banners
function displayBanners() {
  const filteredBanners = banners.filter(b => b.type === currentTab);
  const containerId = currentTab === 'slider' ? 'sliderList' : 'bannerList';
  const container = document.getElementById(containerId);
  
  if (!container) return;
  
  if (filteredBanners.length === 0) {
    container.innerHTML = `
      <div class="empty-reviews" style="grid-column: 1/-1;">
        <i class="fa fa-image"></i>
        <h3>Chưa có ${currentTab === 'slider' ? 'slider' : 'banner'} nào</h3>
        <p>Nhấn "Thêm Banner" để tạo mới.</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredBanners
    .sort((a, b) => a.order - b.order)
    .map(banner => `
      <div class="banner-card">
        <div class="banner-image-wrapper">
          <img src="${banner.image}" alt="${banner.title}" 
               onerror="this.src='../images/d53c7593-3c1b-437a-98bc-f71b44050b40.png'">
          <div class="banner-overlay">
            <button class="banner-overlay-btn" onclick="editBanner('${banner.id}')">
              <i class="fa fa-edit"></i> Sửa
            </button>
            <button class="banner-overlay-btn" onclick="deleteBanner('${banner.id}')">
              <i class="fa fa-trash"></i> Xóa
            </button>
          </div>
        </div>
        <div class="banner-info">
          <div class="banner-title">${banner.title}</div>
          <div class="banner-meta">
            <span class="banner-status-badge ${banner.status}">
              <i class="fa fa-${banner.status === 'active' ? 'check-circle' : 'times-circle'}"></i>
              ${banner.status === 'active' ? 'Hiển thị' : 'Ẩn'}
            </span>
            <span><i class="fa fa-sort-numeric-up"></i> Thứ tự: ${banner.order}</span>
          </div>
          ${banner.description ? `<p style="font-size:13px;color:#666;margin-top:8px;">${banner.description}</p>` : ''}
          <div class="banner-actions">
            <button class="btn-banner btn-edit-banner" onclick="editBanner('${banner.id}')">
              <i class="fa fa-edit"></i> Sửa
            </button>
            <button class="btn-banner btn-delete-banner" onclick="deleteBanner('${banner.id}')">
              <i class="fa fa-trash"></i> Xóa
            </button>
          </div>
        </div>
      </div>
    `).join('');
}

// Filter Banners
function filterBanners() {
  // Implement search if needed
  displayBanners();
}

// Open Banner Modal
function openBannerModal(bannerId = null) {
  editingBannerId = bannerId;
  const modal = document.getElementById('bannerModal');
  const form = document.getElementById('bannerForm');
  const modalTitle = document.getElementById('modalTitle');
  
  if (bannerId) {
    const banner = banners.find(b => b.id === bannerId);
    if (banner) {
      modalTitle.textContent = 'Sửa Banner';
      document.getElementById('bannerId').value = banner.id;
      document.getElementById('bannerType').value = banner.type;
      document.getElementById('bannerTitle').value = banner.title;
      document.getElementById('bannerDescription').value = banner.description || '';
      document.getElementById('bannerImage').value = banner.image;
      document.getElementById('bannerLink').value = banner.link || '';
      document.getElementById('bannerPosition').value = banner.position || 'homepage';
      document.getElementById('bannerOrder').value = banner.order || 1;
      document.getElementById('bannerStatus').value = banner.status || 'active';
      document.getElementById('bannerStartDate').value = banner.startDate ? banner.startDate.split('T')[0] + 'T' + banner.startDate.split('T')[1].substring(0, 5) : '';
      document.getElementById('bannerEndDate').value = banner.endDate ? banner.endDate.split('T')[0] + 'T' + banner.endDate.split('T')[1].substring(0, 5) : '';
      updateImagePreview();
    }
  } else {
    modalTitle.textContent = 'Thêm Banner';
    form.reset();
    document.getElementById('bannerId').value = '';
    document.getElementById('bannerType').value = currentTab;
    document.getElementById('bannerOrder').value = banners.filter(b => b.type === currentTab).length + 1;
    document.getElementById('bannerStatus').value = 'active';
    document.getElementById('bannerImagePreview').classList.remove('has-image');
    document.getElementById('bannerImagePreview').innerHTML = '';
  }
  
  modal.style.display = 'flex';
}

// Close Banner Modal
function closeBannerModal() {
  const modal = document.getElementById('bannerModal');
  modal.style.display = 'none';
  editingBannerId = null;
  document.getElementById('bannerForm').reset();
}

// Update Image Preview
function updateImagePreview() {
  const imageUrl = document.getElementById('bannerImage').value;
  const preview = document.getElementById('bannerImagePreview');
  
  if (imageUrl) {
    preview.classList.add('has-image');
    preview.innerHTML = `
      <div style="font-size:12px;color:#666;margin-bottom:8px;">Xem trước:</div>
      <img src="${imageUrl}" alt="Preview" onerror="this.style.display='none'">
    `;
  } else {
    preview.classList.remove('has-image');
    preview.innerHTML = '';
  }
}

// Save Banner
function saveBanner(e) {
  e.preventDefault();
  
  const bannerId = document.getElementById('bannerId').value;
  const banner = {
    id: bannerId || 'BAN' + Date.now(),
    type: document.getElementById('bannerType').value,
    title: document.getElementById('bannerTitle').value,
    description: document.getElementById('bannerDescription').value,
    image: document.getElementById('bannerImage').value,
    link: document.getElementById('bannerLink').value || null,
    position: document.getElementById('bannerPosition').value,
    order: parseInt(document.getElementById('bannerOrder').value) || 1,
    status: document.getElementById('bannerStatus').value,
    startDate: document.getElementById('bannerStartDate').value || null,
    endDate: document.getElementById('bannerEndDate').value || null,
    createdAt: bannerId ? banners.find(b => b.id === bannerId)?.createdAt || new Date().toISOString() : new Date().toISOString()
  };
  
  if (bannerId) {
    const index = banners.findIndex(b => b.id === bannerId);
    if (index !== -1) {
      banners[index] = banner;
    }
  } else {
    banners.push(banner);
  }
  
  localStorage.setItem('banners', JSON.stringify(banners));
  displayBanners();
  closeBannerModal();
  showNotification(bannerId ? 'Đã cập nhật banner!' : 'Đã thêm banner mới!', 'success');
}

// Edit Banner
function editBanner(bannerId) {
  openBannerModal(bannerId);
}

// Delete Banner
function deleteBanner(bannerId) {
  if (!confirm('Bạn có chắc muốn xóa banner này?')) return;
  
  banners = banners.filter(b => b.id !== bannerId);
  localStorage.setItem('banners', JSON.stringify(banners));
  displayBanners();
  showNotification('Đã xóa banner!', 'success');
}

// Show Notification
function showNotification(message, type = 'success') {
  // Simple notification - can be enhanced
  alert(message);
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('bannerModal');
  if (event.target === modal) {
    closeBannerModal();
  }
}

