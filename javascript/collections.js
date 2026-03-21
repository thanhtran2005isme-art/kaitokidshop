// Collections Page

// Sample collections data
const defaultCollections = [
  {
    id: 1,
    name: 'Summer Breeze 2025',
    description: 'Bộ sưu tập mùa hè với chất liệu thoáng mát',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600',
    productCount: 24
  },
  {
    id: 2,
    name: 'Office Elegance',
    description: 'Phong cách công sở thanh lịch, chuyên nghiệp',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600',
    productCount: 18
  },
  {
    id: 3,
    name: 'Street Style',
    description: 'Thời trang đường phố năng động, cá tính',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600',
    productCount: 32
  },
  {
    id: 4,
    name: 'Party Night',
    description: 'Tỏa sáng trong mọi bữa tiệc',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
    productCount: 15
  },
  {
    id: 5,
    name: 'Minimalist',
    description: 'Đơn giản nhưng tinh tế',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600',
    productCount: 20
  },
  {
    id: 6,
    name: 'Vintage Charm',
    description: 'Nét đẹp cổ điển vượt thời gian',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600',
    productCount: 12
  }
];

function getCollections() {
  const saved = localStorage.getItem('collections');
  return saved ? JSON.parse(saved) : defaultCollections;
}

function generateCollectionCard(collection) {
  return `
    <div class="collection-card">
      <div class="collection-image">
        <img src="${collection.image}" alt="${collection.name}" onerror="this.src='/images/placeholder.png'">
        <div class="collection-overlay">
          <a href="collection-detail.html?id=${collection.id}" class="btn-view">Xem bộ sưu tập</a>
        </div>
      </div>
      <div class="collection-info">
        <h3>${collection.name}</h3>
        <p>${collection.description}</p>
        <span class="product-count">${collection.productCount} sản phẩm</span>
      </div>
    </div>
  `;
}

function renderCollections() {
  const container = document.getElementById('collections-grid');
  if (!container) return;

  const collections = getCollections();

  if (collections.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:40px;">Chưa có bộ sưu tập nào</p>';
    return;
  }

  container.innerHTML = collections.map(c => generateCollectionCard(c)).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderCollections();
});
