// Trang chi tiết sản phẩm - liên kết backend

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productApi } from '../services/api';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';
import { formatCurrency } from '../utils/format';
import { trackProductView } from '../utils/viewedTracker';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct(Number(id));
    }
  }, [id]);

  async function fetchProduct(productId: number) {
    try {
      setLoading(true);
      // Fetch product detail and related products in parallel
      const [productRes, relatedRes] = await Promise.all([
        productApi.getById(productId),
        productApi.getRelated(productId, 4),
      ]);

      if (productRes.success && productRes.data) {
        setProduct(productRes.data);
        // Track lịch sử xem sản phẩm để dùng cho gợi ý cá nhân hóa
        trackProductView({
          id: productRes.data.id,
          name: productRes.data.name,
          category: productRes.data.category,
          gender: productRes.data.gender,
        });
      } else {
        toast.error(productRes.error || 'Không tìm thấy sản phẩm');
        setProduct(null);
      }

      if (relatedRes.success && relatedRes.data) {
        setRelatedProducts(relatedRes.data);
      } else {
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch product detail:', error);
      toast.error('Không thể tải chi tiết sản phẩm');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Không tìm thấy sản phẩm</h2>
        <Link to="/products" className="btn-continue-shopping">Quay lại</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Vui lòng chọn size');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error('Vui lòng chọn màu sắc');
      return;
    }

    addItem(product, selectedSize, selectedColor, quantity);
    setAdded(true);
    toast.success('Đã thêm vào giỏ hàng');
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
              <label>Màu sắc: <span>{selectedColor}</span></label>
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
            <button className="btn-add-cart" onClick={handleAddToCart} disabled={product.stock === 0}>
              <i className="fa fa-shopping-cart"></i> {added ? 'Đã thêm vào giỏ!' : 'Thêm vào giỏ hàng'}
            </button>
          </div>

          {/* Stock Status */}
          <div className={`stock-status ${product.stock > 0 ? (product.stock < 10 ? 'low-stock' : 'in-stock') : 'out-of-stock'}`}>
            <i className={`fa ${product.stock > 0 ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            {product.stock > 0 ? (product.stock < 10 ? `Chỉ còn ${product.stock} sản phẩm` : 'Còn hàng') : 'Hết hàng'}
          </div>

          {/* Description */}
          {product.description && (
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Mô tả sản phẩm</h3>
              <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{product.description}</p>
            </div>
          )}

          {/* Specs */}
          {product.specs && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Thông số kỹ thuật</h3>
              <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{product.specs}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="related-products">
          <h2>Sản phẩm liên quan</h2>
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
