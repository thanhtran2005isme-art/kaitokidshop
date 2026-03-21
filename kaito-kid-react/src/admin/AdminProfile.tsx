// Hồ sơ Admin - match admin structure

import { useState } from 'react';

export default function AdminProfile() {
  const [activeTab, setActiveTab] = useState('info');
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const [basicInfo, setBasicInfo] = useState({
    fullName: 'Admin',
    displayName: 'Admin',
    email: 'admin@kaitokid.vn',
    phone: '0123 456 789',
    birthday: '1990-01-01',
    gender: 'male'
  });

  const [workInfo, setWorkInfo] = useState({
    position: 'Administrator',
    department: 'Quản trị',
    jobDescription: 'Quản lý toàn bộ hoạt động của website bán hàng KAITO KID.'
  });

  const enableEditing = (section: string) => {
    setEditingSection(section);
  };

  const cancelEditing = () => {
    setEditingSection(null);
  };

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('adminBasicInfo', JSON.stringify(basicInfo));
    setEditingSection(null);
    alert('Đã lưu thông tin cá nhân');
  };

  const handleWorkInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('adminWorkInfo', JSON.stringify(workInfo));
    setEditingSection(null);
    alert('Đã lưu thông tin công việc');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Đã đổi mật khẩu thành công');
  };

  return (
    <>
      {/* Profile Header */}
      <div className="card" style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ 
              width: 100, 
              height: 100, 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.2)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: 40,
              border: '4px solid rgba(255,255,255,0.3)'
            }}>
              <i className="fa fa-user"></i>
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, marginBottom: 8, fontSize: 32 }}>{basicInfo.displayName}</h1>
              <p style={{ margin: 0, opacity: 0.9, fontSize: 16 }}>
                <i className="fa fa-shield-alt"></i> {workInfo.position}
              </p>
              <p style={{ margin: 0, marginTop: 8, opacity: 0.8, fontSize: 14 }}>
                <i className="fa fa-calendar-alt"></i> Tham gia từ 01/01/2024
              </p>
            </div>
            <div style={{ display: 'flex', gap: 32 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 600 }}>0</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>Đơn xử lý</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 600 }}>0</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>SP cập nhật</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 600 }}>0</div>
                <div style={{ fontSize: 13, opacity: 0.9 }}>Đánh giá duyệt</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ marginBottom: 24, padding: 0 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
            style={{ 
              flex: 1, 
              padding: '16px 24px', 
              background: activeTab === 'info' ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'info' ? '2px solid #667eea' : '2px solid transparent',
              color: activeTab === 'info' ? '#667eea' : '#888',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 500
            }}
          >
            <i className="fa fa-user"></i> Thông tin cá nhân
          </button>
          <button 
            className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
            style={{ 
              flex: 1, 
              padding: '16px 24px', 
              background: activeTab === 'security' ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === 'security' ? '2px solid #667eea' : '2px solid transparent',
              color: activeTab === 'security' ? '#667eea' : '#888',
              cursor: 'pointer',
              fontSize: 15,
              fontWeight: 500
            }}
          >
            <i className="fa fa-lock"></i> Bảo mật
          </button>
        </div>
      </div>

      {/* Info Tab */}
      {activeTab === 'info' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {/* Basic Info */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0 }}><i className="fa fa-user"></i> Thông tin cơ bản</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => enableEditing('basic')}>
                <i className="fa fa-edit"></i> Chỉnh sửa
              </button>
            </div>
            <form onSubmit={handleBasicInfoSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Họ và tên</label>
                  <input 
                    className="form-control" 
                    value={basicInfo.fullName}
                    onChange={e => setBasicInfo({ ...basicInfo, fullName: e.target.value })}
                    disabled={editingSection !== 'basic'}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tên hiển thị</label>
                  <input 
                    className="form-control" 
                    value={basicInfo.displayName}
                    onChange={e => setBasicInfo({ ...basicInfo, displayName: e.target.value })}
                    disabled={editingSection !== 'basic'}
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input 
                    className="form-control" 
                    type="email"
                    value={basicInfo.email}
                    onChange={e => setBasicInfo({ ...basicInfo, email: e.target.value })}
                    disabled={editingSection !== 'basic'}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input 
                    className="form-control" 
                    value={basicInfo.phone}
                    onChange={e => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                    disabled={editingSection !== 'basic'}
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Ngày sinh</label>
                  <input 
                    className="form-control" 
                    type="date"
                    value={basicInfo.birthday}
                    onChange={e => setBasicInfo({ ...basicInfo, birthday: e.target.value })}
                    disabled={editingSection !== 'basic'}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Giới tính</label>
                  <select 
                    className="form-control"
                    value={basicInfo.gender}
                    onChange={e => setBasicInfo({ ...basicInfo, gender: e.target.value })}
                    disabled={editingSection !== 'basic'}
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>
              {editingSection === 'basic' && (
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={cancelEditing}>Hủy</button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fa fa-save"></i> Lưu thay đổi
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Work Info */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ margin: 0 }}><i className="fa fa-briefcase"></i> Thông tin công việc</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => enableEditing('work')}>
                <i className="fa fa-edit"></i> Chỉnh sửa
              </button>
            </div>
            <form onSubmit={handleWorkInfoSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Vị trí</label>
                  <input 
                    className="form-control" 
                    value={workInfo.position}
                    onChange={e => setWorkInfo({ ...workInfo, position: e.target.value })}
                    disabled={editingSection !== 'work'}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phòng ban</label>
                  <input 
                    className="form-control" 
                    value={workInfo.department}
                    onChange={e => setWorkInfo({ ...workInfo, department: e.target.value })}
                    disabled={editingSection !== 'work'}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả công việc</label>
                <textarea 
                  className="form-control" 
                  rows={3}
                  value={workInfo.jobDescription}
                  onChange={e => setWorkInfo({ ...workInfo, jobDescription: e.target.value })}
                  disabled={editingSection !== 'work'}
                />
              </div>
              {editingSection === 'work' && (
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={cancelEditing}>Hủy</button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fa fa-save"></i> Lưu thay đổi
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
          {/* Change Password */}
          <div className="card">
            <h3 style={{ marginBottom: 24 }}><i className="fa fa-key"></i> Đổi mật khẩu</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Mật khẩu hiện tại</label>
                <input className="form-control" type="password" required />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <input className="form-control" type="password" required />
              </div>
              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu mới</label>
                <input className="form-control" type="password" required />
              </div>
              <button type="submit" className="btn btn-primary">
                <i className="fa fa-lock"></i> Đổi mật khẩu
              </button>
            </form>
          </div>

          {/* Security Options */}
          <div className="card">
            <h3 style={{ marginBottom: 24 }}><i className="fa fa-shield-alt"></i> Bảo mật tài khoản</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div>
                  <h4 style={{ margin: 0, marginBottom: 4 }}>Xác thực 2 bước</h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Bảo vệ tài khoản bằng mã xác thực gửi qua SMS</p>
                </div>
                <label className="form-check">
                  <input className="form-check-input" type="checkbox" />
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div>
                  <h4 style={{ margin: 0, marginBottom: 4 }}>Thông báo đăng nhập</h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Gửi email thông báo khi có đăng nhập mới</p>
                </div>
                <label className="form-check">
                  <input className="form-check-input" type="checkbox" defaultChecked />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}