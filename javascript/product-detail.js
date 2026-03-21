// Product Detail Page JavaScript

let currentProduct = null;
let currentImageIndex = 0;
let selectedColor = null;
let selectedSize = null;
let productVariants = {}; // {size_color: quantity}
let flashSaleDiscount = null; // Flash sale discount if applicable

// Get product ID from URL
function getProductId() {
  const params = new URLSearchParams(window.location.search);
  return parseInt(params.get('id'));
}

// Get all products
function getProducts() {
  const saved = localStorage.getItem('products');
  return saved ? JSON.parse(saved) : [];
}

// Check if product is in active Flash Sale
function checkFlashSale(productId) {
  const savedFlashSales = localStorage.getItem('flashSales');
  if (!savedFlashSales) return null;
  
  try {
    const flashSales = JSON.parse(savedFlashSales);
    const now = new Date();
    
    // Find active flash sale containing this product
    for (const fs of flashSales) {
      const start = new Date(fs.startTime);
      const end = new Date(start.getTime() + fs.duration * 60 * 60 * 1000);
      
      if (start <= now && end >= now) {
        // Flash sale is active, check if product is in it
        const flashProduct = fs.products.find(p => p.id === productId);
        if (flashProduct) {
          return {
            discount: flashProduct.discount,
            flashSaleName: fs.name,
            endTime: end
          };
        }
      }
    }
  } catch (error) {
    console.error('Error checking flash sale:', error);
  }
  
  return null;
}

// Get product image
function getProductImage(product, index = 0) {
  if (product.images && product.images.length > index) return product.images[index];
  if (product.images && product.images.length > 0) return product.images[0];
  if (product.image) return product.image;
  return '/images/placeholder.png';
}

// Get all product images
function getProductImages(product) {
  if (product.images && product.images.length > 0) return product.images;
  if (product.image) return [product.image];
  return ['/images/placeholder.png'];
}

// Format price
function formatPrice(price) {
  return price.toLocaleString('vi-VN') + '₫';
}

