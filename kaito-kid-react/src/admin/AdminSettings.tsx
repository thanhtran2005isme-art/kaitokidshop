import { useState, useEffect } from 'react';

type TabType = 'general' | 'payment' | 'shipping' | 'email' | 'notifications' | 'security';

interface Settings {
  storeName: string;
  storeSlogan: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  codEnabled: boolean;
  codFee: number;
  bankEnabled: boolean;
  defaultShippingFee: number;
  freeShippingFrom: number;
  estimatedDelivery: string;
  enableTracking: boolean;
  smtpHost: string;
  smtpPort: number;
  smtpEmail: string;
  emailOrderConfirm: boolean;
  emailShipping: boolean;
  emailDelivered: boolean;
  notifyNewOrder: boolean;
  notifyCancelOrder: boolean;
  notifyLowStock: boolean;
  notifyOutOfStock: boolean;
  notifyNewReview: boolean;
  notifyNewCustomer: boolean;
  enable2FA: boolean;
  loginNotification: boolean;
}

const defaultSettings: Settings = {
  storeName: 'KAITO KID Fashion',
  storeSlogan: 'Thời trang hiện đại - Phong cách trẻ trung',
  storeEmail: 'contact@kaitokid.com',
  storePhone: '1900 1234',
  storeAddress: '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
  codEnabled: true,
  codFee: 0,
  bankEnabled: true,
  defaultShippingFee: 30000,
  freeShippingFrom: 500000,
  estimatedDelivery: '2-3 ngày',
  enableTracking: true,
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpEmail: 'noreply@kaitokid.com',
  emailOrderConfirm: true,
  emailShipping: true,
  emailDelivered: true,
  notifyNewOrder: true,
  notifyCancelOrder: true,
  notifyLowStock: true,
  notifyOutOfStock: true,
  notifyNewReview: true,
  notifyNewCustomer: false,
  enable2FA: false,
  loginNotification: true,
};

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('adminSettings') || '{}');
    setSettings({ ...defaultSettings, ...saved });
  }, []);

  const handleSave = (section: string) => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    setMsg(`Đã lưu cài đặt ${section}!`);
    setTimeout(() => setMsg(''), 3000);
  };

  const tabs = [
    { id: 'general' as const, icon: 'fa-store', label: 'Thông tin cửa hàng' },
    { id: 'payment' as const, icon: 'fa-credit-card', label: 'Thanh toán' },
    { id: 'shipping' as const, icon: 'fa-truck', label: 'Vận chuyển' },
    { id: 'email' as const, icon: 'fa-envelope', label: 'Email' },
    { id: 'notifications' as const, icon: 'fa-bell', label: 'Thông báo' },
    { id: 'security' as const, icon: 'fa-shield-alt', label: 'Bảo mật' },
  ];

  return (
    <div className="content-wrapper">
      {msg && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          <i className="fa fa-check-circle"></i> {msg}
        </div>
      )}

      {/* Settings Tabs */}
      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`fa ${tab.icon}`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="settings-content">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="settings-panel active">
            <div className="settings-card">
              <h3 className="settings-card-title">Thông tin cửa hàng</h3>

              <div className="form-group">
                <label>Tên cửa hàng</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={e => setSettings({ ...settings, storeName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Slogan</label>
                <input
                  type="text"
                  value={settings.storeSlogan}
                  onChange={e => setSettings({ ...settings, storeSlogan: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email liên hệ</label>
                  <input
                    type="email"
                    value={settings.storeEmail}
                    onChange={e => setSettings({ ...settings, storeEmail: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    value={settings.storePhone}
                    onChange={e => setSettings({ ...settings, storePhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Địa chỉ</label>
                <textarea
                  rows={3}
                  value={settings.storeAddress}
                  onChange={e => setSettings({ ...settings, storeAddress: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Logo cửa hàng</label>
                <div className="logo-upload">
                  <img src="/images/logokaitokid.png" alt="Logo" className="logo-preview" />
                  <button type="button" className="btn-upload">
                    <i className="fa fa-upload"></i> Tải logo lên
                  </button>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-primary" onClick={() => handleSave('thông tin cửa hàng')}>
                  <i className="fa fa-save"></i> Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Settings */}
        {activeTab === 'payment' && (
          <div className="settings-panel active">
            <div className="settings-card">
              <h3 className="settings-card-title">Phương thức thanh toán</h3>

              {/* COD Payment */}
              <div className="payment-method">
                <div className="payment-method-header">
                  <div className="payment-method-info">
                    <i className="fa fa-money-bill-wave"></i>
                    <div>
                      <h4>Thanh toán khi nhận hàng (COD)</h4>
                      <p>Khách hàng thanh toán tiền mặt khi nhận hàng</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.codEnabled}
                      onChange={e => setSettings({ ...settings, codEnabled: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                {settings.codEnabled && (
                  <div className="payment-method-details">
                    <div className="form-group">
                      <label>Phí COD (%)</label>
                      <input
                        type="number"
                        value={settings.codFee}
                        onChange={e => setSettings({ ...settings, codFee: Number(e.target.value) })}
                        min="0"
                        max="100"
                        step="0.5"
                      />
                      <span className="help-text">
                        Phí thu thêm cho thanh toán COD (% trên tổng đơn hàng)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bank Transfer */}
              <div className="payment-method">
                <div className="payment-method-header">
                  <div className="payment-method-info">
                    <i className="fa fa-university"></i>
                    <div>
                      <h4>Chuyển khoản ngân hàng</h4>
                      <p>Khách hàng chuyển khoản trước khi giao hàng</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.bankEnabled}
                      onChange={e => setSettings({ ...settings, bankEnabled: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                {settings.bankEnabled && (
                  <div className="payment-method-details">
                    <div className="bank-accounts-list">
                      <div className="bank-account-item">
                        <div className="form-group">
                          <label>Tên ngân hàng</label>
                          <select className="bank-name">
                            <option value="Vietcombank">Vietcombank</option>
                            <option value="VietinBank">VietinBank</option>
                            <option value="BIDV">BIDV</option>
                            <option value="Agribank">Agribank</option>
                            <option value="Techcombank">Techcombank</option>
                            <option value="MB Bank">MB Bank</option>
                            <option value="ACB">ACB</option>
                          </select>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Số tài khoản</label>
                            <input type="text" className="bank-account" defaultValue="1234567890" />
                          </div>
                          <div className="form-group">
                            <label>Chủ tài khoản</label>
                            <input type="text" className="bank-owner" defaultValue="Trần Ngọc Thanh" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button className="btn-primary" onClick={() => handleSave('thanh toán')}>
                  <i className="fa fa-save"></i> Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Settings */}
        {activeTab === 'shipping' && (
          <div className="settings-panel active">
            <div className="settings-card">
              <h3 className="settings-card-title">Cài đặt vận chuyển</h3>

              <div className="form-group">
                <label>Phí vận chuyển mặc định</label>
                <input
                  type="number"
                  value={settings.defaultShippingFee}
                  onChange={e =>
                    setSettings({ ...settings, defaultShippingFee: Number(e.target.value) })
                  }
                  min="0"
                />
                <span className="help-text">Phí ship áp dụng cho tất cả đơn hàng</span>
              </div>

              <div className="form-group">
                <label>Miễn phí ship cho đơn từ</label>
                <input
                  type="number"
                  value={settings.freeShippingFrom}
                  onChange={e =>
                    setSettings({ ...settings, freeShippingFrom: Number(e.target.value) })
                  }
                  min="0"
                />
                <span className="help-text">Đơn hàng từ giá trị này sẽ được freeship</span>
              </div>

              <div className="form-group">
                <label>Thời gian giao hàng dự kiến</label>
                <input
                  type="text"
                  value={settings.estimatedDelivery}
                  onChange={e => setSettings({ ...settings, estimatedDelivery: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={settings.enableTracking}
                    onChange={e => setSettings({ ...settings, enableTracking: e.target.checked })}
                  />
                  <span>Cho phép khách hàng tra cứu đơn hàng</span>
                </label>
              </div>

              <div className="form-actions">
                <button className="btn-primary" onClick={() => handleSave('vận chuyển')}>
                  <i className="fa fa-save"></i> Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === 'email' && (
          <div className="settings-panel active">
            <div className="settings-card">
              <h3 className="settings-card-title">Cấu hình Email</h3>

              <div className="form-row">
                <div className="form-group">
                  <label>SMTP Host</label>
                  <input
                    type="text"
                    value={settings.smtpHost}
                    onChange={e => setSettings({ ...settings, smtpHost: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>SMTP Port</label>
                  <input
                    type="number"
                    value={settings.smtpPort}
                    onChange={e => setSettings({ ...settings, smtpPort: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email gửi</label>
                  <input
                    type="email"
                    value={settings.smtpEmail}
                    onChange={e => setSettings({ ...settings, smtpEmail: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <input type="password" defaultValue="********" />
                </div>
              </div>

              <div className="email-templates">
                <h4>Mẫu email tự động</h4>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.emailOrderConfirm}
                      onChange={e =>
                        setSettings({ ...settings, emailOrderConfirm: e.target.checked })
                      }
                    />
                    <span>Gửi email xác nhận đơn hàng</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.emailShipping}
                      onChange={e => setSettings({ ...settings, emailShipping: e.target.checked })}
                    />
                    <span>Gửi email thông báo giao hàng</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.emailDelivered}
                      onChange={e => setSettings({ ...settings, emailDelivered: e.target.checked })}
                    />
                    <span>Gửi email xác nhận đã giao</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-secondary">
                  <i className="fa fa-paper-plane"></i> Gửi email test
                </button>
                <button className="btn-primary" onClick={() => handleSave('email')}>
                  <i className="fa fa-save"></i> Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="settings-panel active">
            <div className="settings-card">
              <h3 className="settings-card-title">Cài đặt thông báo</h3>

              <div className="notification-group">
                <h4>Thông báo đơn hàng</h4>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifyNewOrder}
                      onChange={e => setSettings({ ...settings, notifyNewOrder: e.target.checked })}
                    />
                    <span>Đơn hàng mới</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifyCancelOrder}
                      onChange={e =>
                        setSettings({ ...settings, notifyCancelOrder: e.target.checked })
                      }
                    />
                    <span>Đơn hàng bị hủy</span>
                  </label>
                </div>
              </div>

              <div className="notification-group">
                <h4>Thông báo sản phẩm</h4>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifyLowStock}
                      onChange={e => setSettings({ ...settings, notifyLowStock: e.target.checked })}
                    />
                    <span>Sản phẩm sắp hết hàng</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifyOutOfStock}
                      onChange={e =>
                        setSettings({ ...settings, notifyOutOfStock: e.target.checked })
                      }
                    />
                    <span>Sản phẩm hết hàng</span>
                  </label>
                </div>
              </div>

              <div className="notification-group">
                <h4>Thông báo khác</h4>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifyNewReview}
                      onChange={e =>
                        setSettings({ ...settings, notifyNewReview: e.target.checked })
                      }
                    />
                    <span>Đánh giá mới</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifyNewCustomer}
                      onChange={e =>
                        setSettings({ ...settings, notifyNewCustomer: e.target.checked })
                      }
                    />
                    <span>Khách hàng mới đăng ký</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-primary" onClick={() => handleSave('thông báo')}>
                  <i className="fa fa-save"></i> Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="settings-panel active">
            <div className="settings-card">
              <h3 className="settings-card-title">Bảo mật</h3>

              <div className="form-group">
                <label>Đổi mật khẩu</label>
                <input type="password" placeholder="Mật khẩu hiện tại" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <input type="password" placeholder="Mật khẩu mới" />
                </div>
                <div className="form-group">
                  <label>Xác nhận mật khẩu</label>
                  <input type="password" placeholder="Nhập lại mật khẩu" />
                </div>
              </div>

              <div className="form-group">
                <button className="btn-primary">
                  <i className="fa fa-key"></i> Đổi mật khẩu
                </button>
              </div>

              <hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

              <div className="security-options">
                <h4>Tùy chọn bảo mật</h4>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.enable2FA}
                      onChange={e => setSettings({ ...settings, enable2FA: e.target.checked })}
                    />
                    <span>Bật xác thực 2 bước (2FA)</span>
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.loginNotification}
                      onChange={e =>
                        setSettings({ ...settings, loginNotification: e.target.checked })
                      }
                    />
                    <span>Thông báo khi đăng nhập từ thiết bị mới</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-primary" onClick={() => handleSave('bảo mật')}>
                  <i className="fa fa-save"></i> Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
