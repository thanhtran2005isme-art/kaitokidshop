// Products Loader for Homepage
// Load products from localStorage and display on homepage

// ============================================================
// BƯỚC 1: LẤY DỮ LIỆU TỪ LOCALSTORAGE
// ============================================================
// Hàm này lấy danh sách sản phẩm từ localStorage
// - localStorage.getItem('products') trả về STRING hoặc null
// - JSON.parse() chuyển STRING thành ARRAY/OBJECT
// - Nếu không có dữ liệu (null) thì trả về mảng rỗng []
function getProducts() {
  const saved = localStorage.getItem('products'); // Lấy string từ localStorage
  if (saved) {
    return JSON.parse(saved); // Chuyển string -> array
  }
  return []; // Trả về mảng rỗng nếu chưa có dữ liệu
}

// Get inventory data from localStorage
function getInventory() {
  const saved = localStorage.getItem('inventory');
  if (saved) {
    return JSON.parse(saved);
  }
  return [];
}

// Get sold count for a product from inventory
function getSoldCount(productId) {
  const inventory = getInventory();
  const invEntry = inventory.find(inv => inv.productId === productId || inv.id === productId);
  if (invEntry && invEntry.sold) {
    return invEntry.sold;
  }
  return 0;
}

// Get homepage sections config from admin
function getHomepageSections() {
  const saved = localStorage.getItem('homepageSections');
  if (saved) {
    return JSON.parse(saved);
  }
  return { newArrivals: [], saleProducts: [], bestSellers: [] };
}

// Filter products by criteria - uses admin config only (no fallback)
function getNewArrivals(limit = 8) {
  const products = getProducts();
  const sections = getHomepageSections();
  
  // Only show products configured by admin
  if (sections.newArrivals && sections.newArrivals.length > 0) {
    return sections.newArrivals
      .map(id => products.find(p => p.id === id))
      .filter(p => p && p.status === 'active')
      .slice(0, limit);
  }
  
  // No products configured - return empty
  return [];
}

function getSaleProducts(limit = 8) {
  const products = getProducts();
  const sections = getHomepageSections();
  
  // Only show products configured by admin
  if (sections.saleProducts && sections.saleProducts.length > 0) {
    return sections.saleProducts
      .map(id => products.find(p => p.id === id))
      .filter(p => p && p.status === 'active')
      .slice(0, limit);
  }
  
  // No products configured - return empty
  return [];
}

function getBestSellers(limit = 8) {
  const products = getProducts();
  const sections = getHomepageSections();
  
  // Only show products configured by admin
  if (sections.bestSellers && sections.bestSellers.length > 0) {
    return sections.bestSellers
      .map(id => products.find(p => p.id === id))
      .filter(p => p && p.status === 'active')
      .slice(0, limit);
  }
  
  // No products configured - return empty
  return [];
}

// Filter by gender
function filterByGender(products, gender) {
  if (gender === 'Tất cả') return products;
  return products.filter(p => p.gender === gender);
}

// Filter by category
function filterByCategory(products, category) {
  if (category === 'Tất cả') return products;
  return products.filter(p => p.category === category);
}

// Calculate discount percentage
function getDiscountPercent(product) {
  // Case 1: Product has salePrice (sale price is lower than original price)
  if (product.salePrice && product.price && product.salePrice < product.price) {
    return Math.round(((product.price - product.salePrice) / product.price) * 100);
  }
  
  // Case 2: Product has oldPrice (current price is lower than old price)
  if (product.oldPrice && product.price && product.price < product.oldPrice) {
    return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
  }
  
  // Case 3: Product has discountPercent field directly
  if (product.discountPercent && product.discountPercent > 0) {
    return product.discountPercent;
  }
  
  return 0;
}

// Format price to VND
function formatPrice(price) {
  return price.toLocaleString('vi-VN') + '₫';
}

// Get product image (support both formats)
function getProductImage(product) {
  if (product.images && product.images.length > 0) return product.images[0];
  if (product.image) return product.image;
  return '/images/placeholder.png';
}

