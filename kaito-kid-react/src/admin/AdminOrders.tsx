// Quan ly don hang - thay the admin/orders.html + admin-orders.js

import { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import { formatCurrency, formatDate } from '../utils/format';
import type { Order } from '../types';

const statusMap: Record<string, string> = {
  pending: 'Cho xac nhan', confirmed: 'Da xac nhan',
  shipping: 'Dang giao', completed: 'Hoan thanh', cancelled: 'Da huy',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => { reload(); }, []);
  const reload = () => {
    const all = orderService.getAll();
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOrders(all);
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const updateStatus = (id: string, status: Order['status']) => {
    orderService.updateStatus(id, status);
    reload();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const stats = {
    pending: orders.filter(o => o.status === 'pending').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Quản lý đơn hàng ({orders.length})</h1>
      </div>

      {/* Stats */}
      <div className="stats-grid-small">
        <div className={`stat-card-small clickable ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter(filter === 'pending' ? 'all' : 'pending')}>
          <div className="stat-icon-small pending"><i className="fa fa-clock"></i></div>
          <div className="stat-content-small"><span className="stat-label-small">Cho xu ly</span><p className="stat-value-small">{stats.pending}</p></div>
        </div>
        <div className={`stat-card-small clickable ${filter === 'shipping' ? 'active' : ''}`} onClick={() => setFilter(filter === 'shipping' ? 'all' : 'shipping')}>
          <div className="stat-icon-small shipping"><i className="fa fa-truck"></i></div>
          <div className="stat-content-small"><span className="stat-label-small">Dang giao</span><p className="stat-value-small">{stats.shipping}</p></div>
        </div>
        <div className={`stat-card-small clickable ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter(filter === 'completed' ? 'all' : 'completed')}>
          <div className="stat-icon-small completed"><i className="fa fa-check-circle"></i></div>
          <div className="stat-content-small"><span className="stat-label-small">Hoan thanh</span><p className="stat-value-small">{stats.completed}</p></div>
        </div>
        <div className={`stat-card-small clickable ${filter === 'cancelled' ? 'active' : ''}`} onClick={() => setFilter(filter === 'cancelled' ? 'all' : 'cancelled')}>
          <div className="stat-icon-small cancelled"><i className="fa fa-times-circle"></i></div>
          <div className="stat-content-small"><span className="stat-label-small">Da huy</span><p className="stat-value-small">{stats.cancelled}</p></div>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr>
              <th>Ma don</th><th>Khach hang</th><th>Ngay dat</th><th>Tong tien</th><th>Trang thai</th><th>Thao tac</th>
            </tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td><span className="order-id">#{o.id}</span></td>
                  <td><div className="customer-info"><span className="customer-name">{o.customer?.name}</span><span className="customer-phone">{o.customer?.phone}</span></div></td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td><span className="order-price">{formatCurrency(o.total)}</span></td>
                  <td>
                    <select className="filter-select" value={o.status} onChange={e => updateStatus(o.id, e.target.value as Order['status'])} style={{ minWidth: 140 }}>
                      {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-action view" onClick={() => setSelected(o)}><i className="fa fa-eye"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="loading-row">Khong co don hang nao</p>}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal active" onClick={() => setSelected(null)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Don hang #{selected.id}</h3>
                <button className="modal-close" onClick={() => setSelected(null)}>x</button>
              </div>
              <div className="modal-body">
                <div className="order-detail-grid">
                  <div className="detail-section">
                    <h4>Thong tin khach hang</h4>
                    <div className="detail-row"><span className="detail-label">Ten</span><span className="detail-value">{selected.customer?.name}</span></div>
                    <div className="detail-row"><span className="detail-label">SDT</span><span className="detail-value">{selected.customer?.phone}</span></div>
                    <div className="detail-row"><span className="detail-label">Email</span><span className="detail-value">{selected.customer?.email}</span></div>
                  </div>
                  <div className="detail-section">
                    <h4>Thong tin don hang</h4>
                    <div className="detail-row"><span className="detail-label">Trang thai</span><span className={`status-badge ${selected.status}`}>{statusMap[selected.status]}</span></div>
                    <div className="detail-row"><span className="detail-label">Thanh toan</span><span className="detail-value">{selected.paymentMethod === 'cod' ? 'COD' : 'Chuyen khoan'}</span></div>
                    <div className="detail-row"><span className="detail-label">Dia chi</span><span className="detail-value">{selected.customer?.address}</span></div>
                  </div>
                </div>
                <div className="order-items">
                  <h4>San pham ({selected.items.length})</h4>
                  {selected.items.map((item, i) => (
                    <div key={i} className="order-item">
                      <img src={item.image} alt="" className="item-image" />
                      <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-variant">{item.color} {item.size} x {item.quantity}</div>
                        <div className="item-price">{formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '2px solid #eee' }}>
                  <div className="detail-row"><span className="detail-label">Tam tinh</span><span className="detail-value">{formatCurrency(selected.subtotal)}</span></div>
                  <div className="detail-row"><span className="detail-label">Phi ship</span><span className="detail-value">{selected.shippingFee === 0 ? 'Mien phi' : formatCurrency(selected.shippingFee)}</span></div>
                  {selected.discount > 0 && <div className="detail-row"><span className="detail-label">Giam gia</span><span className="detail-value">-{formatCurrency(selected.discount)}</span></div>}
                  <div className="detail-row" style={{ fontWeight: 700, fontSize: 16 }}><span>Tong cong</span><span style={{ color: '#e74c3c' }}>{formatCurrency(selected.total)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
