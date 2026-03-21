// Trang quản lý địa chỉ - thay thế diachi.html + address.js

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AddressItem {
  id: string; fullName: string; phone: string;
  province: string; district: string; ward: string;
  streetAddress: string; note?: string; type: 'home' | 'office';
  isDefault: boolean; provinceName: string; districtName: string; wardName: string;
}

const provinces = [
  { id: 'hanoi', name: 'Hà Nội' }, { id: 'hcm', name: 'TP. Hồ Chí Minh' },
  { id: 'danang', name: 'Đà Nẵng' }, { id: 'haiphong', name: 'Hải Phòng' },
  { id: 'cantho', name: 'Cần Thơ' }, { id: 'binhduong', name: 'Bình Dương' },
  { id: 'dongnai', name: 'Đồng Nai' }, { id: 'quangninh', name: 'Quảng Ninh' },
  { id: 'thanhhoa', name: 'Thanh Hóa' }, { id: 'nghean', name: 'Nghệ An' },
];

export default function Address() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: '', phone: '', province: '', district: '', ward: '', streetAddress: '', note: '', type: 'home' as 'home' | 'office', isDefault: false });

  const storageKey = `addresses_${user?.email || user?.name}`;

  useEffect(() => {
    setAddresses(JSON.parse(localStorage.getItem(storageKey) || '[]'));
  }, [storageKey]);

  const save = (list: AddressItem[]) => {
    setAddresses(list);
    localStorage.setItem(storageKey, JSON.stringify(list));
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ fullName: user?.name || '', phone: user?.phone || '', province: '', district: '', ward: '', streetAddress: '', note: '', type: 'home', isDefault: addresses.length === 0 });
    setShowModal(true);
  };

  const openEdit = (addr: AddressItem) => {
    setEditId(addr.id);
    setForm({ fullName: addr.fullName, phone: addr.phone, province: addr.province, district: addr.district, ward: addr.ward, streetAddress: addr.streetAddress, note: addr.note || '', type: addr.type, isDefault: addr.isDefault });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.fullName || !form.phone || !form.province || !form.streetAddress) { alert('Vui lòng điền đầy đủ thông tin'); return; }
    const prov = provinces.find(p => p.id === form.province);
    let list = [...addresses];
    if (form.isDefault) list = list.map(a => ({ ...a, isDefault: false }));
    if (editId) {
      list = list.map(a => a.id === editId ? { ...a, ...form, provinceName: prov?.name || form.province, districtName: form.district, wardName: form.ward } : a);
    } else {
      list.push({ id: 'addr_' + Date.now(), ...form, provinceName: prov?.name || form.province, districtName: form.district, wardName: form.ward });
    }
    save(list);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Xóa địa chỉ này?')) return;
    const list = addresses.filter(a => a.id !== id);
    if (addresses.find(a => a.id === id)?.isDefault && list.length > 0) list[0].isDefault = true;
    save(list);
  };

  const setDefault = (id: string) => {
    save(addresses.map(a => ({ ...a, isDefault: a.id === id })));
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

          {addresses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><i className="fa fa-map-marker-alt"></i></div>
              <h3>Chưa có địa chỉ nào</h3>
              <p>Thêm địa chỉ giao hàng để đặt hàng nhanh hơn</p>
              <button className="btn-add-address-empty" onClick={openAdd}><i className="fa fa-plus"></i> Thêm địa chỉ mới</button>
            </div>
          ) : (
            <div className="address-list">
              {addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)).map(addr => (
                <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                  <div className="address-card-header">
                    <div className="address-user-info">
                      <h4>{addr.fullName}</h4>
                      <span className="address-phone">{addr.phone}</span>
                    </div>
                    <div className="address-badges">
                      {addr.isDefault && <span className="badge badge-default">Mặc định</span>}
                      <span className={`badge ${addr.type === 'office' ? 'badge-office' : 'badge-home'}`}>
                        {addr.type === 'office' ? 'Văn phòng' : 'Nhà riêng'}
                      </span>
                    </div>
                  </div>
                  <div className="address-content">
                    <div className="address-detail">
                      <i className="fa fa-map-marker-alt"></i>
                      <span>{addr.streetAddress}, {addr.wardName}, {addr.districtName}, {addr.provinceName}</span>
                    </div>
                    {addr.note && (
                      <div className="address-note">
                        <i className="fa fa-sticky-note"></i>
                        <span>{addr.note}</span>
                      </div>
                    )}
                  </div>
                  <div className="address-actions">
                    <button className="btn-address-action btn-edit" onClick={() => openEdit(addr)}><i className="fa fa-edit"></i> Sửa</button>
                    <button className="btn-address-action btn-delete" onClick={() => handleDelete(addr.id)}><i className="fa fa-trash"></i> Xóa</button>
                    {!addr.isDefault && <button className="btn-address-action btn-set-default" onClick={() => setDefault(addr.id)}><i className="fa fa-check-circle"></i> Đặt mặc định</button>}
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
                  <div className="form-group"><label>Họ tên <span className="required">*</span></label><input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} /></div>
                  <div className="form-group"><label>SĐT <span className="required">*</span></label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                </div>
                <div className="form-group">
                  <label>Tỉnh/Thành <span className="required">*</span></label>
                  <select value={form.province} onChange={e => setForm({ ...form, province: e.target.value })}>
                    <option value="">Chọn tỉnh/thành</option>
                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Quận/Huyện</label><input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="Nhập quận/huyện" /></div>
                  <div className="form-group"><label>Phường/Xã</label><input value={form.ward} onChange={e => setForm({ ...form, ward: e.target.value })} placeholder="Nhập phường/xã" /></div>
                </div>
                <div className="form-group"><label>Địa chỉ chi tiết <span className="required">*</span></label><input value={form.streetAddress} onChange={e => setForm({ ...form, streetAddress: e.target.value })} placeholder="Số nhà, tên đường" /></div>
                <div className="form-group"><label>Ghi chú</label><textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder="Ghi chú thêm"></textarea></div>
                <div className="form-group">
                  <label>Loại địa chỉ</label>
                  <div className="address-type-selector">
                    <label className="type-option"><input type="radio" checked={form.type === 'home'} onChange={() => setForm({ ...form, type: 'home' })} /><span className="type-label"><i className="fa fa-home"></i> Nhà riêng</span></label>
                    <label className="type-option"><input type="radio" checked={form.type === 'office'} onChange={() => setForm({ ...form, type: 'office' })} /><span className="type-label"><i className="fa fa-building"></i> Văn phòng</span></label>
                  </div>
                </div>
                <div className="checkbox-group">
                  <label className="checkbox-label"><input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} /><span className="checkmark"></span> Đặt làm mặc định</label>
                </div>
                <div className="modal-footer">
                  <button className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                  <button className="btn-primary" onClick={handleSave}><i className="fa fa-save"></i> Lưu</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
