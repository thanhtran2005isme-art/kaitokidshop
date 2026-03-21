// Admin Reports JavaScript

let reportsData = {
  period: 'month',
  totalRevenue: 0,
  totalOrders: 0,
  newCustomers: 0,
  productsSold: 0,
  revenueData: [],
  ordersByStatus: {},
  topProducts: [],
  categoryRevenue: []
};

// Initialize Reports
document.addEventListener('DOMContentLoaded', () => {
  loadReportsData();
  initCharts();
  
  // Period filter change
  const periodFilter = document.getElementById('reportPeriod');
  if (periodFilter) {
    periodFilter.addEventListener('change', (e) => {
      reportsData.period = e.target.value;
      loadReportsData();
      updateCharts();
    });
  }
});

// Load Reports Data
function loadReportsData() {
  // Load orders from localStorage - try multiple keys
  let orders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
  
  // Also check 'orders' key if adminOrders is empty
  if (orders.length === 0) {
    orders = JSON.parse(localStorage.getItem('orders') || '[]');
  }
  
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const customers = JSON.parse(localStorage.getItem('customers') || '[]');
  
  console.log('📊 Loading reports - Orders:', orders.length, 'Products:', products.length);
  
  // Calculate date range
  const now = new Date();
  let startDate = new Date();
  
  switch(reportsData.period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setDate(now.getDate() - 30);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  // Filter orders by date
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= now;
  });
  
  // Calculate statistics
  reportsData.totalRevenue = filteredOrders.reduce((sum, order) => {
    // Support different field names for total
    const orderTotal = order.total || order.totalAmount || order.grandTotal || 0;
    return sum + orderTotal;
  }, 0);
  
  reportsData.totalOrders = filteredOrders.length;
  
  reportsData.productsSold = filteredOrders.reduce((sum, order) => {
    // Support different field names for items
    const items = order.items || order.products || order.orderItems || [];
    return sum + items.reduce((itemSum, item) => itemSum + (item.quantity || item.qty || 1), 0);
  }, 0);
  
  // Count new customers in period
  const uniqueCustomers = new Set();
  filteredOrders.forEach(order => {
    const customerId = order.customerId || order.userId || order.email || order.phone;
    if (customerId) uniqueCustomers.add(customerId);
  });
  reportsData.newCustomers = uniqueCustomers.size;
  
  // Orders by status - support different status values
  reportsData.ordersByStatus = {
    pending: filteredOrders.filter(o => 
      o.status === 'pending' || o.status === 'Chờ xác nhận' || o.status === 'new'
    ).length,
    shipping: filteredOrders.filter(o => 
      o.status === 'shipping' || o.status === 'processing' || 
      o.status === 'Đang giao' || o.status === 'Đang xử lý'
    ).length,
    completed: filteredOrders.filter(o => 
      o.status === 'completed' || o.status === 'delivered' || 
      o.status === 'Hoàn thành' || o.status === 'Đã giao'
    ).length,
    cancelled: filteredOrders.filter(o => 
      o.status === 'cancelled' || o.status === 'Đã huỷ' || o.status === 'Đã hủy'
    ).length
  };
  
  console.log('📊 Stats:', {
    revenue: reportsData.totalRevenue,
    orders: reportsData.totalOrders,
    products: reportsData.productsSold,
    customers: reportsData.newCustomers
  });
  
  // Generate revenue data (last 30 days)
  reportsData.revenueData = generateRevenueData(filteredOrders);
  
  // Top products
  reportsData.topProducts = calculateTopProducts(filteredOrders);
  
  // Category revenue
  reportsData.categoryRevenue = calculateCategoryRevenue(filteredOrders, products);
  
  // Update UI
  updateStatistics();
  updateTables();
}

// Generate Revenue Data
function generateRevenueData(orders) {
  const days = 30;
  const data = [];
  const labels = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dayOrders = orders.filter(order => {
      // Support different date field names
      const orderDateStr = order.createdAt || order.orderDate || order.date || order.created_at;
      if (!orderDateStr) return false;
      
      const orderDate = new Date(orderDateStr);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === date.getTime();
    });
    
    const revenue = dayOrders.reduce((sum, order) => {
      return sum + (order.total || order.totalAmount || order.grandTotal || 0);
    }, 0);
    
    labels.push(date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
    data.push(revenue);
  }
  
  return { labels, data };
}

// Calculate Top Products
function calculateTopProducts(orders) {
  const productMap = {};
  
  orders.forEach(order => {
    const items = order.items || order.products || order.orderItems || [];
    items.forEach(item => {
      const itemId = item.id || item.productId || item.name;
      const itemName = item.name || item.productName || `Sản phẩm #${itemId}`;
      const itemQty = item.quantity || item.qty || 1;
      const itemPrice = item.price || item.unitPrice || 0;
      
      if (!productMap[itemId]) {
        productMap[itemId] = {
          id: itemId,
          name: itemName,
          quantity: 0,
          revenue: 0
        };
      }
      productMap[itemId].quantity += itemQty;
      productMap[itemId].revenue += itemPrice * itemQty;
    });
  });
  
  return Object.values(productMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);
}