// Generate product card HTML
function generateProductCard(product) {
  const discount = getDiscountPercent(product);
  const hasDiscount = discount > 0;
  
  // Determine display price and original price
  let displayPrice, originalPrice;
  
  if (product.salePrice && product.salePrice < product.price) {
    // salePrice is the discounted price, price is original
    displayPrice = product.salePrice;
    originalPrice = product.price;
  } else if (product.oldPrice && product.price < product.oldPrice) {
    // price is current (discounted), oldPrice is original
    displayPrice = product.price;
    originalPrice = product.oldPrice;
  } else {
    // No discount
    displayPrice = product.price;
    originalPrice = null;
  }
  
  return `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-image">
        <a href="chitietsanpham.html?id=${product.id}">
          <img src="${getProductImage(product)}" alt="${product.name}" loading="lazy" onerror="this.src='/images/placeholder.png'" />
        </a>
        
        ${product.isNew ? '<span class="product-badge new badge-new">NEW</span>' : ''}
        ${hasDiscount ? `<span class="product-badge sale badge-sale">-${discount}%</span>` : ''}
        ${product.isBestSeller && !product.isNew && !hasDiscount ? '<span class="product-badge hot badge-hot">HOT</span>' : ''}
        
        <button class="wishlist-btn" onclick="event.preventDefault(); event.stopPropagation(); toggleWishlist(${product.id})">
          <i class="far fa-heart"></i>
        </button>
        
        <button class="quick-view-btn" onclick="event.preventDefault(); event.stopPropagation(); quickView(${product.id})">
          <i class="fa fa-eye"></i> Xem nhanh
        </button>
      </div>
      
      <div class="product-info">
        <a href="chitietsanpham.html?id=${product.id}" class="product-name-link">
          <h3>${product.name}</h3>
        </a>
        <div class="product-price">
          <span class="current-price">${formatPrice(displayPrice)}</span>
          ${originalPrice ? `<span class="old-price">${formatPrice(originalPrice)}</span>` : ''}
          ${hasDiscount ? `<span class="discount-percent">-${discount}%</span>` : ''}
        </div>
        <div class="product-rating">
          <div class="stars">
            ${generateStars(product.rating || 5)}
          </div>
          <span>(${getSoldCount(product.id) || product.soldCount || 0} đã bán)</span>
        </div>
        ${product.stock === 0 ? '<div class="stock-alert"><i class="fa fa-exclamation-triangle"></i> Hết hàng</div>' : ''}
        ${product.stock > 0 && product.stock < 10 ? `<div class="stock-alert"><i class="fa fa-fire"></i> Chỉ còn ${product.stock} sản phẩm!</div>` : ''}
      </div>
    </div>
  `;
}

// Generate star rating HTML
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let html = '';
  
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fas fa-star"></i>';
  }
  
  if (hasHalfStar) {
    html += '<i class="fas fa-star-half-alt"></i>';
  }
  
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="far fa-star"></i>';
  }
  
  return html;
}

// ============================================================
// BƯỚC 2: RENDER (ĐỔ) DỮ LIỆU LÊN GIAO DIỆN HTML
// ============================================================
// Hàm này nhận vào:
// - containerId: ID của thẻ HTML sẽ chứa sản phẩm (vd: 'new-arrivals-grid')
// - products: Mảng sản phẩm đã lấy từ localStorage
// 
// Quy trình:
// 1. Lấy container bằng document.getElementById()
// 2. Dùng .map() để tạo HTML cho từng sản phẩm
// 3. Dùng .join('') để nối mảng HTML thành 1 string
// 4. Gán vào container.innerHTML để hiển thị
function renderProductsToContainer(containerId, products) {
  // Lấy thẻ HTML container theo ID
  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`Container #${containerId} not found`);
    return;
  }
  
  // Nếu không có sản phẩm thì hiển thị thông báo
  if (products.length === 0) {
    container.innerHTML = '<p class="no-products">Chưa có sản phẩm nào trong danh mục này</p>';
    return;
  }
  
  // Xóa nội dung cũ
  container.innerHTML = '';
  
  // Force reflow
  void container.offsetHeight;
  
  // ĐỔ DỮ LIỆU LÊN HTML:
  // - products.map(p => generateProductCard(p)): Tạo mảng HTML cho từng sản phẩm
  // - .join(''): Nối mảng thành 1 string HTML
  // - container.innerHTML = ...: Gán HTML vào container để hiển thị
  container.innerHTML = products.map(p => generateProductCard(p)).join('');
  
  // Cập nhật UI wishlist sau khi render
  setTimeout(() => {
    updateWishlistUI();
  }, 50);
  
  console.log(`✅ Rendered ${products.length} products to #${containerId}`);
}

// ============================================================
// BƯỚC 3: GỌI HÀM LOAD DỮ LIỆU CHO TỪNG SECTION
// ============================================================
// Các hàm này kết hợp Bước 1 và Bước 2:
// 1. Gọi hàm lấy dữ liệu (getNewArrivals, getSaleProducts, getBestSellers)
// 2. Gọi hàm render để đổ lên HTML

// Load section SẢN PHẨM MỚI
function loadNewArrivals() {
  const products = getNewArrivals(8); // Lấy 8 sản phẩm mới từ localStorage
  renderProductsToContainer('new-arrivals-grid', products); // Đổ vào container có id="new-arrivals-grid"
}

// Load section SẢN PHẨM SALE
function loadSaleProducts() {
  const products = getSaleProducts(8); // Lấy 8 sản phẩm sale từ localStorage
  renderProductsToContainer('sale-products-grid', products); // Đổ vào container có id="sale-products-grid"
}

// Load section SẢN PHẨM BÁN CHẠY
function loadBestSellers() {
  const products = getBestSellers(8); // Lấy 8 sản phẩm bán chạy từ localStorage
  renderProductsToContainer('bestsellers-grid', products); // Đổ vào container có id="bestsellers-grid"
}

// Filter handlers
let currentNewArrivalsFilter = 'Tất cả';
let currentSaleFilter = 'Tất cả';
let currentBestSellersFilter = 'Tất cả';

