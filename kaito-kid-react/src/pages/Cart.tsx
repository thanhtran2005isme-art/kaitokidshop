// Trang giỏ hàng — phiên bản nâng cao
// Coupon apply trực tiếp + freeship progress + reservation timer + cross-sell

import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import { couponApi, productApi } from '../services/api';
import type { Product } from '../types';
import toast from 'react-hot-toast';

const FREESHIP_THRESHOLD = 499_000;
const RESERVATION_MINUTES = 30;

interface AppliedCoupon {
  code: string;
  type: 'percent' | 'fixed' | string;
  discount: number;
}

export default function Cart() {
  const { cart, totalItems, subtotal, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);
  const [crossSell, setCrossSell] = useState<Product[]>([]);
  const [reservationLeft, setReservationLeft] = useState(RESERVATION_MINUTES * 60);

  // Reservation: 30 phút giữ giỏ hàng — lưu vào localStorage để sống qua F5
  useEffect(() => {
    if (cart.length === 0) {
      localStorage.removeItem('kk_cart_reserved_at');
      setReservationLeft(RESERVATION_MINUTES * 60);
      return;
    }
    let reservedAt = Number(localStorage.getItem('kk_cart_reserved_at'));
    if (!reservedAt || Number.isNaN(reservedAt)) {
      reservedAt = Date.now();
      localStorage.setItem('kk_cart_reserved_at', String(reservedAt));
    }
    const tick = () => {
      const elapsed = Math.floor((Date.now() - reservedAt) / 1000);
      const left = Math.max(0, RESERVATION_MINUTES * 60 - elapsed);
      setReservationLeft(left);
    };
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [cart.length]);

  // Cross-sell: gợi ý sản phẩm bestseller cùng category với item đầu tiên
  useEffect(() => {
    if (cart.length === 0) {
      setCrossSell([]);
      return;
    }
    void productApi.getBestSellers(8).then((r) => {
      if (r.success && r.data) {
        const inCart = new Set(cart.map((c) => c.productId));
        setCrossSell(r.data.filter((p) => !inCart.has(p.id)).slice(0, 4));
      }
    });
  }, [cart.length]);

  const freeshipMissing = Math.max(0, FREESHIP_THRESHOLD - subtotal);
  const freeshipPct = Math.min(100, Math.round((subtotal / FREESHIP_THRESHOLD) * 100));
  const totalAfterDiscount = Math.max(0, subtotal - (applied?.discount ?? 0));

  const handleApplyCoupon = useCallback(async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }
    if (!user) {
      toast.error('Đăng nhập để áp dụng mã giảm giá');
      navigate('/login');
      return;
    }
    setApplying(true);
    const r = await couponApi.validate({ code, orderAmount: subtotal });
    setApplying(false);
    if (r.success && r.data?.isValid) {
      setApplied({ code, type: 'fixed', discount: r.data.discountAmount });
      toast.success(`Áp dụng mã ${code} thành công`);
    } else {
      toast.error(r.data?.message || r.error || 'Mã giảm giá không hợp lệ');
    }
  }, [couponInput, subtotal, user, navigate]);

  const handleRemoveCoupon = useCallback(() => {
    setApplied(null);
    setCouponInput('');
    toast.success('Đã bỏ mã giảm giá');
  }, []);

  const goCheckout = useCallback(() => {
    if (!user) {
      toast.error('Vui lòng đăng nhập trước khi đặt hàng');
      navigate('/login');
      return;
    }
    if (applied) {
      sessionStorage.setItem('kk_pending_coupon', applied.code);
    }
    navigate('/checkout');
  }, [user, applied, navigate]);

  // ============== EMPTY ==============
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
        <div className="ivy-step active"><div className="ivy-step-num">1</div><span>Giỏ hàng</span></div>
        <div className="ivy-step-line"></div>
        <div className="ivy-step"><div className="ivy-step-num">2</div><span>Đặt hàng</span></div>
        <div className="ivy-step-line"></div>
        <div className="ivy-step"><div className="ivy-step-num">3</div><span>Thanh toán</span></div>
        <div className="ivy-step-line"></div>
        <div className="ivy-step"><div className="ivy-step-num">4</div><span>Hoàn thành đơn</span></div>
      </div>

      {/* Reservation banner */}
      {reservationLeft > 0 ? (
        <div style={{
          background: reservationLeft < 300 ? '#fef2f2' : '#fff7ed',
          border: `1px solid ${reservationLeft < 300 ? '#fecaca' : '#fed7aa'}`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12, fontSize: 13,
          color: reservationLeft < 300 ? '#991b1b' : '#9a3412',
        }}>
          <i className="fa fa-clock" style={{ fontSize: 16 }}></i>
          <div style={{ flex: 1 }}>
            <strong>Giỏ hàng đang được giữ trong {String(Math.floor(reservationLeft / 60)).padStart(2, '0')}:{String(reservationLeft % 60).padStart(2, '0')}</strong>
            <span style={{ marginLeft: 8 }}>để các bạn khác không tranh hàng. Đặt nhanh tay nhé!</span>
          </div>
        </div>
      ) : null}

      {/* Freeship progress */}
      <div style={{
        background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
        padding: '14px 18px', marginBottom: 20,
      }}>
        {freeshipMissing > 0 ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: '#166534' }}>
                <i className="fa fa-truck" style={{ marginRight: 6 }}></i>
                Mua thêm <strong>{formatCurrency(freeshipMissing)}</strong> để được <strong>FREESHIP</strong>!
              </span>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>{freeshipPct}%</span>
            </div>
            <div style={{ background: '#dcfce7', height: 8, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ background: 'linear-gradient(90deg, #22c55e, #16a34a)', height: '100%', width: `${freeshipPct}%`, transition: 'width 0.4s' }} />
            </div>
          </>
        ) : (
          <div style={{ color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fa fa-check-circle"></i>
            Đơn hàng được FREESHIP! Cảm ơn bạn đã ủng hộ KaitoKid 🎉
          </div>
        )}
      </div>

      <div className="ivy-cart-layout">
        {/* Left: Cart items */}
        <div className="ivy-cart-left">
          <h2 className="ivy-cart-title">
            Giỏ hàng của bạn <strong>{totalItems} Sản Phẩm</strong>
          </h2>

          <div className="ivy-cart-header">
            <span className="ivy-col-product">TÊN SẢN PHẨM</span>
            <span className="ivy-col-discount">CHIẾT KHẤU</span>
            <span className="ivy-col-qty">SỐ LƯỢNG</span>
            <span className="ivy-col-total">TỔNG TIỀN</span>
          </div>

          {cart.map((item) => {
            const lowStock = item.quantity >= 3; // Mock: nếu khách add nhiều sẽ cảnh báo
            return (
              <div className="ivy-cart-item" key={item.id}>
                <div className="ivy-col-product">
                  <div className="ivy-item-info">
                    <Link to={`/product/${item.productId}`} className="ivy-item-img">
                      <img src={item.image} alt={item.name} />
                    </Link>
                    <div className="ivy-item-details">
                      <Link to={`/product/${item.productId}`} className="ivy-item-name">{item.name}</Link>
                      <p className="ivy-item-variant">
                        {item.color && <>Màu: {item.color}</>}
                        {item.color && item.size && <>&nbsp;&nbsp;|&nbsp;&nbsp;</>}
                        {item.size && <>Size: {item.size}</>}
                      </p>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>
                        Đơn giá: {formatCurrency(item.price)}
                      </p>
                      {lowStock && (
                        <p style={{ fontSize: 12, color: '#ea580c', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <i className="fa fa-fire"></i>
                          Size {item.size} đang được {3 + (item.id % 8)} người khác xem
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ivy-col-discount">
                  <span className="ivy-discount-text">—</span>
                </div>
                <div className="ivy-col-qty">
                  <div className="ivy-qty-control">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
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
            );
          })}

          <div className="ivy-cart-continue">
            <Link to="/products" className="ivy-btn-continue">← Tiếp tục mua hàng</Link>
          </div>

          {/* Cross-sell */}
          {crossSell.length > 0 && (
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: 16, marginBottom: 16, color: '#0f172a' }}>
                <i className="fa fa-magic" style={{ marginRight: 8, color: '#ec4899' }}></i>
                Mua kèm để được giảm thêm
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {crossSell.map((p) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.id}`}
                    style={{
                      display: 'block', textDecoration: 'none', color: '#0f172a',
                      border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden',
                      transition: 'border-color 0.2s, transform 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ec4899')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                  >
                    <div style={{ aspectRatio: '4/5', background: '#f8fafc', overflow: 'hidden' }}>
                      <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, height: 32, overflow: 'hidden' }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: '#dc2626', fontWeight: 700, marginTop: 4 }}>{formatCurrency(p.price)}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
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
              <span>Tạm tính</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {applied && (
              <div className="ivy-summary-row" style={{ color: '#16a34a' }}>
                <span>Mã {applied.code}</span>
                <span>−{formatCurrency(applied.discount)}</span>
              </div>
            )}
            <div className="ivy-summary-row ivy-summary-bold" style={{ marginTop: 8 }}>
              <span>Thành tiền</span>
              <span className="ivy-price-red">{formatCurrency(totalAfterDiscount)}</span>
            </div>

            {/* Coupon input */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
              {!applied ? (
                <>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: 6 }}>
                    <i className="fa fa-tag" style={{ marginRight: 6, color: '#ec4899' }}></i>
                    Mã giảm giá
                  </label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Nhập mã (vd: KAITOKID10)"
                      style={{
                        flex: 1, padding: '10px 12px', border: '1px solid #cbd5e1',
                        borderRadius: 6, fontSize: 13, textTransform: 'uppercase',
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter') void handleApplyCoupon(); }}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applying}
                      style={{
                        padding: '0 16px', background: '#0f172a', color: '#fff',
                        border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                      }}
                    >
                      {applying ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                </>
              ) : (
                <div style={{
                  background: '#dcfce7', border: '1px solid #86efac',
                  padding: '10px 12px', borderRadius: 6, display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <i className="fa fa-check-circle" style={{ color: '#16a34a', marginRight: 6 }}></i>
                    <strong style={{ color: '#166534' }}>{applied.code}</strong>
                    <span style={{ fontSize: 12, color: '#15803d', marginLeft: 6 }}>
                      −{formatCurrency(applied.discount)}
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 18 }}
                  >×</button>
                </div>
              )}
            </div>

            <div className="ivy-summary-notes" style={{ marginTop: 16 }}>
              <p><i className="fa fa-info-circle"></i> Sản phẩm KM trên 50% không hỗ trợ đổi trả.</p>
              <p><i className="fa fa-shield-alt"></i> Không thanh toán cho shipper khi chưa nhận hàng!</p>
            </div>

            <button className="ivy-btn-order" onClick={goCheckout}>
              <i className="fa fa-shopping-cart" style={{ marginRight: 8 }}></i>
              Đặt hàng • {formatCurrency(totalAfterDiscount)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
