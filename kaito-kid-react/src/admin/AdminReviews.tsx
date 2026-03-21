import { useState, useEffect } from 'react';
import { formatDate } from '../utils/format';

interface Review {
  id: number;
  orderId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const saved: Review[] = JSON.parse(localStorage.getItem('reviews') || '[]');
    saved.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setReviews(saved);
  }, []);

  const handleDelete = (id: number) => {
    if (!confirm('Xóa đánh giá này?')) return;
    const updated = reviews.filter(r => r.id !== id);
    setReviews(updated);
    localStorage.setItem('reviews', JSON.stringify(updated));
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) 
    : '0';

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1>Quản lý Đánh giá</h1>
        <div className="page-actions">
          <button className="btn-export">
            <i className="fa fa-download"></i> Xuất Excel
          </button>
        </div>
      </div>

      <div className="stats-grid-small">
        <div className="stat-card-small">
          <div className="stat-icon-small" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <i className="fa fa-star"></i>
          </div>
          <div className="stat-content-small">
            <span className="stat-label-small">Tổng đánh giá</span>
            <h3 className="stat-value-small">{reviews.length}</h3>
          </div>
        </div>
        <div className="stat-card-small">
          <div className="stat-icon-small" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <i className="fa fa-check-circle"></i>
          </div>
          <div className="stat-content-small">
            <span className="stat-label-small">Đã duyệt</span>
            <h3 className="stat-value-small">{reviews.length}</h3>
          </div>
        </div>
        <div className="stat-card-small">
          <div className="stat-icon-small" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <i className="fa fa-clock"></i>
          </div>
          <div className="stat-content-small">
            <span className="stat-label-small">Chờ duyệt</span>
            <h3 className="stat-value-small">0</h3>
          </div>
        </div>
        <div className="stat-card-small">
          <div className="stat-icon-small" style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)' }}>
            <i className="fa fa-star-half-alt"></i>
          </div>
          <div className="stat-content-small">
            <span className="stat-label-small">Điểm trung bình</span>
            <h3 className="stat-value-small">{avgRating}</h3>
          </div>
        </div>
      </div>

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="data-card" style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ color: '#666' }}>Chưa có đánh giá nào</p>
          </div>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="data-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <strong>{r.customerName}</strong>{' '}
                  <span style={{ color: '#f59e0b' }}>
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: '#666' }}>{formatDate(r.createdAt)}</span>
              </div>
              <div style={{ fontSize: 13, color: '#667eea', marginBottom: 4 }}>
                Sản phẩm: {r.productName}
              </div>
              {r.comment && <p style={{ fontSize: 14, color: '#444', marginBottom: 8 }}>{r.comment}</p>}
              <button className="btn-action btn-delete" onClick={() => handleDelete(r.id)}>
                <i className="fa fa-trash"></i>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
