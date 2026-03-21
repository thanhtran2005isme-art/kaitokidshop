// Login & Register Page JavaScript

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  initTabs();
  initForms();
  initPasswordStrength();
  initDefaultAdmin();
});

// Initialize default admin account
function initDefaultAdmin() {
  if (!localStorage.getItem('adminCredentials')) {
    const defaultAdmin = {
      username: 'admin',
      password: 'admin123',
      email: 'admin@kaitokid.com'
    };
    localStorage.setItem('adminCredentials', JSON.stringify(defaultAdmin));
  }
  
  // Initialize users array if not exists
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
  }
}

// Tab Switching
function initTabs() {
  const tabs = document.querySelectorAll('.auth-tab');
  const indicator = document.querySelector('.tab-indicator');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  // Update tabs
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  // Update indicator position
  const indicator = document.querySelector('.tab-indicator');
  if (tabName === 'register') {
    indicator.style.left = 'calc(50%)';
  } else {
    indicator.style.left = '6px';
  }
  
  // Update forms
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.toggle('active', form.dataset.form === tabName);
  });
  
  // Clear errors
  clearMessages();
}

// Form Handling
function initForms() {
  // Login Form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Register Form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
}

// Handle Login
function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  const submitBtn = e.target.querySelector('.btn-submit');
  
  // Clear previous errors
  clearMessages();
  
  // Validate
  if (!email || !password) {
    showError('loginError', 'Vui lòng nhập đầy đủ thông tin');
    return;
  }
  
  // Show loading
  submitBtn.classList.add('loading');
  
  // Simulate API call
  setTimeout(() => {
    // Check admin credentials
    const adminCredentials = JSON.parse(localStorage.getItem('adminCredentials') || '{}');
    
    if ((email === adminCredentials.username || email === adminCredentials.email) && 
        password === adminCredentials.password) {
      // Admin login
      loginSuccess({
        name: 'Administrator',
        email: adminCredentials.email,
        role: 'admin',
        username: adminCredentials.username
      }, rememberMe);
      return;
    }
    
    // Check registered users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => (u.email === email || u.phone === email) && u.password === password);
    
    if (user) {
      // User login
      loginSuccess({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: 'user'
      }, rememberMe);
      return;
    }
    
    // Login failed - account not found or wrong password
    submitBtn.classList.remove('loading');
    showError('loginError', 'Email/số điện thoại hoặc mật khẩu không đúng');
    
  }, 800);
}

function loginSuccess(userData, rememberMe) {
  // Store user data
  localStorage.setItem('currentUser', JSON.stringify(userData));
  localStorage.setItem('userLoggedIn', 'true');
  localStorage.setItem('userType', userData.role);
  localStorage.setItem('username', userData.name || userData.username || userData.email);
  
  // Store user phone and email for order tracking
  if (userData.phone) {
    localStorage.setItem('userPhone', userData.phone);
  }
  if (userData.email) {
    localStorage.setItem('userEmail', userData.email);
  }
  
  if (userData.role === 'admin') {
    localStorage.setItem('adminLoggedIn', 'true');
    localStorage.setItem('adminUser', userData.username);
  }
  
  if (rememberMe) {
    localStorage.setItem('rememberLogin', 'true');
  }
  
  // Redirect
  window.location.href = 'index.html';
}

// Handle Register
function handleRegister(e) {
  e.preventDefault();
  
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const phone = document.getElementById('registerPhone').value.trim();
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const agreeTerms = document.getElementById('agreeTerms').checked;
  const submitBtn = e.target.querySelector('.btn-submit');
  
  // Clear previous messages
  clearMessages();
  
  // Validate
  if (!name || !email || !phone || !password || !confirmPassword) {
    showError('registerError', 'Vui lòng nhập đầy đủ thông tin');
    return;
  }
  
  if (!validateEmail(email)) {
    showError('registerError', 'Email không hợp lệ');
    return;
  }
  
  if (!validatePhone(phone)) {
    showError('registerError', 'Số điện thoại không hợp lệ');
    return;
  }
  
  if (password.length < 6) {
    showError('registerError', 'Mật khẩu phải có ít nhất 6 ký tự');
    return;
  }
  
  if (password !== confirmPassword) {
    showError('registerError', 'Mật khẩu xác nhận không khớp');
    return;
  }
  
  if (!agreeTerms) {
    showError('registerError', 'Vui lòng đồng ý với điều khoản dịch vụ');
    return;
  }
  
  // Check if email already exists
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.find(u => u.email === email)) {
    showError('registerError', 'Email này đã được đăng ký');
    return;
  }
  
  // Show loading
  submitBtn.classList.add('loading');
  
  // Simulate API call
  setTimeout(() => {
    // Save new user
    const newUser = {
      id: Date.now(),
      name,
      email,
      phone,
      password,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    submitBtn.classList.remove('loading');
    
    // Show success
    showSuccess('registerSuccess', 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
    
    // Switch to login after 2 seconds
    setTimeout(() => {
      switchTab('login');
      document.getElementById('loginEmail').value = email;
    }, 2000);
    
  }, 1000);
}

// Password Strength Indicator
function initPasswordStrength() {
  const passwordInput = document.getElementById('registerPassword');
  const strengthIndicator = document.getElementById('passwordStrength');
  
  if (passwordInput && strengthIndicator) {
    passwordInput.addEventListener('input', () => {
      const password = passwordInput.value;
      const strength = checkPasswordStrength(password);
      
      strengthIndicator.className = 'password-strength';
      if (password.length > 0) {
        strengthIndicator.classList.add(strength);
      }
    });
  }
}

function checkPasswordStrength(password) {
  let score = 0;
  
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
}

// Toggle Password Visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = input.parentElement.querySelector('.toggle-password i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// Validation Helpers
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  return /^[0-9]{10,11}$/.test(phone.replace(/\s/g, ''));
}

// Message Helpers
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.classList.add('show');
    element.parentElement.classList.add('shake');
    setTimeout(() => element.parentElement.classList.remove('shake'), 300);
  }
}

function showSuccess(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = message;
    element.classList.add('show');
  }
}

function clearMessages() {
  document.querySelectorAll('.error-message, .success-message').forEach(el => {
    el.classList.remove('show');
    el.textContent = '';
  });
}

// Export for global use
window.switchTab = switchTab;
window.togglePassword = togglePassword;
