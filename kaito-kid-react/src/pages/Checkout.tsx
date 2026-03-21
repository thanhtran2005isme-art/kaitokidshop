// Trang thanh toán - dùng class names từ checkout-page.css

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { formatCurrency } from '../utils/format';

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [error, setError] = useState('');

  const shippingFee = subtotal >= 499000 ? 0 : 20000;
  const total = subtotal - discount + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-cart" style={{ textAlign: 'center', padding: 60 }}>
          <h2>Giỏ hàng trống</h2>
          <p>Vui lòng thêm sản phẩm trước khi thanh toán</p>
          <Link to="/products" className="btn-primary">Mua sắm ngay</Link>
        </div>
      </div>
    );
  }

  const applyCoupon = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    const coupons = JSON.parse(localStorage.getItem('coupons') || '[]');
    const coupon = coupons.find((c: any) => c.code === code);
    if (!coupon) { setError('Mã giảm giá không tồn tại'); return; }
    if (new Date(coupon.endDate) < new Date()) { setError('Mã đã hết hạn'); return; }
    if (coupon.used >= coupon.quantity) { setError('Mã đã hết lượt'); return; }
    if (coupon.minOrder > 0 && subtotal < coupon.minOrder) { setError(`Đơn tối thiểu ${formatCurrency(coupon.minOrder)}`); return; }
    let disc = coupon.discountType === 'percent'
      ? Math.min(subtotal * coupon.discountValue / 100, coupon.maxDiscount || Infinity)
      : coupon.discountValue;
    setDiscount(Math.min(disc, subtotal));
    setAppliedCoupon(code);
    setError('');
  };

  const removeCoupon = () => { setDiscount(0); setAppliedCoupon(null); setPromoCode(''); };

  const handlePlaceOrder = () => {
    if (!name.trim()) { setError('Vui lòng nhập tên'); return; }
    if (!phone.trim()) { setError('Vui lòng nhập số điện thoại'); return; }
    if (!address.trim()) { setError('Vui lòng nhập địa chỉ'); return; }
    setError('');
    const order = orderService.create({
      customer: { name, phone, email, address }, items: cart,
      total, subtotal, shippingFee, discount,
      couponCode: appliedCoupon || undefined, paymentMethod, note: note || undefined,
    });
    if (appliedCoupon) {
      const coupons = JSON.parse(localStorage.getItem('coupons') || '[]');
      const idx = coupons.findIndex((c: any) => c.code === appliedCoupon);
      if (idx !== -1) { coupons[idx].used = (coupons[idx].used || 0) + 1; localStorage.setItem('coupons', JSON.stringify(coupons)); }
    }
    clearCart();
    alert(`🎉 Đặt hàng thành công!\n\nMã đơn: ${order.id}\nTổng: ${formatCurrency(total)}`);
    navigate('/orders');
  };

  return (
    <div className="checkout-page">
      <h1 style={{ marginBottom: 24, fontSize: 24, fontWeight: 700 }}>Thanh toán</h1>
      <div className="checkout-container">
        {/* Left - Form */}
        <div>
          <div className="checkout-section">
            <h3><i className="fa fa-user"></i> Thông tin nhận hàng</h3>
            {error && <div className="error-message show">{error}</div>}
            <div className="form-group"><input value={name} onChange={e => setName(e.target.value)} placeholder="Họ tên *" /></div>
            <div className="form-group">
              <div className="input-prefix"><span>+84</span><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Số điện thoại *" /></div>
            </div>
            <div className="form-group"><input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" /></div>
            <div className="form-group"><input value={address} onChange={e => setAddress(e.target.value)} placeholder="Địa chỉ giao hàng *" /></div>
            <div className="form-group"><textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú đơn hàng" rows={3}></textarea></div>
          </div>
        </div>

        {/* Right - Summary */}
        <div className="checkout-right">
          {/* Promo */}
          {appliedCoupon ? (
            <div className="applied-promo">
              <i className="fa fa-ticket"></i>
              <div className="applied-promo-info">
                <span className="applied-code">{appliedCoupon}</span>
                <span className="applied-desc">Giảm {formatCurrency(discount)}</span>
              </div>
              <button className="btn-remove-coupon" onClick={removeCoupon}><i className="fa fa-times"></i></button>
            </div>
          ) : (
            <div className="checkout-section" style={{ padding: 16 }}>
              <div className="promo-input-group">
                <input value={promoCode} onChange={e => setPromoCode(e.target.value)} placeholder="Nhập mã giảm giá" style={{ textTransform: 'uppercase' }} />
                <button className="btn-apply-promo" onClick={applyCoupon}>Áp dụng</button>
              </div>
            </div>
          )}

          {/* Payment */}
          <div className="checkout-section">
            <h3><i className="fa fa-credit-card"></i> Thanh toán</h3>
            <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}>
              <input type="radio" name="payment" checked={paymentMethod === 'cod'} readOnly />
              <i className="fa fa-money-bill-wave"></i>
              <span>(COD) Thanh toán khi nhận hàng</span>
            </label>
            <label className={`payment-option ${paymentMethod === 'bank' ? 'active' : ''}`} onClick={() => setPaymentMethod('bank')}>
              <input type="radio" name="payment" checked={paymentMethod === 'bank'} readOnly />
              <i className="fa fa-university"></i>
              <span>Chuyển khoản ngân hàng</span>
            </label>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h4>Đơn hàng ({cart.length} sản phẩm)</h4>
            <div className="order-items" style={{ maxHeight: 250, overflowY: 'auto', marginBottom: 16 }}>
              {cart.map((item, i) => (
                <div key={i} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <div className="order-item-info">
                    <h4>{item.name}</h4>
                    <p>{item.color} {item.size && `, ${item.size}`} × {item.quantity}</p>
                    <p style={{ fontWeight: 600, color: '#1f2937' }}>{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="summary-row"><span>Tạm tính</span><span>{formatCurrency(subtotal)}</span></div>
            {discount > 0 && <div className="summary-row discount"><span>Giảm giá</span><span>-{formatCurrency(discount)}</span></div>}
            <div className="summary-row"><span>Phí vận chuyển</span><span>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</span></div>
            <div className="summary-row total"><span>Tổng cộng</span><span>{formatCurrency(total)}</span></div>
            {shippingFee > 0 && (
              <div className="free-shipping-note"><i className="fa fa-truck"></i> Mua thêm {formatCurrency(499000 - subtotal)} để được freeship</div>
            )}
          </div>

          <button className="btn-place-order" onClick={handlePlaceOrder}>
            <i className="fa fa-lock"></i> Đặt hàng - {formatCurrency(total)}
          </button>
        </div>
      </div>
    </div>
  );
}