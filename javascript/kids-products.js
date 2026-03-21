// Kids Products Loader
// Load and display all kids' products from localStorage

function getProducts() {
  const saved = localStorage.getItem('products');
  if (saved) {
    return JSON.parse(saved);
  }
  return [];
}

function getKidsProducts() {
  const products = getProducts();
  return products.filter(p => {
    const isKids = p.gender === 'Trẻ em' || p.menu === 'treem';
    const isActive = p.status === 'active';
    return isKids && isActive;
  });
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

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + '₫';
}

function getDiscountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

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

let currentPage = 1;
const productsPerPage = 12;
let allKidsProducts = [];
let filteredProducts = [];

function renderProducts(page = 1) {
  const container = document.getElementById('kids-products-grid');
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

function renderPagination() {
  const container = document.getElementById('pagination-container');
  if (!container) return;
  
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let html = '';
  
  if (currentPage > 1) {
    html += `<a class="page" onclick="goToPage(${currentPage - 1})">&laquo;</a>`;
  }
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<a class="page ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</a>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += '<span class="dots">...</span>';
    }
  }
  
  if (currentPage < totalPages) {
    html += `<a class="page" onclick="goToPage(${currentPage + 1})">&raquo;</a>`;
  }
  
  container.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  renderProducts(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterBySubCategory(subCategory) {
  if (subCategory === 'Tất cả sản phẩm trẻ em') {
    filteredProducts = [...allKidsProducts];
  } else {
    filteredProducts = allKidsProducts.filter(p => 
      p.category === subCategory || p.subCategory === subCategory
    );
  }
  
  currentPage = 1;
  renderProducts(1);
  
  const header = document.querySelector('.header-filter h2');
  if (header) {
    header.textContent = subCategory === 'Tất cả sản phẩm trẻ em' ? 'THỜI TRANG TRẺ EM' : subCategory.toUpperCase();
  }
}

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
  updateCartCount();
  alert('Đã thêm sản phẩm vào giỏ hàng!');
}

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

document.addEventListener('DOMContentLoaded', () => {
  console.log('🛍️ Loading kids products...');
  
  allKidsProducts = getKidsProducts();
  filteredProducts = [...allKidsProducts];
  
  console.log(`Found ${allKidsProducts.length} kids products`);
  
  renderProducts(1);
  updateCartCount();
  
  console.log('✅ Kids products loaded successfully');
});

window.goToPage = goToPage;
window.filterBySubCategory = filterBySubCategory;
window.addToCart = addToCart;
