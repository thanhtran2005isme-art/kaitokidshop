// ProductCard - thay thế hàm createProductCard() trong products-loader.js
// Component dùng lại ở: Home, Products, Search, Wishlist...

import { Link } from 'react-router-dom';
import { FaHeart, FaStar } from 'react-icons/fa';
import type { Product } from '../../types';
import { formatCurrency } from '../../utils/format';

interface ProductCardProps {
  product: Product;
  onToggleWishlist?: (id: number) => void;
  isWishlisted?: boolean;
}

export default function ProductCard({ product, onToggleWishlist, isWishlisted }: ProductCardProps) {
  return (
    <div className="product-card">
      <div className="product-image">
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>

        {/* Badges */}
        <div className="product-badges">
          {product.isNew && <span className="badge badge-new">NEW</span>}
          {product.isSale && product.oldPrice && (
            <span className="badge badge-sale">
              -{Math.round((1 - product.price / product.oldPrice) * 100)}%
            </span>
          )}
          {product.isBestSeller && <span className="badge badge-hot">HOT</span>}
        </div>

        {/* Wishlist button */}
        {onToggleWishlist && (
          <button
            className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
            onClick={() => onToggleWishlist(product.id)}
            aria-label="Thêm vào yêu thích"
          >
            <FaHeart />
          </button>
        )}
      </div>

      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-name">
          {product.name}
        </Link>

        <div className="product-rating">
          <FaStar className="star" />
          <span>{product.rating}</span>
          <span className="sold-count">Đã bán {product.soldCount}</span>
        </div>

        <div className="product-price">
          <span className="current-price">{formatCurrency(product.price)}</span>
          {product.oldPrice && (
            <span className="old-price">{formatCurrency(product.oldPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
