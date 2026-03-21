// Bao cao thong ke - match admin-reports.css structure

import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { formatCurrency } from '../utils/format';

export default function AdminReports() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0, avgOrderValue: 0 });
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const orders = orderService.getAll();
    const products = productService.getAll();
    const customers = JSON.parse(localStorage.getItem('users') || '[]');
    const completedOrders = orders.filter(o => o.status !== 'cancelled');
    const totalRevenue = completedOrders.reduce((s, o) => s + (o.total || 0), 0);
    setStats({
      totalRevenue, totalOrders: orders.length, totalProducts: products.length,
      totalCustomers: customers.length,
      avgOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
    });
  }, []);

  const statCards = [
    { label: 'Tổng doanh thu', value: formatCurrency(stats.totalRevenue), icon: 'fa-dollar-sign', iconClass: 'revenue', change: '+12.5%', changeType: 'positive' },
    { label: 'Tổng đơn hàng', value: String(stats.totalOrders), icon: 'fa-shopping-cart', iconClass: 'orders', change: '+8.2%', changeType: 'positive' },
    { label: 'Khách hàng mới', value: String(stats.totalCustomers), icon: 'fa-users', iconClass: 'shipping', change: '+15.3%', changeType: 'positive' },
    { label: 'Sản phẩm đã bán', value: String(stats.totalProducts), icon: 'fa-box', iconClass: 'alert', change: '+10.1%', changeType: 'positive' },
  ];

  const products = productService.getAll().sort((a, b) => b.soldCount - a.soldCount).slice(0, 10);

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Báo cáo</h1>
        <div className="page-actions">
          <select className="date-filter" value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="today">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="quarter">3 tháng qua</option>
            <option value="year">Năm nay</option>
          </select>
          <button className="btn btn-primary">
            <i className="fa fa-download"></i> Xuất Excel
          </button>
        </div>
      </div>

      {/* Summary Stats */}
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
                <i className="fa fa-arrow-up"></i> {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="card-header">
            <h3>Doanh thu theo thời gian</h3>
            <select className="chart-filter">
              <option value="line">Đường</option>
              <option value="bar">Cột</option>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray-400)' }}>
              <p>Biểu đồ trạng thái đơn hàng</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="card-header">
            <h3>Top 10 sản phẩm bán chạy</h3>
          </div>
          <div className="chart-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray-400)' }}>
              <p>Biểu đồ top sản phẩm</p>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="card-header">
            <h3>Doanh thu theo danh mục</h3>
          </div>
          <div className="chart-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray-400)' }}>
              <p>Biểu đồ danh mục</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Reports Tables */}
      <div className="reports-tables">
        <div className="data-card">
          <div className="card-header">
            <h3>Top sản phẩm bán chạy</h3>
            <a href="/admin/products">Xem tất cả</a>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>STT</th>
                  <th>Tên sản phẩm</th>
                  <th style={{ width: 120 }}>Số lượng bán</th>
                  <th style={{ width: 150 }}>Doanh thu</th>
                  <th style={{ width: 100 }}>Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td><span className="product-name-cell">{p.name}</span></td>
                    <td>{p.soldCount}</td>
                    <td><span className="order-price">{formatCurrency(p.price * p.soldCount)}</span></td>
                    <td>{products.length > 0 ? Math.round((p.soldCount / products.reduce((s, pr) => s + pr.soldCount, 0)) * 100) : 0}%</td>
                  </tr>
                ))}
                {products.length === 0 && <tr><td colSpan={5} className="loading-row">Chưa có dữ liệu</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="data-card">
          <div className="card-header">
            <h3>Báo cáo theo danh mục</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Danh mục</th>
                  <th style={{ width: 120 }}>Số đơn hàng</th>
                  <th style={{ width: 150 }}>Doanh thu</th>
                  <th style={{ width: 120 }}>Số lượng SP</th>
                  <th style={{ width: 100 }}>Tỷ lệ</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={5} className="loading-row">Chưa có dữ liệu</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