// Calculate Category Revenue
function calculateCategoryRevenue(orders, products) {
  const categoryMap = {};
  
  orders.forEach(order => {
    const items = order.items || order.products || order.orderItems || [];
    items.forEach(item => {
      const itemId = item.id || item.productId;
      const product = products.find(p => p.id === itemId);
      const category = item.category || product?.category || 'Khác';
      const itemQty = item.quantity || item.qty || 1;
      const itemPrice = item.price || item.unitPrice || 0;
      
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          orders: 0,
          revenue: 0,
          quantity: 0
        };
      }
      
      categoryMap[category].orders += 1;
      categoryMap[category].revenue += itemPrice * itemQty;
      categoryMap[category].quantity += itemQty;
    });
  });
  
  const totalRevenue = Object.values(categoryMap).reduce((sum, cat) => sum + cat.revenue, 0);
  
  return Object.values(categoryMap).map(cat => ({
    ...cat,
    percentage: totalRevenue > 0 ? ((cat.revenue / totalRevenue) * 100).toFixed(1) : 0
  })).sort((a, b) => b.revenue - a.revenue);
}

// Update Statistics
function updateStatistics() {
  document.getElementById('totalRevenue').textContent = formatCurrency(reportsData.totalRevenue);
  document.getElementById('totalOrders').textContent = reportsData.totalOrders;
  document.getElementById('newCustomers').textContent = reportsData.newCustomers || 0;
  document.getElementById('productsSold').textContent = reportsData.productsSold;
  
  // Calculate changes (mock data for now)
  const revenueChange = 12.5;
  const ordersChange = 8.2;
  const customersChange = 15.3;
  const productsChange = 10.1;
  
  updateChangeIndicator('revenueChange', revenueChange);
  updateChangeIndicator('ordersChange', ordersChange);
  updateChangeIndicator('customersChange', customersChange);
  updateChangeIndicator('productsChange', productsChange);
}

// Update Change Indicator
function updateChangeIndicator(id, change) {
  const element = document.getElementById(id);
  if (element) {
    const isPositive = change >= 0;
    element.className = `stat-change ${isPositive ? 'positive' : 'negative'}`;
    element.innerHTML = `<i class="fa fa-arrow-${isPositive ? 'up' : 'down'}"></i> ${Math.abs(change).toFixed(1)}%`;
  }
}

// Update Tables
function updateTables() {
  updateTopProductsTable();
  updateCategoryReportTable();
}

// Update Top Products Table
function updateTopProductsTable() {
  const tbody = document.getElementById('topProductsTable');
  if (!tbody) return;
  
  if (reportsData.topProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-message">Chưa có dữ liệu</td></tr>';
    return;
  }
  
  const totalQuantity = reportsData.topProducts.reduce((sum, p) => sum + p.quantity, 0);
  
  tbody.innerHTML = reportsData.topProducts.map((product, index) => {
    const percentage = totalQuantity > 0 ? ((product.quantity / totalQuantity) * 100).toFixed(1) : 0;
    return `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${product.name}</strong></td>
        <td>${product.quantity}</td>
        <td><strong>${formatCurrency(product.revenue)}</strong></td>
        <td>${percentage}%</td>
      </tr>
    `;
  }).join('');
}

// Update Category Report Table
function updateCategoryReportTable() {
  const tbody = document.getElementById('categoryReportTable');
  if (!tbody) return;
  
  if (reportsData.categoryRevenue.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-message">Chưa có dữ liệu</td></tr>';
    return;
  }
  
  tbody.innerHTML = reportsData.categoryRevenue.map(cat => {
    return `
      <tr>
        <td><strong>${cat.name}</strong></td>
        <td>${cat.orders}</td>
        <td><strong>${formatCurrency(cat.revenue)}</strong></td>
        <td>${cat.quantity}</td>
        <td>${cat.percentage}%</td>
      </tr>
    `;
  }).join('');
}

// Initialize Charts
let revenueChart, ordersStatusChart, topProductsChart, categoryRevenueChart;

