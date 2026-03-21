import { useState, useEffect } from 'react';

interface Banner {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  position: string;
  order: number;
  status: 'active' | 'inactive';
  type: 'slider' | 'banner';
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeTab, setActiveTab] = useState<'slider' | 'banner'>('slider');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
    position: 'homepage',
    order: 1,
    status: 'active' as const,
  });

  useEffect(() => {
    setBanners(JSON.parse(localStorage.getItem('banners') || '[]'));
  }, []);

  const saveBanners = (list: Banner[]) => {
    setBanners(list);
    localStorage.setItem('banners', JSON.stringify(list));
  };

  const handleSave = () => {
    if (!form.title || !form.imageUrl) {
      alert('Điền đầy đủ thông tin');
      return;
    }
    const newBanner: Banner = {
      id: Date.now(),
      ...form,
      type: activeTab,
    };
    saveBanners([...banners, newBanner]);
    setShowForm(false);
    setForm({
      title: '',
      description: '',
      imageUrl: '',
      link: '',
      position: 'homepage',
      order: 1,
      status: 'active',
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Xóa banner?')) saveBanners(banners.filter(b => b.id !== id));
  };

  const filteredBanners = banners.filter(b => b.type === activeTab);

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1>Quản lý Banner & Slider</h1>
        <div className="page-actions">
          <button className="btn-add" onClick={() => setShowForm(true)}>
            <i className="fa fa-plus"></i> Thêm Banner
          </button>
        </div>
      </div>

      <div className="banner-tabs" style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button
          className={`tab-btn ${activeTab === 'slider' ? 'active' : ''}`}
          onClick={() => setActiveTab('slider')}
          style={{
            padding: '10px 20px',
            border: activeTab === 'slider' ? '2px solid #667eea' : '1px solid #e5e7eb',
            background: activeTab === 'slider' ? '#eef2ff' : '#fff',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          <i className="fa fa-images"></i> Hero Slider
        </button>
        <button
          className={`tab-btn ${activeTab === 'banner' ? 'active' : ''}`}
          onClick={() => setActiveTab('banner')}
          style={{
            padding: '10px 20px',
            border: activeTab === 'banner' ? '2px solid #667eea' : '1px solid #e5e7eb',
            background: activeTab === 'banner' ? '#eef2ff' : '#fff',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          <i className="fa fa-image"></i> Banner Quảng cáo
        </button>
      </div>

      <div className="banners-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filteredBanners.length === 0 ? (
          <div className="data-card" style={{ textAlign: 'center', padding: 40, gridColumn: '1 / -1' }}>
            <i className="fa fa-image" style={{ fontSize: 40, color: '#ccc', marginBottom: 12 }}></i>
            <p style={{ color: '#666' }}>Chưa có banner nào</p>
          </div>
        ) : (
          filteredBanners.map(b => (
            <div key={b.id} className="data-card">
              <img
                src={b.imageUrl}
                alt={b.title}
                style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
              />
              <h3 style={{ fontSize: 16, marginBottom: 4 }}>{b.title}</h3>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>{b.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge ${b.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                  {b.status === 'active' ? 'Hiển thị' : 'Ẩn'}
                </span>
                <button className="btn-action btn-delete" onClick={() => handleDelete(b.id)}>
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="modal" style={{ display: 'flex' }} onClick={() => setShowForm(false)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Thêm Banner</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>
                  <i className="fa fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tiêu đề <span className="required">*</span></label>
                  <input
                    className="form-control"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Nhập tiêu đề banner"
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Nhập mô tả ngắn"
                  />
                </div>
                <div className="form-group">
                  <label>URL hình ảnh <span className="required">*</span></label>
                  <input
                    className="form-control"
                    value={form.imageUrl}
                    onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="form-group">
                  <label>Link khi click (URL)</label>
                  <input
                    className="form-control"
                    value={form.link}
                    onChange={e => setForm({ ...form, link: e.target.value })}
                    placeholder="https://example.com hoặc để trống"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Vị trí hiển thị</label>
                    <select
                      className="form-control"
                      value={form.position}
                      onChange={e => setForm({ ...form, position: e.target.value })}
                    >
                      <option value="homepage">Trang chủ</option>
                      <option value="category">Trang danh mục</option>
                      <option value="product">Trang sản phẩm</option>
                      <option value="sidebar">Sidebar</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Thứ tự hiển thị</label>
                    <input
                      className="form-control"
                      type="number"
                      value={form.order}
                      onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
                <button className="btn-primary" onClick={handleSave}>
                  <i className="fa fa-save"></i> Lưu Banner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
