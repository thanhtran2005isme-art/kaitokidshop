// Checkout Page JavaScript

let selectedDeliveryMethod = 'delivery';
let selectedStore = null;

// Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(value) + '₫';
}

// Get product image
function getProductImage(item) {
  if (item.image) return item.image;
  if (item.imgSrc) return item.imgSrc;
  return '/images/placeholder.png';
}

// Load cart items
function loadOrderItems() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.getElementById('order-items');
  
  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#6b7280;">Giỏ hàng trống</p>';
    return;
  }
  
  let subtotal = 0;
  
  container.innerHTML = cart.map(item => {
    const price = parseInt(item.price) || 0;
    const quantity = item.quantity || 1;
    subtotal += price * quantity;
    
    return `
      <div class="order-item">
        <img src="${getProductImage(item)}" alt="${item.name}" onerror="this.src='/images/placeholder.png'">
        <div class="order-item-info">
          <h4>${item.name}</h4>
          <p>${item.color || ''} ${item.size ? ', ' + item.size : ''}</p>
          <p>Số lượng: ${quantity}</p>
          <p style="font-weight:600;color:#1f2937;">${formatCurrency(price)}</p>
        </div>
      </div>
    `;
  }).join('');
  
  updateOrderSummary(subtotal);
}

// Update order summary
function updateOrderSummary(subtotal) {
  currentSubtotal = subtotal; // Store for coupon calculations
  
  const discount = calculateDiscount(appliedCoupon, subtotal);
  const shipping = subtotal >= 499000 ? 0 : 20000;
  const total = subtotal - discount + shipping;
  
  document.getElementById('subtotal').textContent = formatCurrency(subtotal);
  document.getElementById('discount').textContent = discount > 0 ? '-' + formatCurrency(discount) : '0₫';
  document.getElementById('shipping').textContent = shipping === 0 ? 'Miễn phí' : formatCurrency(shipping);
  document.getElementById('total').textContent = formatCurrency(total);
  
  const savingsEl = document.getElementById('savings');
  if (discount > 0) {
    savingsEl.textContent = `Tiết kiệm ${formatCurrency(discount)}`;
    savingsEl.style.display = 'block';
  } else {
    savingsEl.style.display = 'none';
  }
}

// Switch delivery tab
function switchDeliveryTab(tab) {
  selectedDeliveryMethod = tab;
  
  // Update tabs
  document.querySelectorAll('.delivery-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  
  // Update content
  document.getElementById('delivery-content').classList.toggle('active', tab === 'delivery');
  document.getElementById('pickup-content').classList.toggle('active', tab === 'pickup');
  
  // Update shipping
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += (parseInt(item.price) || 0) * (item.quantity || 1);
  });
  
  if (tab === 'pickup') {
    document.getElementById('shipping').textContent = 'Miễn phí';
    const total = subtotal;
    document.getElementById('total').textContent = formatCurrency(total);
  } else {
    updateOrderSummary(subtotal);
  }
}