function filterNewArrivals(gender) {
  currentNewArrivalsFilter = gender;
  const allProducts = getNewArrivals(100);
  const filtered = filterByGender(allProducts, gender).slice(0, 8);
  renderProductsToContainer('new-arrivals-grid', filtered);
  
  // Update active button
  document.querySelectorAll('.filter-btn[data-section="new-arrivals"]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === gender);
  });
}

function filterSaleProducts(filter) {
  currentSaleFilter = filter;
  const allProducts = getSaleProducts(100);
  const filtered = allProducts.slice(0, 8);
  renderProductsToContainer('sale-products-grid', filtered);
  
  // Update active button
  document.querySelectorAll('.filter-btn[data-section="sale"]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
}

function filterBestSellers(category) {
  currentBestSellersFilter = category;
  const allProducts = getBestSellers(100);
  const filtered = filterByCategory(allProducts, category).slice(0, 8);
  renderProductsToContainer('bestsellers-grid', filtered);
  
  // Update active button
  document.querySelectorAll('.filter-btn[data-section="bestsellers"]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === category);
  });
}

// Wishlist functions
function getWishlistKey() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    return `wishlist_${currentUser.username || currentUser.email}`;
  }
  return 'wishlist_guest';
}

function getWishlist() {
  const key = getWishlistKey();
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : [];
}

function saveWishlist(wishlist) {
  const key = getWishlistKey();
  localStorage.setItem(key, JSON.stringify(wishlist));
}

function toggleWishlist(productId) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  // Yêu cầu đăng nhập
  if (!currentUser) {
    if (confirm('Bạn cần đăng nhập để thêm sản phẩm yêu thích. Đăng nhập ngay?')) {
      window.location.href = 'login.html';
    }
    return;
  }
  
  // Lấy thông tin sản phẩm
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    console.error('Product not found:', productId);
    return;
  }
  
  let wishlist = getWishlist();
  const existingIndex = wishlist.findIndex(item => item.id === productId);
  
  if (existingIndex > -1) {
    // Xóa khỏi wishlist
    wishlist.splice(existingIndex, 1);
    if (typeof modernFashion !== 'undefined' && modernFashion.showToast) {
      modernFashion.showToast('Đã xóa khỏi yêu thích', 'info');
    }
  } else {
    // Thêm vào wishlist với đầy đủ thông tin
    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      oldPrice: product.salePrice ? product.price : product.oldPrice,
      image: getProductImage(product),
      menu: product.menu || product.gender || 'Sản phẩm',
      category: product.category,
      stock: product.stock || 100,
      colors: product.colors || [],
      sizes: product.sizes || [],
      addedDate: new Date().toISOString()
    };
    
    wishlist.push(wishlistItem);
    if (typeof modernFashion !== 'undefined' && modernFashion.showToast) {
      modernFashion.showToast('Đã thêm vào yêu thích', 'success');
    }
  }
  
  saveWishlist(wishlist);
  updateWishlistUI();
  updateWishlistBadge();
}

function updateWishlistUI() {
  const wishlist = getWishlist();
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const card = btn.closest('.product-card');
    if (card) {
      const productId = parseInt(card.dataset.productId);
      const isInWishlist = wishlist.some(item => item.id === productId);
      btn.classList.toggle('active', isInWishlist);
      
      // Thay đổi icon
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isInWishlist ? 'fa fa-heart' : 'far fa-heart';
      }
    }
  });
}

function updateWishlistBadge() {
  const wishlist = getWishlist();
  const badges = document.querySelectorAll('#wishlist-count, .wishlist-badge');
  badges.forEach(badge => {
    badge.textContent = wishlist.length;
    badge.style.display = wishlist.length > 0 ? 'flex' : 'none';
  });
}

// Quick view function - redirect to product detail page
function quickView(productId) {
  window.location.href = `chitietsanpham.html?id=${productId}`;
}

// ============================================================
// BƯỚC 4: KHỞI CHẠY KHI TRANG WEB LOAD XONG
// ============================================================
// DOMContentLoaded: Sự kiện khi HTML đã load xong
// Khi trang load xong sẽ tự động gọi các hàm load dữ liệu
document.addEventListener('DOMContentLoaded', () => {
  console.log('🛍️ Loading products from localStorage...');
  
  // Gọi các hàm load dữ liệu cho từng section
  loadNewArrivals();   // Đổ sản phẩm mới
  loadSaleProducts();  // Đổ sản phẩm sale
  loadBestSellers();   // Đổ sản phẩm bán chạy
  updateWishlistUI();  // Cập nhật UI wishlist
  updateWishlistBadge(); // Cập nhật số lượng wishlist
  
  console.log('✅ Products loaded successfully');
});

// Export functions for global use
window.filterNewArrivals = filterNewArrivals;
window.filterSaleProducts = filterSaleProducts;
window.filterBestSellers = filterBestSellers;
window.toggleWishlist = toggleWishlist;
window.quickView = quickView;
window.getWishlist = getWishlist;
window.updateWishlistBadge = updateWishlistBadge;
