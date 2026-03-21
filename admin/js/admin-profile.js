// Admin Profile Management
let adminProfile = {};
let currentTab = 'info';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  loadProfile();
  setupForms();
  setupPasswordStrength();
  loadSessions();
  loadActivity();
});

// Load profile from localStorage
function loadProfile() {
  const saved = localStorage.getItem('adminProfile');
  
  if (saved) {
    adminProfile = JSON.parse(saved);
  } else {
    // Default profile
    adminProfile = {
      id: 'admin_1',
      fullName: 'Admin',
      displayName: 'Admin',
      email: 'admin@kaitokid.vn',
      phone: '0123 456 789',
      birthday: '1990-01-01',
      gender: 'male',
      position: 'Administrator',
      department: 'Quản trị',
      jobDescription: 'Quản lý toàn bộ hoạt động của website bán hàng KAITO KID.',
      avatar: null,
      joinedAt: '2024-01-01',
      stats: {
        orders: 156,
        products: 89,
        reviews: 234
      },
      notifications: {
        order_new_email: true,
        order_new_push: true,
        order_cancel_email: true,
        order_cancel_push: false,
        product_outofstock_email: true,
        product_outofstock_push: true,
        review_new_email: true,
        review_new_push: false,
        system_update_email: true,
        system_update_push: false
      }
    };
    saveProfile();
  }
  
  displayProfile();
}

// Save profile to localStorage
function saveProfile() {
  localStorage.setItem('adminProfile', JSON.stringify(adminProfile));
}

// Display profile data
function displayProfile() {
  // Header
  document.getElementById('profileName').textContent = adminProfile.displayName;
  document.getElementById('profileRole').textContent = adminProfile.position;
  document.getElementById('profileJoined').textContent = formatDate(adminProfile.joinedAt);
  
  // Stats
  document.getElementById('statOrders').textContent = adminProfile.stats.orders;
  document.getElementById('statProducts').textContent = adminProfile.stats.products;
  document.getElementById('statReviews').textContent = adminProfile.stats.reviews;
  
  // Avatar
  if (adminProfile.avatar) {
    document.getElementById('profileAvatar').innerHTML = `<img src="${adminProfile.avatar}" alt="${adminProfile.displayName}">`;
  }
  
  // Basic Info Form
  document.getElementById('fullName').value = adminProfile.fullName;
  document.getElementById('displayName').value = adminProfile.displayName;
  document.getElementById('email').value = adminProfile.email;
  document.getElementById('phone').value = adminProfile.phone;
  document.getElementById('birthday').value = adminProfile.birthday;
  document.getElementById('gender').value = adminProfile.gender;
  
  // Work Info Form
  document.getElementById('position').value = adminProfile.position;
  document.getElementById('department').value = adminProfile.department;
  document.getElementById('jobDescription').value = adminProfile.jobDescription;
  
  // Notification settings
  Object.keys(adminProfile.notifications).forEach(key => {
    const checkbox = document.querySelector(`input[data-key="${key}"]`);
    if (checkbox) {
      checkbox.checked = adminProfile.notifications[key];
    }
  });
  
  // Update sidebar and topbar names
  const adminNameElements = document.querySelectorAll('#adminName, #topAdminName');
  adminNameElements.forEach(el => {
    if (el) el.textContent = adminProfile.displayName;
  });
}

// Switch tabs
function switchTab(tabId) {
  currentTab = tabId;
  
  // Update tab buttons
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabId);
  });
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `tab-${tabId}`);
  });
}

// Enable editing for a section
function enableEditing(section) {
  const formId = section === 'basic' ? 'basicInfoForm' : 'workInfoForm';
  const actionsId = section === 'basic' ? 'basicFormActions' : 'workFormActions';
  
  const form = document.getElementById(formId);
  const actions = document.getElementById(actionsId);
  
  // Enable all inputs
  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.disabled = false;
  });
  
  // Show action buttons
  actions.style.display = 'flex';
  
  // Focus first input
  form.querySelector('input, select, textarea').focus();
}

// Cancel editing
function cancelEditing(section) {
  displayProfile(); // Reset to saved values
  
  const formId = section === 'basic' ? 'basicInfoForm' : 'workInfoForm';
  const actionsId = section === 'basic' ? 'basicFormActions' : 'workFormActions';
  
  const form = document.getElementById(formId);
  const actions = document.getElementById(actionsId);
  
  // Disable all inputs
  form.querySelectorAll('input, select, textarea').forEach(input => {
    input.disabled = true;
  });
  
  // Hide action buttons
  actions.style.display = 'none';
}

