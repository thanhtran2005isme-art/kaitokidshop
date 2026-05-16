import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PiEnvelopeFill, PiArrowLeftBold, PiCheckCircleFill } from 'react-icons/pi';
import { authApi } from '../services/api/authApi';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    setLoading(true);
    const r = await authApi.forgotPassword(email.trim().toLowerCase());
    setLoading(false);
    if (r.success) {
      setSent(true);
    } else {
      toast.error(r.error || 'Có lỗi xảy ra');
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '60px 20px', background: '#f8fafc',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '40px 36px',
        maxWidth: 460, width: '100%', boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
      }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 13, textDecoration: 'none', marginBottom: 16 }}>
          <PiArrowLeftBold /> Quay lại đăng nhập
        </Link>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <PiCheckCircleFill style={{ fontSize: 64, color: '#16a34a' }} />
            <h2 style={{ margin: '16px 0 8px', color: '#0f172a' }}>Đã gửi email</h2>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>
              Nếu email <strong>{email}</strong> tồn tại trong hệ thống, link đặt lại mật khẩu đã được gửi.
              Vui lòng kiểm tra hộp thư trong vài phút tới.
            </p>
            <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 12 }}>
              Link có hiệu lực trong 30 phút.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                marginTop: 20, padding: '10px 24px', background: '#0f172a', color: '#fff',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
              }}
            >Về đăng nhập</button>
          </div>
        ) : (
          <>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, color: '#0f172a' }}>Quên mật khẩu?</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
              Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.
            </p>
            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <PiEnvelopeFill style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  autoFocus
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px',
                    border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: 14, background: loading ? '#94a3b8' : '#ec4899',
                  color: '#fff', border: 'none', borderRadius: 8,
                  fontSize: 15, fontWeight: 700, cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#64748b' }}>
              Nhớ ra rồi? <Link to="/login" style={{ color: '#ec4899', fontWeight: 600 }}>Đăng nhập</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
