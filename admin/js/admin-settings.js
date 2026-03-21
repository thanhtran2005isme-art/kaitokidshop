// Settings Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  initSettingsTabs();
  initLogoUpload();
  initPaymentToggles();
  loadSettings();
});

// Initialize Payment Toggles
function initPaymentToggles() {
  const paymentSwitches = document.querySelectorAll('.payment-method .switch input');
  
  paymentSwitches.forEach(switchInput => {
    const paymentMethod = switchInput.closest('.payment-method');
    const details = paymentMethod.querySelector('.payment-method-details');
    
    if (details) {
      // Set initial state
      details.style.display = switchInput.checked ? 'block' : 'none';
      details.style.opacity = switchInput.checked ? '1' : '0';
      
      // Toggle on change
      switchInput.addEventListener('change', function() {
        if (this.checked) {
          details.style.display = 'block';
          setTimeout(() => {
            details.style.opacity = '1';
            details.style.transform = 'translateY(0)';
          }, 10);
        } else {
          details.style.opacity = '0';
          details.style.transform = 'translateY(-10px)';
          setTimeout(() => {
            details.style.display = 'none';
          }, 300);
        }
      });
    }
  });
}

// Initialize Settings Tabs
function initSettingsTabs() {
  const tabs = document.querySelectorAll('.settings-tab');
  const panels = document.querySelectorAll('.settings-panel');

  console.log('Found tabs:', tabs.length);
  console.log('Found panels:', panels.length);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetPanel = tab.dataset.tab;
      console.log('Clicked tab:', targetPanel);

      // Remove active class from all tabs and panels
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      // Add active class to clicked tab and corresponding panel
      tab.classList.add('active');
      const panel = document.getElementById(`${targetPanel}-panel`);
      if (panel) {
        panel.classList.add('active');
        console.log('Activated panel:', targetPanel);
      } else {
        console.error('Panel not found:', `${targetPanel}-panel`);
      }
    });
  });
}

// Initialize Logo Upload
function initLogoUpload() {
  const logoInput = document.getElementById('logoInput');
  const logoPreview = document.getElementById('logoPreview');

  if (logoInput) {
    logoInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          logoPreview.src = e.target.result;
          showNotification('Logo đã được tải lên', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// Load Settings from localStorage
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
  
  // Load general settings
  if (settings.general) {
    document.getElementById('storeName').value = settings.general.storeName || 'KAITO KID Fashion';
    document.getElementById('storeSlogan').value = settings.general.storeSlogan || 'Thời trang hiện đại - Phong cách trẻ trung';
    document.getElementById('storeEmail').value = settings.general.storeEmail || 'contact@kaitokid.com';
    document.getElementById('storePhone').value = settings.general.storePhone || '1900 1234';
    document.getElementById('storeAddress').value = settings.general.storeAddress || '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh';
  }

  // Load payment settings
  if (settings.payment) {
    // COD
    document.getElementById('codEnabled').checked = settings.payment.codEnabled !== false;
    document.getElementById('codFee').value = settings.payment.codFee || 0;
    
    // Bank Transfer
    document.getElementById('bankEnabled').checked = settings.payment.bankEnabled !== false;
    
    // General
    if (settings.payment.defaultCurrency) document.getElementById('defaultCurrency').value = settings.payment.defaultCurrency;
    document.getElementById('autoConfirmPayment').checked = settings.payment.autoConfirmPayment !== false;
    document.getElementById('requirePaymentProof').checked = settings.payment.requirePaymentProof || false;
  }

  // Load shipping settings
  if (settings.shipping) {
    document.getElementById('defaultShippingFee').value = settings.shipping.defaultShippingFee || 30000;
    document.getElementById('freeShippingFrom').value = settings.shipping.freeShippingFrom || 500000;
    document.getElementById('estimatedDelivery').value = settings.shipping.estimatedDelivery || '2-3 ngày';
    document.getElementById('enableTracking').checked = settings.shipping.enableTracking !== false;
  }

  // Load email settings
  if (settings.email) {
    document.getElementById('smtpHost').value = settings.email.smtpHost || 'smtp.gmail.com';
    document.getElementById('smtpPort').value = settings.email.smtpPort || 587;
    document.getElementById('smtpEmail').value = settings.email.smtpEmail || 'noreply@kaitokid.com';
    document.getElementById('emailOrderConfirm').checked = settings.email.emailOrderConfirm !== false;
    document.getElementById('emailShipping').checked = settings.email.emailShipping !== false;
    document.getElementById('emailDelivered').checked = settings.email.emailDelivered !== false;
  }

  // Load notification settings
  if (settings.notifications) {
    document.getElementById('notifyNewOrder').checked = settings.notifications.notifyNewOrder !== false;
    document.getElementById('notifyCancelOrder').checked = settings.notifications.notifyCancelOrder !== false;
    document.getElementById('notifyLowStock').checked = settings.notifications.notifyLowStock !== false;
    document.getElementById('notifyOutOfStock').checked = settings.notifications.notifyOutOfStock !== false;
    document.getElementById('notifyNewReview').checked = settings.notifications.notifyNewReview !== false;
    document.getElementById('notifyNewCustomer').checked = settings.notifications.notifyNewCustomer || false;
  }

  // Load security settings
  if (settings.security) {
    document.getElementById('enable2FA').checked = settings.security.enable2FA || false;
    document.getElementById('loginNotification').checked = settings.security.loginNotification !== false;
  }
  
  // Load QR Codes
  setTimeout(loadQRCodes, 100);
}

// QR Code Preview
function previewQRCode(input, bankId) {
  const file = input.files[0];
  const preview = document.getElementById(`qrPreview${bankId}`);
  const removeBtn = document.getElementById(`removeQr${bankId}`);
  
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="QR Code" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
      if (removeBtn) {
        removeBtn.style.display = 'inline-flex';
      }
      // Save to localStorage
      saveQRCodeToStorage(bankId, e.target.result);
      showNotification('Đã tải ảnh QR Code', 'success');
    };
    reader.readAsDataURL(file);
  }
}

