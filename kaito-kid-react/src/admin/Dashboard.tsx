import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { formatCurrency, formatDate } from '../utils/format';
import type { Order, Product } from '../types';

const statusMap: Record<Order['status'], string> = {
  pending: 'Cho xac nhan',
  confirmed: 'Da xac nhan',
  shipping: 'Dang giao',
  completed: 'Hoan thanh',
  cancelled: 'Da huy',
};

const chartColors: Record<Order['status'], string> = {
  pending: '#f59e0b',
  confirmed: '#6366f1',
  shipping: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    pending: 0,
    shipping: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<Product[]>([]);

  useEffect(() => {
    setStats(orderService.getStats());

    const orders = orderService.getAll();
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRecentOrders(orders.slice(0, 5));

    const products = productService.getAll();
    products.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    setTopProducts(products.slice(0, 5));
  }, []);

  const statusData: Array<{ status: Order['status']; name: string; value: number; color: string }> = [
    { status: 'pending', name: statusMap.pending, value: stats.pending, color: chartColors.pending },
    { status: 'shipping', name: statusMap.shipping, value: stats.shipping, color: chartColors.shipping },
    { status: 'completed', name: statusMap.completed, value: stats.completed, color: chartColors.completed },
    { status: 'cancelled', name: statusMap.cancelled, value: stats.cancelled, color: chartColors.cancelled },
  ];

  return (
    <div className="dashboard-admin-page">
      <div className="page-header dashboard-page-header">
        <div className="dashboard-page-copy">
          <span className="dashboard-page-eyebrow">Admin</span>
          <h1>Dashboard</h1>
          <p>Tong quan nhanh doanh thu, don hang va san pham ban chay.</p>
        </div>
        <div className="page-actions dashboard-page-actions">
          <Link to="/admin/orders" className="dashboard-action-button subtle">
            <i className="fa fa-shopping-cart"></i>
            <span>Xem don hang</span>
          </Link>
          <Link to="/admin/products" className="dashboard-action-button primary">
            <i className="fa fa-box"></i>
            <span>Quan ly san pham</span>
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue"><i className="fa fa-dollar-sign"></i></div>
          <div className="stat-content">
            <span className="stat-label">Doanh thu hom nay</span>
            <h3 className="stat-value">{formatCurrency(stats.todayRevenue)}</h3>
            <span className="stat-change neutral"><i className="fa fa-receipt"></i> {stats.total} don hang</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orders"><i className="fa fa-clock"></i></div>
          <div className="stat-content">
            <span className="stat-label">Cho xu ly</span>
            <h3 className="stat-value">{stats.pending}</h3>
            <span className="stat-change neutral"><i className="fa fa-truck"></i> {stats.shipping} dang giao</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon shipping"><i className="fa fa-check-circle"></i></div>
          <div className="stat-content">
            <span className="stat-label">Hoan thanh</span>
            <h3 className="stat-value">{stats.completed}</h3>
            <span className="stat-change neutral"><i className="fa fa-ban"></i> {stats.cancelled} da huy</span>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="card-header">
            <h3>Don hang theo trang thai</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value">
                  {statusData.map(entry => (
                    <Cell key={entry.status} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="data-card">
          <div className="card-header">
            <h3>San pham ban chay</h3>
            <Link to="/admin/products">Xem tat ca</Link>
          </div>
          <div className="product-list">
            {topProducts.map(product => (
              <div key={product.id} className="product-item">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-sales">Da ban: {product.soldCount}</div>
                </div>
                <div className="product-revenue">{formatCurrency(product.price)}</div>
              </div>
            ))}
            {topProducts.length === 0 && <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 20 }}>Chua co du lieu</p>}
          </div>
        </div>
      </div>

      <div className="data-card">
        <div className="card-header">
          <h3>Don hang gan day</h3>
          <Link to="/admin/orders">Xem tat ca</Link>
        </div>
        <div className="order-list">
          {recentOrders.map(order => (
            <div key={order.id} className="order-item">
              <div className="order-header">
                <span className="order-id">#{order.id}</span>
                <span className={`order-status ${order.status}`}>{statusMap[order.status]}</span>
              </div>
              <div className="order-details">
                <span>{order.customer.name} - {formatDate(order.createdAt)}</span>
                <span className="order-total">{formatCurrency(order.total)}</span>
              </div>
            </div>
          ))}
          {recentOrders.length === 0 && <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 20 }}>Chua co don hang</p>}
        </div>
      </div>
    </div>
  );
}
