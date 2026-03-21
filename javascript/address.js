// Address Management System
let addresses = [];
let currentUser = null;
let editingAddressId = null;
let deletingAddressId = null;

// Vietnam provinces data
const vietnamData = {
  provinces: [
    { id: 'hanoi', name: 'Hà Nội' },
    { id: 'hcm', name: 'TP. Hồ Chí Minh' },
    { id: 'danang', name: 'Đà Nẵng' },
    { id: 'haiphong', name: 'Hải Phòng' },
    { id: 'cantho', name: 'Cần Thơ' },
    { id: 'binhduong', name: 'Bình Dương' },
    { id: 'dongnai', name: 'Đồng Nai' },
    { id: 'quangninh', name: 'Quảng Ninh' },
    { id: 'thanhhoa', name: 'Thanh Hóa' },
    { id: 'nghean', name: 'Nghệ An' },
    { id: 'hatinh', name: 'Hà Tĩnh' },
    { id: 'quangbinh', name: 'Quảng Bình' },
    { id: 'hue', name: 'Thừa Thiên Huế' },
    { id: 'quangnam', name: 'Quảng Nam' },
    { id: 'quangngai', name: 'Quảng Ngãi' },
    { id: 'binhdinh', name: 'Bình Định' },
    { id: 'phuyen', name: 'Phú Yên' },
    { id: 'khanhhoa', name: 'Khánh Hòa' },
    { id: 'ninhthuan', name: 'Ninh Thuận' },
    { id: 'binhthuan', name: 'Bình Thuận' },
    { id: 'lamdong', name: 'Lâm Đồng' },
    { id: 'gialai', name: 'Gia Lai' },
    { id: 'daklak', name: 'Đắk Lắk' },
    { id: 'daknong', name: 'Đắk Nông' },
    { id: 'kontum', name: 'Kon Tum' },
    { id: 'longan', name: 'Long An' },
    { id: 'tiengiang', name: 'Tiền Giang' },
    { id: 'bentre', name: 'Bến Tre' },
    { id: 'travinh', name: 'Trà Vinh' },
    { id: 'vinhlong', name: 'Vĩnh Long' },
    { id: 'dongthap', name: 'Đồng Tháp' },
    { id: 'angiang', name: 'An Giang' },
    { id: 'kiengiang', name: 'Kiên Giang' },
    { id: 'haugiang', name: 'Hậu Giang' },
    { id: 'soctrang', name: 'Sóc Trăng' },
    { id: 'baclieu', name: 'Bạc Liêu' },
    { id: 'camau', name: 'Cà Mau' },
    { id: 'tayninh', name: 'Tây Ninh' },
    { id: 'binhphuoc', name: 'Bình Phước' },
    { id: 'brvt', name: 'Bà Rịa - Vũng Tàu' },
    { id: 'namdinh', name: 'Nam Định' },
    { id: 'thaibinh', name: 'Thái Bình' },
    { id: 'hungyen', name: 'Hưng Yên' },
    { id: 'haiduong', name: 'Hải Dương' },
    { id: 'bacninh', name: 'Bắc Ninh' },
    { id: 'bacgiang', name: 'Bắc Giang' },
    { id: 'langson', name: 'Lạng Sơn' },
    { id: 'caobang', name: 'Cao Bằng' },
    { id: 'hagiang', name: 'Hà Giang' },
    { id: 'tuyenquang', name: 'Tuyên Quang' },
    { id: 'laocai', name: 'Lào Cai' },
    { id: 'yenbai', name: 'Yên Bái' },
    { id: 'thainguyen', name: 'Thái Nguyên' },
    { id: 'phutho', name: 'Phú Thọ' },
    { id: 'vinhphuc', name: 'Vĩnh Phúc' },
    { id: 'ninhbinh', name: 'Ninh Bình' },
    { id: 'hoabinh', name: 'Hòa Bình' },
    { id: 'sonla', name: 'Sơn La' },
    { id: 'dienbien', name: 'Điện Biên' },
    { id: 'laichau', name: 'Lai Châu' },
    { id: 'backan', name: 'Bắc Kạn' }
  ],
  districts: {
    'hanoi': [
      { id: 'hoankiem', name: 'Quận Hoàn Kiếm' },
      { id: 'dongda', name: 'Quận Đống Đa' },
      { id: 'badinh', name: 'Quận Ba Đình' },
      { id: 'haibatrung', name: 'Quận Hai Bà Trưng' },
      { id: 'hoangmai', name: 'Quận Hoàng Mai' },
      { id: 'thanhxuan', name: 'Quận Thanh Xuân' },
      { id: 'caugiay', name: 'Quận Cầu Giấy' },
      { id: 'longbien', name: 'Quận Long Biên' },
      { id: 'tayho', name: 'Quận Tây Hồ' },
      { id: 'namtuliem', name: 'Quận Nam Từ Liêm' },
      { id: 'bactuliem', name: 'Quận Bắc Từ Liêm' },
      { id: 'hadong', name: 'Quận Hà Đông' }
    ],
    'hcm': [
      { id: 'quan1', name: 'Quận 1' },
      { id: 'quan2', name: 'Quận 2 (TP. Thủ Đức)' },
      { id: 'quan3', name: 'Quận 3' },
      { id: 'quan4', name: 'Quận 4' },
      { id: 'quan5', name: 'Quận 5' },
      { id: 'quan6', name: 'Quận 6' },
      { id: 'quan7', name: 'Quận 7' },
      { id: 'quan8', name: 'Quận 8' },
      { id: 'quan9', name: 'Quận 9 (TP. Thủ Đức)' },
      { id: 'quan10', name: 'Quận 10' },
      { id: 'quan11', name: 'Quận 11' },
      { id: 'quan12', name: 'Quận 12' },
      { id: 'binhtan', name: 'Quận Bình Tân' },
      { id: 'binhthanh', name: 'Quận Bình Thạnh' },
      { id: 'govap', name: 'Quận Gò Vấp' },
      { id: 'phunhuan', name: 'Quận Phú Nhuận' },
      { id: 'tanbinh', name: 'Quận Tân Bình' },
      { id: 'tanphu', name: 'Quận Tân Phú' },
      { id: 'thuduc', name: 'TP. Thủ Đức' }
    ],
    'danang': [
      { id: 'haichau', name: 'Quận Hải Châu' },
      { id: 'thanhkhe', name: 'Quận Thanh Khê' },
      { id: 'sontra', name: 'Quận Sơn Trà' },
      { id: 'nguhanhson', name: 'Quận Ngũ Hành Sơn' },
      { id: 'lienchieu', name: 'Quận Liên Chiểu' },
      { id: 'camle', name: 'Quận Cẩm Lệ' }
    ]
  },
  wards: {
    'caugiay': [
      { id: 'dichvong', name: 'Phường Dịch Vọng' },
      { id: 'dichvonghau', name: 'Phường Dịch Vọng Hậu' },
      { id: 'maidinh', name: 'Phường Mai Dịch' },
      { id: 'nghiado', name: 'Phường Nghĩa Đô' },
      { id: 'nghiatan', name: 'Phường Nghĩa Tân' },
      { id: 'quantrung', name: 'Phường Quan Hoa' },
      { id: 'trunghoai', name: 'Phường Trung Hòa' },
      { id: 'yenhoa', name: 'Phường Yên Hòa' }
    ],
    'dongda': [
      { id: 'catlinh', name: 'Phường Cát Linh' },
      { id: 'hangbot', name: 'Phường Hàng Bột' },
      { id: 'khahthuong', name: 'Phường Khâm Thiên' },
      { id: 'kimliên', name: 'Phường Kim Liên' },
      { id: 'langha', name: 'Phường Láng Hạ' },
      { id: 'langthuong', name: 'Phường Láng Thượng' },
      { id: 'namđong', name: 'Phường Nam Đồng' },
      { id: 'ngatu', name: 'Phường Ngã Tư Sở' },
      { id: 'ocalachs', name: 'Phường Ô Chợ Dừa' },
      { id: 'phuongboi', name: 'Phường Phương Liên' },
      { id: 'phuongmai', name: 'Phường Phương Mai' },
      { id: 'quoctugiám', name: 'Phường Quốc Tử Giám' },
      { id: 'thinhquang', name: 'Phường Thịnh Quang' },
      { id: 'trungliet', name: 'Phường Trung Liệt' },
      { id: 'trunhgphung', name: 'Phường Trung Phụng' },
      { id: 'trungtự', name: 'Phường Trung Tự' },
      { id: 'vanmieu', name: 'Phường Văn Miếu' },
      { id: 'vančhương', name: 'Phường Văn Chương' }
    ],
    'quan1': [
      { id: 'benthanh', name: 'Phường Bến Thành' },
      { id: 'benghe', name: 'Phường Bến Nghé' },
      { id: 'codang', name: 'Phường Cô Giang' },
      { id: 'caugho', name: 'Phường Cầu Kho' },
      { id: 'cauonglanh', name: 'Phường Cầu Ông Lãnh' },
      { id: 'dakao', name: 'Phường Đa Kao' },
      { id: 'nguyenthaimbinh', name: 'Phường Nguyễn Thái Bình' },
      { id: 'nguyencutrinhh', name: 'Phường Nguyễn Cư Trinh' },
      { id: 'phamngulao', name: 'Phường Phạm Ngũ Lão' },
      { id: 'tantĩnh', name: 'Phường Tân Định' }
    ],
    'quan7': [
      { id: 'tanphong', name: 'Phường Tân Phong' },
      { id: 'tanthuan', name: 'Phường Tân Thuận Đông' },
      { id: 'tanthuantay', name: 'Phường Tân Thuận Tây' },
      { id: 'tanquy', name: 'Phường Tân Quy' },
      { id: 'phumy', name: 'Phường Phú Mỹ' },
      { id: 'phuthuanw', name: 'Phường Phú Thuận' },
      { id: 'tanphuthung', name: 'Phường Tân Phú' },
      { id: 'tanhung', name: 'Phường Tân Hưng' },
      { id: 'binhthuan', name: 'Phường Bình Thuận' },
      { id: 'tankieng', name: 'Phường Tân Kiểng' }
    ]
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Load user info
  loadUserInfo();
  
  // Load addresses
  loadAddresses();
  
  // Load provinces
  loadProvinces();
  
  // Setup form handler
  setupFormHandler();
  
  // Setup logout
  setupLogout();
});