function initCharts() {
  // Revenue Chart
  const revenueCtx = document.getElementById('revenueChart');
  if (revenueCtx) {
    revenueChart = new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: reportsData.revenueData.labels || [],
        datasets: [{
          label: 'Doanh thu',
          data: reportsData.revenueData.data || [],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return formatCurrency(context.parsed.y);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                if (value >= 1000000) {
                  return (value / 1000000).toFixed(1) + 'M';
                }
                return (value / 1000).toFixed(0) + 'K';
              }
            }
          }
        }
      }
    });
  }

  // Orders Status Chart
  const ordersStatusCtx = document.getElementById('ordersStatusChart');
  if (ordersStatusCtx) {
    ordersStatusChart = new Chart(ordersStatusCtx, {
      type: 'doughnut',
      data: {
        labels: ['Chờ xác nhận', 'Đang giao', 'Hoàn thành', 'Đã huỷ'],
        datasets: [{
          data: [
            reportsData.ordersByStatus.pending || 0,
            reportsData.ordersByStatus.shipping || 0,
            reportsData.ordersByStatus.completed || 0,
            reportsData.ordersByStatus.cancelled || 0
          ],
          backgroundColor: [
            '#f59e0b',
            '#3b82f6',
            '#10b981',
            '#ef4444'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  // Top Products Chart
  const topProductsCtx = document.getElementById('topProductsChart');
  if (topProductsCtx && reportsData.topProducts.length > 0) {
    const top5 = reportsData.topProducts.slice(0, 5);
    topProductsChart = new Chart(topProductsCtx, {
      type: 'bar',
      data: {
        labels: top5.map(p => p.name),
        datasets: [{
          label: 'Số lượng bán',
          data: top5.map(p => p.quantity),
          backgroundColor: '#667eea',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Category Revenue Chart
  const categoryRevenueCtx = document.getElementById('categoryRevenueChart');
  if (categoryRevenueCtx && reportsData.categoryRevenue.length > 0) {
    categoryRevenueChart = new Chart(categoryRevenueCtx, {
      type: 'pie',
      data: {
        labels: reportsData.categoryRevenue.map(c => c.name),
        datasets: [{
          data: reportsData.categoryRevenue.map(c => c.revenue),
          backgroundColor: [
            '#667eea',
            '#764ba2',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#3b82f6'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = formatCurrency(context.parsed);
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
}

// Update Charts
function updateCharts() {
  if (revenueChart) {
    revenueChart.data.labels = reportsData.revenueData.labels;
    revenueChart.data.datasets[0].data = reportsData.revenueData.data;
    revenueChart.update();
  }
  
  if (ordersStatusChart) {
    ordersStatusChart.data.datasets[0].data = [
      reportsData.ordersByStatus.pending || 0,
      reportsData.ordersByStatus.shipping || 0,
      reportsData.ordersByStatus.completed || 0,
      reportsData.ordersByStatus.cancelled || 0
    ];
    ordersStatusChart.update();
  }
  
  if (topProductsChart && reportsData.topProducts.length > 0) {
    const top5 = reportsData.topProducts.slice(0, 5);
    topProductsChart.data.labels = top5.map(p => p.name);
    topProductsChart.data.datasets[0].data = top5.map(p => p.quantity);
    topProductsChart.update();
  }
  
  if (categoryRevenueChart && reportsData.categoryRevenue.length > 0) {
    categoryRevenueChart.data.labels = reportsData.categoryRevenue.map(c => c.name);
    categoryRevenueChart.data.datasets[0].data = reportsData.categoryRevenue.map(c => c.revenue);
    categoryRevenueChart.update();
  }
}

// Export Report
function exportReport() {
  // Create CSV content
  let csv = 'Báo cáo - KAITO KID\n';
  csv += `Kỳ báo cáo: ${document.getElementById('reportPeriod').selectedOptions[0].text}\n\n`;
  
  csv += 'Tổng quan\n';
  csv += `Tổng doanh thu,${formatCurrency(reportsData.totalRevenue)}\n`;
  csv += `Tổng đơn hàng,${reportsData.totalOrders}\n`;
  csv += `Sản phẩm đã bán,${reportsData.productsSold}\n\n`;
  
  csv += 'Top sản phẩm bán chạy\n';
  csv += 'STT,Tên sản phẩm,Số lượng bán,Doanh thu\n';
  reportsData.topProducts.forEach((p, i) => {
    csv += `${i + 1},${p.name},${p.quantity},${formatCurrency(p.revenue)}\n`;
  });
  
  csv += '\nBáo cáo theo danh mục\n';
  csv += 'Danh mục,Số đơn hàng,Doanh thu,Số lượng SP\n';
  reportsData.categoryRevenue.forEach(cat => {
    csv += `${cat.name},${cat.orders},${formatCurrency(cat.revenue)},${cat.quantity}\n`;
  });
  
  // Download CSV
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `bao-cao-${reportsData.period}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Đã xuất báo cáo thành công!', 'success');
}



// Format Currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount || 0).replace('₫', '₫');
}

// Show Notification
function showNotification(message, type = 'success') {
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification-toast ${type}`;
  notification.innerHTML = `
    <i class="fa fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 16px 20px;
    background: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