// Setup forms
function setupForms() {
  // Basic Info Form
  document.getElementById('basicInfoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    adminProfile.fullName = document.getElementById('fullName').value;
    adminProfile.displayName = document.getElementById('displayName').value;
    adminProfile.email = document.getElementById('email').value;
    adminProfile.phone = document.getElementById('phone').value;
    adminProfile.birthday = document.getElementById('birthday').value;
    adminProfile.gender = document.getElementById('gender').value;
    
    saveProfile();
    cancelEditing('basic');
    displayProfile();
    showNotification('Đã cập nhật thông tin cá nhân', 'success');
    
    // Log activity
    addActivity('settings', 'Cập nhật thông tin cá nhân', 'Đã thay đổi thông tin cơ bản trong hồ sơ');
  });
  
  // Work Info Form
  document.getElementById('workInfoForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    adminProfile.position = document.getElementById('position').value;
    adminProfile.department = document.getElementById('department').value;
    adminProfile.jobDescription = document.getElementById('jobDescription').value;
    
    saveProfile();
    cancelEditing('work');
    displayProfile();
    showNotification('Đã cập nhật thông tin công việc', 'success');
    
    addActivity('settings', 'Cập nhật thông tin công việc', 'Đã thay đổi vị trí và mô tả công việc');
  });
  
  // Password Form
  document.getElementById('passwordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate
    if (newPassword !== confirmPassword) {
      showNotification('Mật khẩu xác nhận không khớp', 'error');
      return;
    }
    
    if (newPassword.length < 6) {
      showNotification('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
      return;
    }
    
    // Simulate password change
    showNotification('Đã đổi mật khẩu thành công', 'success');
    this.reset();
    document.getElementById('passwordStrength').innerHTML = '';
    
    addActivity('settings', 'Đổi mật khẩu', 'Đã thay đổi mật khẩu tài khoản');
  });
}

// Password strength indicator
function setupPasswordStrength() {
  const passwordInput = document.getElementById('newPassword');
  const strengthDisplay = document.getElementById('passwordStrength');
  
  passwordInput.addEventListener('input', function() {
    const password = this.value;
    const strength = calculatePasswordStrength(password);
    
    strengthDisplay.innerHTML = `
      <div class="strength-bar"></div>
      <div class="strength-bar"></div>
      <div class="strength-bar"></div>
      <div class="strength-bar"></div>
    `;
    
    strengthDisplay.className = 'password-strength ' + strength;
  });
}

// Calculate password strength
function calculatePasswordStrength(password) {
  if (!password) return '';
  
  let score = 0;
  
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  if (score <= 1) return 'weak';
  if (score === 2) return 'medium';
  if (score === 3) return 'strong';
  return 'very-strong';
}

// Toggle password visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = input.nextElementSibling.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

