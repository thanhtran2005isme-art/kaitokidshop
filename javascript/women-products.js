// Women Products Loader
// Load and display all women's products from localStorage

// Get products from localStorage
function getProducts() {
  const saved = localStorage.getItem('products');
  if (saved) {
    return JSON.parse(saved);
  }
  return [];
}

// Filter products for women
function getWomenProducts() {
  const products = getProducts();
  return products.filter(p => {
    // Support both old format (gender) and new format (menu)
    const isWomen = p.gender === 'Nữ' || p.menu === 'nu';
    const isActive = p.status === 'active';
    return isWomen && isActive;
  });
}

// Format price to VND
function formatPrice(price) {
  return price.toLocaleString('vi-VN') + '₫';
}

// Calculate discount percentage
function getDiscountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

// Generate star rating HTML
function generateStars(rating) {
  const fullStars = Math.floor(rating || 5);
  let html = '';
  
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fa-solid fa-star"></i>';
  }
  
  const emptyStars = 5 - fullStars;
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="fa-solid fa-star"></i>';
  }
  
  return html;
}

// Get product image (support both single image and images array)
function getProductImage(product) {
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }
  if (product.image) {
    return product.image;
  }
  return '/images/placeholder.png';
}

// Generate product card HTML
function generateProductCard(product) {
  const discount = getDiscountPercent(product.price, product.oldPrice || product.salePrice);
  const hasDiscount = discount > 0 || (product.salePrice && product.salePrice < product.price);
  const displayPrice = product.salePrice || product.price;
  const originalPrice = product.salePrice ? product.price : product.oldPrice;
  
  return `
    <div class="sanpham" data-product-id="${product.id}">
      <div class="image">
        <a href="chitietsanpham.html?id=${product.id}">
          <img src="${getProductImage(product)}" alt="${product.name}" onerror="this.src='/images/placeholder.png'">
        </a>
        ${product.isNew ? '<span class="badge-new">NEW</span>' : ''}
        ${hasDiscount ? `<span class="badge-sale">-${discount}%</span>` : ''}
      </div>
      <div class="namePrice">
        <h3>${product.name}</h3>
        <span>${formatPrice(displayPrice)}</span>
      </div>
      <p>${product.description || product.shortDesc || 'Sản phẩm chất lượng cao'}</p>
      ${originalPrice ? `<p class="old-price">Giá gốc: ${formatPrice(originalPrice)}</p>` : ''}
      <div class="bottom-row">
        <div class="stars">
          ${generateStars(product.rating)}
        </div>
        <div class="buy">
          <a href="chitietsanpham.html?id=${product.id}" class="btn-buy">Mua ngay</a>
        </div>
      </div>
    </div>
  `;
}

// Pagination variables
let currentPage = 1;
const productsPerPage = 12;
let allWomenProducts = [];
let filteredProducts = [];

// Render products with pagination
function renderProducts(page = 1) {
  const container = document.getElementById('women-products-grid');
  if (!container) return;
  
  const startIndex = (page - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToShow = filteredProducts.slice(startIndex, endIndex);
  
  if (productsToShow.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 40px; grid-column: 1/-1;">Không tìm thấy sản phẩm nào</p>';
    return;
  }
  
  container.innerHTML = productsToShow.map(p => generateProductCard(p)).join('');
  renderPagination();
}

// Render pagination
function renderPagination() {
  const container = document.getElementById('pagination-container');
  if (!container) return;
  
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let html = '';
  
  // Previous button
  if (currentPage > 1) {
    html += `<a class="page" onclick="goToPage(${currentPage - 1})">&laquo;</a>`;
  }
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<a class="page ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</a>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += '<span class="dots">...</span>';
    }
  }
  
  // Next button
  if (currentPage < totalPages) {
    html += `<a class="page" onclick="goToPage(${currentPage + 1})">&raquo;</a>`;
  }
  
  container.innerHTML = html;
}

// Go to specific page
function goToPage(page) {
  currentPage = page;
  renderProducts(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Filter by subcategory
function filterBySubCategory(subCategory) {
  if (subCategory === 'Tất cả sản phẩm nữ') {
    filteredProducts = [...allWomenProducts];
  } else {
    filteredProducts = allWomenProducts.filter(p => 
      p.category === subCategory || p.subCategory === subCategory
    );
  }
  
  currentPage = 1;
  renderProducts(1);
  
  // Update header
  const header = document.querySelector('.header-filter h2');
  if (header) {
    header.textContent = subCategory === 'Tất cả sản phẩm nữ' ? 'THỜI TRANG NỮ' : subCategory.toUpperCase();
  }
}

// Add to cart function
function addToCart(productId) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    alert('Không tìm thấy sản phẩm');
    return;
  }
  
  if (product.stock === 0) {
    alert('Sản phẩm đã hết hàng');
    return;
  }
  
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: getProductImage(product),
      quantity: 1
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Update cart count
  updateCartCount();
  
  alert('Đã thêm sản phẩm vào giỏ hàng!');
}

// Update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let totalItems = 0;
  cart.forEach(item => {
    totalItems += item.quantity;
  });
  
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    if (totalItems > 0) {
      countElement.textContent = totalItems;
      countElement.style.display = 'inline';
    } else {
      countElement.style.display = 'none';
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('🛍️ Loading women products...');
  
  allWomenProducts = getWomenProducts();
  filteredProducts = [...allWomenProducts];
  
  console.log(`Found ${allWomenProducts.length} women products`);
  
  renderProducts(1);
  updateCartCount();
  
  console.log('✅ Women products loaded successfully');
});

// Export functions for global use
window.goToPage = goToPage;
window.filterBySubCategory = filterBySubCategory;
window.addToCart = addToCart;
