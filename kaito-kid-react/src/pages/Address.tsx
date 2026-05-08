// Trang quản lý địa chỉ - kết nối backend qua /api/addresses

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addressApi, type AddressDTO } from '../services/api';
import toast from 'react-hot-toast';

const provinces = [
  'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng',
  'Cần Thơ', 'Bình Dương', 'Đồng Nai', 'Quảng Ninh',
  'Thanh Hóa', 'Nghệ An',
];

interface AddressFormState {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
}

const EMPTY_FORM: AddressFormState = {
  fullName: '', phone: '', province: '', district: '', ward: '', street: '', isDefault: false,
};

export default function Address() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<AddressDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<AddressFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadAddresses = async () => {
    setLoading(true);
    const result = await addressApi.getAll();
    if (result.success && result.data) {
      setAddresses(result.data);
    } else {
      setAddresses([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      void loadAddresses();
    }
  }, [user]);

  const openAdd = () => {
    setEditId(null);
    setForm({
      ...EMPTY_FORM,
      fullName: user?.name || '',
      phone: user?.phone || '',
      isDefault: addresses.length === 0,
    });
    setShowModal(true);
  };

  const openEdit = (addr: AddressDTO) => {
    setEditId(addr.id);
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.province,
      district: addr.district,
      ward: addr.ward,
      street: addr.street,
      isDefault: addr.isDefault,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.phone.trim() || !form.province || !form.street.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setSaving(true);
    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      province: form.province,
      district: form.district.trim(),
      ward: form.ward.trim(),
      street: form.street.trim(),
      isDefault: form.isDefault,
    };

    const result = editId
      ? await addressApi.update(editId, payload)
      : await addressApi.create(payload);

    setSaving(false);

    if (result.success) {
      toast.success(editId ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ mới');
      setShowModal(false);
      await loadAddresses();
    } else {
      toast.error(result.error || 'Không thể lưu địa chỉ');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa địa chỉ này?')) return;

    const result = await addressApi.delete(id);
    if (result.success) {
      toast.success('Đã xóa địa chỉ');
      await loadAddresses();
    } else {
      toast.error(result.error || 'Không thể xóa địa chỉ');
    }
  };

  const setDefault = async (id: number) => {
    const result = await addressApi.setDefault(id);
    if (result.success) {
      toast.success('Đã đặt làm địa chỉ mặc định');
      await loadAddresses();
    } else {
      toast.error(result.error || 'Không thể đặt mặc định');
    }
  };

  const sidebarLinks = [
    { to: '/account', icon: 'fa-user', label: 'Thông tin tài khoản' },
    { to: '/orders', icon: 'fa-box', label: 'Đơn hàng của tôi' },
    { to: '/wishlist', icon: 'fa-heart', label: 'Sản phẩm yêu thích' },
    { to: '/address', icon: 'fa-location-dot', label: 'Địa chỉ giao hàng', active: true },
  ];

  return (
    <div className="account-page">
      <div className="account-container">
        {/* Sidebar */}
        <div className="account-sidebar">
          <div className="user-profile-card">
            <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
          </div>
          <nav className="account-nav">
            {sidebarLinks.map(l => (
              <Link key={l.to} to={l.to} className={`nav-item ${l.active ? 'active' : ''}`}>
                <i className={`fa ${l.icon}`}></i> {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="account-main">
          <div className="section-header" style={{ marginBottom: 20 }}>
            <h2><i className="fa fa-map-marker-alt"></i> Địa chỉ giao hàng</h2>
            <button className="btn-add-address" onClick={openAdd}><i className="fa fa-plus"></i> Thêm địa chỉ</button>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <i className="fa fa-spinner fa-spin"></i> Đang tải địa chỉ...
            </div>
          ) : addresses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><i className="fa fa-map-marker-alt"></i></div>
              <h3>Chưa có địa chỉ nào</h3>
              <p>Thêm địa chỉ giao hàng để đặt hàng nhanh hơn</p>
              <button className="btn-add-address-empty" onClick={openAdd}><i className="fa fa-plus"></i> Thêm địa chỉ mới</button>
            </div>
          ) : (
            <div className="address-list">
              {[...addresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)).map(addr => (
                <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                  <div className="address-card-header">
                    <div className="address-user-info">
                      <h4>{addr.fullName}</h4>
                      <span className="address-phone">{addr.phone}</span>
                    </div>
                    <div className="address-badges">
                      {addr.isDefault && <span className="badge badge-default">Mặc định</span>}
                    </div>
                  </div>
                  <div className="address-content">
                    <div className="address-detail">
                      <i className="fa fa-map-marker-alt"></i>
                      <span>
                        {[addr.street, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>
                  <div className="address-actions">
                    <button className="btn-address-action btn-edit" onClick={() => openEdit(addr)}>
                      <i className="fa fa-edit"></i> Sửa
                    </button>
                    <button className="btn-address-action btn-delete" onClick={() => handleDelete(addr.id)}>
                      <i className="fa fa-trash"></i> Xóa
                    </button>
                    {!addr.isDefault && (
                      <button className="btn-address-action btn-set-default" onClick={() => setDefault(addr.id)}>
                        <i className="fa fa-check-circle"></i> Đặt mặc định
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal active" onClick={() => setShowModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editId ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Họ tên <span className="required">*</span></label>
                    <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>SĐT <span className="required">*</span></label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Tỉnh/Thành <span className="required">*</span></label>
                  <select value={form.province} onChange={e => setForm({ ...form, province: e.target.value })}>
                    <option value="">Chọn tỉnh/thành</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Quận/Huyện</label>
                    <input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="Nhập quận/huyện" />
                  </div>
                  <div className="form-group">
                    <label>Phường/Xã</label>
                    <input value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })} placeholder="Nhập phường/xã" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Địa chỉ chi tiết <span className="required">*</span></label>
                  <input value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} placeholder="Số nhà, tên đường" />
                </div>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
                    <span className="checkmark"></span> Đặt làm mặc định
                  </label>
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                  <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
                    {' '}{saving ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