// Load user info
function loadUserInfo() {
  if (currentUser) {
    // Update sidebar
    document.getElementById('sidebarUserName').textContent = currentUser.name || currentUser.username || 'Người dùng';
    document.getElementById('sidebarUserEmail').textContent = currentUser.email || '';
    
    // Show admin link if user is admin
    if (currentUser.role === 'admin') {
      const adminLink = document.getElementById('adminLink');
      if (adminLink) adminLink.style.display = 'flex';
      
      const adminMenuItem = document.getElementById('adminMenuItem');
      if (adminMenuItem) adminMenuItem.style.display = 'flex';
    }
    
    // Update header account dropdown
    const accountGuest = document.getElementById('accountGuest');
    const accountUser = document.getElementById('accountUser');
    
    if (accountGuest) accountGuest.style.display = 'none';
    if (accountUser) {
      accountUser.style.display = 'block';
      const userName = accountUser.querySelector('#userName');
      const userEmail = accountUser.querySelector('#userEmail');
      if (userName) userName.textContent = currentUser.name || currentUser.username;
      if (userEmail) userEmail.textContent = currentUser.email;
    }
  }
}

// Load addresses from localStorage
function loadAddresses() {
  const key = `addresses_${currentUser.username || currentUser.email}`;
  const saved = localStorage.getItem(key);
  
  addresses = saved ? JSON.parse(saved) : [];
  
  displayAddresses();
}

