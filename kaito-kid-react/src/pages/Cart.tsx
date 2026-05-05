// Trang giỏ hàng - IVY moda style

import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

export default function Cart() {
  const { cart, totalItems, subtotal, updateQuantity, removeItem } = useCart();

  if (cart.length === 0) {
    return (
      <div className="ivy-cart-page">
        <div className="ivy-cart-empty">
          <i className="fa fa-shopping-bag"></i>
          <h3>Giỏ hàng trống</h3>
          <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <Link to="/products" className="ivy-btn-continue">← Tiếp tục mua hàng</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ivy-cart-page">
      {/* Progress Steps */}
      <div className="ivy-cart-steps">
        <div className="ivy-step active">
          <div className="ivy-step-num">1</div>
          <span>Giỏ hàng</span>
        </div>
        <div className="ivy-step-line"></div>
        <div className="ivy-step">
          <div className="ivy-step-num">2</div>
          <span>Đặt hàng</span>
        </div>
        <div className="ivy-step-line"></div>
        <div className="ivy-step">
          <div className="ivy-step-num">3</div>
          <span>Thanh toán</span>
        </div>
        <div className="ivy-step-line"></div>
        <div className="ivy-step">
          <div className="ivy-step-num">4</div>
          <span>Hoàn thành đơn</span>
        </div>
      </div>

      <div className="ivy-cart-layout">
        {/* Left: Cart items */}
        <div className="ivy-cart-left">
          <h2 className="ivy-cart-title">
            Giỏ hàng của bạn <strong>{totalItems} Sản Phẩm</strong>
          </h2>

          {/* Table header */}
          <div className="ivy-cart-header">
            <span className="ivy-col-product">TÊN SẢN PHẨM</span>
            <span className="ivy-col-discount">CHIẾT KHẤU</span>
            <span className="ivy-col-qty">SỐ LƯỢNG</span>
            <span className="ivy-col-total">TỔNG TIỀN</span>
          </div>

          {/* Cart items */}
          {cart.map((item) => (
            <div className="ivy-cart-item" key={item.id}>
              <div className="ivy-col-product">
                <div className="ivy-item-info">
                  <Link to={`/product/${item.id}`} className="ivy-item-img">
                    <img src={item.image} alt={item.name} />
                  </Link>
                  <div className="ivy-item-details">
                    <Link to={`/product/${item.id}`} className="ivy-item-name">{item.name}</Link>
                    <p className="ivy-item-variant">
                      {item.color && <>Màu sắc: {item.color}</>}
                      {item.color && item.size && <>&nbsp;&nbsp;</>}
                      {item.size && <>Size: {item.size}</>}
                    </p>
                  </div>
                </div>
              </div>
              <div className="ivy-col-discount">
                <span className="ivy-discount-text">—</span>
              </div>
              <div className="ivy-col-qty">
                <div className="ivy-qty-control">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                  <input value={item.quantity} readOnly />
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <div className="ivy-col-total">
                <span className="ivy-item-total">{formatCurrency(item.price * item.quantity)}</span>
                <button className="ivy-remove-btn" onClick={() => removeItem(item.id)} aria-label="Xóa">
                  <i className="fa fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))}

          <div className="ivy-cart-continue">
            <Link to="/products" className="ivy-btn-continue">← Tiếp tục mua hàng</Link>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="ivy-cart-right">
          <div className="ivy-summary-box">
            <h3>Tổng tiền giỏ hàng</h3>
            <div className="ivy-summary-row">
              <span>Tổng sản phẩm</span>
              <span>{totalItems}</span>
            </div>
            <div className="ivy-summary-row">
              <span>Tổng tiền hàng</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="ivy-summary-row ivy-summary-bold">
              <span>Thành tiền</span>
              <span className="ivy-price-red">{formatCurrency(subtotal)}</span>
            </div>
            <div className="ivy-summary-row ivy-summary-bold">
              <span>Tạm tính</span>
              <span className="ivy-price-red">{formatCurrency(subtotal)}</span>
            </div>

            <div className="ivy-summary-notes">
              <p><i className="fa fa-info-circle"></i> Sản phẩm nằm trong chương trình KM giảm giá trên 50% không hỗ trợ đổi trả.</p>
              <p><i className="fa fa-info-circle"></i> Không thanh toán cho Shipper khi chưa nhận hàng !</p>
            </div>

            <Link to="/checkout" className="ivy-btn-order">ĐẶT HÀNG</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
