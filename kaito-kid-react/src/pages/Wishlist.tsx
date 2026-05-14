// Trang yêu thích - liên kết backend

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import type { Product } from '../types';

export default function Wishlist() {
  const { addItem } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function fetchWishlist() {
    try {
      setLoading(true);
      const response = await wishlistApi.getWishlist();
      if (response.success && response.data) {
        setProducts(response.data);
      } else {
        toast.error(response.error || 'Không thể tải danh sách yêu thích');
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const removeFromWishlist = async (id: number) => {
    try {
      const response = await wishlistApi.removeFromWishlist(id);
      if (response.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        toast.error(response.error || 'Không thể xóa sản phẩm');
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, '', '', 1);
    toast.success('Đã thêm vào giỏ hàng');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="account-page">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="empty-state">
            <div className="empty-icon"><i className="fa fa-heart"></i></div>
            <h3>Vui lòng đăng nhập</h3>
            <p>Đăng nhập để xem danh sách yêu thích của bạn</p>
            <Link to="/login" className="btn-continue-shopping"><i className="fa fa-sign-in-alt"></i> Đăng nhập</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="section-header" style={{ marginBottom: 24 }}>
          <h2><i className="fa fa-heart" style={{ color: '#e53e3e' }}></i> Sản phẩm yêu thích</h2>
          <div className="wishlist-stats"><span>{products.length}</span> sản phẩm</div>
        </div>

        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><i className="fa fa-heart"></i></div>
            <h3>Chưa có sản phẩm yêu thích</h3>
            <p>Hãy thêm sản phẩm vào danh sách yêu thích của bạn</p>
            <Link to="/products" className="btn-continue-shopping"><i className="fa fa-shopping-bag"></i> Khám phá ngay</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {products.map(p => (
              <div key={p.id} className="wishlist-item">
                <div className="wishlist-item-image">
                  <img src={p.image} alt={p.name} />
                  {p.oldPrice && <span className="wishlist-item-badge sale">-{Math.round((1 - p.price / p.oldPrice) * 100)}%</span>}
                  <button className="btn-remove-wishlist" onClick={() => removeFromWishlist(p.id)}>
                    <i className="fa fa-heart"></i>
                  </button>
                </div>
                <div className="wishlist-item-info">
                  <div className="wishlist-item-category">{p.category}</div>
                  <div className="wishlist-item-name">{p.name}</div>
                  <div className="wishlist-item-price">
                    <span className="current-price">{formatCurrency(p.price)}</span>
                    {p.oldPrice && <span className="old-price">{formatCurrency(p.oldPrice)}</span>}
                  </div>
                  <div className={`wishlist-item-stock ${p.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    <i className={`fa ${p.stock > 0 ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                    {p.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                  </div>
                  <div className="wishlist-item-actions">
                    <button className="btn-add-to-cart" onClick={() => handleAddToCart(p)} disabled={p.stock === 0}>
                      <i className="fa fa-shopping-cart"></i> Thêm vào giỏ
                    </button>
                    <Link to={`/product/${p.id}`} className="btn-view-product"><i className="fa fa-eye"></i></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
