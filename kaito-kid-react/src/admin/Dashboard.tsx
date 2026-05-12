// Admin Dashboard - match admin-dashboard.css glassmorphism design

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { formatCurrency, formatDate } from '../utils/format';
import type { Order, Product } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todayRevenue: 0, pending: 0, shipping: 0, completed: 0, cancelled: 0, total: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);

  useEffect(() => {
    setStats(orderService.getStats());
    const orders = orderService.getAll();
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRecentOrders(orders.slice(0, 5));
    const products = productService.getAll();
    products.sort((a, b) => b.soldCount - a.soldCount);
    setTopProducts(products.slice(0, 5));
  }, []);

  const selectedPeriod = PERIOD_OPTIONS.find((option) => option.value === period) || PERIOD_OPTIONS[2];
  const selectedChartWindow = CHART_WINDOWS.find((option) => option.value === chartWindow) || CHART_WINDOWS[1];
  const periodRange = getPeriodRange(period);
  const chartRange = getRollingWindowRange(chartWindow);
  const weekRange = getPeriodRange('week');

  const filteredOrders = orders.filter((order) => isDateInRange(order.createdAt, periodRange.start, periodRange.end));
  const validOrders = filteredOrders.filter((order) => order.status !== 'cancelled');
  const periodRevenue = validOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const newCustomers = customers.filter((customer) =>
    isDateInRange(customer.createdAt, periodRange.start, periodRange.end)
  ).length;
  const lowStockProducts = products.filter((product) => product.stock > 0 && product.stock <= 10).length;
  const outOfStockProducts = products.filter(
    (product) => product.stock <= 0 || product.status === 'out-of-stock'
  ).length;
  const inventoryIssueCount = lowStockProducts + outOfStockProducts;
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  const pendingOrdersInPeriod = filteredOrders.filter((order) => order.status === 'pending').length;
  const shippingOrdersInPeriod = filteredOrders.filter(
    (order) => order.status === 'shipping' || order.status === 'confirmed'
  ).length;
  const completedOrders = filteredOrders.filter((order) => order.status === 'completed').length;
  const cancelledOrders = filteredOrders.filter((order) => order.status === 'cancelled').length;
  const totalUnitsSold = products.reduce((sum, product) => sum + (product.soldCount || 0), 0);

  const chartOrders = orders.filter((order) => isDateInRange(order.createdAt, chartRange.start, chartRange.end));
  const chartValidOrders = chartOrders.filter((order) => order.status !== 'cancelled');
  const chartRevenue = chartValidOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const chartAverageOrderValue = chartValidOrders.length > 0 ? chartRevenue / chartValidOrders.length : 0;

  const revenueSeries = buildRevenueSeries(orders, chartWindow);
  const hasRevenueSeries = revenueSeries.some((item) => item.revenue > 0 || item.orders > 0);

  const statusChartData = [
    { name: 'Chờ xác nhận', value: filteredOrders.filter((order) => order.status === 'pending').length },
    {
      name: 'Đang giao',
      value: filteredOrders.filter(
        (order) => order.status === 'confirmed' || order.status === 'shipping'
      ).length,
    },
    { name: 'Hoàn thành', value: completedOrders },
    { name: 'Đã hủy', value: cancelledOrders },
  ];
  const hasStatusData = statusChartData.some((item) => item.value > 0);

  const topProducts = [...products]
    .filter((product) => product.soldCount > 0)
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5);
  const recentOrders = orders.slice(0, 5);
  const latestPendingOrder = orders.find((order) => order.status === 'pending');
  const latestCancelledOrder = orders.find((order) => order.status === 'cancelled');
  const latestReview = reviews[0];
  const latestCustomer = [...customers]
    .filter((customer) => isValidDate(customer.createdAt))
    .sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())[0];
  const customersThisWeek = customers.filter((customer) =>
    isDateInRange(customer.createdAt, weekRange.start, weekRange.end)
  ).length;
  const lowestStockProduct = [...products]
    .filter((product) => product.stock > 0)
    .sort((a, b) => a.stock - b.stock)[0];

  const statCards = [
    {
      eyebrow: 'Revenue pulse',
      label: `Doanh thu ${selectedPeriod.shortLabel}`,
      value: formatCurrency(periodRevenue),
      iconClass: 'revenue',
      icon: 'fa-dollar-sign',
      change: `${validOrders.length} đơn hợp lệ`,
      changeType: periodRevenue > 0 ? 'positive' : 'neutral',
      changeIcon: 'fa-receipt',
    },
    {
      eyebrow: 'Order flow',
      label: `Đơn hàng ${selectedPeriod.shortLabel}`,
      value: String(filteredOrders.length),
      iconClass: 'orders',
      icon: 'fa-shopping-cart',
      change: `${pendingOrdersInPeriod} đơn chờ xử lý trong kỳ`,
      changeType: pendingOrdersInPeriod > 0 ? 'positive' : 'neutral',
      changeIcon: 'fa-clock',
    },
    {
      eyebrow: 'Customer growth',
      label: `Khách mới ${selectedPeriod.shortLabel}`,
      value: String(newCustomers),
      iconClass: 'shipping',
      icon: 'fa-users',
      change: `${customers.length} tài khoản`,
      changeType: newCustomers > 0 ? 'positive' : 'neutral',
      changeIcon: 'fa-user-plus',
    },
    {
      eyebrow: 'Inventory watch',
      label: 'SKU cần xử lý',
      value: String(inventoryIssueCount),
      iconClass: 'alert',
      icon: 'fa-exclamation-triangle',
      change:
        inventoryIssueCount > 0
          ? `${outOfStockProducts} hết hàng · ${lowStockProducts} sắp hết`
          : 'Không có cảnh báo tồn kho',
      changeType: inventoryIssueCount > 0 ? 'negative' : 'neutral',
      changeIcon: 'fa-box-open',
    },
  ];

  const notifications = [
    adminSettings.notifyNewOrder && pendingOrders > 0
      ? {
          id: 'pending-orders',
          iconClass: 'order',
          icon: 'fa-shopping-cart',
          text: `Có ${pendingOrders} đơn hàng đang chờ xác nhận`,
          meta: latestPendingOrder ? `Mới nhất: #${latestPendingOrder.id}` : 'Cần xử lý sớm',
          time: latestPendingOrder ? formatRelativeTime(latestPendingOrder.createdAt) : 'Mới cập nhật',
          to: '/admin/orders?status=pending',
        }
      : null,
    adminSettings.notifyCancelOrder && cancelledOrders > 0
      ? {
          id: 'cancelled-orders',
          iconClass: 'order',
          icon: 'fa-ban',
          text: `${cancelledOrders} đơn hàng đã bị hủy trong kỳ đã chọn`,
          meta: latestCancelledOrder ? `Gần nhất: #${latestCancelledOrder.id}` : 'Cần kiểm tra lý do hủy',
          time: latestCancelledOrder ? formatRelativeTime(latestCancelledOrder.createdAt) : 'Mới cập nhật',
          to: '/admin/orders?status=cancelled',
        }
      : null,
    (adminSettings.notifyLowStock && lowStockProducts > 0) ||
    (adminSettings.notifyOutOfStock && outOfStockProducts > 0)
      ? {
          id: 'inventory-alert',
          iconClass: 'stock',
          icon: 'fa-exclamation-triangle',
          text: `${lowStockProducts} sản phẩm sắp hết hàng, ${outOfStockProducts} sản phẩm đã hết`,
          meta: lowestStockProduct
            ? `${lowestStockProduct.name} chỉ còn ${lowestStockProduct.stock} sản phẩm`
            : 'Kiểm tra tồn kho để nhập hàng',
          time: 'Cần kiểm tra ngay',
          to: '/admin/inventory/alerts',
        }
      : null,
    adminSettings.notifyNewReview && latestReview
      ? {
          id: 'latest-review',
          iconClass: 'review',
          icon: 'fa-star',
          text: `Đánh giá mới từ ${latestReview.customerName}`,
          meta: `${latestReview.productName} • ${latestReview.rating}/5 sao`,
          time: formatRelativeTime(latestReview.createdAt),
          to: '/admin/reviews',
        }
      : null,
    adminSettings.notifyNewCustomer && customersThisWeek > 0
      ? {
          id: 'new-customers',
          iconClass: 'customer',
          icon: 'fa-user-plus',
          text: `${customersThisWeek} khách hàng mới trong 7 ngày qua`,
          meta: latestCustomer ? `Gần nhất: ${latestCustomer.name}` : 'Danh sách khách mới đã cập nhật',
          time: latestCustomer ? formatRelativeTime(latestCustomer.createdAt) : 'Tuần này',
          to: '/admin/customers',
        }
      : null,
  ].filter(Boolean) as Array<{
    id: string;
    iconClass: string;
    icon: string;
    text: string;
    meta: string;
    time: string;
    to: string;
  }>;

  return (
    <div className="dashboard-admin-page">
      <div className="page-header dashboard-page-header">
        <div className="dashboard-page-copy">
          <span className="dashboard-page-eyebrow">Admin command center</span>
          <h1>Dashboard</h1>
          <p>
            Xem nhanh tình hình cửa hàng trong <strong>{selectedPeriod.label}</strong>. Các phân tích sâu được tách sang trang báo cáo.
          </p>
        </div>

        <div className="page-actions dashboard-page-actions">
          <label className="dashboard-filter-shell">
            <AdminIcon name="fa-calendar-alt" />
            <select
              className="date-filter"
              value={period}
              onChange={(event) => setPeriod(event.target.value as DashboardPeriod)}
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Link to="/admin/orders" className="dashboard-action-button subtle">
            <AdminIcon name="fa-shopping-cart" />
            <span>Xem đơn hàng</span>
          </Link>

          <Link to="/admin/products" className="dashboard-action-button primary">
            <AdminIcon name="fa-box" />
            <span>Quản lý sản phẩm</span>
          </Link>
        </div>
      </div>

      <div className="dashboard-section-heading">
        <div>
          <span>KPI chính</span>
          <h2>Toàn cảnh kinh doanh</h2>
        </div>
        <p>Các chỉ số gọn để nắm tình hình trước khi đi vào từng module chi tiết.</p>
      </div>

      <div className="stats-grid">
        {statCards.map(card => (
          <div key={card.label} className="stat-card">
            <div className={`stat-icon ${card.iconClass}`}>
              <i className={`fa ${card.icon}`}></i>
            </div>
            <div className="stat-content">
              <span className="stat-label">{card.label}</span>
              <h3 className="stat-value">{card.value}</h3>
              <span className={`stat-change ${card.changeType}`}>
                <i className={`fa ${card.changeIcon}`}></i> {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-section-heading">
        <div>
          <span>Biểu đồ</span>
          <h2>Xu hướng nhanh</h2>
        </div>
        <p>Chỉ giữ biểu đồ tóm tắt, phần phân tích sâu nằm ở trang báo cáo.</p>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="card-header">
            <h3>Doanh thu 30 ngày</h3>
            <select className="chart-filter">
              <option>7 ngày</option>
              <option selected>30 ngày</option>
              <option>90 ngày</option>
            </select>
          </div>
          <div className="chart-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray-400)' }}>
              <p>Biểu đồ doanh thu sẽ hiển thị ở đây</p>
            </div>
          </div>
        </div>
        <div className="chart-card">
          <div className="card-header">
            <h3>Đơn hàng theo trạng thái</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Chờ xác nhận', value: stats.pending, color: '#f59e0b' },
                    { name: 'Đang giao', value: stats.shipping, color: '#3b82f6' },
                    { name: 'Hoàn thành', value: stats.completed, color: '#10b981' },
                    { name: 'Đã huỷ', value: stats.cancelled, color: '#ef4444' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ value }) => (value > 0 ? `${value}` : '')}
                >
                  {[
                    { name: 'Chờ xác nhận', value: stats.pending, color: '#f59e0b' },
                    { name: 'Đang giao', value: stats.shipping, color: '#3b82f6' },
                    { name: 'Hoàn thành', value: stats.completed, color: '#10b981' },
                    { name: 'Đã huỷ', value: stats.cancelled, color: '#ef4444' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px 12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span style={{ color: '#6b7280', fontSize: '13px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-row">
        {/* Top Products */}
        <div className="data-card">
          <div className="card-header">
            <h3>Sản phẩm bán chạy</h3>
            <Link to="/admin/products">Xem tất cả</Link>
          </div>
          <div className="product-list">
            {topProducts.map(p => (
              <div key={p.id} className="product-item">
                <img src={p.image} alt={p.name} className="product-image" />
                <div className="product-info">
                  <div className="product-name">{p.name}</div>
                  <div className="product-sales">Đã bán: {p.soldCount}</div>
                </div>
                <div className="product-revenue">{formatCurrency(p.price)}</div>
              </div>
            ))}
            {topProducts.length === 0 && <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 20 }}>Chưa có dữ liệu</p>}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="data-card">
          <div className="card-header">
            <h3>Đơn hàng gần đây</h3>
            <Link to="/admin/orders">Xem tất cả</Link>
          </div>
          <div className="order-list">
            {recentOrders.map(order => (
              <div key={order.id} className="order-item">
                <div className="order-header">
                  <span className="order-id">#{order.id}</span>
                  <span className={`order-status ${order.status}`}>{statusMap[order.status]}</span>
                </div>
                <div className="order-details">
                  <span>{order.customer.name} • {formatDate(order.createdAt)}</span>
                  <span className="order-total">{formatCurrency(order.total)}</span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 20 }}>Chưa có đơn hàng</p>}
          </div>
        </div>

        {/* Notifications */}
        <div className="data-card">
          <div className="card-header">
            <h3>Thông báo</h3>
          </div>
          <div className="notification-list">
            <div className="notification-item">
              <div className="notification-icon order"><i className="fa fa-shopping-cart"></i></div>
              <div className="notification-content">
                <div className="notification-text">Có {stats.pending} đơn hàng chờ xử lý</div>
                <div className="notification-time">Vừa xong</div>
              </div>
            </div>
            <div className="notification-item">
              <div className="notification-icon stock"><i className="fa fa-exclamation-triangle"></i></div>
              <div className="notification-content">
                <div className="notification-text">Kiểm tra tồn kho sản phẩm</div>
                <div className="notification-time">Hôm nay</div>
              </div>
            </div>
            <div className="notification-item">
              <div className="notification-icon review"><i className="fa fa-star"></i></div>
              <div className="notification-content">
                <div className="notification-text">Có đánh giá mới cần duyệt</div>
                <div className="notification-time">1 giờ trước</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
