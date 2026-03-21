// New In Products Page

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

function getNewInProducts() {
  const products = getProducts();
  return products.filter(p => p.isNew && p.status === 'active');
}

function generateProductCard(product) {
  const hasDiscount = product.oldPrice || product.salePrice;
  const displayPrice = product.salePrice || product.price;
  const originalPrice = product.salePrice ? product.price : product.oldPrice;
  
  return `
    <div class="sanpham" data-product-id="${product.id}">
      <div class="image">
        <a href="chitietsanpham.html?id=${product.id}">
          <img src="${getProductImage(product)}" alt="${product.name}" onerror="this.src='/images/placeholder.png'">
        </a>
        <span class="badge-new">NEW</span>
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
let currentPage = 1;
const productsPerPage = 12;

function renderProducts(page = 1) {
  const container = document.getElementById('newin-products-grid');
  if (!container) return;

  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const products = allProducts.slice(start, end);

  if (products.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:40px;grid-column:1/-1;">Chưa có sản phẩm mới</p>';
    return;
  }

  container.innerHTML = products.map(p => generateProductCard(p)).join('');
  renderPagination();
}

function renderPagination() {
  const container = document.getElementById('pagination-container');
  if (!container) return;

  const totalPages = Math.ceil(allProducts.length / productsPerPage);
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
  allProducts = getNewInProducts();
  renderProducts(1);
});

window.goToPage = goToPage;
window.addToCart = addToCart;
