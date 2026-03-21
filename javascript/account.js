// Account Page JavaScript

let currentUser = null;
let isEditing = false;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  checkAuth();
  loadUserData();
  setupEventListeners();
  loadStats();
  updateCartCount();
});

// Check if user is logged in
function checkAuth() {
  const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  
  if (!userLoggedIn && !adminLoggedIn) {
    window.location.href = 'login.html?redirect=taikhoan.html';
    return;
  }
}

// Load user data
function loadUserData() {
  // Try to get user from different storage methods
  let user = null;
  
  try {
    user = JSON.parse(localStorage.getItem('currentUser'));
  } catch (e) {}
  
  if (!user) {
    // Fallback to old method
    const username = localStorage.getItem('username') || localStorage.getItem('adminUser');
    const userType = localStorage.getItem('userType');
    
    user = {
      username: username || 'user',
      name: username || 'Người dùng',
      email: username ? `${username}@kaitokid.com` : 'email@example.com',
      phone: '',
      birthday: '',
      gender: '',
      role: userType || 'user',
      createdAt: new Date().toISOString()
    };
  }
  
  currentUser = user;
  
  // Update sidebar
  document.getElementById('sidebarUserName').textContent = user.name || user.username;
  document.getElementById('sidebarUserEmail').textContent = user.email;
  
  // Update avatar with initials
  const avatar = document.getElementById('userAvatar');
  if (user.name) {
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    avatar.innerHTML = initials || '<i class="fa fa-user"></i>';
  }
  
  // Fill form
  document.getElementById('fullName').value = user.name || '';
  document.getElementById('username').value = user.username || '';
  document.getElementById('email').value = user.email || '';
  document.getElementById('phone').value = user.phone || '';
  document.getElementById('birthday').value = user.birthday || '';
  document.getElementById('gender').value = user.gender || '';
  
  // Show admin link if admin
  if (user.role === 'admin' || localStorage.getItem('adminLoggedIn') === 'true') {
    const adminLink = document.getElementById('adminLink');
    adminLink.style.display = 'flex';
    adminLink.href = 'admin/dashboard.html';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Edit profile button
  document.getElementById('editProfileBtn').addEventListener('click', toggleEditMode);
  
  // Cancel edit button
  document.getElementById('cancelEditBtn').addEventListener('click', cancelEdit);
  
  // Profile form submit
  document.getElementById('profileForm').addEventListener('submit', saveProfile);
  
  // Password form submit
  document.getElementById('passwordForm').addEventListener('submit', changePassword);
  
  // Password strength checker
  document.getElementById('newPassword').addEventListener('input', checkPasswordStrength);
  
  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  
  // Delete account button
  document.getElementById('deleteAccountBtn').addEventListener('click', deleteAccount);
}

// Toggle edit mode
function toggleEditMode() {
  isEditing = !isEditing;
  
  const inputs = document.querySelectorAll('#profileForm input:not([readonly]), #profileForm select');
  const actions = document.getElementById('profileActions');
  const editBtn = document.getElementById('editProfileBtn');
  
  inputs.forEach(input => {
    input.disabled = !isEditing;
  });
  
  actions.style.display = isEditing ? 'flex' : 'none';
  editBtn.innerHTML = isEditing ? '<i class="fa fa-times"></i> Hủy' : '<i class="fa fa-edit"></i> Chỉnh sửa';
  
  if (isEditing) {
    document.getElementById('fullName').focus();
  }
}

// Cancel edit
function cancelEdit() {
  isEditing = false;
  loadUserData();
  
  const inputs = document.querySelectorAll('#profileForm input:not([readonly]), #profileForm select');
  const actions = document.getElementById('profileActions');
  const editBtn = document.getElementById('editProfileBtn');
  
  inputs.forEach(input => {
    input.disabled = true;
  });
  
  actions.style.display = 'none';
  editBtn.innerHTML = '<i class="fa fa-edit"></i> Chỉnh sửa';
}

// Save profile
function saveProfile(e) {
  e.preventDefault();
  
  const name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const birthday = document.getElementById('birthday').value;
  const gender = document.getElementById('gender').value;
  
  if (!name) {
    showToast('Vui lòng nhập họ và tên', 'error');
    return;
  }
  
  if (!email || !isValidEmail(email)) {
    showToast('Vui lòng nhập email hợp lệ', 'error');
    return;
  }
  
  // Update user data
  currentUser.name = name;
  currentUser.email = email;
  currentUser.phone = phone;
  currentUser.birthday = birthday;
  currentUser.gender = gender;
  
  // Save to localStorage
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  // Update sidebar
  document.getElementById('sidebarUserName').textContent = name;
  document.getElementById('sidebarUserEmail').textContent = email;
  
  // Update avatar
  const avatar = document.getElementById('userAvatar');
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  avatar.innerHTML = initials || '<i class="fa fa-user"></i>';
  
  // Exit edit mode
  cancelEdit();
  
  showToast('Đã cập nhật thông tin thành công!', 'success');
}

// Change password
function changePassword(e) {
  e.preventDefault();
  
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (!currentPassword) {
    showToast('Vui lòng nhập mật khẩu hiện tại', 'error');
    return;
  }
  
  if (!newPassword || newPassword.length < 6) {
    showToast('Mật khẩu mới phải có ít nhất 6 ký tự', 'error');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showToast('Mật khẩu xác nhận không khớp', 'error');
    return;
  }
  
  // In real app, verify current password with server
  // For demo, just update
  currentUser.password = newPassword;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  // Clear form
  document.getElementById('currentPassword').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';
  document.getElementById('passwordStrength').className = 'password-strength';
  
  showToast('Đã đổi mật khẩu thành công!', 'success');
}

// Check password strength
function checkPasswordStrength() {
  const password = document.getElementById('newPassword').value;
  const strengthEl = document.getElementById('passwordStrength');
  
  if (!password) {
    strengthEl.className = 'password-strength';
    return;
  }
  
  let strength = 0;
  
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  if (strength <= 2) {
    strengthEl.className = 'password-strength weak';
  } else if (strength <= 3) {
    strengthEl.className = 'password-strength medium';
  } else {
    strengthEl.className = 'password-strength strong';
  }
}

// Toggle password visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = input.nextElementSibling.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fa fa-eye';
  }
}