// Remove QR Code
function removeQRCode(bankId) {
  const preview = document.getElementById(`qrPreview${bankId}`);
  const removeBtn = document.getElementById(`removeQr${bankId}`);
  const input = document.getElementById(`qrInput${bankId}`);
  
  if (preview) {
    preview.innerHTML = `
      <i class="fa fa-qrcode"></i>
      <span>Chưa có ảnh QR</span>
    `;
  }
  if (removeBtn) {
    removeBtn.style.display = 'none';
  }
  if (input) {
    input.value = '';
  }
  
  // Remove from localStorage
  removeQRCodeFromStorage(bankId);
  showNotification('Đã xóa ảnh QR Code', 'info');
}

// Save QR Code to localStorage
function saveQRCodeToStorage(bankId, imageData) {
  let qrCodes = JSON.parse(localStorage.getItem('bankQRCodes') || '{}');
  qrCodes[bankId] = imageData;
  localStorage.setItem('bankQRCodes', JSON.stringify(qrCodes));
}

// Remove QR Code from localStorage
function removeQRCodeFromStorage(bankId) {
  let qrCodes = JSON.parse(localStorage.getItem('bankQRCodes') || '{}');
  delete qrCodes[bankId];
  localStorage.setItem('bankQRCodes', JSON.stringify(qrCodes));
}