// Save addresses to localStorage
function saveAddresses() {
  const key = `addresses_${currentUser.username || currentUser.email}`;
  localStorage.setItem(key, JSON.stringify(addresses));
}

// Display addresses
function displayAddresses() {
  const container = document.getElementById('addressList');
  const emptyState = document.getElementById('emptyAddress');
  
  if (!container) return;
  
  if (addresses.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }
  
  if (emptyState) emptyState.style.display = 'none';
  
  // Sort: default first, then by created date
  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  container.innerHTML = sortedAddresses.map(addr => createAddressCard(addr)).join('');
}

// Create address card HTML
function createAddressCard(address) {
  const typeLabel = address.type === 'office' ? 'Văn phòng' : 'Nhà riêng';
  const typeClass = address.type === 'office' ? 'badge-office' : 'badge-home';
  const typeIcon = address.type === 'office' ? 'fa-building' : 'fa-home';
  
  return `
    <div class="address-card ${address.isDefault ? 'default' : ''}" data-id="${address.id}">
      <div class="address-card-header">
        <div class="address-user-info">
          <h4>${address.fullName}</h4>
          <span class="address-phone">${address.phone}</span>
        </div>
        <div class="address-badges">
          ${address.isDefault ? '<span class="badge badge-default"><i class="fa fa-check"></i> Mặc định</span>' : ''}
          <span class="badge ${typeClass}"><i class="fa ${typeIcon}"></i> ${typeLabel}</span>
        </div>
      </div>
      
      <div class="address-content">
        <div class="address-detail">
          <i class="fa fa-map-marker-alt"></i>
          <span>${address.streetAddress}, ${address.wardName}, ${address.districtName}, ${address.provinceName}</span>
        </div>
        ${address.note ? `
        <div class="address-note">
          <i class="fa fa-sticky-note"></i>
          <span>${address.note}</span>
        </div>
        ` : ''}
      </div>
      
      <div class="address-actions">
        <button class="btn-address-action btn-edit" onclick="editAddress('${address.id}')">
          <i class="fa fa-edit"></i> Sửa
        </button>
        <button class="btn-address-action btn-delete" onclick="deleteAddress('${address.id}')">
          <i class="fa fa-trash"></i> Xóa
        </button>
        ${!address.isDefault ? `
        <button class="btn-address-action btn-set-default" onclick="setDefaultAddress('${address.id}')">
          <i class="fa fa-check-circle"></i> Đặt mặc định
        </button>
        ` : ''}
      </div>
    </div>
  `;
}

