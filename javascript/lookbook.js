// Lookbook Page

// Sample lookbook data
const defaultLookbooks = [
  {
    id: 1,
    title: 'Office Chic Monday',
    style: 'office',
    image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600',
    description: 'Phong cách công sở thanh lịch cho ngày đầu tuần',
    products: ['Áo blazer kẻ', 'Quần tây lưng cao', 'Áo thun trắng basic']
  },
  {
    id: 2,
    title: 'Street Style Weekend',
    style: 'street',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600',
    description: 'Mix & match cho phong cách đường phố',
    products: ['Áo hoodie oversized', 'Quần jeans baggy', 'Giày sneaker']
  },
  {
    id: 3,
    title: 'Casual Sunday',
    style: 'casual',
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600',
    description: 'Thoải mái cho ngày cuối tuần',
    products: ['Áo thun basic', 'Quần short', 'Sandal']
  },
  {
    id: 4,
    title: 'Party Night Glam',
    style: 'party',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
    description: 'Tỏa sáng trong đêm tiệc',
    products: ['Đầm dự tiệc', 'Clutch', 'Giày cao gót']
  },
  {
    id: 5,
    title: 'Business Meeting',
    style: 'office',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600',
    description: 'Chuyên nghiệp cho cuộc họp quan trọng',
    products: ['Áo sơ mi', 'Chân váy bút chì', 'Giày oxford']
  },
  {
    id: 6,
    title: 'Coffee Date',
    style: 'casual',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600',
    description: 'Nhẹ nhàng cho buổi hẹn cà phê',
    products: ['Áo kiểu', 'Quần culottes', 'Túi xách nhỏ']
  }
];

function getLookbooks() {
  const saved = localStorage.getItem('lookbooks');
  return saved ? JSON.parse(saved) : defaultLookbooks;
}

function generateLookbookCard(lookbook) {
  return `
    <div class="lookbook-card" data-style="${lookbook.style}">
      <div class="lookbook-image">
        <img src="${lookbook.image}" alt="${lookbook.title}" onerror="this.src='/images/placeholder.png'">
        <div class="lookbook-overlay">
          <h3>${lookbook.title}</h3>
          <p>${lookbook.description}</p>
          <div class="lookbook-products">
            ${lookbook.products.map(p => `<span class="product-tag">${p}</span>`).join('')}
          </div>
          <button class="btn-shop-look">Shop this look</button>
        </div>
      </div>
    </div>
  `;
}

let allLookbooks = [];
let currentStyle = 'all';

function renderLookbooks() {
  const container = document.getElementById('lookbook-grid');
  if (!container) return;

  let lookbooks = allLookbooks;
  if (currentStyle !== 'all') {
    lookbooks = allLookbooks.filter(l => l.style === currentStyle);
  }

  if (lookbooks.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:40px;grid-column:1/-1;">Chưa có lookbook nào</p>';
    return;
  }

  container.innerHTML = lookbooks.map(l => generateLookbookCard(l)).join('');
}

function setupStyleTabs() {
  const tabs = document.querySelectorAll('.style-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentStyle = tab.dataset.style;
      renderLookbooks();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  allLookbooks = getLookbooks();
  renderLookbooks();
  setupStyleTabs();
});