// Update avatar
function updateAvatar(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      adminProfile.avatar = e.target.result;
      saveProfile();
      displayProfile();
      showNotification('Đã cập nhật ảnh đại diện', 'success');
      
      addActivity('settings', 'Cập nhật ảnh đại diện', 'Đã thay đổi ảnh đại diện');
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Load sessions
function loadSessions() {
  const sessions = [
    {
      device: 'Windows PC - Chrome',
      ip: '192.168.1.100',
      location: 'Hà Nội, Việt Nam',
      lastActive: new Date().toISOString(),
      icon: 'fa-desktop',
      current: true
    },
    {
      device: 'iPhone 14 - Safari',
      ip: '192.168.1.105',
      location: 'Hà Nội, Việt Nam',
      lastActive: new Date(Date.now() - 3600000).toISOString(),
      icon: 'fa-mobile-alt',
      current: false
    },
    {
      device: 'MacBook Pro - Firefox',
      ip: '192.168.1.110',
      location: 'TP. Hồ Chí Minh, Việt Nam',
      lastActive: new Date(Date.now() - 86400000).toISOString(),
      icon: 'fa-laptop',
      current: false
    }
  ];
  
  const container = document.getElementById('sessionsList');
  if (!container) return;
  
  container.innerHTML = sessions.map(session => `
    <div class="session-item ${session.current ? 'current' : ''}">
      <div class="session-icon">
        <i class="fa ${session.icon}"></i>
      </div>
      <div class="session-info">
        <div class="session-device">
          ${session.device}
          ${session.current ? '<span class="badge-current">Phiên hiện tại</span>' : ''}
        </div>
        <div class="session-details">
          ${session.ip} • ${session.location} • ${formatDateTime(session.lastActive)}
        </div>
      </div>
      ${!session.current ? `<button class="btn-revoke" onclick="revokeSession('${session.device}')">Thu hồi</button>` : ''}
    </div>
  `).join('');
}

// Revoke session
function revokeSession(device) {
  showNotification(`Đã thu hồi phiên đăng nhập: ${device}`, 'success');
  loadSessions();
  
  addActivity('settings', 'Thu hồi phiên đăng nhập', `Đã đăng xuất khỏi thiết bị: ${device}`);
}

// Show sessions modal
function showSessions() {
  switchTab('security');
  setTimeout(() => {
    const sessionsSection = document.querySelector('.sessions-list');
    if (sessionsSection) {
      sessionsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
}

// Load activity
function loadActivity() {
  let activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
  
  if (activities.length === 0) {
    // Generate sample activities
    activities = [
      { type: 'login', title: 'Đăng nhập thành công', description: 'Đăng nhập từ Windows PC - Chrome', timestamp: new Date().toISOString() },
      { type: 'order', title: 'Xác nhận đơn hàng', description: 'Đơn hàng #DH001234 đã được xác nhận', timestamp: new Date(Date.now() - 1800000).toISOString() },
      { type: 'product', title: 'Cập nhật sản phẩm', description: 'Đã cập nhật giá sản phẩm "Áo thun nam basic"', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { type: 'order', title: 'Hoàn thành đơn hàng', description: 'Đơn hàng #DH001230 đã giao thành công', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { type: 'settings', title: 'Thay đổi cài đặt', description: 'Đã cập nhật thông tin cửa hàng', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { type: 'login', title: 'Đăng nhập thành công', description: 'Đăng nhập từ iPhone 14 - Safari', timestamp: new Date(Date.now() - 172800000).toISOString() },
      { type: 'product', title: 'Thêm sản phẩm mới', description: 'Đã thêm 5 sản phẩm vào danh mục "Áo sơ mi"', timestamp: new Date(Date.now() - 259200000).toISOString() }
    ];
    localStorage.setItem('adminActivities', JSON.stringify(activities));
  }
  
  displayActivities(activities);
}

// Display activities
function displayActivities(activities) {
  const container = document.getElementById('activityTimeline');
  if (!container) return;
  
  if (activities.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #718096; padding: 40px;">Chưa có hoạt động nào</p>';
    return;
  }
  
  const icons = {
    login: 'fa-sign-in-alt',
    order: 'fa-shopping-bag',
    product: 'fa-box',
    settings: 'fa-cog'
  };
  
  container.innerHTML = activities.slice(0, 20).map(activity => `
    <div class="activity-item ${activity.type}">
      <div class="activity-header">
        <span class="activity-title">
          <i class="fa ${icons[activity.type] || 'fa-circle'}"></i>
          ${activity.title}
        </span>
        <span class="activity-time">${formatDateTime(activity.timestamp)}</span>
      </div>
      <p class="activity-description">${activity.description}</p>
    </div>
  `).join('');
}

// Filter activity
function filterActivity() {
  const typeFilter = document.getElementById('activityType').value;
  const dateFilter = document.getElementById('activityDate').value;
  
  let activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
  
  if (typeFilter !== 'all') {
    activities = activities.filter(a => a.type === typeFilter);
  }
  
  if (dateFilter) {
    const filterDate = new Date(dateFilter).toDateString();
    activities = activities.filter(a => new Date(a.timestamp).toDateString() === filterDate);
  }
  
  displayActivities(activities);
}

// Add activity
function addActivity(type, title, description) {
  const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
  
  activities.unshift({
    type,
    title,
    description,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last 100 activities
  if (activities.length > 100) {
    activities.pop();
  }
  
  localStorage.setItem('adminActivities', JSON.stringify(activities));
}

// Export activity
function exportActivity() {
  const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
  
  const csvContent = 'data:text/csv;charset=utf-8,' +
    'Thời gian,Loại,Tiêu đề,Mô tả\n' +
    activities.map(a => 
      `${formatDateTime(a.timestamp)},${a.type},${a.title},"${a.description}"`
    ).join('\n');
  
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', `activity_log_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Đã xuất báo cáo hoạt động', 'success');
}

// Save notification settings
function saveNotificationSettings() {
  document.querySelectorAll('.notification-channels input[type="checkbox"]').forEach(checkbox => {
    const key = checkbox.dataset.key;
    if (key) {
      adminProfile.notifications[key] = checkbox.checked;
    }
  });
  
  saveProfile();
  showNotification('Đã lưu cài đặt thông báo', 'success');
  
  addActivity('settings', 'Cập nhật cài đặt thông báo', 'Đã thay đổi tùy chọn thông báo');
}

// Helper: Format date
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Helper: Format date time
function formatDateTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  
  // Less than 1 minute
  if (diff < 60000) return 'Vừa xong';
  // Less than 1 hour
  if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
  // Less than 24 hours
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
  // Less than 7 days
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày trước`;
  
  return date.toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
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

// Export functions
window.switchTab = switchTab;
window.enableEditing = enableEditing;
window.cancelEditing = cancelEditing;
window.togglePassword = togglePassword;
window.updateAvatar = updateAvatar;
window.revokeSession = revokeSession;
window.showSessions = showSessions;
window.filterActivity = filterActivity;
window.exportActivity = exportActivity;
window.saveNotificationSettings = saveNotificationSettings;

