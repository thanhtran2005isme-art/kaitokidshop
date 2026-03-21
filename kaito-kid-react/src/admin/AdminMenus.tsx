import { useState, useEffect } from 'react';

interface MenuItem {
  id: number;
  name: string;
  link: string;
  order: number;
  target: '_self' | '_blank';
}

interface FooterSettings {
  col1Title: string;
  col1Content: string;
  col2Title: string;
  col2Content: string;
  copyright: string;
}

export default function AdminMenus() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [footer, setFooter] = useState<FooterSettings>({
    col1Title: 'Về chúng tôi',
    col1Content: 'KAITO KID - Thương hiệu thời trang trẻ trung, năng động.',
    col2Title: 'Hỗ trợ khách hàng',
    col2Content: 'Hotline: 1900 1234\nEmail: support@kaitokid.com',
    copyright: '© 2024 KAITO KID. All rights reserved.',
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    link: '',
    order: 1,
    target: '_self' as const,
  });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setMenuItems(JSON.parse(localStorage.getItem('menuItems') || '[]'));
    const savedFooter = JSON.parse(localStorage.getItem('footerSettings') || '{}');
    setFooter({ ...footer, ...savedFooter });
  }, []);

  const saveMenuItems = (list: MenuItem[]) => {
    setMenuItems(list);
    localStorage.setItem('menuItems', JSON.stringify(list));
  };

  const handleAddMenuItem = () => {
    if (!form.name || !form.link) {
      alert('Điền đầy đủ thông tin');
      return;
    }
    const newItem: MenuItem = {
      id: Date.now(),
      ...form,
    };
    saveMenuItems([...menuItems, newItem]);
    setShowForm(false);
    setForm({ name: '', link: '', order: 1, target: '_self' });
  };

  const handleDeleteMenuItem = (id: number) => {
    if (confirm('Xóa mục menu?')) saveMenuItems(menuItems.filter(m => m.id !== id));
  };

  const handleSaveAll = () => {
    localStorage.setItem('footerSettings', JSON.stringify(footer));
    setMsg('Đã lưu thay đổi!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1>Quản lý Menu & Footer</h1>
        <div className="page-actions">
          <button className="btn-add" onClick={handleSaveAll}>
            <i className="fa fa-save"></i> Lưu thay đổi
          </button>
        </div>
      </div>

      {msg && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          <i className="fa fa-check-circle"></i> {msg}
        </div>
      )}

      <div className="data-card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <h3>Menu chính</h3>
          <button className="btn-add-small" onClick={() => setShowForm(true)}>
            <i className="fa fa-plus"></i> Thêm mục
          </button>
        </div>

        <div className="menu-items-list">
          {menuItems.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: 20 }}>Chưa có mục menu nào</p>
          ) : (
            menuItems.map(item => (
              <div
                key={item.id}
                className="menu-item"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  background: '#f9fafb',
                  borderRadius: 8,
                  marginBottom: 8,
                }}
              >
                <div>
                  <strong>{item.name}</strong>
                  <span style={{ color: '#666', fontSize: 13, marginLeft: 12 }}>{item.link}</span>
                </div>
                <button className="btn-action btn-delete" onClick={() => handleDeleteMenuItem(item.id)}>
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="data-card">
        <div className="card-header">
          <h3>Footer</h3>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tiêu đề cột 1</label>
            <input
              className="form-control"
              value={footer.col1Title}
              onChange={e => setFooter({ ...footer, col1Title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Tiêu đề cột 2</label>
            <input
              className="form-control"
              value={footer.col2Title}
              onChange={e => setFooter({ ...footer, col2Title: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Nội dung cột 1</label>
            <textarea
              className="form-control"
              rows={6}
              value={footer.col1Content}
              onChange={e => setFooter({ ...footer, col1Content: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Nội dung cột 2</label>
            <textarea
              className="form-control"
              rows={6}
              value={footer.col2Content}
              onChange={e => setFooter({ ...footer, col2Content: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Bản quyền (Copyright)</label>
          <input
            className="form-control"
            value={footer.copyright}
            onChange={e => setFooter({ ...footer, copyright: e.target.value })}
          />
        </div>
      </div>

      {showForm && (
        <div className="modal" style={{ display: 'flex' }} onClick={() => setShowForm(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Thêm mục menu</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>
                  <i className="fa fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tên mục menu <span className="required">*</span></label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ví dụ: Trang chủ, Sản phẩm..."
                  />
                </div>
                <div className="form-group">
                  <label>Link (URL) <span className="required">*</span></label>
                  <input
                    className="form-control"
                    value={form.link}
                    onChange={e => setForm({ ...form, link: e.target.value })}
                    placeholder="/ hoặc /products hoặc https://..."
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Thứ tự</label>
                    <input
                      className="form-control"
                      type="number"
                      value={form.order}
                      onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mở trong tab mới</label>
                    <select
                      className="form-control"
                      value={form.target}
                      onChange={e => setForm({ ...form, target: e.target.value as any })}
                    >
                      <option value="_self">Cùng tab</option>
                      <option value="_blank">Tab mới</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
                <button className="btn-primary" onClick={handleAddMenuItem}>
                  <i className="fa fa-save"></i> Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
