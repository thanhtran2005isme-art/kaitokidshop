// Trang thanh toán - IVY moda style

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { formatCurrency } from '../utils/format';
import { couponApi } from '../services/api';

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [promoTab, setPromoTab] = useState<'code' | 'mine'>('code');
  const [staffCode, setStaffCode] = useState('');
  const [showProducts, setShowProducts] = useState(false);
  const [error, setError] = useState('');

  const shippingFee = 0;
  const total = Math.max(0, subtotal - discount) + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="ivy-checkout-page">
        <div className="ivy-cart-empty">
          <h3>Giỏ hàng trống</h3>
          <p>Vui lòng thêm sản phẩm trước khi thanh toán</p>
          <Link to="/products" className="ivy-btn-continue">← Tiếp tục mua hàng</Link>
        </div>
      </div>
    );
  }

  const applyCoupon = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    const result = await couponApi.validate({ code, orderAmount: subtotal });
    if (result.success && result.data) {
      if (result.data.isValid) {
        setDiscount(result.data.discountAmount);
        setAppliedCoupon(code);
        setError('');
      } else {
        setError(result.data.message || 'Mã không hợp lệ');
      }
    } else {
      setError(result.error || 'Không thể kiểm tra mã giảm giá');
    }
  };

  const handlePlaceOrder = () => {
    if (!name.trim()) { setError('Vui lòng nhập họ tên'); return; }
    if (!phone.trim()) { setError('Vui lòng nhập số điện thoại'); return; }
    if (!address.trim()) { setError('Vui lòng nhập địa chỉ'); return; }
    setError('');
    const fullAddress = [address, ward, district, city].filter(Boolean).join(', ');
    const order = orderService.create({
      customer: { name, phone, email: user?.email || '', address: fullAddress },
      items: cart, total, subtotal, shippingFee, paymentFee: 0, discount,
      couponCode: appliedCoupon || undefined, paymentMethod,
    });
    clearCart();
    alert(`Đặt hàng thành công!\nMã đơn: ${order.id}\nTổng: ${formatCurrency(total)}`);
    navigate('/orders');
  };

  return (
    <div className="ivy-checkout-page">
      {/* Progress Steps */}
      <div className="ivy-cart-steps">
        <div className="ivy-step done"><div className="ivy-step-num">✓</div><span>Giỏ hàng</span></div>
        <div className="ivy-step-line active"></div>
        <div className="ivy-step active"><div className="ivy-step-num">2</div><span>Đặt hàng</span></div>
        <div className="ivy-step-line"></div>
        <div className="ivy-step"><div className="ivy-step-num">3</div><span>Thanh toán</span></div>
        <div className="ivy-step-line"></div>
        <div className="ivy-step"><div className="ivy-step-num">4</div><span>Hoàn thành đơn</span></div>
      </div>

      <div className="ivy-checkout-layout">
        {/* LEFT */}
        <div className="ivy-checkout-left">
          {/* Địa chỉ giao hàng */}
          <div className="ivy-checkout-section">
            <h3 className="ivy-section-title">Địa chỉ giao hàng</h3>
            {!user && (
              <>
                <div className="ivy-auth-btns">
                  <Link to="/login" className="ivy-auth-btn dark">ĐĂNG NHẬP</Link>
                  <Link to="/login" className="ivy-auth-btn outline">ĐĂNG KÝ</Link>
                </div>
                <p className="ivy-auth-note">Đăng nhập/Đăng ký tài khoản để được hưởng ưu đãi và nhận thêm nhiều ưu đãi.</p>
              </>
            )}
            {error && <div className="ivy-error">{error}</div>}
            <div className="ivy-form-row">
              <div className="ivy-form-group"><input value={name} onChange={e => setName(e.target.value)} placeholder="Họ tên" /></div>
              <div className="ivy-form-group"><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại" /></div>
            </div>
            <div className="ivy-form-row">
              <div className="ivy-form-group">
                <select value={city} onChange={e => setCity(e.target.value)}>
                  <option value="">Tỉnh/Thành phố</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP.HCM">TP. Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                </select>
              </div>
              <div className="ivy-form-group">
                <select value={district} onChange={e => setDistrict(e.target.value)}>
                  <option value="">Quận/Huyện</option>
                </select>
              </div>
            </div>
            <div className="ivy-form-group full">
              <select value={ward} onChange={e => setWard(e.target.value)}>
                <option value="">Phường/xã</option>
              </select>
            </div>
            <div className="ivy-form-group full"><input value={address} onChange={e => setAddress(e.target.value)} placeholder="Địa chỉ" /></div>
          </div>

          {/* Phương thức giao hàng + VAT */}
          <div className="ivy-checkout-row">
            <div className="ivy-checkout-section ivy-half">
              <h3 className="ivy-section-title">Phương thức giao hàng</h3>
              <label className="ivy-radio-option active">
                <input type="radio" name="shipping" checked readOnly />
                <span>Chuyển phát nhanh</span>
              </label>
            </div>
            <div className="ivy-checkout-section ivy-half">
              <p className="ivy-vat-question">Bạn có muốn nhận hoá đơn VAT không? <input type="checkbox" /></p>
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="ivy-checkout-section">
            <h3 className="ivy-section-title">Phương thức thanh toán</h3>
            <div className="ivy-payment-box">
              <p className="ivy-payment-note">Mọi giao dịch đều được bảo mật và mã hoá. Thông tin thẻ tín dụng sẽ không bao giờ được lưu lại.</p>
              <label className="ivy-radio-option" onClick={() => setPaymentMethod('visa')}>
                <input type="radio" name="payment" checked={paymentMethod === 'visa'} readOnly />
                <span>Thanh toán bằng thẻ tín dụng <strong>VISA</strong> <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" alt="MC" style={{height: 16, verticalAlign: 'middle', marginLeft: 4}} /></span>
              </label>
              <label className="ivy-radio-option" onClick={() => setPaymentMethod('atm')}>
                <input type="radio" name="payment" checked={paymentMethod === 'atm'} readOnly />
                <span>Thanh toán bằng thẻ ATM</span>
                <small>Hỗ trợ thanh toán online hơn 38 ngân hàng cho bạn Việt Nam</small>
              </label>
              <label className="ivy-radio-option" onClick={() => setPaymentMethod('momo')}>
                <input type="radio" name="payment" checked={paymentMethod === 'momo'} readOnly />
                <span>Thanh toán bằng Momo</span>
              </label>
              <label className="ivy-radio-option" onClick={() => setPaymentMethod('cod')}>
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} readOnly />
                <span>Thanh toán khi giao hàng</span>
              </label>
            </div>
          </div>

          {/* Show products toggle */}
          <button className="ivy-btn-show-products" onClick={() => setShowProducts(!showProducts)}>
            HIỂN THỊ SẢN PHẨM
          </button>
          {showProducts && (
            <div className="ivy-order-products">
              {cart.map((item, i) => (
                <div key={i} className="ivy-order-product-item">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <p className="ivy-op-name">{item.name}</p>
                    <p className="ivy-op-variant">{item.color} {item.size && `/ ${item.size}`} x{item.quantity}</p>
                    <p className="ivy-op-price">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Summary */}
        <div className="ivy-checkout-right">
          <div className="ivy-summary-box">
            <h3>Tóm tắt đơn hàng</h3>
            <div className="ivy-summary-row"><span>Tổng tiền hàng</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="ivy-summary-row"><span>Tạm tính</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="ivy-summary-row"><span>Phí vận chuyển</span><span>{shippingFee === 0 ? '0đ' : formatCurrency(shippingFee)}</span></div>
            {discount > 0 && <div className="ivy-summary-row"><span>Giảm giá</span><span>-{formatCurrency(discount)}</span></div>}
            <div className="ivy-summary-row ivy-summary-bold">
              <span>Tiền thanh toán</span>
              <span className="ivy-price-red">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Promo code */}
          <div className="ivy-promo-box">
            <div className="ivy-promo-tabs">
              <button className={promoTab === 'code' ? 'active' : ''} onClick={() => setPromoTab('code')}>Mã phiếu giảm giá</button>
              <button className={promoTab === 'mine' ? 'active' : ''} onClick={() => setPromoTab('mine')}>Mã của tôi</button>
            </div>
            <div className="ivy-promo-input">
              <input
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                placeholder="Mã giảm giá"
                style={{ textTransform: 'uppercase' }}
              />
              <button onClick={applyCoupon}>ÁP DỤNG</button>
            </div>
            {appliedCoupon && (
              <p className="ivy-promo-applied">Đã áp dụng: <strong>{appliedCoupon}</strong> (-{formatCurrency(discount)})</p>
            )}
          </div>

          {/* Staff code */}
          <div className="ivy-staff-box">
            <select value={staffCode} onChange={e => setStaffCode(e.target.value)}>
              <option value="">Mã nhân viên hỗ trợ</option>
            </select>
          </div>

          <button className="ivy-btn-complete" onClick={handlePlaceOrder}>HOÀN THÀNH</button>
        </div>
      </div>
    </div>
  );
}
