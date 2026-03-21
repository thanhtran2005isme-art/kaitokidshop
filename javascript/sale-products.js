// Sale Products Page

function getProducts() {
  const saved = localStorage.getItem('products');
  return saved ? JSON.parse(saved) : [];
}

function getProductImage(product) {
  if (product.images && product.images.length > 0) return product.images[0];
  if (product.image) return product.image;
  return '/images/placeholder.png';
}

function formatPrice(price) {
  return price.toLocaleString('vi-VN') + '₫';
}

function getDiscountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

function getSaleProducts() {
  const products = getProducts();
  return products.filter(p => {
    // Check if product is active
    if (p.status !== 'active') return false;
    
    // Calculate discount
    let displayPrice, originalPrice;
    
    if (p.salePrice && p.salePrice < p.price) {
      // Has salePrice lower than price
      displayPrice = p.salePrice;
      originalPrice = p.price;
    } else if (p.oldPrice && p.price < p.oldPrice) {
      // Has oldPrice higher than current price
      displayPrice = p.price;
      originalPrice = p.oldPrice;
    } else {
      // No valid discount
      return false;
    }
    
    // Must have actual discount (> 0%)
    const discount = getDiscountPercent(displayPrice, originalPrice);
    return discount > 0;
  });
}

function generateProductCard(product) {
  const displayPrice = product.salePrice || product.price;
  const originalPrice = product.salePrice ? product.price : product.oldPrice;
  const discount = getDiscountPercent(displayPrice, originalPrice);
  
  return `
    <div class="sanpham" data-product-id="${product.id}">
      <div class="image">
        <a href="chitietsanpham.html?id=${product.id}">
          <img src="${getProductImage(product)}" alt="${product.name}" onerror="this.src='/images/placeholder.png'">
        </a>
        ${discount > 0 ? `<span class="badge-sale">-${discount}%</span>` : ''}
      </div>
      <div class="namePrice">
        <h3>${product.name}</h3>
        <span>${formatPrice(displayPrice)}</span>
      </div>
      <p>${product.description || product.shortDesc || ''}</p>
      ${originalPrice ? `<p class="old-price">${formatPrice(originalPrice)}</p>` : ''}
      <div class="bottom-row">
        <div class="stars">
          ${'<i class="fa-solid fa-star"></i>'.repeat(5)}
        </div>
        <div class="buy">
          <a href="chitietsanpham.html?id=${product.id}" class="btn-buy">Mua ngay</a>
        </div>
      </div>
    </div>
  `;
}

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 12;

function renderProducts(page = 1) {
  const container = document.getElementById('sale-products-grid');
  if (!container) return;

  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const products = filteredProducts.slice(start, end);

  if (products.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:40px;grid-column:1/-1;">Chưa có sản phẩm giảm giá</p>';
    return;
  }

  container.innerHTML = products.map(p => generateProductCard(p)).join('');
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
  for (let i = 1; i <= totalPages; i++) {
    html += `<a class="page ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</a>`;
  }
  container.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  renderProducts(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterByDiscount() {
  const minDiscount = parseInt(document.getElementById('discountFilter').value) || 0;
  
  filteredProducts = allProducts.filter(p => {
    const displayPrice = p.salePrice || p.price;
    const originalPrice = p.salePrice ? p.price : p.oldPrice;
    const discount = getDiscountPercent(displayPrice, originalPrice);
    return discount >= minDiscount;
  });
  
  currentPage = 1;
  renderProducts(1);
}

function sortProducts() {
  const sortBy = document.getElementById('sortFilter').value;
  
  if (sortBy === 'discount-desc') {
    filteredProducts.sort((a, b) => {
      const discountA = getDiscountPercent(a.salePrice || a.price, a.salePrice ? a.price : a.oldPrice);
      const discountB = getDiscountPercent(b.salePrice || b.price, b.salePrice ? b.price : b.oldPrice);
      return discountB - discountA;
    });
  } else if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
  }
  
  currentPage = 1;
  renderProducts(1);
}

function addToCart(productId) {
  const product = getProducts().find(p => p.id === productId);
  if (!product) return;

  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += 1;
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
  alert('Đã thêm vào giỏ hàng!');
}

document.addEventListener('DOMContentLoaded', () => {
  allProducts = getSaleProducts();
  filteredProducts = [...allProducts];
  renderProducts(1);
});

window.goToPage = goToPage;
window.addToCart = addToCart;
window.filterByDiscount = filterByDiscount;
window.sortProducts = sortProducts;
