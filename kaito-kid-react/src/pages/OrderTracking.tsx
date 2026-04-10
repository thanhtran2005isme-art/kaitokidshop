// Trang đơn hàng của tôi - thay thế donhang.html + order-tracking.js

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { formatCurrency, formatDate } from '../utils/format';
import { readStoredReviews, saveStoredReviews, type ReviewRecord } from '../utils/reviewConfig';
import toast from 'react-hot-toast';
import type { Order, CartItem } from '../types';

const statusMap: Record<string, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
  shipping: 'Đang giao hàng', completed: 'Hoàn thành', cancelled: 'Đã huỷ',
};

export default function OrderTracking() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Order | null>(null);
  const [reviewingItem, setReviewingItem] = useState<{ order: Order; item: CartItem } | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (user) {
      const userOrders = orderService.getByUser(user.phone, user.email);
      userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(userOrders);
    }
  }, [user]);

  const hasReviewed = (orderId: string, productId: number): boolean => {
    const reviews = readStoredReviews();
    return reviews.some(r => r.orderId === orderId && r.productId === productId);
  };

  const handleSubmitReview = () => {
    if (!reviewingItem || !user) return;

    if (reviewForm.comment.trim().length < 10) {
      toast.error('Vui lòng nhập ít nhất 10 ký tự cho đánh giá');
      return;
    }

    const reviews = readStoredReviews();
    const newReview: ReviewRecord = {
      id: Date.now(),
      orderId: reviewingItem.order.id,
      productId: reviewingItem.item.id,
      productName: reviewingItem.item.name,
      customerName: user.name,
      customerEmail: user.email,
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
      createdAt: new Date().toISOString(),
      status: 'pending',
      adminReply: '',
      isHidden: false,
      isPinned: false,
    };

    saveStoredReviews([...reviews, newReview]);
    toast.success('Cảm ơn bạn đã đánh giá! Đánh giá của bạn đang chờ duyệt.');
    
    setReviewingItem(null);
    setReviewForm({ rating: 5, comment: '' });
  };

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
                    
                    {selected.status === 'completed' && (
                      <div style={{ marginTop: '8px' }}>
                        {hasReviewed(selected.id, item.id) ? (
                          <span style={{ color: '#10b981', fontSize: '14px' }}>
                            <i className="fa fa-check-circle"></i> Đã đánh giá
                          </span>
                        ) : (
                          <button 
                            className="btn-review"
                            onClick={() => {
                              setReviewingItem({ order: selected, item });
                              setSelected(null);
                            }}
                          >
                            <i className="fa fa-star"></i> Đánh giá
                          </button>
                        )}
                      </div>
                    )}
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

      {/* Modal đánh giá sản phẩm */}
      {reviewingItem && (
        <div className="modal active" onClick={() => setReviewingItem(null)}>
          <div className="modal-content review-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Đánh giá sản phẩm</h3>
              <button className="modal-close" onClick={() => setReviewingItem(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="review-product-info">
                <img src={reviewingItem.item.image} alt={reviewingItem.item.name} />
                <div>
                  <div className="review-product-name">{reviewingItem.item.name}</div>
                  <div className="review-product-variant">
                    {reviewingItem.item.color} {reviewingItem.item.size && `, ${reviewingItem.item.size}`}
                  </div>
                </div>
              </div>

              <div className="review-rating-input">
                <label>Đánh giá của bạn</label>
                <div className="star-rating-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={star <= reviewForm.rating ? 'active' : ''}
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                    >
                      <i className="fa fa-star"></i>
                    </button>
                  ))}
                </div>
              </div>

              <div className="review-comment-input">
                <label>Nhận xét của bạn</label>
                <textarea
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này (tối thiểu 10 ký tự)..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={5}
                />
                <div className="char-count">{reviewForm.comment.length} ký tự</div>
              </div>

              <div className="review-actions">
                <button className="btn-cancel" onClick={() => setReviewingItem(null)}>
                  Hủy
                </button>
                <button 
                  className="btn-submit-review" 
                  onClick={handleSubmitReview}
                  disabled={reviewForm.comment.trim().length < 10}
                >
                  Gửi đánh giá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
