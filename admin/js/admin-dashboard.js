// Admin Dashboard JavaScript

// Dashboard Data - will be loaded from localStorage
let dashboardData = {
  stats: {
    todayRevenue: 0,
    newOrders: 0,
    shippingOrders: 0,
    lowStockProducts: 0
  },
  revenueData: {
    labels: [],
    data: []
  },
  ordersData: {
    pending: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0
  },
  topProducts: [],
  recentOrders: [],
  notifications: []
};

// Load data from localStorage
function loadDashboardData() {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate stats
  let todayRevenue = 0;
  let pendingCount = 0;
  let shippingCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;
  
  orders.forEach(order => {
    const orderDate = order.createdAt ? order.createdAt.split('T')[0] : '';
    const total = order.total || 0;
    
    // Today's revenue (only completed orders)
    if (orderDate === today) {
      todayRevenue += total;
    }
    
    // Count by status
    switch (order.status) {
      case 'pending':
        pendingCount++;
        break;
      case 'confirmed':
      case 'shipping':
        shippingCount++;
        break;
      case 'completed':
        completedCount++;
        break;
      case 'cancelled':
        cancelledCount++;
        break;
    }
  });
  
  // Update stats
  dashboardData.stats = {
    todayRevenue: todayRevenue,
    newOrders: pendingCount,
    shippingOrders: shippingCount,
    lowStockProducts: 0
  };
  
  dashboardData.ordersData = {
    pending: pendingCount,
    shipping: shippingCount,
    completed: completedCount,
    cancelled: cancelledCount
  };
  
  // Recent orders (last 5)
  dashboardData.recentOrders = orders
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5)
    .map(order => ({
      id: '#' + order.id,
      customer: order.customer?.name || 'Khách hàng',
      total: order.total || 0,
      status: order.status || 'pending',
      date: order.createdAt ? new Date(order.createdAt) : new Date()
    }));
  
  // Revenue data for chart (last 7 days)
  const last7Days = [];
  const revenueByDay = {};
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const label = `${date.getDate()}/${date.getMonth() + 1}`;
    last7Days.push({ dateStr, label });
    revenueByDay[dateStr] = 0;
  }
  
  orders.forEach(order => {
    const orderDate = order.createdAt ? order.createdAt.split('T')[0] : '';
    if (revenueByDay.hasOwnProperty(orderDate)) {
      revenueByDay[orderDate] += order.total || 0;
    }
  });
  
  dashboardData.revenueData = {
    labels: last7Days.map(d => d.label),
    data: last7Days.map(d => revenueByDay[d.dateStr])
  };
  
  // Calculate top selling products from orders
  const productSales = {};
  
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const productName = item.name || 'Sản phẩm';
        const quantity = item.quantity || 1;
        const price = parseInt(item.price) || 0;
        const image = item.image || item.imgSrc || '/images/placeholder.png';
        
        if (!productSales[productName]) {
          productSales[productName] = {
            name: productName,
            image: image,
            sales: 0,
            revenue: 0
          };
        }
        
        productSales[productName].sales += quantity;
        productSales[productName].revenue += price * quantity;
        // Update image if current one is placeholder
        if (productSales[productName].image === '/images/placeholder.png' && image !== '/images/placeholder.png') {
          productSales[productName].image = image;
        }
      });
    }
  });
  
  // Sort by sales and get top 5
  dashboardData.topProducts = Object.values(productSales)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)
    .map((product, index) => ({
      id: index + 1,
      name: product.name,
      image: product.image,
      sales: product.sales,
      revenue: product.revenue
    }));
  
  // Notifications
  dashboardData.notifications = [];
  if (pendingCount > 0) {
    dashboardData.notifications.push({
      type: 'order',
      text: `Có ${pendingCount} đơn hàng chờ xác nhận`,
      time: 'Vừa xong'
    });
  }
  
  const latestOrder = orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
  if (latestOrder) {
    dashboardData.notifications.push({
      type: 'order',
      text: `Đơn hàng #${latestOrder.id} mới được đặt`,
      time: getTimeAgo(latestOrder.createdAt)
    });
  }
  
  // Check low stock products
  const inventory = JSON.parse(localStorage.getItem('inventory') || '[]');
  const lowStockCount = inventory.filter(p => p.stock > 0 && p.stock <= 10).length;
  if (lowStockCount > 0) {
    dashboardData.notifications.push({
      type: 'stock',
      text: `${lowStockCount} sản phẩm sắp hết hàng`,
      time: 'Cần kiểm tra'
    });
  }
  
  // Update UI
  updateStatsUI();
  
  console.log('Dashboard data loaded:', dashboardData);
}

