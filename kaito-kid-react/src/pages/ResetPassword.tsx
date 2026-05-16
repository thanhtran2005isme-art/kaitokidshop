import { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { PiLockKeyFill, PiCheckCircleFill, PiArrowLeftBold } from 'react-icons/pi';
import { authApi } from '../services/api/authApi';
import toast from 'react-hot-toast';
import { checkPasswordStrength } from '../utils/validation';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const strength = useMemo(() => pw ? checkPasswordStrength(pw) : null, [pw]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Link không hợp lệ.');
      return;
    }
    if (pw.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (pw !== pw2) {
      toast.error('Mật khẩu nhập lại không khớp');
      return;
    }
    setLoading(true);
    const r = await authApi.resetPassword(token, pw);
    setLoading(false);
    if (r.success) {
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } else {
      toast.error(r.error || 'Đặt lại mật khẩu thất bại');
    }
  };

  if (!token) {
    return (
      <div style={{ padding: 80, textAlign: 'center' }}>
        <h2 style={{ color: '#dc2626' }}>Link không hợp lệ</h2>
        <p style={{ color: '#64748b' }}>Vui lòng gửi yêu cầu đặt lại mật khẩu mới.</p>
        <Link to="/forgot-password" style={{ color: '#ec4899' }}>← Quên mật khẩu</Link>
      </div>
    );
  }

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

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <PiCheckCircleFill style={{ fontSize: 64, color: '#16a34a' }} />
            <h2 style={{ margin: '16px 0 8px', color: '#0f172a' }}>Thành công!</h2>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              Mật khẩu đã được đặt lại. Bạn sẽ được chuyển đến trang đăng nhập...
            </p>
          </div>
        ) : (
          <>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, color: '#0f172a' }}>Đặt lại mật khẩu</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
              Tạo mật khẩu mới cho tài khoản của bạn.
            </p>
            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mật khẩu mới</label>
              <div style={{ position: 'relative', marginBottom: strength ? 6 : 14 }}>
                <PiLockKeyFill style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
                />
              </div>
              {strength && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                  {(['weak','medium','strong'] as const).map((lv, idx) => (
                    <div key={lv} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: ['#dc2626','#f59e0b','#16a34a'][idx],
                      opacity: (strength === 'weak' && idx <= 0) ||
                              (strength === 'medium' && idx <= 1) ||
                              (strength === 'strong' && idx <= 2) ? 1 : 0.2,
                    }} />
                  ))}
                </div>
              )}

              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nhập lại mật khẩu</label>
              <div style={{ position: 'relative', marginBottom: 20 }}>
                <PiLockKeyFill style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
                />
                {pw2 && pw && pw !== pw2 && (
                  <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>Mật khẩu không khớp</div>
                )}
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
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
