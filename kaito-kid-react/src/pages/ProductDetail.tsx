// Trang chi tiet san pham - thay the chitietsanpham.html + product-detail.js

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import { formatCurrency } from '../utils/format';
import ProductCard from '../components/product/ProductCard';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (id) {
      const p = productService.getById(Number(id));
      setProduct(p || null);
      if (p) {
        const related = productService.getAll()
          .filter(r => r.category === p.category && r.id !== p.id && r.status === 'active')
          .slice(0, 4);
        setRelatedProducts(related);
      }
    }
  }, [id]);

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Khong tim thay san pham</h2>
        <Link to="/products" className="btn-continue-shopping">Quay lai</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, selectedSize, selectedColor, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <div className="product-detail-container">
        {/* Product Images */}
        <div className="product-images">
          <div className="main-image-wrapper">
            <img src={product.image} alt={product.name} className="main-image" />
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          <div className="product-sku">SKU: {product.sku}</div>

          <div className="price-row">
            <span className="current-price">{formatCurrency(product.price)}</span>
            {product.oldPrice && <span className="original-price-strike">{formatCurrency(product.oldPrice)}</span>}
          </div>

          {/* Color Options */}
          {product.colors && product.colors.length > 0 && (
            <div className="option-group">
              <label>Mau sac: <span>{selectedColor}</span></label>
              <div className="color-options">
                {product.colors.map(color => (
                  <button key={color} className={`size-btn ${selectedColor === color ? 'active' : ''}`} onClick={() => setSelectedColor(color)}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Options */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="option-group">
              <label>Size: <span>{selectedSize}</span></label>
              <div className="size-options">
                {product.sizes.map(size => (
                  <button key={size} className={`size-btn ${selectedSize === size ? 'active' : ''}`} onClick={() => setSelectedSize(size)}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="add-to-cart-section">
            <div className="quantity-selector">
              <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <input value={quantity} readOnly />
              <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button className="btn-add-cart" onClick={handleAddToCart}>
              <i className="fa fa-shopping-cart"></i> {added ? 'Da them vao gio!' : 'Them vao gio hang'}
            </button>
          </div>

          {/* Stock Status */}
          <div className={`stock-status ${product.stock > 0 ? (product.stock < 10 ? 'low-stock' : 'in-stock') : 'out-of-stock'}`}>
            <i className={`fa ${product.stock > 0 ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            {product.stock > 0 ? (product.stock < 10 ? `Chi con ${product.stock} san pham` : 'Con hang') : 'Het hang'}
          </div>

          {/* Description */}
          {product.description && (
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Mo ta san pham</h3>
              <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>San pham lien quan</h2>
          <div className="related-grid">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
