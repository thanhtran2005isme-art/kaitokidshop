// Trang giỏ hàng - thay thế GioHang.html + cart-page.js

import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

export default function Cart() {
  const { cart, totalItems, subtotal, updateQuantity, removeItem } = useCart();

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="empty-cart">
            <i className="fa fa-shopping-bag"></i>
            <h3>Giỏ hàng trống</h3>
            <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link to="/products" className="btn-continue-shopping">Tiếp tục mua sắm</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title"><i className="fa fa-shopping-bag"></i> Giỏ hàng ({totalItems} sản phẩm)</h1>
        <div className="cart-content">
          <div className="cart-items-section">
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Đơn giá</th>
                  <th>Số lượng</th>
                  <th>Thành tiền</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={`${item.id}_${item.size}_${item.color}`}>
                    <td>
                      <div className="product-cell">
                        <img src={item.image} alt={item.name} />
                        <div className="product-info">
                          <h4>{item.name}</h4>
                          {item.size && <p>Size: {item.size}</p>}
                          {item.color && <p>Màu: {item.color}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="price-cell">{formatCurrency(item.price)}</td>
                    <td>
                      <div className="quantity-cell">
                        <button className="qty-btn" onClick={() => updateQuantity(index, item.quantity - 1)}>−</button>
                        <input className="qty-input" value={item.quantity} readOnly />
                        <button className="qty-btn" onClick={() => updateQuantity(index, item.quantity + 1)}>+</button>
                      </div>
                    </td>
                    <td className="total-cell">{formatCurrency(item.price * item.quantity)}</td>
                    <td>
                      <button className="remove-btn" onClick={() => removeItem(index)}><i className="fa fa-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cart-summary">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="summary-row">
              <span>Tạm tính:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span>Tính khi thanh toán</span>
            </div>
            <div className="summary-row total">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="cart-actions">
              <Link to="/checkout" className="btn-checkout">Tiến hành thanh toán</Link>
              <Link to="/products" className="btn-clear" style={{ textAlign: 'center', textDecoration: 'none' }}>Tiếp tục mua sắm</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
