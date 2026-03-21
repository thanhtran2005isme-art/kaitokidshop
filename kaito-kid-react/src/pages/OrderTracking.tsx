// Trang đơn hàng của tôi - thay thế donhang.html + order-tracking.js

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { formatCurrency, formatDate } from '../utils/format';
import type { Order } from '../types';

const statusMap: Record<string, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
  shipping: 'Đang giao hàng', completed: 'Hoàn thành', cancelled: 'Đã huỷ',
};

export default function OrderTracking() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      const userOrders = orderService.getByUser(user.phone, user.email);
      userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(userOrders);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="order-tracking-page">
        <div className="login-required-box">
          <i className="fa fa-lock"></i>
          <h3>Vui lòng đăng nhập</h3>
          <p>Bạn cần đăng nhập để xem đơn hàng</p>
          <Link to="/login" className="btn-login"><i className="fa fa-sign-in-alt"></i> Đăng nhập</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking-page">
      {/* User Info */}
      <div className="user-section">
        <div className="user-info-box">
          <div className="user-avatar"><i className="fa fa-user"></i></div>
          <div className="user-details">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="orders-section">
        <h3><i className="fa fa-box"></i> Đơn hàng của tôi</h3>

        {orders.length === 0 ? (
          <div className="empty-orders">
            <i className="fa fa-inbox"></i>
            <p>Chưa có đơn hàng nào</p>
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id">#{order.id}</span>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <span className={`order-status ${order.status}`}>
                  {statusMap[order.status] || order.status}
                </span>
              </div>

              <div className="order-items-preview">
                {order.items.slice(0, 4).map((item, i) => (
                  <img key={i} src={item.image} alt={item.name} />
                ))}
                {order.items.length > 4 && <span>+{order.items.length - 4}</span>}
              </div>

              <div className="order-card-footer">
                <span className="order-total">{formatCurrency(order.total)}</span>
                <div className="order-actions">
                  <button className="btn-view-order" onClick={() => setSelected(order)}>
                    <i className="fa fa-eye"></i> Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal chi tiết */}
      {selected && (
        <div className="modal active" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn #{selected.id}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Trạng thái</span>
                <span className={`order-status ${selected.status}`}>{statusMap[selected.status]}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ngày đặt</span>
                <span className="detail-value">{formatDate(selected.createdAt)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Thanh toán</span>
                <span className="detail-value">{selected.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}</span>
              </div>
              {selected.customer.address && (
                <div className="detail-row">
                  <span className="detail-label">Địa chỉ</span>
                  <span className="detail-value">{selected.customer.address}</span>
                </div>
              )}

              <h4 style={{ margin: '20px 0 12px' }}>Sản phẩm ({selected.items.length})</h4>
              {selected.items.map((item, i) => (
                <div key={i} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <div className="order-item-info">
                    <div className="order-item-name">{item.name}</div>
                    <div className="order-item-variant">{item.color} {item.size && `, ${item.size}`} × {item.quantity}</div>
                    <div className="order-item-price">{formatCurrency(item.price)}</div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '2px solid #eee' }}>
                <div className="summary-row"><span>Tạm tính:</span><span>{formatCurrency(selected.subtotal)}</span></div>
                <div className="summary-row"><span>Phí ship:</span><span>{selected.shippingFee === 0 ? 'Miễn phí' : formatCurrency(selected.shippingFee)}</span></div>
                {selected.discount > 0 && <div className="summary-row"><span>Giảm giá:</span><span>-{formatCurrency(selected.discount)}</span></div>}
                <div className="summary-row total"><span>Tổng:</span><span>{formatCurrency(selected.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