// Load product data
function loadProduct() {
  const productId = getProductId();
  const products = getProducts();
  currentProduct = products.find(p => p.id === productId);

  if (!currentProduct) {
    document.querySelector('.product-detail-container').innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px;">
        <h2>Không tìm thấy sản phẩm</h2>
        <p>Sản phẩm này không tồn tại hoặc đã bị xóa.</p>
        <a href="index.html" style="color:#667eea;">Quay về trang chủ</a>
      </div>
    `;
    return;
  }

  renderProduct();
  loadRelatedProducts();
  setupTabs();
}

// Render product
function renderProduct() {
  const p = currentProduct;
  const images = getProductImages(p);
  
  // Check if product is in Flash Sale
  flashSaleDiscount = checkFlashSale(p.id);
  
  let displayPrice = p.salePrice || p.price;
  let originalPrice = p.price;
  
  // Apply Flash Sale discount if applicable
  if (flashSaleDiscount) {
    originalPrice = p.price;
    displayPrice = Math.round(p.price * (1 - flashSaleDiscount.discount / 100));
  }

  // Load variants inventory
  productVariants = p.variants || {};

  // Update page title
  document.title = `${p.name} - KAITO KID`;

  // Breadcrumb
  document.getElementById('breadcrumb-category').textContent = p.category || 'Sản phẩm';
  document.getElementById('breadcrumb-product').textContent = p.name;

  // Main info - Price with Flash Sale badge
  const priceContainer = document.getElementById('product-price');
  if (flashSaleDiscount) {
    priceContainer.innerHTML = `
      <div class="flash-sale-price-wrapper">
        <span class="flash-sale-badge-detail">
          <i class="fa fa-bolt"></i> Flash Sale -${flashSaleDiscount.discount}%
        </span>
        <div class="price-row">
          <span class="current-price">${formatPrice(displayPrice)}</span>
          <span class="original-price-strike">${formatPrice(originalPrice)}</span>
        </div>
        <div class="flash-sale-countdown-mini" id="flash-countdown-mini"></div>
      </div>
    `;
    // Start mini countdown
    startFlashSaleCountdownMini(flashSaleDiscount.endTime);
  } else {
    priceContainer.textContent = formatPrice(displayPrice);
  }
  
  document.getElementById('product-name').textContent = p.name;
  document.getElementById('product-sku').textContent = `SKU: ${p.sku || 'SP' + p.id}`;

  // Main image
  document.getElementById('main-image').src = images[0];
  document.getElementById('main-image').alt = p.name;

  // Thumbnails
  const thumbnailList = document.getElementById('thumbnail-list');
  thumbnailList.innerHTML = images.map((img, index) => `
    <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="selectImage(${index})">
      <img src="${img}" alt="${p.name}" onerror="this.src='/images/placeholder.png'">
    </div>
  `).join('');

  // Colors
  renderColorOptions();

  // Sizes
  renderSizeOptions();

  // Description
  document.getElementById('product-description').innerHTML = `
    <p>${p.description || p.shortDesc || 'Sản phẩm chất lượng cao từ KAITO KID.'}</p>
    <ul>
      <li>Chất liệu cao cấp, thoáng mát</li>
      <li>Thiết kế hiện đại, dễ phối đồ</li>
      <li>Form dáng chuẩn, phù hợp nhiều vóc dáng</li>
    </ul>
  `;

  // Update stock status
  updateStockStatus();
}

// Start mini countdown for Flash Sale on product detail
function startFlashSaleCountdownMini(endTime) {
  const countdownEl = document.getElementById('flash-countdown-mini');
  if (!countdownEl) return;
  
  const updateTimer = () => {
    const now = new Date();
    const diff = endTime - now;
    
    if (diff <= 0) {
      countdownEl.innerHTML = '<span style="color:#ef4444;">Flash Sale đã kết thúc</span>';
      // Reload page to show normal price
      setTimeout(() => location.reload(), 2000);
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    countdownEl.innerHTML = `
      <i class="fa fa-clock"></i> Kết thúc sau: 
      <span class="countdown-time">${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</span>
    `;
  };
  
  updateTimer();
  setInterval(updateTimer, 1000);
}

// Color map
const colorMap = {
  'Trắng': '#ffffff',
  'Đen': '#000000',
  'Xám': '#9ca3af',
  'Xanh navy': '#1e3a8a',
  'Xanh dương': '#3b82f6',
  'Đỏ': '#ef4444',
  'Hồng': '#ec4899',
  'Vàng': '#fbbf24',
  'Be': '#d4c4a8',
  'Nâu': '#78350f'
};

// Render color options with stock check
function renderColorOptions() {
  const p = currentProduct;
  const colorOptions = document.getElementById('color-options');
  const colors = p.colors || ['Trắng', 'Đen'];

  colorOptions.innerHTML = colors.map((color, index) => {
    // Check if this color has any stock for selected size
    const hasStock = checkColorStock(color);
    const isFirst = index === 0 && !selectedColor;
    const isSelected = selectedColor === color;
    const isActive = isSelected || (isFirst && hasStock);
    
    // If first load and this is first available color
    if (!selectedColor && hasStock && index === colors.findIndex(c => checkColorStock(c))) {
      selectedColor = color;
    }

    return `
      <button class="color-btn ${isActive ? 'active' : ''} ${!hasStock ? 'out-of-stock' : ''}" 
              style="background: ${colorMap[color] || '#ccc'}; ${color === 'Trắng' ? 'border-color:#ddd;' : ''}"
              data-color="${color}"
              ${!hasStock ? 'disabled title="Hết hàng"' : ''}
              onclick="selectColor('${color}', this)">
        ${!hasStock ? '<span class="stock-x">✕</span>' : ''}
      </button>
    `;
  }).join('');

  if (selectedColor) {
    document.getElementById('selected-color').textContent = selectedColor;
  }
}

// Render size options with stock check
function renderSizeOptions() {
  const p = currentProduct;
  const sizeOptions = document.getElementById('size-options');
  const sizes = p.sizes || ['M', 'L', 'XL'];

  sizeOptions.innerHTML = sizes.map((size, index) => {
    // Check if this size has any stock for selected color
    const hasStock = checkSizeStock(size);
    const isFirst = index === 0 && !selectedSize;
    const isSelected = selectedSize === size;
    const isActive = isSelected || (isFirst && hasStock);
    
    // If first load and this is first available size
    if (!selectedSize && hasStock && index === sizes.findIndex(s => checkSizeStock(s))) {
      selectedSize = size;
    }

    return `
      <button class="size-btn ${isActive ? 'active' : ''} ${!hasStock ? 'out-of-stock' : ''}" 
              data-size="${size}"
              ${!hasStock ? 'disabled title="Hết hàng"' : ''}
              onclick="selectSize('${size}', this)">
        ${size}
      </button>
    `;
  }).join('');

  if (selectedSize) {
    document.getElementById('selected-size').textContent = selectedSize;
  }
}

// Check if color has stock (for any size if no size selected, or for selected size)
function checkColorStock(color) {
  const p = currentProduct;
  const sizes = p.sizes || [];
  
  // If no variants data, assume in stock
  if (Object.keys(productVariants).length === 0) return true;
  
  if (selectedSize) {
    // Check specific size + color combination
    const key = `${selectedSize}_${color}`;
    return (productVariants[key] || 0) > 0;
  } else {
    // Check if any size has this color in stock
    return sizes.some(size => {
      const key = `${size}_${color}`;
      return (productVariants[key] || 0) > 0;
    });
  }
}

// Check if size has stock (for any color if no color selected, or for selected color)
function checkSizeStock(size) {
  const p = currentProduct;
  const colors = p.colors || [];
  
  // If no variants data, assume in stock
  if (Object.keys(productVariants).length === 0) return true;
  
  if (selectedColor) {
    // Check specific size + color combination
    const key = `${size}_${selectedColor}`;
    return (productVariants[key] || 0) > 0;
  } else {
    // Check if any color has this size in stock
    return colors.some(color => {
      const key = `${size}_${color}`;
      return (productVariants[key] || 0) > 0;
    });
  }
}

// Get current variant stock
function getCurrentVariantStock() {
  if (!selectedSize || !selectedColor) return 0;
  if (Object.keys(productVariants).length === 0) return 999; // No variant data = assume in stock
  
  const key = `${selectedSize}_${selectedColor}`;
  return productVariants[key] || 0;
}

// Update stock status display
function updateStockStatus() {
  const stock = getCurrentVariantStock();
  const addToCartBtn = document.querySelector('.btn-add-cart');
  const stockStatusEl = document.getElementById('stock-status');
  
  if (stock <= 0) {
    // Out of stock
    if (addToCartBtn) {
      addToCartBtn.disabled = true;
      addToCartBtn.innerHTML = 'Sản phẩm đang tạm hết hàng';
      addToCartBtn.classList.add('out-of-stock');
    }
    if (stockStatusEl) {
      stockStatusEl.style.display = 'none';
    }
  } else {
    // In stock
    if (addToCartBtn) {
      addToCartBtn.disabled = false;
      addToCartBtn.innerHTML = 'Thêm vào giỏ <i class="fa fa-shopping-bag"></i>';
      addToCartBtn.classList.remove('out-of-stock');
    }
    if (stockStatusEl) {
      stockStatusEl.style.display = 'inline-flex';
      if (stock < 10) {
        stockStatusEl.innerHTML = `<i class="fa fa-exclamation-circle"></i> Chỉ còn ${stock} sản phẩm`;
        stockStatusEl.className = 'stock-status low-stock';
      } else {
        stockStatusEl.innerHTML = '<i class="fa fa-check-circle"></i> Còn hàng';
        stockStatusEl.className = 'stock-status in-stock';
      }
    }
  }
}

// Select image
function selectImage(index) {
  const images = getProductImages(currentProduct);
  currentImageIndex = index;
  document.getElementById('main-image').src = images[index];

  document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
}

// Navigate images
function prevImage() {
  const images = getProductImages(currentProduct);
  currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
  selectImage(currentImageIndex);
}

function nextImage() {
  const images = getProductImages(currentProduct);
  currentImageIndex = (currentImageIndex + 1) % images.length;
  selectImage(currentImageIndex);
}

// Select color
function selectColor(color, btn) {
  selectedColor = color;
  document.getElementById('selected-color').textContent = color;
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  // Reset quantity to 1 when changing variant
  document.getElementById('quantity').value = 1;
  
  // Update size options based on selected color
  renderSizeOptions();
  updateStockStatus();
}

// Select size
function selectSize(size, btn) {
  selectedSize = size;
  document.getElementById('selected-size').textContent = size;
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  // Reset quantity to 1 when changing variant
  document.getElementById('quantity').value = 1;
  
  // Update color options based on selected size
  renderColorOptions();
  updateStockStatus();
}

// Quantity controls
function decreaseQty() {
  const input = document.getElementById('quantity');
  if (parseInt(input.value) > 1) {
    input.value = parseInt(input.value) - 1;
  }
}

function increaseQty() {
  const input = document.getElementById('quantity');
  const maxStock = getCurrentVariantStock();
  const currentQty = parseInt(input.value) || 1;
  
  if (currentQty < maxStock) {
    input.value = currentQty + 1;
  } else {
    showStockWarning(maxStock);
  }
}

// Show stock warning
function showStockWarning(maxStock) {
  const existing = document.querySelector('.stock-warning-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'stock-warning-toast';
  toast.innerHTML = `<i class="fa fa-exclamation-circle"></i> Chỉ còn ${maxStock} sản phẩm trong kho`;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// Validate quantity input
function validateQuantityInput() {
  const input = document.getElementById('quantity');
  const maxStock = getCurrentVariantStock();
  let value = parseInt(input.value) || 1;
  
  if (value < 1) value = 1;
  if (value > maxStock && maxStock > 0) {
    value = maxStock;
    showStockWarning(maxStock);
  }
  
  input.value = value;
}

// Copy SKU
function copySKU() {
  const sku = currentProduct.sku || 'SP' + currentProduct.id;
  navigator.clipboard.writeText(sku);
  alert('Đã copy mã SKU: ' + sku);
}

// ============================================================
// HÀM THÊM SẢN PHẨM VÀO GIỎ HÀNG
// ============================================================
// QUY TRÌNH THÊM VÀO GIỎ HÀNG:
// BƯỚC 1: Lấy giỏ hàng hiện tại từ localStorage
// BƯỚC 2: Tạo object chứa thông tin sản phẩm cần thêm
// BƯỚC 3: Kiểm tra sản phẩm đã có trong giỏ chưa (cùng id + màu + size)
// BƯỚC 4: Nếu có rồi → tăng số lượng, chưa có → thêm mới vào mảng
// BƯỚC 5: Lưu giỏ hàng mới vào localStorage
// BƯỚC 6: Cập nhật số lượng hiển thị trên icon giỏ hàng
function addToCart() {
  // Kiểm tra có sản phẩm không
  if (!currentProduct) return;

  // Lấy số lượng từ input
  const quantity = parseInt(document.getElementById('quantity').value) || 1;

  // ========== BƯỚC 1: LẤY GIỎ HÀNG TỪ LOCALSTORAGE ==========
  // localStorage.getItem('cart') trả về STRING hoặc null
  // JSON.parse() chuyển STRING thành ARRAY
  // || '[]' nghĩa là nếu null thì dùng chuỗi '[]' (mảng rỗng)
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  // Tính giá cuối cùng (có thể có Flash Sale)
  let finalPrice = currentProduct.salePrice || currentProduct.price;
  if (flashSaleDiscount) {
    finalPrice = Math.round(currentProduct.price * (1 - flashSaleDiscount.discount / 100));
  }
  
  // ========== BƯỚC 2: TẠO OBJECT SẢN PHẨM ==========
  // Object này chứa tất cả thông tin cần thiết của sản phẩm
  const cartItem = {
    id: currentProduct.id,           // ID sản phẩm
    name: currentProduct.name,       // Tên sản phẩm
    price: finalPrice,               // Giá bán
    originalPrice: currentProduct.price, // Giá gốc
    image: getProductImage(currentProduct), // Ảnh sản phẩm
    color: selectedColor,            // Màu đã chọn
    size: selectedSize,              // Size đã chọn
    quantity: quantity,              // Số lượng
    isFlashSale: !!flashSaleDiscount,
    flashSaleDiscount: flashSaleDiscount ? flashSaleDiscount.discount : null
  };

  // ========== BƯỚC 3: KIỂM TRA SẢN PHẨM ĐÃ CÓ TRONG GIỎ CHƯA ==========
  // findIndex() tìm vị trí của sản phẩm trong mảng
  // So sánh theo: id + color + size (vì cùng 1 sản phẩm có thể có nhiều màu/size)
  // Nếu tìm thấy → trả về index (0, 1, 2...)
  // Nếu không tìm thấy → trả về -1
  const existingIndex = cart.findIndex(item => 
    item.id === cartItem.id && 
    item.color === cartItem.color && 
    item.size === cartItem.size
  );

  // ========== BƯỚC 4: THÊM HOẶC CẬP NHẬT ==========
  if (existingIndex > -1) {
    // Sản phẩm ĐÃ CÓ trong giỏ → TĂNG SỐ LƯỢ++++NG
    cart[existingIndex].quantity += quantity;
    // Cập nhật giá (phòng trường hợp flash sale thay đổi)
    cart[existingIndex].price = finalPrice;
    cart[existingIndex].isFlashSale = !!flashSaleDiscount;
  } else {
    // Sản phẩm CHƯA CÓ trong giỏ → THÊM MỚI vào mảng
    cart.push(cartItem);
  }

  // ========== BƯỚC 5: LƯU VÀO LOCALSTORAGE ==========
  // JSON.stringify() chuyển ARRAY thành STRING
  // localStorage.setItem() lưu string vào localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // ========== BƯỚC 6: CẬP NHẬT GIAO DIỆN ==========
  updateCartCount(); // Cập nhật số lượng trên icon giỏ hàng
  alert('Đã thêm vào giỏ hàng!');
}

// Update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let total = 0;
  cart.forEach(item => total += item.quantity);
  
  const countEl = document.getElementById('cart-count');
  if (countEl) {
    countEl.textContent = total;
    countEl.style.display = total > 0 ? 'flex' : 'none';
  }
}

// Load related products
function loadRelatedProducts() {
  const products = getProducts();
  const related = products
    .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
    .slice(0, 4);

  const container = document.getElementById('related-products');
  
  if (related.length === 0) {
    container.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#666;">Không có sản phẩm liên quan</p>';
    return;
  }

  container.innerHTML = related.map(p => `
    <a href="chitietsanpham.html?id=${p.id}" class="related-item">
      <img src="${getProductImage(p)}" alt="${p.name}" onerror="this.src='/images/placeholder.png'">
      <div class="related-item-info">
        <h4>${p.name}</h4>
        <span class="price">${formatPrice(p.salePrice || p.price)}</span>
      </div>
    </a>
  `).join('');
}

// Setup tabs
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById('tab-' + tabId).classList.add('active');
    });
  });
}

// Load product reviews
function loadProductReviews() {
  const productId = getProductId();
  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  
  // Filter reviews for this product (approved only)
  const productReviews = reviews.filter(r => 
    (String(r.productId) === String(productId) || r.productName === currentProduct?.name) && 
    r.status === 'approved'
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const tabReviews = document.getElementById('tab-reviews');
  if (!tabReviews) return;
  
  // Calculate average rating
  const totalReviews = productReviews.length;
  const avgRating = totalReviews > 0 
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';
  
  // Count by rating
  const ratingCounts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
  productReviews.forEach(r => {
    if (ratingCounts[r.rating] !== undefined) {
      ratingCounts[r.rating]++;
    }
  });
  
  // Generate stars HTML
  const generateStars = (rating) => {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      stars += `<i class="fa fa-star ${i <= rating ? '' : 'empty'}"></i>`;
    }
    return stars;
  };
  
  // Generate rating bars HTML
  const generateRatingBars = () => {
    let html = '';
    for (let i = 5; i >= 1; i--) {
      const count = ratingCounts[i];
      const percent = totalReviews > 0 ? (count / totalReviews * 100) : 0;
      html += `
        <div class="rating-bar-row">
          <span class="rating-label">${i} <i class="fa fa-star"></i></span>
          <div class="rating-bar">
            <div class="rating-bar-fill" style="width: ${percent}%"></div>
          </div>
          <span class="rating-count">${count}</span>
        </div>
      `;
    }
    return html;
  };
  
  // Generate reviews list HTML
  const generateReviewsList = () => {
    if (productReviews.length === 0) {
      return '<p class="no-reviews">Chưa có đánh giá nào cho sản phẩm này.</p>';
    }
    
    return productReviews.map(review => {
      const initial = review.customerName ? review.customerName.charAt(0).toUpperCase() : 'K';
      const date = new Date(review.createdAt).toLocaleDateString('vi-VN');
      
      return `
        <div class="review-item-detail">
          <div class="review-item-header">
            <div class="reviewer-avatar-small">${initial}</div>
            <div class="reviewer-info-detail">
              <span class="reviewer-name-detail">${review.customerName || 'Khách hàng'}</span>
              <span class="review-date-detail">${date}</span>
            </div>
          </div>
          <div class="review-rating-detail">
            ${generateStars(review.rating)}
          </div>
          <p class="review-comment-detail">${review.comment}</p>
        </div>
      `;
    }).join('');
  };
  
  // Render reviews tab
  tabReviews.innerHTML = `
    <div class="reviews-container">
      <div class="reviews-summary">
        <div class="rating-overview">
          <div class="rating-big">
            <span class="rating-number">${avgRating}</span>
            <div class="stars">${generateStars(Math.round(avgRating))}</div>
            <span class="review-count">${totalReviews} đánh giá</span>
          </div>
          <div class="rating-breakdown">
            ${generateRatingBars()}
          </div>
        </div>
      </div>
      <div class="reviews-list-detail">
        <h4>Đánh giá từ khách hàng</h4>
        ${generateReviewsList()}
      </div>
    </div>
  `;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadProduct();
  updateCartCount();
  loadProductReviews();
  
  // Add event listener for quantity input
  const quantityInput = document.getElementById('quantity');
  if (quantityInput) {
    quantityInput.addEventListener('change', validateQuantityInput);
    quantityInput.addEventListener('blur', validateQuantityInput);
  }
});

// Export functions
window.selectImage = selectImage;
window.prevImage = prevImage;
window.nextImage = nextImage;
window.selectColor = selectColor;
window.selectSize = selectSize;
window.decreaseQty = decreaseQty;
window.increaseQty = increaseQty;
window.copySKU = copySKU;
window.addToCart = addToCart;
window.validateQuantityInput = validateQuantityInput;
