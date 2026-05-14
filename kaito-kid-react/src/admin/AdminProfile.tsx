import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { formatDate } from '../utils/format';
import {
  pushSecurityActivity,
  readAdminSettings,
  readSecurityActivities,
  saveAdminSettings,
} from '../utils/adminSettingsConfig';
import {
  readAdminProfile,
  saveAdminProfile,
  syncAdminProfileToSession,
  type AdminProfileRecord,
} from '../utils/adminProfileConfig';
import { readStoredReviews } from '../utils/reviewConfig';
import AdminIcon from '../components/admin/AdminIcon';


type ProfileTab = 'overview' | 'security';
type EditableSection = 'basic' | 'work' | null;

interface FlashMessage {
  type: 'success' | 'error';
  text: string;
}

interface PasswordFormState {
  currentPassword: string;
  nextPassword: string;
  confirmPassword: string;
}

function formatDateTime(value?: string) {
  if (!value) {
    return 'Chưa có dữ liệu';
  }

  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return formatDate(value);
  }
}

function buildProfileMetrics() {
  const orders = orderService.getAll();
  const products = productService.getAll();
  const reviews = readStoredReviews();
  const securityActivities = readSecurityActivities();

  return [
    {
      label: 'Don cần theo dõi',
      value: String(
        orders.filter((order) => order.status === 'pending' || order.status === 'confirmed' || order.status === 'shipping').length,
      ),
      detail: `${orders.length} tong đơn hàng`,
    },
    {
      label: 'Sản phẩm đang bán',
      value: String(products.filter((product) => product.status === 'active').length),
      detail: `${products.length} sản phẩm trong hệ thống`,
    },
    {
      label: 'Review đã duyệt',
      value: String(reviews.filter((review) => review.status === 'approved').length),
      detail: `${reviews.filter((review) => review.status !== 'pending').length} review da moderation`,
    },
    {
      label: 'Lan đăng nhập admin',
      value: String(securityActivities.filter((activity) => activity.type === 'admin-login').length),
      detail: securityActivities[0] ? `Gan nhat ${formatDateTime(securityActivities[0].createdAt)}` : 'Chưa có audit log',
    },
  ];
}

