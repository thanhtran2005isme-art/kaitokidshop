// Trang tài khoản - kết nối backend qua /api/account và /api/auth/change-password

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { accountApi } from '../services/api';

export default function Account() {
  const { user, isAdmin, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdMsgType, setPwdMsgType] = useState<'success' | 'error'>('success');
  const [changingPwd, setChangingPwd] = useState(false);

  // Load profile từ backend
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const result = await accountApi.getProfile();
      if (result.success && result.data) {
        setName(result.data.name || '');
        setEmail(result.data.email || '');
        setPhone(result.data.phone || '');
        setAvatar(result.data.avatar || '');
      } else if (user) {
        // Fallback to user from auth context
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
      }
      setLoading(false);
    };
    void loadProfile();
  }, [user]);

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg(text);
    setMsgType(type);
    window.setTimeout(() => setMsg(''), 3000);
  };

  const showPwdMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setPwdMsg(text);
    setPwdMsgType(type);
    window.setTimeout(() => setPwdMsg(''), 3000);
  };

  const saveProfile = async () => {
    if (!name.trim()) { showMsg('Vui lòng nhập họ tên', 'error'); return; }

    setSaving(true);
    const result = await accountApi.updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      avatar: avatar || undefined,
    });
    setSaving(false);

    if (result.success) {
      showMsg('Đã cập nhật thành công!');
      setEditing(false);
      // Sync với auth context
      await refreshUser();
    } else {
      showMsg(result.error || 'Không thể cập nhật. Vui lòng thử lại.', 'error');
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showMsg('Vui lòng chọn file ảnh hợp lệ', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showMsg('Ảnh không được lớn hơn 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      setAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const changePassword = async () => {
    if (!curPwd) { showPwdMsg('Nhập mật khẩu hiện tại', 'error'); return; }
    if (newPwd.length < 6) { showPwdMsg('Mật khẩu mới ít nhất 6 ký tự', 'error'); return; }
    if (newPwd !== confirmPwd) { showPwdMsg('Mật khẩu xác nhận không khớp', 'error'); return; }

    setChangingPwd(true);
    const result = await accountApi.changePassword({
      currentPassword: curPwd,
      newPassword: newPwd,
    });
    setChangingPwd(false);

    if (result.success) {
      showPwdMsg('Đổi mật khẩu thành công!');
      setCurPwd(''); setNewPwd(''); setConfirmPwd('');
    } else {
      showPwdMsg(result.error || 'Không thể đổi mật khẩu', 'error');
    }
  };

  const sidebarLinks = [
    { to: '/account', icon: 'fa-user', label: 'Thông tin tài khoản', active: true },
    { to: '/orders', icon: 'fa-box', label: 'Đơn hàng của tôi' },
    { to: '/wishlist', icon: 'fa-heart', label: 'Sản phẩm yêu thích' },
    { to: '/address', icon: 'fa-location-dot', label: 'Địa chỉ giao hàng' },
  ];

  return (
    <div className="account-page">
      <div className="account-container">
        {/* Sidebar */}
        <div className="account-sidebar">
          <div className="user-profile-card">
            <div className="user-avatar">
              {avatar ? (
                <img src={avatar} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <h3>{name || user?.name}</h3>
            <p>{email || user?.email}</p>
          </div>
          <nav className="account-nav">
            {sidebarLinks.map(link => (
              <Link key={link.to} to={link.to} className={`nav-item ${link.active ? 'active' : ''}`}>
                <i className={`fa ${link.icon}`}></i> {link.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <div className="nav-divider"></div>
                <Link to="/admin/dashboard" className="nav-item">
                  <i className="fa fa-shield-alt"></i> Trang quản trị
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Main Content */}
        <div className="account-main">
          <div className="account-header">
            <h1>Thông tin tài khoản</h1>
            <p>Quản lý thông tin cá nhân của bạn</p>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <i className="fa fa-spinner fa-spin"></i> Đang tải thông tin...
            </div>
          ) : (
            <>
              {/* Profile Section */}
              <div className="account-section">
                <div className="section-header">
                  <h2><i className="fa fa-user"></i> Thông tin cá nhân</h2>
                  <button className="btn-edit" onClick={() => editing ? saveProfile() : setEditing(true)} disabled={saving}>
                    <i className={`fa ${editing ? (saving ? 'fa-spinner fa-spin' : 'fa-check') : 'fa-edit'}`}></i>
                    {' '}{editing ? (saving ? 'Đang lưu...' : 'Lưu') : 'Chỉnh sửa'}
                  </button>
                </div>
                {msg && (
                  <div className={`toast show ${msgType}`} style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginBottom: 12 }}>
                    {msg}
                  </div>
                )}

                {/* Avatar upload */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '32px', fontWeight: 700, color: '#64748b' }}>
                    {avatar ? (
                      <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  {editing && (
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#eff6ff', color: '#2563eb', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <i className="fa fa-camera"></i> Đổi avatar
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                    </label>
                  )}
                </div>

                <div className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Họ tên <span className="required">*</span></label>
                      <input value={name} onChange={e => setName(e.target.value)} disabled={!editing} />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input value={email} disabled title="Email không thể thay đổi" style={{ background: '#f8fafc', color: '#64748b' }} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Số điện thoại</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} disabled={!editing} />
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="account-section">
                <div className="section-header">
                  <h2><i className="fa fa-lock"></i> Đổi mật khẩu</h2>
                </div>
                {pwdMsg && (
                  <div className={`toast show ${pwdMsgType}`} style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginBottom: 12 }}>
                    {pwdMsg}
                  </div>
                )}
                <div className="password-form">
                  <div className="form-group">
                    <label>Mật khẩu hiện tại</label>
                    <input type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Mật khẩu mới</label>
                      <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Xác nhận mật khẩu</label>
                      <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button className="btn-save" onClick={changePassword} disabled={changingPwd}>
                      <i className={`fa ${changingPwd ? 'fa-spinner fa-spin' : 'fa-key'}`}></i>
                      {' '}{changingPwd ? 'Đang đổi...' : 'Đổi mật khẩu'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
