// Trang tài khoản - thay thế taikhoan.html + account.js

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail } from '../utils/validation';

export default function Account() {
  const { user, isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [msg, setMsg] = useState('');

  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');

  const saveProfile = () => {
    if (!name.trim()) { setMsg('Vui lòng nhập họ tên'); return; }
    if (!validateEmail(email)) { setMsg('Email không hợp lệ'); return; }
    const current = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const updated = { ...current, name, email, phone };
    localStorage.setItem('currentUser', JSON.stringify(updated));
    setEditing(false);
    setMsg('Đã cập nhật thành công!');
    setTimeout(() => setMsg(''), 3000);
  };

  const changePassword = () => {
    if (!curPwd) { setPwdMsg('Nhập mật khẩu hiện tại'); return; }
    if (newPwd.length < 6) { setPwdMsg('Mật khẩu mới ít nhất 6 ký tự'); return; }
    if (newPwd !== confirmPwd) { setPwdMsg('Mật khẩu xác nhận không khớp'); return; }
    setPwdMsg('Đổi mật khẩu thành công!');
    setCurPwd(''); setNewPwd(''); setConfirmPwd('');
    setTimeout(() => setPwdMsg(''), 3000);
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
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
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

          {/* Profile Section */}
          <div className="account-section">
            <div className="section-header">
              <h2><i className="fa fa-user"></i> Thông tin cá nhân</h2>
              <button className="btn-edit" onClick={() => editing ? saveProfile() : setEditing(true)}>
                <i className={`fa ${editing ? 'fa-check' : 'fa-edit'}`}></i> {editing ? 'Lưu' : 'Chỉnh sửa'}
              </button>
            </div>
            {msg && <div className={`toast show ${msg.includes('thành công') ? 'success' : 'error'}`} style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginBottom: 12 }}>{msg}</div>}
            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Họ tên <span className="required">*</span></label>
                  <input value={name} onChange={e => setName(e.target.value)} disabled={!editing} />
                </div>
                <div className="form-group">
                  <label>Email <span className="required">*</span></label>
                  <input value={email} onChange={e => setEmail(e.target.value)} disabled={!editing} />
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
            {pwdMsg && <div className={`toast show ${pwdMsg.includes('thành công') ? 'success' : 'error'}`} style={{ position: 'relative', top: 0, right: 0, transform: 'none', marginBottom: 12 }}>{pwdMsg}</div>}
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
                <button className="btn-save" onClick={changePassword}>
                  <i className="fa fa-key"></i> Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