// Load stats
function loadStats() {
  // Orders
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const userOrders = orders.filter(o => o.userId === currentUser?.id || o.email === currentUser?.email);
  document.getElementById('totalOrders').textContent = userOrders.length;
  
  // Wishlist
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  document.getElementById('totalWishlist').textContent = wishlist.length;
  
  // Total spent
  const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  document.getElementById('totalSpent').textContent = formatPrice(totalSpent);
  
  // Member since
  if (currentUser?.createdAt) {
    const date = new Date(currentUser.createdAt);
    document.getElementById('memberSince').textContent = date.toLocaleDateString('vi-VN', {
      month: 'short',
      year: 'numeric'
    });
  }
}

// Handle logout
function handleLogout(e) {
  e.preventDefault();
  
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('username');
    localStorage.removeItem('adminUser');
    
    showToast('Đã đăng xuất thành công!', 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
}

// Delete account
function deleteAccount() {
  if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
    if (confirm('Xác nhận lần cuối: TẤT CẢ dữ liệu của bạn sẽ bị xóa vĩnh viễn!')) {
      // Remove user data
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userLoggedIn');
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('userType');
      localStorage.removeItem('username');
      localStorage.removeItem('wishlist');
      
      showToast('Tài khoản đã được xóa', 'success');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    }
  }
}

// Validate email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Format price
function formatPrice(price) {
  return price.toLocaleString('vi-VN') + '₫';
}

// Update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let total = 0;
  cart.forEach(item => total += item.quantity || 1);
  
  const countEl = document.getElementById('cart-count');
  if (countEl) {
    countEl.textContent = total;
    countEl.style.display = total > 0 ? 'flex' : 'none';
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Export functions
window.togglePassword = togglePassword;
