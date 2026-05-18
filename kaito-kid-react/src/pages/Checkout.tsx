// Trang thanh toán - IVY moda style + QR transfer

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import { couponApi, settingsApi, locationApi, shippingApi, paymentApi, cartApi, type SettingDTO, type Province, type District, type Ward, type ShippingQuoteOption, type ComboDiscountResult } from '../services/api';
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

  // Location API: provinces.open-api.vn
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);

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

  // Step 3: trang thanh toán QR (chỉ hiện khi ATM + đã đặt hàng xong)
  const [paymentStep, setPaymentStep] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<{ orderCode: string; total: number } | null>(null);
  const [paymentSecondsLeft, setPaymentSecondsLeft] = useState(900); // 15 phút
  const [paymentExpired, setPaymentExpired] = useState(false);

  // Step 4: trang hoàn thành đơn (cho COD hoặc sau khi quét QR xong)
  const [completedStep, setCompletedStep] = useState(false);

  const [shippingFee, setShippingFee] = useState(0);
  const [shippingOptions, setShippingOptions] = useState<ShippingQuoteOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingQuoteOption | null>(null);
  const [shippingProvider, setShippingProvider] = useState<'mock' | 'ghn' | 'ghtk' | 'all'>('all');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [combo, setCombo] = useState<ComboDiscountResult | null>(null);
  const comboDiscount = combo?.eligible ? combo.discount : 0;
  const total = Math.max(0, subtotal - discount - comboDiscount) + shippingFee;

  // Phương thức thanh toán cần hiển thị QR
  const requiresBankTransfer = paymentMethod === 'atm';

  // Map tên ngân hàng dài → mã viết tắt VietQR
  const BANK_CODE_MAP: Record<string, string> = {
    'mbbank': 'MB', 'mb bank': 'MB', 'mb': 'MB',
    'vietcombank': 'VCB', 'vcb': 'VCB',
    'techcombank': 'TCB', 'tcb': 'TCB',
    'bidv': 'BIDV',
    'vietinbank': 'CTG', 'ctg': 'CTG', 'vtb': 'CTG',
    'agribank': 'AGRIBANK', 'agri': 'AGRIBANK',
    'acb': 'ACB',
    'sacombank': 'STB', 'stb': 'STB',
    'tpbank': 'TPB', 'tpb': 'TPB',
    'vpbank': 'VPB', 'vpb': 'VPB',
    'mbank': 'MB',
  };

  const getBankCode = (bankName: string): string => {
    const key = bankName.toLowerCase().trim();
    return BANK_CODE_MAP[key] || bankName.toUpperCase().replace(/\s+/g, '');
  };

  // Build URL VietQR động: tự động fill số tiền + nội dung khi user quét
  const buildVietQrUrl = (bank: BankAccount, amount: number, content: string) => {
    const bankCode = getBankCode(bank.bankName);
    const params = new URLSearchParams({
      amount: String(amount),
      addInfo: content,
      accountName: bank.accountHolder,
    });
    return `https://img.vietqr.io/image/${bankCode}-${bank.accountNumber}-compact2.png?${params.toString()}`;
  };

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

  // Auto load coupon đã apply từ trang Cart (nếu có)
  useEffect(() => {
    const pending = sessionStorage.getItem('kk_pending_coupon');
    if (pending && !appliedCoupon) {
      setPromoCode(pending);
      sessionStorage.removeItem('kk_pending_coupon');
      // Auto-apply
      void couponApi.validate({ code: pending, orderAmount: subtotal }).then((r) => {
        if (r.success && r.data?.isValid) {
          setDiscount(r.data.discountAmount);
          setAppliedCoupon(pending);
        }
      });
    }
  }, [subtotal]);

  // Load danh sách 63 tỉnh/thành phố khi mount
  useEffect(() => {
    locationApi.getProvinces().then((list) => {
      setProvinces(list);
    });
  }, []);

  // Combo discount: backend tính dựa trên giỏ thật (≥2 SP cùng category → 10%)
  useEffect(() => {
    if (cart.length === 0) { setCombo(null); return; }
    void cartApi.getComboDiscount().then((r) => {
      if (r.success && r.data) setCombo(r.data); else setCombo(null);
    });
  }, [cart]);

  // Tự tính phí ship khi địa chỉ đổi
  useEffect(() => {
    if (!city || !district) {
      setShippingOptions([]);
      setSelectedShipping(null);
      setShippingFee(0);
      return;
    }
    const totalWeight = cart.reduce((s, i) => s + 300 * i.quantity, 0);
    setShippingLoading(true);
    shippingApi.quote({
      provider: shippingProvider,
      toProvince: city,
      toDistrict: district,
      toWard: ward || undefined,
      toAddress: address || undefined,
      weightGram: Math.max(300, totalWeight),
      orderValue: subtotal,
    }).then((r) => {
      if (r.success && r.data?.success && r.data.options.length > 0) {
        setShippingOptions(r.data.options);
        const found = selectedShipping
          ? r.data.options.find((o) => o.provider === selectedShipping.provider && o.serviceCode === selectedShipping.serviceCode)
          : null;
        const pick = found || r.data.options[0];
        setSelectedShipping(pick);
        setShippingFee(pick.fee);
      } else {
        setShippingOptions([]);
        setSelectedShipping(null);
        setShippingFee(0);
      }
    }).finally(() => setShippingLoading(false));
  }, [city, district, ward, address, subtotal, shippingProvider, cart]);

  // Khi đổi tỉnh: load quận/huyện, reset district + ward
  const handleChangeProvince = async (code: string) => {
    const provinceCode = Number(code);
    if (!provinceCode) {
      setCity(''); setSelectedProvinceCode(null);
      setDistricts([]); setDistrict(''); setSelectedDistrictCode(null);
      setWards([]); setWard('');
      return;
    }
    const province = provinces.find((p) => p.code === provinceCode);
    setCity(province?.name || '');
    setSelectedProvinceCode(provinceCode);
    setDistrict(''); setSelectedDistrictCode(null);
    setWard(''); setWards([]);

    const detail = await locationApi.getProvinceWithDistricts(provinceCode);
    setDistricts(detail?.districts || []);
  };

  // Khi đổi quận: load phường/xã, reset ward
  const handleChangeDistrict = async (code: string) => {
    const districtCode = Number(code);
    if (!districtCode) {
      setDistrict(''); setSelectedDistrictCode(null);
      setWards([]); setWard('');
      return;
    }
    const d = districts.find((x) => x.code === districtCode);
    setDistrict(d?.name || '');
    setSelectedDistrictCode(districtCode);
    setWard('');

    const detail = await locationApi.getDistrictWithWards(districtCode);
    setWards(detail?.wards || []);
  };

  const handleChangeWard = (code: string) => {
    const wardCode = Number(code);
    if (!wardCode) { setWard(''); return; }
    const w = wards.find((x) => x.code === wardCode);
    setWard(w?.name || '');
  };

  // Poll status đơn ATM mỗi 5s và tự countdown từ backend
  useEffect(() => {
    if (!paymentStep || !pendingOrder) return;
    let cancelled = false;

    const tick = async () => {
      const r = await paymentApi.getStatus(pendingOrder.orderCode);
      if (cancelled || !r.success || !r.data) return;
      setPaymentSecondsLeft(r.data.secondsLeft);
      if (r.data.status === 'cancelled' || r.data.secondsLeft <= 0) {
        setPaymentExpired(true);
        return;
      }
      if (r.data.paidAt) {
        // Đã thanh toán → chuyển step 4 hoàn thành
        setPaymentStep(false);
        setCompletedStep(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    void tick();
    const interval = window.setInterval(tick, 5000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [paymentStep, pendingOrder]);

  // Tick countdown UI mỗi giây giữa 2 lần poll backend (smoother)
  useEffect(() => {
    if (!paymentStep || paymentExpired) return;
    const t = window.setInterval(() => {
      setPaymentSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [paymentStep, paymentExpired]);

  if (cart.length === 0 && !successOrder && !paymentStep && !completedStep) {
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
        shippingProvider: selectedShipping?.provider,
        shippingServiceCode: selectedShipping?.serviceCode,
        shippingFee: selectedShipping?.fee ?? shippingFee,
        leadTimeHours: selectedShipping?.leadTimeHours,
      });

      const orderData = response.data as { id?: number; orderCode?: string; total?: number };
      await clearCart();
      const orderInfo = {
        orderCode: orderData.orderCode || String(orderData.id || ''),
        total: orderData.total || total,
      };

      if (paymentMethod === 'atm') {
        // ATM → sang step 3 (trang thanh toán QR)
        setPendingOrder(orderInfo);
        setPaymentStep(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // COD → đi thẳng step 4 (trang hoàn thành đơn)
        setPendingOrder(orderInfo);
        setCompletedStep(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Không thể đặt hàng. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Trang Step 4: Hoàn thành đơn (cho COD hoặc sau khi đã chuyển khoản ATM)
  if (completedStep && pendingOrder) {
    return (
      <div className="ivy-checkout-page">
        {/* Progress Steps - Step 4 active (tất cả done) */}
        <div className="ivy-cart-steps">
          <div className="ivy-step done"><div className="ivy-step-num">✓</div><span>Giỏ hàng</span></div>
          <div className="ivy-step-line active"></div>
          <div className="ivy-step done"><div className="ivy-step-num">✓</div><span>Đặt hàng</span></div>
          <div className="ivy-step-line active"></div>
          <div className="ivy-step done"><div className="ivy-step-num">✓</div><span>Thanh toán</span></div>
          <div className="ivy-step-line active"></div>
          <div className="ivy-step active"><div className="ivy-step-num">4</div><span>Hoàn thành đơn</span></div>
        </div>

        <div style={{ maxWidth: 720, margin: '60px auto', padding: '0 20px' }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '48px 40px',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid #e5e7eb',
          }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: '#dcfce7', color: '#16a34a',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48, marginBottom: 24,
            }}>
              <i className="fa fa-check"></i>
            </div>

            <h1 style={{ margin: '0 0 12px', fontSize: 28, color: '#0f172a' }}>
              Đặt hàng thành công!
            </h1>
            <p style={{ margin: '0 0 32px', color: '#475569', fontSize: 14, lineHeight: 1.6 }}>
              {paymentMethod === 'atm'
                ? 'Cảm ơn bạn đã mua sắm. Đơn hàng sẽ được xác nhận sau khi shop nhận được thanh toán.'
                : 'Cảm ơn bạn đã đặt hàng. Shipper sẽ liên hệ trước khi giao và bạn thanh toán khi nhận hàng.'}
            </p>

            <div style={{
              background: '#f8fafc',
              borderRadius: 10,
              padding: 20,
              marginBottom: 28,
              textAlign: 'left',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#64748b', fontSize: 13 }}>Mã đơn hàng:</span>
                <strong style={{ color: '#0f172a' }}>{pendingOrder.orderCode}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#64748b', fontSize: 13 }}>Tổng tiền:</span>
                <strong style={{ color: '#dc2626', fontSize: 16 }}>{formatCurrency(pendingOrder.total)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: 13 }}>Phương thức:</span>
                <strong style={{ color: '#0f172a' }}>
                  {paymentMethod === 'atm' ? 'Chuyển khoản ATM' : 'Thanh toán khi nhận hàng (COD)'}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/orders')}
                style={{
                  padding: '12px 28px', background: '#0f172a', color: '#fff',
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <i className="fa fa-list"></i> Xem đơn hàng của tôi
              </button>
              <button
                onClick={() => navigate('/products')}
                style={{
                  padding: '12px 28px', background: '#f1f5f9', color: '#0f172a',
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Tiếp tục mua hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Trang Step 3: Thanh toán bằng QR (sau khi đã đặt hàng ATM)
  if (paymentStep && pendingOrder) {
    const primaryBank = bankAccounts[0];
    const transferContent = `DH${pendingOrder.orderCode}`;
    const qrUrl = primaryBank ? buildVietQrUrl(primaryBank, pendingOrder.total, transferContent) : '';

    return (
      <div className="ivy-checkout-page">
        {/* Progress Steps - Step 3 active */}
        <div className="ivy-cart-steps">
          <div className="ivy-step done"><div className="ivy-step-num">✓</div><span>Giỏ hàng</span></div>
          <div className="ivy-step-line active"></div>
          <div className="ivy-step done"><div className="ivy-step-num">✓</div><span>Đặt hàng</span></div>
          <div className="ivy-step-line active"></div>
          <div className="ivy-step active"><div className="ivy-step-num">3</div><span>Thanh toán</span></div>
          <div className="ivy-step-line"></div>
          <div className="ivy-step"><div className="ivy-step-num">4</div><span>Hoàn thành đơn</span></div>
        </div>

        <div style={{ maxWidth: 1100, margin: '40px auto', padding: '0 20px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
            color: '#fff',
            padding: '20px 24px',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <i className="fa fa-university" style={{ fontSize: 24 }}></i>
            <div>
              <h2 style={{ margin: 0, fontSize: 20 }}>Thanh toán qua ngân hàng</h2>
              <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: 13 }}>Quét mã QR để thanh toán nhanh chóng và an toàn</p>
            </div>
          </div>

          {/* Countdown banner */}
          {!paymentExpired ? (
            <div style={{
              background: paymentSecondsLeft < 60 ? '#fef2f2' : '#fff7ed',
              border: paymentSecondsLeft < 60 ? '1px solid #fecaca' : '1px solid #fed7aa',
              padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <i className="fa fa-clock" style={{ fontSize: 20, color: paymentSecondsLeft < 60 ? '#dc2626' : '#d97706' }}></i>
                <div>
                  <strong style={{ color: paymentSecondsLeft < 60 ? '#dc2626' : '#d97706', fontSize: 14 }}>Thời gian thanh toán còn lại</strong>
                  <div style={{ fontSize: 11, color: '#92400e', marginTop: 2 }}>Đơn hàng sẽ tự hủy nếu không thanh toán trước khi hết giờ</div>
                </div>
              </div>
              <div style={{
                fontSize: 32, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 1,
                color: paymentSecondsLeft < 60 ? '#dc2626' : '#d97706',
              }}>
                {String(Math.floor(paymentSecondsLeft / 60)).padStart(2, '0')}:{String(paymentSecondsLeft % 60).padStart(2, '0')}
              </div>
            </div>
          ) : (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              padding: '20px', textAlign: 'center',
            }}>
              <i className="fa fa-times-circle" style={{ fontSize: 36, color: '#dc2626', marginBottom: 8 }}></i>
              <h3 style={{ margin: '0 0 4px', color: '#991b1b', fontSize: 18 }}>Đã hết thời gian thanh toán</h3>
              <p style={{ color: '#7f1d1d', margin: '0 0 16px', fontSize: 14 }}>Đơn hàng đã tự hủy. Vui lòng đặt lại nếu vẫn muốn mua.</p>
              <button
                onClick={() => navigate('/cart')}
                style={{ padding: '10px 24px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
              >
                Quay về giỏ hàng
              </button>
            </div>
          )}

          <div style={{ background: '#fff', padding: 24, borderRadius: '0 0 12px 12px', border: '1px solid #e5e7eb', borderTop: 'none' }}>
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 24,
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start',
            }}>
              <i className="fa fa-info-circle" style={{ color: '#2563eb', marginTop: 2 }}></i>
              <div>
                <strong style={{ color: '#1e3a8a', fontSize: 14 }}>Hướng dẫn thanh toán</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#475569' }}>
                  Vui lòng chuyển khoản đúng số tiền và nội dung để đơn được xác nhận tự động.
                </p>
              </div>
            </div>

            {primaryBank ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
                {/* Thông tin chuyển khoản */}
                <div>
                  <h3 style={{ fontSize: 16, marginBottom: 16, color: '#0f172a' }}>
                    <i className="fa fa-file-invoice" style={{ marginRight: 8, color: '#ec4899' }}></i>
                    Thông tin chuyển khoản
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                    Mã giao dịch: <strong style={{ color: '#0f172a' }}>{pendingOrder.orderCode}</strong>
                  </p>

                  <div style={{ display: 'grid', gap: 14 }}>
                    <div>
                      <span style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Số tiền</span>
                      <div style={{
                        marginTop: 4,
                        background: '#dcfce7',
                        color: '#166534',
                        padding: '8px 14px',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 18,
                        display: 'inline-block',
                      }}>
                        {formatCurrency(pendingOrder.total)}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Ngân hàng</span>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{primaryBank.bankName}</div>
                    </div>

                    <div>
                      <span style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Số tài khoản</span>
                      <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: '#dc2626', letterSpacing: '0.05em' }}>
                          {primaryBank.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(primaryBank.accountNumber)}
                          style={{
                            border: 'none', background: '#eff6ff', color: '#2563eb',
                            padding: '4px 10px', borderRadius: 4, fontSize: 12, cursor: 'pointer',
                          }}
                        >
                          <i className="fa fa-copy"></i> Sao chép
                        </button>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Chủ tài khoản</span>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>
                        {primaryBank.accountHolder}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Nội dung CK</span>
                      <div style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontSize: 15, fontWeight: 700, color: '#dc2626',
                          background: '#fef2f2', padding: '4px 10px', borderRadius: 4,
                        }}>
                          {transferContent}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(transferContent)}
                          style={{
                            border: 'none', background: '#eff6ff', color: '#2563eb',
                            padding: '4px 10px', borderRadius: 4, fontSize: 12, cursor: 'pointer',
                          }}
                        >
                          <i className="fa fa-copy"></i> Sao chép
                        </button>
                      </div>
                    </div>
                  </div>

                  <p style={{
                    marginTop: 18,
                    padding: '10px 14px',
                    background: '#fef3c7',
                    borderRadius: 6,
                    fontSize: 12,
                    color: '#92400e',
                    lineHeight: 1.6,
                  }}>
                    <strong>Lưu ý:</strong> Nội dung chuyển khoản chỉ áp dụng cho 1 lần. Vui lòng chuyển đúng để hệ thống tự động xác nhận đơn.
                  </p>
                </div>

                {/* QR code */}
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: 16, marginBottom: 12, color: '#0f172a' }}>
                    Quét mã QR để thanh toán
                  </h3>
                  <div style={{
                    background: '#fff',
                    border: '2px solid #e5e7eb',
                    borderRadius: 12,
                    padding: 12,
                    display: 'inline-block',
                  }}>
                    <img
                      src={qrUrl}
                      alt="VietQR"
                      style={{ width: 280, height: 'auto', display: 'block' }}
                    />
                  </div>
                  <p style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
                    Quét mã QR bằng app ngân hàng để thanh toán nhanh chóng
                  </p>
                  <a
                    href={qrUrl}
                    download={`QR-${pendingOrder.orderCode}.png`}
                    style={{
                      marginTop: 8, display: 'inline-block',
                      background: '#0f172a', color: '#fff',
                      padding: '8px 16px', borderRadius: 6,
                      textDecoration: 'none', fontSize: 13, fontWeight: 600,
                    }}
                  >
                    <i className="fa fa-download"></i> Tải QR về máy
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>
                Phương thức chuyển khoản chưa được cấu hình. Vui lòng liên hệ shop.
              </div>
            )}

            <div style={{ marginTop: 32, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={async () => {
                  // Mô phỏng webhook ngân hàng → backend set paid → poll status sẽ pickup ở lần tick tiếp theo.
                  // Production: bỏ nút này, để webhook SePay/Casso tự động.
                  const r = await paymentApi.simulatePaid(pendingOrder.orderCode);
                  if (r.success) {
                    // Trigger ngay status check thay vì đợi 5s polling
                    const s = await paymentApi.getStatus(pendingOrder.orderCode);
                    if (s.success && s.data?.paidAt) {
                      setPaymentStep(false);
                      setCompletedStep(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                }}
                style={{
                  padding: '12px 24px', background: '#0f172a', color: '#fff',
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Tôi đã chuyển khoản
              </button>
              <button
                onClick={() => navigate('/products')}
                style={{
                  padding: '12px 24px', background: '#f1f5f9', color: '#0f172a',
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Tiếp tục mua hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <select
                  value={selectedProvinceCode || ''}
                  onChange={(e) => handleChangeProvince(e.target.value)}
                >
                  <option value="">Tỉnh/Thành phố</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="ivy-form-group">
                <select
                  value={selectedDistrictCode || ''}
                  onChange={(e) => handleChangeDistrict(e.target.value)}
                  disabled={!selectedProvinceCode}
                >
                  <option value="">Quận/Huyện</option>
                  {districts.map((d) => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ivy-form-group full">
              <select
                value={ward ? (wards.find((w) => w.name === ward)?.code || '') : ''}
                onChange={(e) => handleChangeWard(e.target.value)}
                disabled={!selectedDistrictCode}
              >
                <option value="">Phường/xã</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>{w.name}</option>
                ))}
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


          {/* Đơn vị vận chuyển */}
          <div className="ivy-checkout-section">
            <h3 className="ivy-section-title">Đơn vị vận chuyển</h3>
            <div className="ivy-payment-box">
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                {(['all', 'mock', 'ghn', 'ghtk'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setShippingProvider(p)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 16,
                      border: shippingProvider === p ? '2px solid #ec4899' : '1px solid #cbd5e1',
                      background: shippingProvider === p ? '#fdf2f8' : '#fff',
                      color: shippingProvider === p ? '#be185d' : '#475569',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: 13,
                    }}
                  >
                    {p === 'all' ? 'Tất cả' : p === 'mock' ? 'KaitoKid Mock' : p === 'ghn' ? 'GHN' : 'GHTK'}
                  </button>
                ))}
              </div>
              {!city || !district ? (
                <p className="ivy-payment-note">Vui lòng chọn tỉnh/quận để tính phí vận chuyển.</p>
              ) : shippingLoading ? (
                <p className="ivy-payment-note">Đang tính phí vận chuyển...</p>
              ) : shippingOptions.length === 0 ? (
                <p className="ivy-payment-note" style={{ color: '#dc2626' }}>Chưa lấy được phí ship cho địa chỉ này.</p>
              ) : (
                shippingOptions.map((opt) => {
                  const isActive = selectedShipping?.provider === opt.provider && selectedShipping?.serviceCode === opt.serviceCode;
                  return (
                    <label
                      key={`${opt.provider}-${opt.serviceCode}`}
                      className="ivy-radio-option"
                      onClick={() => { setSelectedShipping(opt); setShippingFee(opt.fee); }}
                      style={{ borderColor: isActive ? '#ec4899' : undefined }}
                    >
                      <input type="radio" name="shipping" checked={isActive} readOnly />
                      <span>
                        <strong>{opt.serviceName}</strong> · <span style={{ color: '#dc2626', fontWeight: 600 }}>{formatCurrency(opt.fee)}</span>
                      </span>
                      <small>
                        {opt.provider === 'ghn' ? 'Giao Hàng Nhanh (giá thật)' : opt.provider === 'ghtk' ? 'Giao Hàng Tiết Kiệm (giá thật)' : opt.provider === 'mock' ? 'Mô phỏng nội bộ' : opt.provider}
                        {' · '} Dự kiến {opt.leadTimeHours}h
                      </small>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="ivy-checkout-section">
            <h3 className="ivy-section-title">Phương thức thanh toán</h3>
            <div className="ivy-payment-box">
              <p className="ivy-payment-note">Mọi giao dịch đều được bảo mật và mã hoá. Thông tin thẻ tín dụng sẽ không bao giờ được lưu lại.</p>
              <label className="ivy-radio-option" onClick={() => setPaymentMethod('atm')}>
                <input type="radio" name="payment" checked={paymentMethod === 'atm'} readOnly />
                <span>Thanh toán bằng thẻ ATM / Chuyển khoản</span>
                <small>Hỗ trợ thanh toán online hơn 38 ngân hàng cho bạn Việt Nam</small>
              </label>
              <label className="ivy-radio-option" onClick={() => setPaymentMethod('cod')}>
                <input type="radio" name="payment" checked={paymentMethod === 'cod'} readOnly />
                <span>Thanh toán khi giao hàng (COD)</span>
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
            {comboDiscount > 0 && (
              <div className="ivy-summary-row" style={{ color: '#16a34a' }}>
                <span><i className="fa fa-gift" style={{ marginRight: 4 }}></i>Mua kèm −{combo?.percent}%</span>
                <span>-{formatCurrency(comboDiscount)}</span>
              </div>
            )}
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