// Open store modal
function openStoreModal() {
  document.getElementById('storeModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close store modal
function closeStoreModal() {
  document.getElementById('storeModal').classList.remove('active');
  document.body.style.overflow = '';
}

// Confirm store selection
function confirmStore() {
  const selected = document.querySelector('input[name="store"]:checked');
  if (selected) {
    const storeItem = selected.closest('.store-item');
    const storeName = storeItem.querySelector('h4').textContent;
    document.getElementById('selectedStore').textContent = storeName;
    selectedStore = selected.value;
  }
  closeStoreModal();
}

// Open address modal
function openAddressModal() {
  document.getElementById('addressModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close address modal
function closeAddressModal() {
  document.getElementById('addressModal').classList.remove('active');
  document.body.style.overflow = '';
}

// Confirm address
function confirmAddress() {
  const province = document.getElementById('province');
  const district = document.getElementById('district');
  const ward = document.getElementById('ward');
  
  const provinceName = province.options[province.selectedIndex]?.text || '';
  const districtName = district.options[district.selectedIndex]?.text || '';
  const wardName = ward.options[ward.selectedIndex]?.text || '';
  
  if (provinceName && provinceName !== 'Chọn Tỉnh/Thành phố') {
    const addressText = [wardName, districtName, provinceName].filter(x => x && !x.includes('Chọn')).join(', ');
    document.querySelector('.address-select span').textContent = addressText || 'Tỉnh/Thành phố, Quận/Huyện, Phường/Xã';
  }
  
  closeAddressModal();
}

// Promo code state
let appliedCoupon = null;
let currentSubtotal = 0;

// Open promo modal
function openPromoModal() {
  document.getElementById('promoModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  loadAvailableCoupons();
}

// Close promo modal
function closePromoModal() {
  document.getElementById('promoModal').classList.remove('active');
  document.body.style.overflow = '';
}

// Load available coupons - only show public coupons (isPublic = true)
function loadAvailableCoupons() {
  const coupons = JSON.parse(localStorage.getItem('coupons') || '[]');
  const container = document.getElementById('availableCoupons');
  
  // Only show PUBLIC coupons that are active
  const publicCoupons = coupons.filter(c => {
    const now = new Date();
    const endDate = new Date(c.endDate);
    return c.status === 'active' && endDate >= now && c.used < c.quantity && c.isPublic === true;
  });
  
  if (publicCoupons.length === 0) {
    container.innerHTML = '<p class="no-coupons">Nhập mã giảm giá nếu bạn có</p>';
    return;
  }
  
  container.innerHTML = publicCoupons.map(coupon => {
    const discountText = coupon.discountType === 'percent' 
      ? `Giảm ${coupon.discountValue}%` 
      : `Giảm ${formatCurrency(coupon.discountValue)}`;
    const minOrderText = coupon.minOrder > 0 ? `Đơn tối thiểu ${formatCurrency(coupon.minOrder)}` : 'Không yêu cầu';
    const isApplied = appliedCoupon && appliedCoupon.code === coupon.code;
    
    return `
      <div class="coupon-item ${isApplied ? 'applied' : ''}" onclick="selectCoupon('${coupon.code}')">
        <div class="coupon-item-left">
          <div class="coupon-item-code">${coupon.code}</div>
          <div class="coupon-item-desc">${coupon.description || discountText}</div>
          <div class="coupon-item-condition">${minOrderText}</div>
        </div>
        <div class="coupon-item-right">
          <span class="coupon-item-discount">${discountText}</span>
          ${isApplied ? '<i class="fa fa-check-circle applied-icon"></i>' : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Select coupon from list
function selectCoupon(code) {
  document.getElementById('promoCode').value = code;
}

// Apply promo code
function applyPromoCode() {
  const code = document.getElementById('promoCode').value.trim().toUpperCase();
  const errorEl = document.getElementById('promoError');
  
  if (!code) {
    errorEl.textContent = 'Vui lòng nhập mã giảm giá';
    errorEl.style.display = 'block';
    return;
  }
  
  // Get coupons from localStorage
  const coupons = JSON.parse(localStorage.getItem('coupons') || '[]');
  const coupon = coupons.find(c => c.code === code);
  
  if (!coupon) {
    errorEl.textContent = 'Mã giảm giá không tồn tại';
    errorEl.style.display = 'block';
    return;
  }
  
  // Check if expired
  const now = new Date();
  const endDate = new Date(coupon.endDate);
  const startDate = new Date(coupon.startDate);
  
  if (now < startDate) {
    errorEl.textContent = 'Mã giảm giá chưa có hiệu lực';
    errorEl.style.display = 'block';
    return;
  }
  
  if (now > endDate || coupon.status === 'expired') {
    errorEl.textContent = 'Mã giảm giá đã hết hạn';
    errorEl.style.display = 'block';
    return;
  }
  
  // Check quantity
  if (coupon.used >= coupon.quantity) {
    errorEl.textContent = 'Mã giảm giá đã hết lượt sử dụng';
    errorEl.style.display = 'block';
    return;
  }
  
  // Check minimum order
  if (coupon.minOrder > 0 && currentSubtotal < coupon.minOrder) {
    errorEl.textContent = `Đơn hàng tối thiểu ${formatCurrency(coupon.minOrder)} để áp dụng mã này`;
    errorEl.style.display = 'block';
    return;
  }
  
  // Apply coupon
  appliedCoupon = coupon;
  errorEl.style.display = 'none';
  
  // Update UI
  updateOrderSummaryWithDiscount();
  updatePromoDisplay();
  closePromoModal();
  
  showToast(`Đã áp dụng mã ${code}`, 'success');
}

// Remove applied coupon
function removeCoupon() {
  appliedCoupon = null;
  updateOrderSummaryWithDiscount();
  updatePromoDisplay();
  showToast('Đã hủy mã giảm giá', 'info');
}

// Calculate discount amount
function calculateDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  
  let discount = 0;
  
  if (coupon.discountType === 'percent') {
    discount = subtotal * (coupon.discountValue / 100);
    // Apply max discount cap
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.discountValue;
  }
  
  // Discount cannot exceed subtotal
  return Math.min(discount, subtotal);
}

// Update order summary with discount
function updateOrderSummaryWithDiscount() {
  const discount = calculateDiscount(appliedCoupon, currentSubtotal);
  const shipping = selectedDeliveryMethod === 'pickup' ? 0 : (currentSubtotal >= 499000 ? 0 : 20000);
  const total = currentSubtotal - discount + shipping;
  
  document.getElementById('subtotal').textContent = formatCurrency(currentSubtotal);
  document.getElementById('discount').textContent = discount > 0 ? '-' + formatCurrency(discount) : '0₫';
  document.getElementById('shipping').textContent = shipping === 0 ? 'Miễn phí' : formatCurrency(shipping);
  document.getElementById('total').textContent = formatCurrency(total);
  
  const savingsEl = document.getElementById('savings');
  if (discount > 0) {
    savingsEl.textContent = `Tiết kiệm ${formatCurrency(discount)}`;
    savingsEl.style.display = 'block';
  } else {
    savingsEl.style.display = 'none';
  }
}

// Update promo display section
function updatePromoDisplay() {
  const promoSection = document.querySelector('.promo-section');
  
  if (appliedCoupon) {
    promoSection.innerHTML = `
      <div class="applied-promo" onclick="openPromoModal()">
        <i class="fa fa-ticket"></i>
        <div class="applied-promo-info">
          <span class="applied-code">${appliedCoupon.code}</span>
          <span class="applied-desc">${appliedCoupon.description || getDiscountText(appliedCoupon)}</span>
        </div>
        <button class="btn-remove-coupon" onclick="event.stopPropagation(); removeCoupon();">
          <i class="fa fa-times"></i>
        </button>
      </div>
    `;
  } else {
    promoSection.innerHTML = `
      <i class="fa fa-ticket"></i>
      <span>Chọn khuyến mãi</span>
      <i class="fa fa-chevron-right"></i>
    `;
    promoSection.onclick = openPromoModal;
  }
}

// Get discount text
function getDiscountText(coupon) {
  if (coupon.discountType === 'percent') {
    return `Giảm ${coupon.discountValue}%`;
  } else {
    return `Giảm ${formatCurrency(coupon.discountValue)}`;
  }
}

// Show toast notification
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  toast.innerHTML = `
    <i class="fa fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Filter stores
function filterStores() {
  // Can implement store filtering by province/district
}

// Place order
function placeOrder() {
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  
  if (!name) {
    alert('Vui lòng nhập tên khách hàng!');
    document.getElementById('customerName').focus();
    return;
  }
  
  if (!phone) {
    alert('Vui lòng nhập số điện thoại!');
    document.getElementById('customerPhone').focus();
    return;
  }
  
  if (selectedDeliveryMethod === 'pickup' && !selectedStore) {
    alert('Vui lòng chọn cửa hàng nhận hàng!');
    openStoreModal();
    return;
  }
  
  // Get cart
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  if (cart.length === 0) {
    alert('Giỏ hàng trống!');
    return;
  }
  
  // Calculate total
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += (parseInt(item.price) || 0) * (item.quantity || 1);
  });
  const discount = calculateDiscount(appliedCoupon, subtotal);
  const shipping = selectedDeliveryMethod === 'pickup' ? 0 : (subtotal >= 499000 ? 0 : 20000);
  const total = subtotal - discount + shipping;
  
  // Get selected payment method
  const paymentMethod = selectedPaymentMethod || 'cod';
  const paymentLabel = paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng';
  
  // Create order
  const order = {
    id: Date.now(),
    customer: {
      name: name,
      phone: phone,
      email: document.getElementById('customerEmail').value.trim()
    },
    deliveryMethod: selectedDeliveryMethod,
    paymentMethod: paymentMethod,
    paymentLabel: paymentLabel,
    store: selectedStore,
    address: selectedDeliveryMethod === 'delivery' ? document.getElementById('addressDetail').value : null,
    note: document.getElementById('orderNote').value,
    items: cart,
    subtotal: subtotal,
    discount: discount,
    couponCode: appliedCoupon ? appliedCoupon.code : null,
    shipping: shipping,
    total: total,
    status: 'pending',
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'awaiting_transfer',
    createdAt: new Date().toISOString()
  };
  
  // Update coupon usage count
  if (appliedCoupon) {
    updateCouponUsage(appliedCoupon.code);
  }
  
  // Save order
  let orders = JSON.parse(localStorage.getItem('orders') || '[]');
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Update inventory - reduce stock for each item
  updateInventory(cart);
  
  // Clear cart
  localStorage.setItem('cart', JSON.stringify([]));
  
  // Show success
  let successMsg = '🎉 Đặt hàng thành công!\n\nMã đơn hàng: #' + order.id + '\nTổng tiền: ' + formatCurrency(total) + '\nThanh toán: ' + paymentLabel;
  
  if (paymentMethod === 'bank') {
    successMsg += '\n\n⚠️ Vui lòng chuyển khoản theo thông tin đã cung cấp.\nNội dung CK: DH' + order.id;
  }
  
  successMsg += '\n\nCảm ơn bạn đã mua hàng!';
  alert(successMsg);
  
  // Redirect to home
  window.location.href = 'index.html';
}

// Load payment methods from admin settings
function loadPaymentMethods() {
  const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
  const payment = settings.payment || {};
  const container = document.getElementById('paymentMethods');
  
  if (!container) return;
  
  let html = '';
  let firstMethod = true;
  
  // COD
  if (payment.codEnabled !== false) {
    html += `
      <label class="payment-option ${firstMethod ? 'active' : ''}" onclick="selectPayment('cod')">
        <input type="radio" name="payment" value="cod" ${firstMethod ? 'checked' : ''}>
        <i class="fa fa-money-bill-wave"></i>
        <span>(COD) Thanh toán khi nhận hàng</span>
      </label>
    `;
    firstMethod = false;
  }
  
  // Bank Transfer
  if (payment.bankEnabled !== false) {
    html += `
      <label class="payment-option ${firstMethod ? 'active' : ''}" onclick="selectPayment('bank')">
        <input type="radio" name="payment" value="bank" ${firstMethod ? 'checked' : ''}>
        <i class="fa fa-university"></i>
        <span>Chuyển khoản ngân hàng</span>
      </label>
    `;
    firstMethod = false;
  }
  
  // Default if no method enabled
  if (html === '') {
    html = `
      <label class="payment-option active">
        <input type="radio" name="payment" value="cod" checked>
        <i class="fa fa-money-bill-wave"></i>
        <span>(COD) Thanh toán khi nhận hàng</span>
      </label>
    `;
  }
  
  container.innerHTML = html;
  
  // Load bank info
  loadBankInfo();
}

// Load bank account info
function loadBankInfo() {
  const qrCodes = JSON.parse(localStorage.getItem('bankQRCodes') || '{}');
  const container = document.getElementById('bankAccountInfo');
  
  if (!container) return;
  
  // Get bank accounts from settings or use default
  const settings = JSON.parse(localStorage.getItem('adminSettings') || '{}');
  const bankAccounts = settings.payment?.bankAccounts || [];
  
  // Get bank info from HTML elements in admin (fallback)
  let html = '';
  
  if (qrCodes['1']) {
    html = `
      <div class="bank-account-display">
        <div class="bank-details">
          <p><strong>Ngân hàng:</strong> Vietcombank</p>
          <p><strong>Số tài khoản:</strong> 1234567890</p>
          <p><strong>Chủ tài khoản:</strong> Trần Ngọc Thanh</p>
        </div>
        <div class="bank-qr">
          <img src="${qrCodes['1']}" alt="QR Code" style="max-width: 150px; border-radius: 8px;">
          <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">Quét mã QR để thanh toán</p>
        </div>
      </div>
    `;
  } else {
    html = `
      <div class="bank-account-display">
        <div class="bank-details">
          <p><strong>Ngân hàng:</strong> Vietcombank</p>
          <p><strong>Số tài khoản:</strong> 1234567890</p>
          <p><strong>Chủ tài khoản:</strong> Trần Ngọc Thanh</p>
        </div>
        <p style="font-size: 13px; color: #6b7280; margin-top: 12px;">
          <i class="fa fa-info-circle"></i> Vui lòng chuyển khoản đúng số tiền và ghi nội dung: <strong>Thanh toán đơn hàng [Số điện thoại]</strong>
        </p>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

// Select payment method
let selectedPaymentMethod = 'cod';

function selectPayment(method, e) {
  selectedPaymentMethod = method;
  
  // Update radio button
  document.querySelectorAll('.payment-option input[type="radio"]').forEach(radio => {
    radio.checked = radio.value === method;
  });
  
  // Update active state
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.classList.remove('active');
    if (opt.querySelector(`input[value="${method}"]`)) {
      opt.classList.add('active');
    }
  });
  
  // Show/hide bank transfer info
  const bankInfo = document.getElementById('bankTransferInfo');
  if (bankInfo) {
    bankInfo.style.display = method === 'bank' ? 'block' : 'none';
  }
}

// Update inventory when order is placed
function updateInventory(cartItems) {
  // Get current inventory from localStorage
  let inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
  
  // If no inventory exists, create from products
  if (inventory.length === 0) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    inventory = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku || 'SKU-' + p.id,
      stock: p.stock || 100,
      sold: 0
    }));
  }
  
  // Update stock for each cart item
  cartItems.forEach(cartItem => {
    const quantity = cartItem.quantity || 1;
    const productName = cartItem.name;
    const productId = cartItem.id || cartItem.productId;
    
    // Find product in inventory by ID or name
    const invIndex = inventory.findIndex(inv => 
      inv.id === productId || 
      inv.name === productName ||
      inv.name?.toLowerCase() === productName?.toLowerCase()
    );
    
    if (invIndex !== -1) {
      // Reduce stock
      inventory[invIndex].stock = Math.max(0, (inventory[invIndex].stock || 0) - quantity);
      // Increase sold count
      inventory[invIndex].sold = (inventory[invIndex].sold || 0) + quantity;
    } else {
      // Add new inventory entry if product not found
      inventory.push({
        id: productId || Date.now(),
        name: productName,
        sku: 'SKU-' + (productId || Date.now()),
        stock: 0,
        sold: quantity
      });
    }
  });
  
  // Save updated inventory
  localStorage.setItem('inventory', JSON.stringify(inventory));
  
  // Also log to inventory history
  logInventoryHistory(cartItems);
  
  console.log('Inventory updated:', inventory);
}

// Log inventory history
function logInventoryHistory(cartItems) {
  let history = JSON.parse(localStorage.getItem('inventoryHistory') || '[]');
  
  cartItems.forEach(item => {
    history.push({
      id: Date.now() + Math.random(),
      productName: item.name,
      productId: item.id || item.productId,
      type: 'out', // xuất kho
      quantity: item.quantity || 1,
      reason: 'Đơn hàng mới',
      date: new Date().toISOString(),
      note: `Bán hàng - ${item.color || ''} ${item.size || ''}`
    });
  });
  
  localStorage.setItem('inventoryHistory', JSON.stringify(history));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadOrderItems();
  loadPaymentMethods();
});

// Export new functions
window.selectPayment = selectPayment;

// Update coupon usage count
function updateCouponUsage(code) {
  const coupons = JSON.parse(localStorage.getItem('coupons') || '[]');
  const couponIndex = coupons.findIndex(c => c.code === code);
  
  if (couponIndex !== -1) {
    coupons[couponIndex].used = (coupons[couponIndex].used || 0) + 1;
    localStorage.setItem('coupons', JSON.stringify(coupons));
  }
}

// Export functions
window.switchDeliveryTab = switchDeliveryTab;
window.openStoreModal = openStoreModal;
window.closeStoreModal = closeStoreModal;
window.confirmStore = confirmStore;
window.openAddressModal = openAddressModal;
window.closeAddressModal = closeAddressModal;
window.confirmAddress = confirmAddress;
window.openPromoModal = openPromoModal;
window.closePromoModal = closePromoModal;
window.applyPromoCode = applyPromoCode;
window.removeCoupon = removeCoupon;
window.selectCoupon = selectCoupon;
window.filterStores = filterStores;
window.placeOrder = placeOrder;