// Load provinces dropdown
function loadProvinces() {
  const select = document.getElementById('province');
  if (!select) return;
  
  select.innerHTML = '<option value="">Chọn Tỉnh/Thành phố</option>';
  
  vietnamData.provinces.forEach(province => {
    const option = document.createElement('option');
    option.value = province.id;
    option.textContent = province.name;
    select.appendChild(option);
  });
}

// Load districts when province changes
function loadDistricts() {
  const provinceSelect = document.getElementById('province');
  const districtSelect = document.getElementById('district');
  const wardSelect = document.getElementById('ward');
  
  const provinceId = provinceSelect.value;
  
  // Reset district and ward
  districtSelect.innerHTML = '<option value="">Chọn Quận/Huyện</option>';
  wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
  wardSelect.disabled = true;
  
  if (!provinceId) {
    districtSelect.disabled = true;
    return;
  }
  
  districtSelect.disabled = false;
  
  const districts = vietnamData.districts[provinceId] || [];
  
  if (districts.length === 0) {
    // Generate generic districts if not available
    for (let i = 1; i <= 5; i++) {
      const option = document.createElement('option');
      option.value = `district_${i}`;
      option.textContent = `Quận/Huyện ${i}`;
      districtSelect.appendChild(option);
    }
  } else {
    districts.forEach(district => {
      const option = document.createElement('option');
      option.value = district.id;
      option.textContent = district.name;
      districtSelect.appendChild(option);
    });
  }
}

