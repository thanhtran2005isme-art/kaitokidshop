// Trang thanh toán - IVY moda style + QR transfer

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import { couponApi, settingsApi, type SettingDTO } from '../services/api';
import apiClient from '../services/apiClient';

interface BankAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch: string;
  qrImage?: string;
}

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
  const [submitting, setSubmitting] = useState(false);

  // Bank settings từ admin
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankEnabled, setBankEnabled] = useState(true);

  // Modal đặt hàng thành công
  const [successOrder, setSuccessOrder] = useState<{ orderCode: string; total: number } | null>(null);

  const shippingFee = 0;
  const total = Math.max(0, subtotal - discount) + shippingFee;

  // Phương thức thanh toán cần hiển thị QR
  const requiresBankTransfer = paymentMethod === 'atm' || paymentMethod === 'visa';

  useEffect(() => {
    // Load bank settings từ admin
    const loadBankSettings = async () => {
      const result = await settingsApi.getAll('payment');
      if (result.success && result.data) {
        result.data.forEach((dto: SettingDTO) => {
          if (dto.maCauHinh === 'bankAccounts') {
            try {
              const parsed = JSON.parse(dto.giaTri);
              if (Array.isArray(parsed)) setBankAccounts(parsed);
            } catch { /* ignore */ }
          }
          if (dto.maCauHinh === 'bankEnabled') {
            setBankEnabled(dto.giaTri === 'true');
          }
        });
      }
    };
    void loadBankSettings();
  }, []);

  if (cart.length === 0 && !successOrder) {
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

  const handlePlaceOrder = async () => {
    if (!name.trim()) { setError('Vui lòng nhập họ tên'); return; }
    if (!phone.trim()) { setError('Vui lòng nhập số điện thoại'); return; }
    if (!address.trim()) { setError('Vui lòng nhập địa chỉ'); return; }
    setError('');
    setSubmitting(true);

    const fullAddress = [address, ward, district, city].filter(Boolean).join(', ');

    try {
      const response = await apiClient.post('/api/orders', {
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: user?.email || '',
        customerAddress: fullAddress,
        paymentMethod: paymentMethod.toUpperCase(),
        couponCode: appliedCoupon || undefined,
        note: undefined,
      });

      const orderData = response.data as { id?: number; orderCode?: string; total?: number };
      await clearCart();
      setSuccessOrder({
        orderCode: orderData.orderCode || String(orderData.id || ''),
        total: orderData.total || total,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Không thể đặt hàng. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
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
                <span>Thanh toán bằng thẻ tín dụng <strong>VISA</strong></span>
              </label>
              <label className="ivy-radio-option" onClick={() => setPaymentMethod('atm')}>
                <input type="radio" name="payment" checked={paymentMethod === 'atm'} readOnly />
                <span>Thanh toán bằng thẻ ATM / Chuyển khoản</span>
                <small>Hỗ trợ thanh toán online hơn 38 ngân hàng cho bạn Việt Nam</small>
              </label>
              <label className="ivy-radio-option" onClick={() => setPaymentMethod('momo')}>
                <input type="radio" name="payment" checked={paymentMethod === 'momo'} readOnly />
                <span>Thanh toán bằng Momo</span>
              </label>
              <label className="ivy-radio-option" onClick={() => setPaymentMethod('cod')}>
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} readOnly />
                <span>Thanh toán khi giao hàng (COD)</span>
              </label>
            </div>

            {/* Hiển thị QR + thông tin ngân hàng khi chọn ATM/VISA */}
            {requiresBankTransfer && bankEnabled && bankAccounts.length > 0 && (
              <div style={{
                marginTop: '20px',
                padding: '20px',
                background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)',
                borderRadius: '12px',
                border: '1px solid #bfdbfe',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <i className="fa fa-qrcode" style={{ fontSize: '20px', color: '#2563eb' }}></i>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e3a8a' }}>
                    Thông tin chuyển khoản
                  </h4>
                </div>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
                  Vui lòng quét mã QR hoặc chuyển khoản theo thông tin bên dưới với số tiền:{' '}
                  <strong style={{ color: '#dc2626', fontSize: '15px' }}>{formatCurrency(total)}</strong>.
                  Đơn hàng sẽ được xác nhận sau khi nhận được thanh toán.
                </p>

                {bankAccounts.map((bank, idx) => (
                  <div key={bank.id || idx} style={{
                    background: '#ffffff',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: idx < bankAccounts.length - 1 ? '12px' : 0,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    gap: '16px',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                  }}>
                    {bank.qrImage && (
                      <div style={{
                        flex: '0 0 auto',
                        width: '160px',
                        height: '160px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}>
                        <img src={bank.qrImage} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                          Ngân hàng
                        </span>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{bank.bankName}</div>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                          Số tài khoản
                        </span>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#dc2626', letterSpacing: '0.05em' }}>
                          {bank.accountNumber}
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(bank.accountNumber)}
                            style={{ marginLeft: '8px', border: 'none', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}
                          >
                            Sao chép
                          </button>
                        </div>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                          Chủ tài khoản
                        </span>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{bank.accountHolder}</div>
                      </div>
                      {bank.branch && (
                        <div>
                          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                            Chi nhánh
                          </span>
                          <div style={{ fontSize: '13px', color: '#475569' }}>{bank.branch}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div style={{
                  marginTop: '14px',
                  padding: '10px 14px',
                  background: '#fef3c7',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#92400e',
                  lineHeight: 1.6,
                }}>
                  <i className="fa fa-info-circle"></i>{' '}
                  <strong>Lưu ý:</strong> Vui lòng ghi rõ <strong>họ tên + SĐT</strong> trong nội dung chuyển khoản để shop xác nhận đơn nhanh hơn.
                </div>
              </div>
            )}

            {requiresBankTransfer && (!bankEnabled || bankAccounts.length === 0) && (
              <div style={{ marginTop: '16px', padding: '14px', background: '#fef2f2', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>
                Phương thức chuyển khoản hiện chưa được cấu hình. Vui lòng chọn phương thức khác.
              </div>
            )}
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

          <button className="ivy-btn-complete" onClick={handlePlaceOrder} disabled={submitting}>
            {submitting ? 'ĐANG XỬ LÝ...' : 'HOÀN THÀNH'}
          </button>
        </div>
      </div>

      {/* Modal đặt hàng thành công */}
      {successOrder && (
        <div
          className="modal active"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          }}
        >
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '40px 32px',
            maxWidth: '480px', width: '90%', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: '#dcfce7', color: '#16a34a',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '40px', marginBottom: '20px',
            }}>
              <i className="fa fa-check"></i>
            </div>
            <h2 style={{ margin: '0 0 12px', fontSize: '24px', color: '#0f172a' }}>
              Đặt hàng thành công!
            </h2>
            <p style={{ margin: '0 0 8px', color: '#475569', fontSize: '14px' }}>
              Mã đơn hàng: <strong style={{ color: '#0f172a' }}>{successOrder.orderCode}</strong>
            </p>
            <p style={{ margin: '0 0 24px', color: '#475569', fontSize: '14px' }}>
              Tổng tiền: <strong style={{ color: '#dc2626', fontSize: '18px' }}>{formatCurrency(successOrder.total)}</strong>
            </p>
            {paymentMethod === 'cod' ? (
              <p style={{ margin: '0 0 24px', color: '#475569', fontSize: '13px', lineHeight: 1.6 }}>
                Đơn hàng của bạn đang được xử lý. Shipper sẽ liên hệ trước khi giao hàng.
              </p>
            ) : (
              <p style={{ margin: '0 0 24px', color: '#475569', fontSize: '13px', lineHeight: 1.6 }}>
                Vui lòng kiểm tra mã QR và chuyển khoản theo hướng dẫn để shop xác nhận đơn.
              </p>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => { setSuccessOrder(null); navigate('/orders'); }}
                style={{
                  padding: '12px 24px', background: '#0f172a', color: '#fff',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 600,
                }}
              >
                Xem đơn hàng
              </button>
              <button
                onClick={() => { setSuccessOrder(null); navigate('/products'); }}
                style={{
                  padding: '12px 24px', background: '#f1f5f9', color: '#0f172a',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: 600,
                }}
              >
                Tiếp tục mua hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
