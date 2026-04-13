// Trang đăng nhập/đăng ký - MIGRATED VERSION với API Integration
// Thay đổi chính:
// 1. login() và register() giờ là async
// 2. Thêm proper loading states
// 3. Better error handling từ API

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePhone, checkPasswordStrength } from '../utils/validation';
import toast from 'react-hot-toast';

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

  // ============================================================
  // THAY ĐỔI: handleLogin giờ là async
  // ============================================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!loginEmail || !loginPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);

    try {
      // THAY ĐỔI: login() giờ trả về Promise
      const result = await login(loginEmail, loginPassword);

      if (result.success) {
        toast.success('Đăng nhập thành công!');
        navigate('/');
      } else {
        // THAY ĐỔI: Error message từ API
        setError(result.error || 'Đăng nhập thất bại');
        toast.error(result.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi kết nối');
      toast.error('Đã xảy ra lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // THAY ĐỔI: handleRegister giờ là async
  // ============================================================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!regName || !regEmail || !regPhone || !regPassword || !regConfirm) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (!validateEmail(regEmail)) {
      setError('Email không hợp lệ');
      return;
    }
    if (!validatePhone(regPhone)) {
      setError('Số điện thoại không hợp lệ');
      return;
    }
    if (regPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      // THAY ĐỔI: register() giờ trả về Promise
      const result = await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
      });

      if (result.success) {
        setSuccess('Đăng ký thành công! Chuyển sang đăng nhập...');
        toast.success('Đăng ký thành công!');

        // Reset form và chuyển sang tab login
        setTimeout(() => {
          setTab('login');
          setLoginEmail(regEmail);
          setSuccess('');
          // Clear register form
          setRegName('');
          setRegEmail('');
          setRegPhone('');
          setRegPassword('');
          setRegConfirm('');
        }, 2000);
      } else {
        // THAY ĐỔI: Error message từ API
        setError(result.error || 'Đăng ký thất bại');
        toast.error(result.error || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi kết nối');
      toast.error('Đã xảy ra lỗi kết nối');
    } finally {
      setLoading(false);
    }
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
          <div className="brand-logo">
            <img src="/images/logokaitokid.png" alt="KAITO KID" />
          </div>
          <h1>Chào mừng đến với KAITO KID</h1>
          <p>Thời trang hiện đại, phong cách riêng biệt</p>
          <div className="brand-features">
            <div className="feature-item">
              <i className="fa fa-truck"></i>
              <span>Freeship đơn từ 499K</span>
            </div>
            <div className="feature-item">
              <i className="fa fa-sync"></i>
              <span>Đổi trả trong 7 ngày</span>
            </div>
            <div className="feature-item">
              <i className="fa fa-shield-alt"></i>
              <span>Bảo hành chất lượng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right forms */}
      <div className="auth-forms">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setTab('login');
                setError('');
                setSuccess('');
              }}
            >
              Đăng nhập
            </button>
            <button
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => {
                setTab('register');
                setError('');
                setSuccess('');
              }}
            >
              Đăng ký
            </button>
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
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Nhập email hoặc SĐT"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <div className="input-wrapper">
                    <i className="fa fa-lock"></i>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      disabled={loading}
                    />
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
                  <div className="input-wrapper">
                    <i className="fa fa-user"></i>
                    <input
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Nhập họ tên"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <div className="input-wrapper">
                    <i className="fa fa-envelope"></i>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="Nhập email"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <div className="input-wrapper">
                    <i className="fa fa-phone"></i>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="Nhập SĐT"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Mật khẩu</label>
                  <div className="input-wrapper">
                    <i className="fa fa-lock"></i>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      disabled={loading}
                    />
                  </div>
                  {regPassword && <div className={`password-strength ${pwStrength}`}></div>}
                </div>
                <div className="form-group">
                  <label>Xác nhận mật khẩu</label>
                  <div className="input-wrapper">
                    <i className="fa fa-lock"></i>
                    <input
                      type="password"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      disabled={loading}
                    />
                  </div>
                </div>
                <button type="submit" className={`btn-submit ${loading ? 'loading' : ''}`} disabled={loading}>
                  <span>{loading ? 'Đang xử lý...' : 'Đăng ký'}</span>
                </button>
              </form>
            </div>
          )}

          <Link to="/" className="back-home">
            <i className="fa fa-arrow-left"></i> Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}