export default function AdminProfile() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Build profile from JWT user data instead of localStorage
  const baseProfile = readAdminProfile();
  const initialProfile: AdminProfileRecord = {
    ...baseProfile,
    basic: {
      ...baseProfile.basic,
      fullName: user?.name || baseProfile.basic.fullName,
      email: user?.email || baseProfile.basic.email,
      phone: user?.phone || baseProfile.basic.phone,
    },
  };
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [editingSection, setEditingSection] = useState<EditableSection>(null);
  const [savedProfile, setSavedProfile] = useState<AdminProfileRecord>(initialProfile);
  const [profile, setProfile] = useState<AdminProfileRecord>(initialProfile);
  const [message, setMessage] = useState<FlashMessage | null>(null);
  const [metrics, setMetrics] = useState(() => buildProfileMetrics());
  const [securityActivities, setSecurityActivities] = useState(() => readSecurityActivities().slice(0, 6));
  const [securityOptions, setSecurityOptions] = useState({
    enable2FA: false,
    loginNotification: true,
  });
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: '',
    nextPassword: '',
    confirmPassword: '',
  });

  const adminName = user?.name || profile.basic.displayName || profile.basic.fullName;
  const profilePosition = profile.work.position || 'Administrator';
  const avatarFallback = adminName.charAt(0).toUpperCase();

  const showMessage = (type: FlashMessage['type'], text: string) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 3200);
  };

  const refreshDerivedState = () => {
    setMetrics(buildProfileMetrics());
    setSecurityActivities(readSecurityActivities().slice(0, 6));
    const latestSettings = readAdminSettings();
    setSecurityOptions({
      enable2FA: latestSettings.enable2FA,
      loginNotification: latestSettings.loginNotification,
    });
  };

  const persistProfile = (nextProfile: AdminProfileRecord, successText: string) => {
    const saved = saveAdminProfile(nextProfile);
    syncAdminProfileToSession(saved);
    setSavedProfile(saved);
    setProfile(saved);
    refreshUser();
    refreshDerivedState();
    showMessage('success', successText);
  };

  const handleCancelEdit = (section: EditableSection) => {
    if (!section) {
      return;
    }

    setProfile((currentProfile) => ({
      ...currentProfile,
      [section]: savedProfile[section],
    }));
    setEditingSection(null);
  };

  const handleSaveBasic = (event: React.FormEvent) => {
    event.preventDefault();

    if (!/\S+@\S+\.\S+/.test(profile.basic.email)) {
      showMessage('error', 'Email admin không hợp lệ.');
      return;
    }

    persistProfile(profile, 'Đã lưu thông tin ca nhan admin.');
    setEditingSection(null);
  };

  const handleSaveWork = (event: React.FormEvent) => {
    event.preventDefault();
    persistProfile(profile, 'Đã lưu thông tin cong viec admin.');
    setEditingSection(null);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Vui lòng chọn file anh hợp lệ.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const avatar = typeof reader.result === 'string' ? reader.result : '';
      const nextProfile = {
        ...profile,
        basic: {
          ...profile.basic,
          avatar,
        },
      };

      persistProfile(nextProfile, 'Đã cập nhật avatar admin.');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleSaveSecurityOptions = () => {
    const currentSettings = readAdminSettings();
    saveAdminSettings({
      ...currentSettings,
      enable2FA: securityOptions.enable2FA,
      loginNotification: securityOptions.loginNotification,
    });
    refreshDerivedState();
    showMessage('success', 'Da động bo tùy chọn bảo mật voi Admin Settings.');
  };

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const adminCredentials = JSON.parse(localStorage.getItem('adminCredentials') || '{}');

    if (passwordForm.currentPassword !== adminCredentials.password) {
      showMessage('error', 'Mật khẩu hien tai không dung.');
      return;
    }

    if (passwordForm.nextPassword.length < 6) {
      showMessage('error', 'Mật khẩu mới cần ít nhất 6 ky tu.');
      return;
    }

    if (passwordForm.nextPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'Mật khẩu xac nhan không khop.');
      return;
    }

    localStorage.setItem(
      'adminCredentials',
      JSON.stringify({
        ...adminCredentials,
        password: passwordForm.nextPassword,
        email: profile.basic.email,
      }),
    );

    pushSecurityActivity({
      type: 'password-change',
      title: 'Mật khẩu admin da được thay đổi',
      detail: 'Cập nhật tu trang Hồ sơ Admin.',
    });

    setPasswordForm({
      currentPassword: '',
      nextPassword: '',
      confirmPassword: '',
    });
    refreshDerivedState();
    showMessage('success', 'Da doi mật khẩu admin thành công.');
  };

  return (
    <div className="admin-profile-page">
      {message && (
        <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'}`}>
          <AdminIcon name={message.type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'} />
          <span>{message.text}</span>
        </div>
      )}

      <section className="admin-profile-hero">
        <div className="admin-profile-cover"></div>
        <div className="admin-profile-hero-content">
          <div className="admin-profile-avatar-wrap">
            <div className="admin-profile-avatar">
              {profile.basic.avatar ? (
                <img src={profile.basic.avatar} alt={adminName} />
              ) : (
                <span>{avatarFallback}</span>
              )}
            </div>
            <button type="button" className="admin-profile-avatar-btn" onClick={() => fileInputRef.current?.click()}>
              <AdminIcon name="fa fa-camera" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="admin-profile-file-input"
              onChange={handleAvatarUpload}
            />
          </div>

          <div className="admin-profile-identity">
            <h1>{adminName}</h1>
            <p className="admin-profile-role">
              <AdminIcon name="fa fa-shield-alt" /> {profilePosition}
            </p>
            <p className="admin-profile-meta">
              <AdminIcon name="fa fa-envelope" /> {profile.basic.email}
            </p>
            <p className="admin-profile-meta">
              <AdminIcon name="fa fa-calendar-alt" /> Tham gia tu {formatDate(profile.work.joinedAt)}
            </p>
          </div>

          <div className="admin-profile-hero-actions">
            <Link to="/admin/settings" className="btn btn-outline btn-sm">
              <AdminIcon name="fa fa-cog" /> Động bo voi Settings
            </Link>
          </div>
        </div>

        <div className="admin-profile-metrics">
          {metrics.map((metric) => (
            <div key={metric.label} className="admin-profile-metric-card">
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
              <small>{metric.detail}</small>
            </div>
          ))}
        </div>
      </section>

      <div className="admin-profile-tabs">
        <button
          type="button"
          className={`admin-profile-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <AdminIcon name="fa fa-user" /> Tổng quan
        </button>
        <button
          type="button"
          className={`admin-profile-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <AdminIcon name="fa fa-lock" /> Bảo mật
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="admin-profile-grid">
          <section className="admin-profile-card">
            <div className="admin-profile-card-header">
              <div>
                <h3><AdminIcon name="fa fa-id-card" /> Thông tin ca nhan</h3>
                <p>Dữ liệu này được sync sang thanh admin và session đăng nhập hien tai.</p>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingSection('basic')}>
                <AdminIcon name="fa fa-edit" /> Chinh sửa
              </button>
            </div>

            <form onSubmit={handleSaveBasic}>
              <div className="admin-profile-form-grid">
                <div className="form-group">
                  <label className="form-label">Ho và ten</label>
                  <input
                    className="form-control"
                    value={profile.basic.fullName}
                    onChange={(event) =>
                      setProfile((currentProfile) => ({
                        ...currentProfile,
                        basic: { ...currentProfile.basic, fullName: event.target.value },
                      }))
                    }
                    disabled={editingSection !== 'basic'}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Ten hiển thị</label>
                  <input
                    className="form-control"
                    value={profile.basic.displayName}
                    onChange={(event) =>
                      setProfile((currentProfile) => ({
                        ...currentProfile,
                        basic: { ...currentProfile.basic, displayName: event.target.value },
                      }))
                    }
                    disabled={editingSection !== 'basic'}
                  />
                </div>
              </div>

              <div className="admin-profile-form-grid">
                <div className="form-group">
                  <label className="form-label">Email admin</label>
                  <input
                    className="form-control"
                    type="email"
                    value={profile.basic.email}
                    onChange={(event) =>
                      setProfile((currentProfile) => ({
                        ...currentProfile,
                        basic: { ...currentProfile.basic, email: event.target.value },
                      }))
                    }
                    disabled={editingSection !== 'basic'}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    className="form-control"
                    value={profile.basic.phone}
                    onChange={(event) =>
                      setProfile((currentProfile) => ({
                        ...currentProfile,
                        basic: { ...currentProfile.basic, phone: event.target.value },
                      }))
                    }
                    disabled={editingSection !== 'basic'}
                  />
                </div>
              </div>

              <div className="admin-profile-form-grid">
                <div className="form-group">
                  <label className="form-label">Ngay sinh</label>
                  <input
                    className="form-control"
                    type="date"
                    value={profile.basic.birthday}
                    onChange={(event) =>
                      setProfile((currentProfile) => ({
                        ...currentProfile,
                        basic: { ...currentProfile.basic, birthday: event.target.value },
                      }))
                    }
                    disabled={editingSection !== 'basic'}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Giới tính</label>
                  <select
                    className="form-control"
                    value={profile.basic.gender}
                    onChange={(event) =>
                      setProfile((currentProfile) => ({
                        ...currentProfile,
                        basic: {
                          ...currentProfile.basic,
                          gender: event.target.value as AdminProfileRecord['basic']['gender'],
                        },
                      }))
                    }
                    disabled={editingSection !== 'basic'}
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nu</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              {editingSection === 'basic' && (
                <div className="admin-profile-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleCancelEdit('basic')}>
                    Huy
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <AdminIcon name="fa fa-save" /> Lưu thông tin
                  </button>
                </div>
              )}
            </form>
          </section>

          <section className="admin-profile-card">
            <div className="admin-profile-card-header">
              <div>
                <h3><AdminIcon name="fa fa-briefcase" /> Thông tin cong viec</h3>
                <p>Hiển thị xuyen suot trong sidebar, dropdown admin và cac log van hanh.</p>
              </div>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingSection('work')}>
                <AdminIcon name="fa fa-edit" /> Chinh sửa
              </button>
            </div>

            <form onSubmit={handleSaveWork}>
              <div className="admin-profile-form-grid">
                <div className="form-group">
                  <label className="form-label">Vi tri</label>
                  <input
                    className="form-control"
                    value={profile.work.position}
                    onChange={(event) =>
                      setProfile((currentProfile) => ({
                        ...currentProfile,
                        work: { ...currentProfile.work, position: event.target.value },
                      }))
                    }
                    disabled={editingSection !== 'work'}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phong ban</label>
                  <input
                    className="form-control"
                    value={profile.work.department}
                    onChange={(event) =>
                      setProfile((currentProfile) => ({
                        ...currentProfile,
                        work: { ...currentProfile.work, department: event.target.value },
                      }))
                    }
                    disabled={editingSection !== 'work'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả cong viec</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={profile.work.jobDescription}
                  onChange={(event) =>
                    setProfile((currentProfile) => ({
                      ...currentProfile,
                      work: { ...currentProfile.work, jobDescription: event.target.value },
                    }))
                  }
                  disabled={editingSection !== 'work'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Ngay tham gia</label>
                <input
                  className="form-control"
                  type="date"
                  value={profile.work.joinedAt.slice(0, 10)}
                  onChange={(event) =>
                    setProfile((currentProfile) => ({
                      ...currentProfile,
                      work: { ...currentProfile.work, joinedAt: new Date(event.target.value).toISOString() },
                    }))
                  }
                  disabled={editingSection !== 'work'}
                />
              </div>

              {editingSection === 'work' && (
                <div className="admin-profile-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleCancelEdit('work')}>
                    Huy
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <AdminIcon name="fa fa-save" /> Lưu cong viec
                  </button>
                </div>
              )}
            </form>
          </section>

          <section className="admin-profile-card admin-profile-card-wide">
            <div className="admin-profile-card-header">
              <div>
                <h3><AdminIcon name="fa fa-wave-square" /> Hoạt động gần đây</h3>
                <p>Lấy từ audit log và dữ liệu van hanh that trong hệ thống.</p>
              </div>
            </div>

            <div className="admin-profile-activity-list">
              {securityActivities.length > 0 ? (
                securityActivities.map((activity) => (
                  <div key={activity.id} className="admin-profile-activity-item">
                    <div className="admin-profile-activity-icon">
                      <AdminIcon name={activity.type === 'password-change' ? 'fa-key' : 'fa-user-shield'} />
                    </div>
                    <div className="admin-profile-activity-copy">
                      <strong>{activity.title}</strong>
                      <span>{activity.detail}</span>
                      <small>{formatDateTime(activity.createdAt)}</small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-profile-empty-state">
                  <AdminIcon name="fa fa-inbox" />
                  <p>Chưa có hoạt động admin nào được ghi nhan.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="admin-profile-grid">
          <section className="admin-profile-card">
            <div className="admin-profile-card-header">
              <div>
                <h3><AdminIcon name="fa fa-key" /> Doi mật khẩu</h3>
                <p>Cập nhật truc tiep vào adminCredentials và ghi audit log.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label className="form-label">Mật khẩu hien tai</label>
                <input
                  className="form-control"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((currentForm) => ({ ...currentForm, currentPassword: event.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mật khẩu mới</label>
                <input
                  className="form-control"
                  type="password"
                  value={passwordForm.nextPassword}
                  onChange={(event) => setPasswordForm((currentForm) => ({ ...currentForm, nextPassword: event.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Xac nhan mật khẩu mới</label>
                <input
                  className="form-control"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((currentForm) => ({ ...currentForm, confirmPassword: event.target.value }))}
                />
              </div>
              <div className="admin-profile-actions">
                <button type="submit" className="btn btn-primary btn-sm">
                  <AdminIcon name="fa fa-lock" /> Doi mật khẩu
                </button>
              </div>
            </form>
          </section>

          <section className="admin-profile-card">
            <div className="admin-profile-card-header">
              <div>
                <h3><AdminIcon name="fa fa-shield-alt" /> Tùy chọn bảo mật</h3>
                <p>Động bo truc tiep voi Admin Settings de dung cung một policy.</p>
              </div>
            </div>

            <div className="admin-profile-toggle-list">
              <label className="admin-profile-toggle-row">
                <div>
                  <strong>Chinh sach 2FA</strong>
                  <span>Danh dau policy cho tai khoan admin o cac man quản trị.</span>
                </div>
                <input
                  type="checkbox"
                  checked={securityOptions.enable2FA}
                  onChange={(event) =>
                    setSecurityOptions((currentOptions) => ({
                      ...currentOptions,
                      enable2FA: event.target.checked,
                    }))
                  }
                />
              </label>

              <label className="admin-profile-toggle-row">
                <div>
                  <strong>Audit login</strong>
                  <span>Tu động ghi lại mới lan admin đăng nhập thành công.</span>
                </div>
                <input
                  type="checkbox"
                  checked={securityOptions.loginNotification}
                  onChange={(event) =>
                    setSecurityOptions((currentOptions) => ({
                      ...currentOptions,
                      loginNotification: event.target.checked,
                    }))
                  }
                />
              </label>
            </div>

            <div className="admin-profile-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveSecurityOptions}>
                <AdminIcon name="fa fa-save" /> Lưu tùy chọn
              </button>
              <Link to="/admin/settings" className="btn btn-outline btn-sm">
                <AdminIcon name="fa fa-cog" /> Mo Settings
              </Link>
            </div>
          </section>

          <section className="admin-profile-card admin-profile-card-wide">
            <div className="admin-profile-card-header">
              <div>
                <h3><AdminIcon name="fa fa-history" /> Audit timeline</h3>
                <p>Thông tin này được dung chung voi trang Admin Settings.</p>
              </div>
            </div>

            <div className="admin-profile-activity-list">
              {securityActivities.length > 0 ? (
                securityActivities.map((activity) => (
                  <div key={activity.id} className="admin-profile-activity-item">
                    <div className="admin-profile-activity-icon">
                      <AdminIcon name={activity.type === 'password-change' ? 'fa-key' : 'fa-user-shield'} />
                    </div>
                    <div className="admin-profile-activity-copy">
                      <strong>{activity.title}</strong>
                      <span>{activity.detail}</span>
                      <small>{formatDateTime(activity.createdAt)}</small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-profile-empty-state">
                  <AdminIcon name="fa fa-shield-alt" />
                  <p>Chưa có audit log nào.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