// Load QR Codes from localStorage
function loadQRCodes() {
  const qrCodes = JSON.parse(localStorage.getItem('bankQRCodes') || '{}');
  
  Object.keys(qrCodes).forEach(bankId => {
    const preview = document.getElementById(`qrPreview${bankId}`);
    const removeBtn = document.getElementById(`removeQr${bankId}`);
    
    if (preview && qrCodes[bankId]) {
      preview.innerHTML = `<img src="${qrCodes[bankId]}" alt="QR Code" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
      if (removeBtn) {
        removeBtn.style.display = 'inline-flex';
      }
    }
  });
}

// Save General Settings
function saveGeneralSettings() {
  const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
  
  settings.general = {
    storeName: document.getElementById('storeName').value,
    storeSlogan: document.getElementById('storeSlogan').value,
    storeEmail: document.getElementById('storeEmail').value,
    storePhone: document.getElementById('storePhone').value,
    storeAddress: document.getElementById('storeAddress').value
  };

  localStorage.setItem('adminSettings', JSON.stringify(settings));
  showNotification('Đã lưu thông tin cửa hàng', 'success');
}



// Add Bank Account
function addBankAccount() {
  const bankAccountsList = document.querySelector('.bank-accounts-list');
  const accountCount = bankAccountsList.children.length + 1;
  
  const newAccount = document.createElement('div');
  newAccount.className = 'bank-account-item';
  newAccount.setAttribute('data-bank-id', accountCount);
  newAccount.innerHTML = `
    <button type="button" class="btn-remove-bank" onclick="removeBankAccount(this)">
      <i class="fa fa-times"></i>
    </button>
    <div class="form-group">
      <label>Tên ngân hàng</label>
      <select class="bank-name">
        <option value="Vietcombank">Vietcombank</option>
        <option value="VietinBank">VietinBank</option>
        <option value="BIDV">BIDV</option>
        <option value="Agribank">Agribank</option>
        <option value="Techcombank">Techcombank</option>
        <option value="MB Bank">MB Bank</option>
        <option value="ACB">ACB</option>
        <option value="VPBank">VPBank</option>
        <option value="TPBank">TPBank</option>
        <option value="Sacombank">Sacombank</option>
      </select>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Số tài khoản</label>
        <input type="text" class="bank-account" placeholder="Nhập số tài khoản">
      </div>
      <div class="form-group">
        <label>Chủ tài khoản</label>
        <input type="text" class="bank-owner" placeholder="Nhập tên chủ tài khoản">
      </div>
    </div>
    <div class="form-group">
      <label>Ảnh QR Code</label>
      <div class="qr-upload-area">
        <div class="qr-preview" id="qrPreview${accountCount}">
          <i class="fa fa-qrcode"></i>
          <span>Chưa có ảnh QR</span>
        </div>
        <div class="qr-actions">
          <button type="button" class="btn-upload-qr" onclick="document.getElementById('qrInput${accountCount}').click()">
            <i class="fa fa-upload"></i> Tải ảnh QR
          </button>
          <button type="button" class="btn-remove-qr" onclick="removeQRCode(${accountCount})" style="display:none;" id="removeQr${accountCount}">
            <i class="fa fa-trash"></i> Xóa
          </button>
          <input type="file" id="qrInput${accountCount}" accept="image/*" hidden onchange="previewQRCode(this, ${accountCount})">
        </div>
      </div>
      <span class="help-text">Tải lên ảnh mã QR để khách hàng quét thanh toán</span>
    </div>
  `;
  
  bankAccountsList.appendChild(newAccount);
  showNotification('Đã thêm tài khoản ngân hàng', 'success');
}

// Remove Bank Account
function removeBankAccount(button) {
  const accountItem = button.closest('.bank-account-item');
  accountItem.style.opacity = '0';
  accountItem.style.transform = 'translateX(-20px)';
  
  setTimeout(() => {
    accountItem.remove();
    showNotification('Đã xóa tài khoản ngân hàng', 'info');
  }, 300);
}

// Save Payment Settings
function savePaymentSettings() {
  const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
  
  // Collect bank accounts
  const bankAccounts = [];
  const bankAccountItems = document.querySelectorAll('.bank-account-item');
  bankAccountItems.forEach((item, index) => {
    const accountNum = index + 1;
    bankAccounts.push({
      bankName: document.getElementById(`bankName${accountNum}`)?.value || '',
      accountNumber: document.getElementById(`bankAccount${accountNum}`)?.value || '',
      accountOwner: document.getElementById(`bankOwner${accountNum}`)?.value || '',
      branch: document.getElementById(`bankBranch${accountNum}`)?.value || ''
    });
  });
  
  settings.payment = {
    // COD
    codEnabled: document.getElementById('codEnabled').checked,
    codFee: parseFloat(document.getElementById('codFee').value) || 0,
    
    // Bank Transfer
    bankEnabled: document.getElementById('bankEnabled').checked,
    bankAccounts: bankAccounts,
    
    // General
    defaultCurrency: document.getElementById('defaultCurrency').value,
    autoConfirmPayment: document.getElementById('autoConfirmPayment').checked,
    requirePaymentProof: document.getElementById('requirePaymentProof').checked
  };

  localStorage.setItem('adminSettings', JSON.stringify(settings));
  showNotification('Đã lưu cài đặt thanh toán', 'success');
}

// Test Payment Gateway
function testPaymentGateway() {
  showNotification('Đang kiểm tra kết nối với cổng thanh toán...', 'info');
  
  // Simulate testing payment gateways
  setTimeout(() => {
    const enabledGateways = [];
    
    if (document.getElementById('codEnabled').checked) enabledGateways.push('COD');
    if (document.getElementById('bankEnabled').checked) enabledGateways.push('Chuyển khoản');
    
    if (enabledGateways.length > 0) {
      showNotification(`Kết nối thành công: ${enabledGateways.join(', ')}`, 'success');
    } else {
      showNotification('Chưa có phương thức thanh toán nào được kích hoạt', 'error');
    }
  }, 2000);
}

// Save Shipping Settings
function saveShippingSettings() {
  const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
  
  settings.shipping = {
    defaultShippingFee: parseInt(document.getElementById('defaultShippingFee').value),
    freeShippingFrom: parseInt(document.getElementById('freeShippingFrom').value),
    estimatedDelivery: document.getElementById('estimatedDelivery').value,
    enableTracking: document.getElementById('enableTracking').checked
  };

  localStorage.setItem('adminSettings', JSON.stringify(settings));
  showNotification('Đã lưu cài đặt vận chuyển', 'success');
}

// Save Email Settings
function saveEmailSettings() {
  const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
  
  settings.email = {
    smtpHost: document.getElementById('smtpHost').value,
    smtpPort: parseInt(document.getElementById('smtpPort').value),
    smtpEmail: document.getElementById('smtpEmail').value,
    smtpPassword: document.getElementById('smtpPassword').value,
    emailOrderConfirm: document.getElementById('emailOrderConfirm').checked,
    emailShipping: document.getElementById('emailShipping').checked,
    emailDelivered: document.getElementById('emailDelivered').checked
  };

  localStorage.setItem('adminSettings', JSON.stringify(settings));
  showNotification('Đã lưu cài đặt email', 'success');
}

// Test Email
function testEmail() {
  showNotification('Đang gửi email test...', 'info');
  
  // Simulate sending test email
  setTimeout(() => {
    showNotification('Email test đã được gửi thành công!', 'success');
  }, 2000);
}

// Save Notification Settings
function saveNotificationSettings() {
  const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
  
  settings.notifications = {
    notifyNewOrder: document.getElementById('notifyNewOrder').checked,
    notifyCancelOrder: document.getElementById('notifyCancelOrder').checked,
    notifyLowStock: document.getElementById('notifyLowStock').checked,
    notifyOutOfStock: document.getElementById('notifyOutOfStock').checked,
    notifyNewReview: document.getElementById('notifyNewReview').checked,
    notifyNewCustomer: document.getElementById('notifyNewCustomer').checked
  };

  localStorage.setItem('adminSettings', JSON.stringify(settings));
  showNotification('Đã lưu cài đặt thông báo', 'success');
}

// Save Security Settings
function saveSecuritySettings() {
  const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
  
  settings.security = {
    enable2FA: document.getElementById('enable2FA').checked,
    loginNotification: document.getElementById('loginNotification').checked
  };

  localStorage.setItem('adminSettings', JSON.stringify(settings));
  showNotification('Đã lưu cài đặt bảo mật', 'success');
}

// Change Password
function changePassword() {
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    showNotification('Vui lòng điền đầy đủ thông tin', 'error');
    return;
  }

  if (newPassword !== confirmPassword) {
    showNotification('Mật khẩu xác nhận không khớp', 'error');
    return;
  }

  if (newPassword.length < 6) {
    showNotification('Mật khẩu phải có ít nhất 6 ký tự', 'error');
    return;
  }

  // Simulate password change
  showNotification('Đang đổi mật khẩu...', 'info');
  
  setTimeout(() => {
    showNotification('Đổi mật khẩu thành công!', 'success');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
  }, 1500);
}

// Show Notification
function showNotification(message, type = 'info') {
  // Remove existing notification
  const existingNotification = document.querySelector('.notification-toast');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification-toast notification-${type}`;
  
  const icon = type === 'success' ? 'fa-check-circle' : 
               type === 'error' ? 'fa-exclamation-circle' : 
               'fa-info-circle';
  
  notification.innerHTML = `
    <i class="fa ${icon}"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  // Hide and remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Add notification toast styles
if (!document.getElementById('notification-toast-styles')) {
  const notificationStyles = document.createElement('style');
  notificationStyles.id = 'notification-toast-styles';
  notificationStyles.textContent = `
    .notification-toast {
      position: fixed;
      top: 100px;
      right: 30px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      transform: translateX(400px);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(20px);
    }

    .notification-toast.show {
      transform: translateX(0);
    }

    .notification-toast i {
      font-size: 20px;
    }

    .notification-success {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(52, 211, 153, 0.95));
      color: #ffffff;
    }

    .notification-error {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(248, 113, 113, 0.95));
      color: #ffffff;
    }

    .notification-info {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(139, 92, 246, 0.95));
      color: #ffffff;
    }
  `;
  document.head.appendChild(notificationStyles);
}
