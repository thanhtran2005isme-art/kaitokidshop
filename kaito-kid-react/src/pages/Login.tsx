// Trang đăng nhập/đăng ký - dùng class names từ login.css

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePhone, checkPasswordStrength } from '../utils/validation';

export default function Login() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) { setError('Vui lòng nhập đầy đủ thông tin'); return; }
    setLoading(true);
    setTimeout(async () => {
      const result = await login(loginEmail, loginPassword);
      setLoading(false);
      if (result.success) navigate('/');
      else setError(result.error || 'Đăng nhập thất bại');
    }, 500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!regName || !regEmail || !regPhone || !regPassword || !regConfirm) { setError('Vui lòng nhập đầy đủ thông tin'); return; }
    if (!validateEmail(regEmail)) { setError('Email không hợp lệ'); return; }
    if (!validatePhone(regPhone)) { setError('Số điện thoại không hợp lệ'); return; }
    if (regPassword.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return; }
    if (regPassword !== regConfirm) { setError('Mật khẩu xác nhận không khớp'); return; }
    setLoading(true);
    setTimeout(async () => {
      const result = await register({ name: regName, email: regEmail, phone: regPhone, password: regPassword });
      setLoading(false);
      if (result.success) {
        setSuccess('Đăng ký thành công! Chuyển sang đăng nhập...');
        setTimeout(() => { setTab('login'); setLoginEmail(regEmail); setSuccess(''); }, 2000);
      } else setError(result.error || 'Đăng ký thất bại');
    }, 500);
  };

  const pwStrength = checkPasswordStrength(regPassword);

  return (
    <div className="auth-container" style={{ minHeight: 'calc(100vh - 200px)' }}>
      {/* Left branding */}
      <div className="auth-branding">
        <div className="branding-decoration">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
        <div className="branding-content">
          <div className="brand-logo"><img src="/images/logokaitokid.png" alt="KAITO KID" /></div>
          <h1>Chào mừng đến với KAITO KID</h1>
          <p>Thời trang hiện đại, phong cách riêng biệt</p>
          <div className="brand-features">
            <div className="feature-item"><i className="fa fa-truck"></i><span>Freeship đơn từ 499K</span></div>
            <div className="feature-item"><i className="fa fa-sync"></i><span>Đổi trả trong 7 ngày</span></div>
            <div className="feature-item"><i className="fa fa-shield-alt"></i><span>Bảo hành chất lượng</span></div>
          </div>
        </div>
      </div>

      {/* Right forms */}
      <div className="auth-forms">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>Đăng nhập</button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>Đăng ký</button>
          </div>

          {error && <div className="error-message show">{error}</div>}
          {success && <div className="success-message show">{success}</div>}

          {tab === 'login' ? (
            <div className="auth-form active">
              <div className="form-header">
                <h2>Đăng nhập</h2>
                <p>Nhập thông tin để tiếp tục mua sắm</p>
              </div>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label>Email hoặc số điện thoại</label>
                  <div className="input-wrapper">
                    <i className="fa fa-envelope"></i>
                    <input type="text" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Nhập email hoặc SĐT" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <div className="input-wrapper">
                    <i className="fa fa-lock"></i>
                    <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Nhập mật khẩu" />
                  </div>
                </div>
                <button type="submit" className={`btn-submit ${loading ? 'loading' : ''}`} disabled={loading}>
                  <span>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="auth-form active">
              <div className="form-header">
                <h2>Đăng ký</h2>
                <p>Tạo tài khoản để trải nghiệm mua sắm</p>
              </div>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Họ tên</label>
                  <div className="input-wrapper"><i className="fa fa-user"></i><input value={regName} onChange={e => setRegName(e.target.value)} placeholder="Nhập họ tên" /></div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrapper"><i className="fa fa-envelope"></i><input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Nhập email" /></div>
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <div className="input-wrapper"><i className="fa fa-phone"></i><input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="Nhập SĐT" /></div>
                </div>
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <div className="input-wrapper"><i className="fa fa-lock"></i><input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Nhập mật khẩu" /></div>
                  {regPassword && <div className={`password-strength ${pwStrength}`}></div>}
                </div>
                <div className="form-group">
                  <label>Xác nhận mật khẩu</label>
                  <div className="input-wrapper"><i className="fa fa-lock"></i><input type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} placeholder="Nhập lại mật khẩu" /></div>
                </div>
                <button type="submit" className={`btn-submit ${loading ? 'loading' : ''}`} disabled={loading}>
                  <span>{loading ? 'Đang xử lý...' : 'Đăng ký'}</span>
                </button>
              </form>
            </div>
          )}

          <Link to="/" className="back-home"><i className="fa fa-arrow-left"></i> Về trang chủ</Link>
        </div>
      </div>
    </div>
  );
}
