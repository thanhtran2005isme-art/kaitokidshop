// Best Seller Products Page
// Hiển thị sản phẩm bán chạy nhất dựa trên số lượng đã bán

function getProducts() {
  const saved = localStorage.getItem('products');
  return saved ? JSON.parse(saved) : [];
}

function getInventory() {
  const saved = localStorage.getItem('inventory');
  return saved ? JSON.parse(saved) : [];
}

// Lấy số lượng đã bán từ inventory
function getSoldCount(productId) {
  const inventory = getInventory();
  const invEntry = inventory.find(inv => inv.productId === productId || inv.id === productId);
  if (invEntry && invEntry.sold) {
    return invEntry.sold;
  }
  return 0;
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

function generateStars(rating) {
  const fullStars = Math.floor(rating || 5);
  let html = '';
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fa-solid fa-star"></i>';
  }
  const emptyStars = 5 - fullStars;
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="fa-regular fa-star"></i>';
  }
  return html;
}

// Lấy tất cả sản phẩm và sắp xếp theo số lượng bán
function getBestSellerProducts() {
  const products = getProducts();
  
  // Thêm số lượng đã bán vào mỗi sản phẩm
  const productsWithSold = products
    .filter(p => p.status === 'active')
    .map(p => ({
      ...p,
      soldFromInventory: getSoldCount(p.id),
      totalSold: getSoldCount(p.id) || p.soldCount || 0
    }));
  
  // Sắp xếp theo số lượng bán giảm dần
  return productsWithSold.sort((a, b) => b.totalSold - a.totalSold);
}

function generateProductCard(product) {
  const discount = getDiscountPercent(product.price, product.oldPrice);
  const hasDiscount = discount > 0 || (product.salePrice && product.salePrice < product.price);
  const displayPrice = product.salePrice || product.price;
  const originalPrice = product.salePrice ? product.price : product.oldPrice;
  const soldCount = product.totalSold || 0;
  
  // Badge cho top seller
  let rankBadge = '';
  if (product.rank === 1) {
    rankBadge = '<span class="badge-rank badge-gold">🥇 #1</span>';
  } else if (product.rank === 2) {
    rankBadge = '<span class="badge-rank badge-silver">🥈 #2</span>';
  } else if (product.rank === 3) {
    rankBadge = '<span class="badge-rank badge-bronze">🥉 #3</span>';
  } else if (product.rank <= 10) {
    rankBadge = `<span class="badge-rank">TOP ${product.rank}</span>`;
  }
  
  return `
    <div class="sanpham" data-product-id="${product.id}">
      <div class="image">
        <a href="chitietsanpham.html?id=${product.id}">
          <img src="${getProductImage(product)}" alt="${product.name}" onerror="this.src='/images/placeholder.png'">
        </a>
        ${rankBadge}
        ${product.isNew ? '<span class="badge-new">NEW</span>' : ''}
        ${hasDiscount ? `<span class="badge-sale">-${discount}%</span>` : ''}
      </div>
      <div class="namePrice">
        <h3>${product.name}</h3>
        <span>${formatPrice(displayPrice)}</span>
      </div>
      <p>${product.description || product.shortDesc || ''}</p>
      ${originalPrice ? `<p class="old-price">${formatPrice(originalPrice)}</p>` : ''}
      <div class="bottom-row">
        <div class="stars">
          ${generateStars(product.rating)}
        </div>
        <div class="sold-count">
          <i class="fa fa-fire" style="color: #ef4444;"></i>
          <span>${soldCount} đã bán</span>
        </div>
      </div>
      <div class="buy">
        <a href="chitietsanpham.html?id=${product.id}" class="btn-buy">Xem chi tiết</a>
      </div>
    </div>
  `;
}

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let currentSort = 'sold-desc';
let currentCategory = 'Tất cả';
const productsPerPage = 12;

function renderProducts(page = 1) {
  const container = document.getElementById('bestseller-products-grid');
  if (!container) return;

  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  
  // Thêm rank cho sản phẩm
  const rankedProducts = filteredProducts.map((p, index) => ({
    ...p,
    rank: index + 1
  }));
  
  const products = rankedProducts.slice(start, end);

  if (products.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:40px;grid-column:1/-1;">Chưa có sản phẩm bán chạy</p>';
    return;
  }

  container.innerHTML = products.map(p => generateProductCard(p)).join('');
  renderPagination();
  
  // Thêm CSS cho badge rank
  addRankStyles();
}

function addRankStyles() {
  if (document.getElementById('rank-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'rank-styles';
  style.textContent = `
    .badge-rank {
      position: absolute;
      top: 10px;
      left: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      z-index: 10;
    }
    .badge-gold {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    .badge-silver {
      background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
    }
    .badge-bronze {
      background: linear-gradient(135deg, #d97706 0%, #92400e 100%);
    }
    .sold-count {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #ef4444;
      font-weight: 600;
    }
    .bestseller-desc {
      color: #6b7280;
      font-size: 14px;
      margin-top: 5px;
    }
    .sort-link {
      display: block;
      padding: 8px 0;
      color: #374151;
      text-decoration: none;
      transition: color 0.2s;
    }
    .sort-link:hover {
      color: #667eea;
    }
    .sort-link.active {
      color: #667eea;
      font-weight: 600;
    }
  `;
  document.head.appendChild(style);
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

// Lọc theo danh mục
function filterByCategory(category) {
  currentCategory = category;
  
  if (category === 'Tất cả') {
    filteredProducts = [...allProducts];
  } else {
    filteredProducts = allProducts.filter(p => {
      const gender = p.gender || '';
      const menu = p.menu || '';
      
      if (category === 'Nữ') {
        return gender === 'Nữ' || menu === 'nu';
      } else if (category === 'Nam') {
        return gender === 'Nam' || menu === 'nam';
      } else if (category === 'Trẻ em') {
        return gender === 'Trẻ em' || menu === 'treem';
      }
      return true;
    });
  }
  
  // Áp dụng lại sort
  applySorting();
  
  currentPage = 1;
  renderProducts(1);
  
  // Update header
  const header = document.querySelector('.header-filter h2');
  if (header) {
    if (category === 'Tất cả') {
      header.textContent = '🏆 SẢN PHẨM BÁN CHẠY';
    } else {
      header.textContent = `🏆 BÁN CHẠY - ${category.toUpperCase()}`;
    }
  }
}

// Sắp xếp sản phẩm
function sortProducts(sortType) {
  currentSort = sortType;
  applySorting();
  
  currentPage = 1;
  renderProducts(1);
  
  // Update active sort link
  document.querySelectorAll('.sort-link').forEach(link => {
    link.classList.toggle('active', link.dataset.sort === sortType);
  });
}

function applySorting() {
  switch (currentSort) {
    case 'sold-desc':
      filteredProducts.sort((a, b) => b.totalSold - a.totalSold);
      break;
    case 'price-asc':
      filteredProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
      break;
    case 'price-desc':
      filteredProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
      break;
    case 'newest':
      filteredProducts.sort((a, b) => b.id - a.id);
      break;
  }
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let totalItems = 0;
  cart.forEach(item => totalItems += item.quantity || 1);
  
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    countElement.textContent = totalItems;
    countElement.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏆 Loading best seller products...');
  
  allProducts = getBestSellerProducts();
  filteredProducts = [...allProducts];
  
  console.log(`Found ${allProducts.length} products, sorted by sales`);
  
  renderProducts(1);
  updateCartCount();
  
  console.log('✅ Best seller products loaded successfully');
});

// Export functions
window.goToPage = goToPage;
window.filterByCategory = filterByCategory;
window.sortProducts = sortProducts;
