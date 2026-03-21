// Trang yêu thích - thay thế wishlist logic

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';
import type { Product } from '../types';

export default function Wishlist() {
  const { addItem } = useCart();
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const saved: number[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlist(saved);
    const all = productService.getAll();
    setProducts(all.filter(p => saved.includes(p.id)));
  }, []);

  const removeFromWishlist = (id: number) => {
    const updated = wishlist.filter(wid => wid !== id);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, '', '', 1);
  };

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
