// Inventory History Management
let history = [];
let filteredHistory = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  loadHistory();
  setupFilters();
});

// Load history
function loadHistory() {
  const saved = localStorage.getItem('inventoryHistory');
  if (saved) {
    history = JSON.parse(saved);
  } else {
    // Demo data
    history = [
      {
        productName: 'Áo sơ mi trắng',
        type: 'in',
        quantity: 20,
        oldStock: 25,
        newStock: 45,
        note: 'Nhập hàng từ nhà cung cấp ABC',
        date: new Date().toISOString()
      },
      {
        productName: 'Quần jean xanh',
        type: 'out',
        quantity: 5,
        oldStock: 13,
        newStock: 8,
        note: 'Xuất hàng cho đơn #DH002',
        date: new Date(Date.now() - 86400000).toISOString()
      },
      {
        productName: 'Váy hoa nhí',
        type: 'set',
        quantity: 0,
        oldStock: 3,
        newStock: 0,
        note: 'Kiểm kê - Hết hàng',
        date: new Date(Date.now() - 172800000).toISOString()
      }
    ];
  }
  
  filteredHistory = [...history];
  renderHistory();
}

// Render history
function renderHistory() {
  const timeline = document.getElementById('historyTimeline');
  
  if (filteredHistory.length === 0) {
    timeline.innerHTML = `
      <div class="empty-state">
        <i class="fa fa-history"></i>
        <h3>Chưa có lịch sử nào</h3>
        <p>Các thay đổi tồn kho sẽ được ghi lại tại đây</p>
      </div>
    `;
    return;
  }
  
  // Group by date
  const grouped = groupByDate(filteredHistory);
  
  timeline.innerHTML = Object.keys(grouped).map(date => `
    <div class="history-date-group">
      <div class="history-date-header">
        <i class="fa fa-calendar"></i>
        <span>${formatDateHeader(date)}</span>
      </div>
      <div class="history-items">
        ${grouped[date].map(item => renderHistoryItem(item)).join('')}
      </div>
    </div>
  `).join('');
}

// Render single history item
function renderHistoryItem(item) {
  const typeInfo = getTypeInfo(item.type);
  const time = new Date(item.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  
  return `
    <div class="history-item">
      <div class="history-icon ${typeInfo.class}">
        <i class="fa fa-${typeInfo.icon}"></i>
      </div>
      <div class="history-content">
        <div class="history-header">
          <h4>${item.productName}</h4>
          <span class="history-time">${time}</span>
        </div>
        <div class="history-details">
          <span class="history-type ${typeInfo.class}">${typeInfo.text}</span>
          <span class="history-quantity">${item.quantity} sản phẩm</span>
          <span class="history-stock-change">
            ${item.oldStock} → ${item.newStock}
          </span>
        </div>
        ${item.note ? `<p class="history-note">${item.note}</p>` : ''}
      </div>
    </div>
  `;
}

// Setup filters
function setupFilters() {
  const typeFilter = document.getElementById('typeFilter');
  const dateFrom = document.getElementById('dateFrom');
  const dateTo = document.getElementById('dateTo');
  
  typeFilter.addEventListener('change', applyFilters);
  dateFrom.addEventListener('change', applyFilters);
  dateTo.addEventListener('change', applyFilters);
}

// Apply filters
function applyFilters() {
  const typeFilter = document.getElementById('typeFilter').value;
  const dateFrom = document.getElementById('dateFrom').value;
  const dateTo = document.getElementById('dateTo').value;
  
  filteredHistory = history.filter(item => {
    const matchType = !typeFilter || item.type === typeFilter;
    
    const itemDate = new Date(item.date).toISOString().split('T')[0];
    const matchDateFrom = !dateFrom || itemDate >= dateFrom;
    const matchDateTo = !dateTo || itemDate <= dateTo;
    
    return matchType && matchDateFrom && matchDateTo;
  });
  
  renderHistory();
}

// Reset filters
function resetFilters() {
  document.getElementById('typeFilter').value = '';
  document.getElementById('dateFrom').value = '';
  document.getElementById('dateTo').value = '';
  filteredHistory = [...history];
  renderHistory();
}

// Export history
function exportHistory() {
  alert('Chức năng xuất Excel đang được phát triển');
}

// Helper functions
function groupByDate(items) {
  return items.reduce((groups, item) => {
    const date = new Date(item.date).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
    return groups;
  }, {});
}

function formatDateHeader(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateOnly = date.toISOString().split('T')[0];
  const todayOnly = today.toISOString().split('T')[0];
  const yesterdayOnly = yesterday.toISOString().split('T')[0];
  
  if (dateOnly === todayOnly) {
    return 'Hôm nay';
  } else if (dateOnly === yesterdayOnly) {
    return 'Hôm qua';
  } else {
    return date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}

function getTypeInfo(type) {
  const types = {
    'in': { text: 'Nhập hàng', icon: 'arrow-down', class: 'type-in' },
    'out': { text: 'Xuất hàng', icon: 'arrow-up', class: 'type-out' },
    'set': { text: 'Đặt lại', icon: 'sync', class: 'type-set' }
  };
  return types[type] || types['in'];
}