// Update stats in UI
function updateStatsUI() {
  const todayRevenueEl = document.getElementById('todayRevenue');
  const newOrdersEl = document.getElementById('newOrders');
  const shippingOrdersEl = document.getElementById('shippingOrders');
  const totalOrdersEl = document.getElementById('totalOrders');
  
  if (todayRevenueEl) {
    todayRevenueEl.textContent = formatCurrency(dashboardData.stats.todayRevenue);
  }
  if (newOrdersEl) {
    newOrdersEl.textContent = dashboardData.stats.newOrders;
  }
  if (shippingOrdersEl) {
    shippingOrdersEl.textContent = dashboardData.stats.shippingOrders;
  }
  if (totalOrdersEl) {
    const total = dashboardData.ordersData.pending + dashboardData.ordersData.shipping + 
                  dashboardData.ordersData.completed + dashboardData.ordersData.cancelled;
    totalOrdersEl.textContent = total;
  }
}

// Get time ago string
function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
}

// Initialize Charts
function initCharts() {
  // Revenue Chart
  const revenueCtx = document.getElementById('revenueChart');
  if (revenueCtx) {
    new Chart(revenueCtx, {
      type: 'line',
      data: {
        labels: dashboardData.revenueData.labels,
        datasets: [{
          label: 'Doanh thu',
          data: dashboardData.revenueData.data,
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
                return (value / 1000000) + 'M';
              }
            }
          }
        }
      }
    });
  }

  // Orders Chart
  const ordersCtx = document.getElementById('ordersChart');
  if (ordersCtx) {
    new Chart(ordersCtx, {
      type: 'doughnut',
      data: {
        labels: ['Chờ xác nhận', 'Đang giao', 'Hoàn thành', 'Đã huỷ'],
        datasets: [{
          data: [
            dashboardData.ordersData.pending,
            dashboardData.ordersData.shipping,
            dashboardData.ordersData.completed,
            dashboardData.ordersData.cancelled
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
}

// Load Top Products
function loadTopProducts() {
  const productList = document.querySelector('.product-list');
  if (!productList) return;

  if (dashboardData.topProducts.length === 0) {
    productList.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: 30px; color: #9ca3af;">
        <i class="fa fa-box-open" style="font-size: 40px; margin-bottom: 12px;"></i>
        <p>Chưa có sản phẩm bán chạy</p>
        <small>Dữ liệu sẽ hiển thị khi có đơn hàng</small>
      </div>
    `;
    return;
  }

  productList.innerHTML = dashboardData.topProducts.map((product, index) => `
    <div class="product-item">
      <span class="product-rank" style="width: 24px; height: 24px; background: ${index < 3 ? '#667eea' : '#e5e7eb'}; color: ${index < 3 ? 'white' : '#6b7280'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; margin-right: 12px;">${index + 1}</span>
      <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='/images/placeholder.png'" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
      <div class="product-info" style="flex: 1; margin-left: 12px;">
        <div class="product-name" style="font-weight: 600; color: #1f2937; font-size: 14px;">${product.name}</div>
        <div class="product-sales" style="font-size: 13px; color: #6b7280;">Đã bán: ${product.sales} sản phẩm</div>
      </div>
      <div class="product-revenue" style="font-weight: 600; color: #667eea;">${formatCurrency(product.revenue)}</div>
    </div>
  `).join('');
}

// Load Recent Orders
function loadRecentOrders() {
  const orderList = document.querySelector('.order-list');
  if (!orderList) return;

  const statusText = {
    pending: 'Chờ xác nhận',
    shipping: 'Đang giao',
    completed: 'Hoàn thành'
  };

  orderList.innerHTML = dashboardData.recentOrders.map(order => `
    <div class="order-item">
      <div class="order-header">
        <span class="order-id">${order.id}</span>
        <span class="order-status ${order.status}">${statusText[order.status]}</span>
      </div>
      <div class="order-details">
        <span>${order.customer}</span>
        <span class="order-total">${formatCurrency(order.total)}</span>
      </div>
    </div>
  `).join('');
}

// Load Notifications
function loadNotifications() {
  const notificationList = document.querySelector('.notification-list');
  if (!notificationList) return;

  notificationList.innerHTML = dashboardData.notifications.map(notif => `
    <div class="notification-item">
      <div class="notification-icon ${notif.type}">
        <i class="fa fa-${notif.type === 'order' ? 'shopping-cart' : notif.type === 'stock' ? 'exclamation-triangle' : 'star'}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-text">${notif.text}</div>
        <div class="notification-time">${notif.time}</div>
      </div>
    </div>
  `).join('');
}

// Format currency helper
function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN').format(value) + '₫';
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
  loadDashboardData(); // Load real data from localStorage first
  initCharts();
  loadTopProducts();
  loadRecentOrders();
  loadNotifications();
});
