// Trang đơn hàng của tôi - kết nối backend qua JWT

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { customerOrderApi, customerReviewApi, shippingApi, type CustomerOrderDTO, type CustomerOrderItemDTO, type ShippingTracking } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import toast from 'react-hot-toast';

const statusMap: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
};

// Trạng thái cho phép user hủy đơn (chỉ khi đơn chưa được shipper lấy hàng)
const CANCELLABLE_STATUSES = ['pending', 'confirmed'];
const CANCELLABLE_SHIPPING_STATUSES = ['', 'ready_to_pick', 'picking'];
function canCancelOrder(o: { status: string; shippingStatus?: string }) {
  if (!CANCELLABLE_STATUSES.includes(o.status)) return false;
  return CANCELLABLE_SHIPPING_STATUSES.includes(o.shippingStatus || '');
}

export default function OrderTracking() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<CustomerOrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CustomerOrderDTO | null>(null);
  const [reviewingItem, setReviewingItem] = useState<{ order: CustomerOrderDTO; item: CustomerOrderItemDTO } | null>(null);
  const [reviewForm, setReviewForm] = useState<{
    rating: number;
    comment: string;
    files: File[];
    uploading: boolean;
  }>({ rating: 5, comment: '', files: [], uploading: false });
  const [reviewedKeys, setReviewedKeys] = useState<Set<string>>(new Set());
  const [tracking, setTracking] = useState<ShippingTracking | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    const result = await customerOrderApi.getMyOrders();
    if (result.success && result.data) {
      const sorted = [...result.data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setOrders(sorted);
    } else {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    void loadOrders();
    // Tự reload trạng thái đơn mỗi 60s để khách thấy ship cập nhật real-time
    const interval = window.setInterval(() => { void loadOrders(); }, 60_000);
    return () => window.clearInterval(interval);
  }, [user]);

  const hasReviewed = (orderId: number, productId: number): boolean => {
    return reviewedKeys.has(`${orderId}-${productId}`);
  };

  const handleSubmitReview = async () => {
    if (!reviewingItem || !user) return;

    if (reviewForm.comment.trim().length < 10) {
      toast.error('Vui lòng nhập ít nhất 10 ký tự cho đánh giá');
      return;
    }

    const result = await customerReviewApi.create({
      productId: reviewingItem.item.productId,
      orderId: reviewingItem.order.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment.trim(),
    });

    if (result.success) {
      toast.success('Cảm ơn bạn đã đánh giá! Đánh giá của bạn đang chờ duyệt.');
      setReviewedKeys((prev) => new Set(prev).add(`${reviewingItem.order.id}-${reviewingItem.item.productId}`));
      setReviewingItem(null);
      setReviewForm({ rating: 5, comment: '', files: [], uploading: false });
    } else {
      toast.error(result.error || 'Không thể gửi đánh giá. Vui lòng thử lại.');
    }
  };

  const openTracking = async (orderCode: string) => {
    setTrackingLoading(true);
    setTracking(null);
    const result = await shippingApi.track(orderCode);
    if (result.success && result.data) {
      setTracking(result.data);
    } else {
      toast.error(result.error || 'Không lấy được tracking');
    }
    setTrackingLoading(false);
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    const result = await customerOrderApi.cancel(orderId);
    if (result.success) {
      toast.success(result.data?.message || 'Đã hủy đơn hàng');
      setSelected(null);
      await loadOrders();
    } else {
      toast.error(result.error || 'Không thể hủy đơn hàng');
    }
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

        {loading ? (
          <div className="empty-orders">
            <i className="fa fa-spinner fa-spin"></i>
            <p>Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-orders">
            <i className="fa fa-inbox"></i>
            <p>Chưa có đơn hàng nào</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id">#{order.orderCode || order.id}</span>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <span className={`order-status ${order.status}`}>
                  {statusMap[order.status] || order.status}
                </span>
              </div>

              <div className="order-items-preview">
                {order.items.slice(0, 4).map((item, i) => (
                  <img key={i} src={item.productImage} alt={item.productName} />
                ))}
                {order.items.length > 4 && <span>+{order.items.length - 4}</span>}
              </div>

              <div className="order-card-footer">
                <span className="order-total">{formatCurrency(order.total)}</span>
                <div className="order-actions">
                  <button className="btn-view-order" onClick={() => setSelected(order)}>
                    <i className="fa fa-eye"></i> Chi tiết
                  </button>
                  <button
                    className="btn-view-order"
                    style={{ marginLeft: 8, background: '#dbeafe', color: '#1d4ed8' }}
                    onClick={() => openTracking(order.orderCode || String(order.id))}
                  >
                    <i className="fa fa-truck"></i> Theo dõi
                  </button>
                  {canCancelOrder(order) && (
                    <button
                      className="btn-view-order"
                      style={{ marginLeft: 8, background: '#fee2e2', color: '#dc2626' }}
                      onClick={() => handleCancelOrder(order.id)}
                    >
                      <i className="fa fa-times"></i> Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal chi tiết */}
      {selected && (
        <div className="modal active" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn #{selected.orderCode || selected.id}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Trạng thái</span>
                <span className={`order-status ${selected.status}`}>{statusMap[selected.status] || selected.status}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Ngày đặt</span>
                <span className="detail-value">{formatDate(selected.createdAt)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Thanh toán</span>
                <span className="detail-value">{selected.paymentMethod}</span>
              </div>
              {selected.customerAddress && (
                <div className="detail-row">
                  <span className="detail-label">Địa chỉ</span>
                  <span className="detail-value">{selected.customerAddress}</span>
                </div>
              )}

              <h4 style={{ margin: '20px 0 12px' }}>Sản phẩm ({selected.items.length})</h4>
              {selected.items.map((item, i) => (
                <div key={i} className="order-item">
                  <img src={item.productImage} alt={item.productName} />
                  <div className="order-item-info">
                    <div className="order-item-name">{item.productName}</div>
                    <div className="order-item-variant">
                      {item.color}{item.size && `, ${item.size}`} × {item.quantity}
                    </div>
                    <div className="order-item-price">{formatCurrency(item.price)}</div>

                    {selected.status === 'completed' && (
                      <div style={{ marginTop: '8px' }}>
                        {hasReviewed(selected.id, item.productId) ? (
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

              {canCancelOrder(selected) && (
                <div style={{ marginTop: 20, textAlign: 'right' }}>
                  <button
                    className="btn-view-order"
                    style={{ background: '#dc2626', color: '#fff' }}
                    onClick={() => handleCancelOrder(selected.id)}
                  >
                    <i className="fa fa-times"></i> Hủy đơn hàng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal đánh giá sản phẩm */}
      {reviewingItem && (
        <div className="modal active" onClick={() => setReviewingItem(null)}>
          <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Đánh giá sản phẩm</h3>
              <button className="modal-close" onClick={() => setReviewingItem(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="review-product-info">
                <img src={reviewingItem.item.productImage} alt={reviewingItem.item.productName} />
                <div>
                  <div className="review-product-name">{reviewingItem.item.productName}</div>
                  <div className="review-product-variant">
                    {reviewingItem.item.color}{reviewingItem.item.size && `, ${reviewingItem.item.size}`}
                  </div>
                </div>
              </div>

              <div className="review-rating-input">
                <label>Đánh giá của bạn</label>
                <div className="star-rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
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
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  rows={5}
                />
                <div className="char-count">{reviewForm.comment.length} ký tự</div>
              </div>

              <div className="review-media-input" style={{ marginTop: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
                  <i className="fa fa-image" style={{ marginRight: 6, color: '#ec4899' }}></i>
                  Thêm ảnh / video (tối đa 5 ảnh + 1 video)
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {reviewForm.files.map((f, idx) => (
                    <div key={idx} style={{ position: 'relative', width: 80, height: 80, borderRadius: 6, overflow: 'hidden', background: '#f8fafc' }}>
                      {f.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(f)} alt={`media-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#475569', fontSize: 12 }}>
                          <i className="fa fa-video" style={{ marginRight: 4 }}></i> Video
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setReviewForm((p) => ({ ...p, files: p.files.filter((_, i) => i !== idx) }))}
                        style={{
                          position: 'absolute', top: 2, right: 2, width: 20, height: 20,
                          background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                          borderRadius: '50%', cursor: 'pointer', fontSize: 11, lineHeight: 1,
                        }}
                      >×</button>
                    </div>
                  ))}
                  {reviewForm.files.length < 6 && (
                    <label
                      style={{
                        width: 80, height: 80, borderRadius: 6, border: '2px dashed #cbd5e1',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        justifyContent: 'center', cursor: 'pointer', color: '#94a3b8',
                        fontSize: 11,
                      }}
                    >
                      <i className="fa fa-plus" style={{ fontSize: 18, marginBottom: 4 }}></i>
                      Thêm
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          // limit 5 ảnh + 1 video
                          const images = files.filter((f) => f.type.startsWith('image/')).slice(0, 5);
                          const video = files.find((f) => f.type.startsWith('video/'));
                          const all = video ? [...images, video] : images;
                          setReviewForm((p) => ({ ...p, files: [...p.files, ...all].slice(0, 6) }));
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                </div>
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, marginBottom: 0 }}>
                  Định dạng JPG/PNG/WebP (max 5MB) hoặc MP4/WebM/MOV (max 30MB).
                </p>
              </div>

              <div className="review-actions">
                <button className="btn-cancel" onClick={() => setReviewingItem(null)}>
                  Hủy
                </button>
                <button
                  className="btn-submit-review"
                  onClick={handleSubmitReview}
                  disabled={reviewForm.comment.trim().length < 10 || reviewForm.uploading}
                >
                  {reviewForm.uploading ? 'Đang tải tệp...' : 'Gửi đánh giá'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal theo dõi vận chuyển */}
      {(tracking || trackingLoading) && (
        <div className="modal active" onClick={() => setTracking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <h3>
                <i className="fa fa-truck" style={{ marginRight: 8, color: '#1d4ed8' }}></i>
                Theo dõi vận chuyển
              </h3>
              <button className="modal-close" onClick={() => setTracking(null)}>×</button>
            </div>
            <div className="modal-body" style={{ padding: 20 }}>
              {trackingLoading && <p style={{ textAlign: 'center', color: '#64748b' }}>Đang tải...</p>}
              {tracking && (
                <>
                  <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ color: '#64748b', fontSize: 13 }}>Mã đơn hàng:</span>
                      <strong>{tracking.orderCode}</strong>
                    </div>
                    {tracking.maVanDon && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: '#64748b', fontSize: 13 }}>Mã vận đơn:</span>
                        <strong style={{ color: '#1d4ed8' }}>{tracking.maVanDon}</strong>
                      </div>
                    )}
                    {tracking.nhaVanChuyen && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ color: '#64748b', fontSize: 13 }}>Đơn vị vận chuyển:</span>
                        <strong>
                          {tracking.nhaVanChuyen === 'ghn' ? 'Giao Hàng Nhanh' :
                           tracking.nhaVanChuyen === 'ghtk' ? 'Giao Hàng Tiết Kiệm' :
                           tracking.nhaVanChuyen === 'mock' ? 'KaitoKid (Mock)' :
                           tracking.nhaVanChuyen}
                        </strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b', fontSize: 13 }}>Trạng thái:</span>
                      <strong style={{ color: '#16a34a', textTransform: 'uppercase' }}>
                        {tracking.trangThaiVanChuyen}
                      </strong>
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 12px', fontSize: 15, color: '#0f172a' }}>Lịch sử vận chuyển</h4>
                  {tracking.history.length === 0 ? (
                    <p style={{ color: '#64748b' }}>Chưa có cập nhật.</p>
                  ) : (
                    <div style={{ borderLeft: '2px solid #e5e7eb', paddingLeft: 20, marginLeft: 8 }}>
                      {tracking.history.slice().reverse().map((h, idx) => (
                        <div key={h.id} style={{ marginBottom: 16, position: 'relative' }}>
                          <div style={{
                            position: 'absolute',
                            left: -28,
                            top: 4,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: idx === 0 ? '#16a34a' : '#cbd5e1',
                            border: '2px solid #fff',
                            boxShadow: idx === 0 ? '0 0 0 3px #bbf7d0' : 'none',
                          }} />
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                            {h.moTa || h.trangThai}
                          </div>
                          {h.viTri && (
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                              <i className="fa fa-map-marker-alt" style={{ marginRight: 4 }}></i>
                              {h.viTri}
                            </div>
                          )}
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                            {formatDate(h.thoiGian)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
