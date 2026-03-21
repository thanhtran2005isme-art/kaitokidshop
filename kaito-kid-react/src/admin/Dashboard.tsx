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

  const statCards = [
    { label: 'Doanh thu hôm nay', value: formatCurrency(stats.todayRevenue), iconClass: 'revenue', icon: 'fa-dollar-sign', change: 'Cập nhật', changeType: 'positive', changeIcon: 'fa-arrow-up' },
    { label: 'Đơn hàng mới', value: stats.pending, iconClass: 'orders', icon: 'fa-shopping-cart', change: 'Chờ xử lý', changeType: 'positive', changeIcon: 'fa-arrow-up' },
    { label: 'Đang giao hàng', value: stats.shipping, iconClass: 'shipping', icon: 'fa-truck', change: 'Đang ship', changeType: 'neutral', changeIcon: 'fa-minus' },
    { label: 'Tổng đơn hàng', value: stats.total, iconClass: 'alert', icon: 'fa-exclamation-triangle', change: 'Tất cả', changeType: 'positive', changeIcon: 'fa-check' },
  ];

  const statusMap: Record<string, string> = {
    pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
    shipping: 'Đang giao', completed: 'Hoàn thành', cancelled: 'Đã huỷ',
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Dashboard</h1>
        <div className="page-actions">
          <select className="date-filter">
            <option>Hôm nay</option>
            <option>7 ngày qua</option>
            <option selected>30 ngày qua</option>
            <option>Tháng này</option>
            <option>Tháng trước</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
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

      {/* Charts Row */}
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
