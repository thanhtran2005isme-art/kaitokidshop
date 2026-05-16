import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PiCheckCircleFill, PiXCircleFill, PiSpinnerGapBold } from 'react-icons/pi';
import { authApi } from '../services/api/authApi';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Link không hợp lệ.');
      return;
    }
    void authApi.verifyEmail(token).then((r) => {
      if (r.success && r.data) {
        setStatus('success');
        setMessage(r.data.message);
      } else {
        setStatus('error');
        setMessage(r.error || 'Xác thực thất bại');
      }
    });
  }, [token]);

  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '60px 20px', background: '#f8fafc',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '48px 40px',
        maxWidth: 480, width: '100%', boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
        textAlign: 'center',
      }}>
        {status === 'loading' && (
          <>
            <PiSpinnerGapBold style={{ fontSize: 64, color: '#6366f1', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ marginTop: 16, color: '#0f172a' }}>Đang xác thực...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <PiCheckCircleFill style={{ fontSize: 72, color: '#16a34a' }} />
            <h2 style={{ margin: '16px 0 8px', color: '#0f172a' }}>Xác thực thành công!</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>{message}</p>
            <Link to="/" style={{
              display: 'inline-block', padding: '12px 28px',
              background: '#16a34a', color: '#fff', borderRadius: 8,
              textDecoration: 'none', fontWeight: 600,
            }}>Về trang chủ</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <PiXCircleFill style={{ fontSize: 72, color: '#dc2626' }} />
            <h2 style={{ margin: '16px 0 8px', color: '#0f172a' }}>Xác thực thất bại</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>{message}</p>
            <Link to="/account" style={{
              display: 'inline-block', padding: '12px 28px',
              background: '#0f172a', color: '#fff', borderRadius: 8,
              textDecoration: 'none', fontWeight: 600,
            }}>Vào tài khoản để gửi lại</Link>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