// Load wards when district changes
function loadWards() {
  const districtSelect = document.getElementById('district');
  const wardSelect = document.getElementById('ward');
  
  const districtId = districtSelect.value;
  
  // Reset ward
  wardSelect.innerHTML = '<option value="">Chọn Phường/Xã</option>';
  
  if (!districtId) {
    wardSelect.disabled = true;
    return;
  }
  
  wardSelect.disabled = false;
  
  const wards = vietnamData.wards[districtId] || [];
  
  if (wards.length === 0) {
    // Generate generic wards if not available
    for (let i = 1; i <= 10; i++) {
      const option = document.createElement('option');
      option.value = `ward_${i}`;
      option.textContent = `Phường/Xã ${i}`;
      wardSelect.appendChild(option);
    }
  } else {
    wards.forEach(ward => {
      const option = document.createElement('option');
      option.value = ward.id;
      option.textContent = ward.name;
      wardSelect.appendChild(option);
    });
  }
}

// Open address modal
function openAddressModal(addressId = null) {
  const modal = document.getElementById('addressModal');
  const form = document.getElementById('addressForm');
  const title = document.getElementById('modalTitle');
  
  // Reset form
  form.reset();
  document.getElementById('district').disabled = true;
  document.getElementById('ward').disabled = true;
  
  if (addressId) {
    // Edit mode
    editingAddressId = addressId;
    title.textContent = 'Sửa địa chỉ';
    
    const address = addresses.find(a => a.id === addressId);
    if (address) {
      document.getElementById('addressId').value = address.id;
      document.getElementById('fullName').value = address.fullName;
      document.getElementById('phone').value = address.phone;
      document.getElementById('province').value = address.province;
      
      // Load and set district
      loadDistricts();
      setTimeout(() => {
        document.getElementById('district').value = address.district;
        loadWards();
        setTimeout(() => {
          document.getElementById('ward').value = address.ward;
        }, 50);
      }, 50);
      
      document.getElementById('streetAddress').value = address.streetAddress;
      document.getElementById('note').value = address.note || '';
      document.getElementById('isDefault').checked = address.isDefault;
      
      // Set address type
      const typeRadio = document.querySelector(`input[name="addressType"][value="${address.type}"]`);
      if (typeRadio) typeRadio.checked = true;
    }
  } else {
    // Add mode
    editingAddressId = null;
    title.textContent = 'Thêm địa chỉ mới';
    document.getElementById('addressId').value = '';
    
    // Pre-fill with user info if available
    if (currentUser) {
      document.getElementById('fullName').value = currentUser.name || '';
      document.getElementById('phone').value = currentUser.phone || '';
    }
    
    // Set default if no addresses
    if (addresses.length === 0) {
      document.getElementById('isDefault').checked = true;
    }
  }
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close address modal
function closeAddressModal() {
  const modal = document.getElementById('addressModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  editingAddressId = null;
}

// Setup form handler
function setupFormHandler() {
  const form = document.getElementById('addressForm');
  if (!form) return;
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    const typeRadio = document.querySelector('input[name="addressType"]:checked');
    
    const addressData = {
      fullName: document.getElementById('fullName').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      province: provinceSelect.value,
      provinceName: provinceSelect.options[provinceSelect.selectedIndex].text,
      district: districtSelect.value,
      districtName: districtSelect.options[districtSelect.selectedIndex].text,
      ward: wardSelect.value,
      wardName: wardSelect.options[wardSelect.selectedIndex].text,
      streetAddress: document.getElementById('streetAddress').value.trim(),
      note: document.getElementById('note').value.trim(),
      type: typeRadio ? typeRadio.value : 'home',
      isDefault: document.getElementById('isDefault').checked
    };
    
    // Validate
    if (!addressData.fullName || !addressData.phone || !addressData.province || 
        !addressData.district || !addressData.ward || !addressData.streetAddress) {
      showNotification('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }
    
    // Validate phone
    if (!/^[0-9]{10,11}$/.test(addressData.phone.replace(/\s/g, ''))) {
      showNotification('Số điện thoại không hợp lệ', 'error');
      return;
    }
    
    if (editingAddressId) {
      // Update existing address
      const index = addresses.findIndex(a => a.id === editingAddressId);
      if (index > -1) {
        // If setting as default, remove default from others
        if (addressData.isDefault) {
          addresses.forEach(a => a.isDefault = false);
        }
        
        addresses[index] = {
          ...addresses[index],
          ...addressData,
          updatedAt: new Date().toISOString()
        };
        
        showNotification('Đã cập nhật địa chỉ', 'success');
      }
    } else {
      // Add new address
      // If setting as default, remove default from others
      if (addressData.isDefault) {
        addresses.forEach(a => a.isDefault = false);
      }
      
      // If this is the first address, set as default
      if (addresses.length === 0) {
        addressData.isDefault = true;
      }
      
      const newAddress = {
        id: 'addr_' + Date.now(),
        ...addressData,
        createdAt: new Date().toISOString()
      };
      
      addresses.push(newAddress);
      showNotification('Đã thêm địa chỉ mới', 'success');
    }
    
    saveAddresses();
    displayAddresses();
    closeAddressModal();
  });
}

// Edit address
function editAddress(addressId) {
  openAddressModal(addressId);
}

// Delete address
function deleteAddress(addressId) {
  deletingAddressId = addressId;
  const modal = document.getElementById('deleteModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close delete modal
function closeDeleteModal() {
  const modal = document.getElementById('deleteModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
  deletingAddressId = null;
}

// Confirm delete
function confirmDelete() {
  if (!deletingAddressId) return;
  
  const address = addresses.find(a => a.id === deletingAddressId);
  
  addresses = addresses.filter(a => a.id !== deletingAddressId);
  
  // If deleted address was default and there are other addresses, set first as default
  if (address && address.isDefault && addresses.length > 0) {
    addresses[0].isDefault = true;
  }
  
  saveAddresses();
  displayAddresses();
  closeDeleteModal();
  showNotification('Đã xóa địa chỉ', 'success');
}

// Set default address
function setDefaultAddress(addressId) {
  addresses.forEach(a => {
    a.isDefault = (a.id === addressId);
  });
  
  saveAddresses();
  displayAddresses();
  showNotification('Đã đặt làm địa chỉ mặc định', 'success');
}

// Setup logout
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  const logoutBtnSidebar = document.getElementById('logoutBtnSidebar');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
  
  if (logoutBtnSidebar) {
    logoutBtnSidebar.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
}

function logout() {
  if (confirm('Bạn có chắc muốn đăng xuất?')) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
  }
}

// Show notification
function showNotification(message, type = 'success') {
  // Remove existing notifications
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification-toast ${type}`;
  notification.innerHTML = `
    <i class="fa fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <div class="message">
      <strong>${type === 'success' ? 'Thành công!' : 'Lỗi'}</strong>
      <span>${message}</span>
    </div>
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
  const addressModal = document.getElementById('addressModal');
  const deleteModal = document.getElementById('deleteModal');
  
  if (e.target === addressModal) {
    closeAddressModal();
  }
  if (e.target === deleteModal) {
    closeDeleteModal();
  }
});

// Account dropdown toggle
const accountIcon = document.getElementById('accountIcon');
const accountDropdown = document.getElementById('accountDropdown');

if (accountIcon && accountDropdown) {
  accountIcon.addEventListener('click', function(e) {
    e.preventDefault();
    accountDropdown.classList.toggle('active');
  });
  
  document.addEventListener('click', function(e) {
    if (!accountIcon.contains(e.target) && !accountDropdown.contains(e.target)) {
      accountDropdown.classList.remove('active');
    }
  });
}

// Back to top button
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });
  
  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Export functions
window.openAddressModal = openAddressModal;
window.closeAddressModal = closeAddressModal;
window.editAddress = editAddress;
window.deleteAddress = deleteAddress;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.setDefaultAddress = setDefaultAddress;
window.loadDistricts = loadDistricts;
window.loadWards = loadWards;

