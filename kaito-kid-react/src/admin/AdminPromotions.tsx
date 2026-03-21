import { useState, useEffect } from 'react';

interface Promotion {
  id: number;
  name: string;
  description: string;
  type: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'ended';
}

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'discount',
    discountPercent: 10,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    setPromotions(JSON.parse(localStorage.getItem('promotions') || '[]'));
  }, []);

  const savePromotions = (list: Promotion[]) => {
    setPromotions(list);
    localStorage.setItem('promotions', JSON.stringify(list));
  };

  const handleSave = () => {
    if (!form.name || !form.startDate || !form.endDate) {
      alert('Điền đầy đủ thông tin');
      return;
    }
    const newPromo: Promotion = {
      id: Date.now(),
      ...form,
      status: 'scheduled',
    };
    savePromotions([...promotions, newPromo]);
    setShowForm(false);
    setForm({
      name: '',
      description: '',
      type: 'discount',
      discountPercent: 10,
      startDate: '',
      endDate: '',
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Xóa chương trình khuyến mãi?'))
      savePromotions(promotions.filter(p => p.id !== id));
  };

  const activeCount = promotions.filter(p => p.status === 'active').length;
  const scheduledCount = promotions.filter(p => p.status === 'scheduled').length;
  const endedCount = promotions.filter(p => p.status === 'ended').length;

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1>Chương trình Khuyến mãi</h1>
        <div className="page-actions">
          <button className="btn-add" onClick={() => setShowForm(true)}>
            <i className="fa fa-plus"></i> Tạo chương trình
          </button>
        </div>
      </div>

      <div className="promo-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card-small">
          <div className="stat-icon-small" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <i className="fa fa-bullhorn"></i>
          </div>
          <div className="stat-content-small">
            <span className="stat-label-small">Đang chạy</span>
            <h3 className="stat-value-small">{activeCount}</h3>
          </div>
        </div>
        <div className="stat-card-small">
          <div className="stat-icon-small" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <i className="fa fa-calendar-check"></i>
          </div>
          <div className="stat-content-small">
            <span className="stat-label-small">Sắp diễn ra</span>
            <h3 className="stat-value-small">{scheduledCount}</h3>
          </div>
        </div>
        <div className="stat-card-small">
          <div className="stat-icon-small" style={{ background: 'linear-gradient(135deg, #6b7280, #4b5563)' }}>
            <i className="fa fa-history"></i>
          </div>
          <div className="stat-content-small">
            <span className="stat-label-small">Đã kết thúc</span>
            <h3 className="stat-value-small">{endedCount}</h3>
          </div>
        </div>
      </div>

      <div className="promotions-list">
        {promotions.length === 0 ? (
          <div className="data-card" style={{ textAlign: 'center', padding: 40 }}>
            <i className="fa fa-tags" style={{ fontSize: 40, color: '#ccc', marginBottom: 12 }}></i>
            <p style={{ color: '#666' }}>Chưa có chương trình khuyến mãi nào</p>
          </div>
        ) : (
          promotions.map(p => (
            <div key={p.id} className="data-card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ marginBottom: 8 }}>{p.name}</h3>
                  <p style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{p.description}</p>
                  <p style={{ fontSize: 13, color: '#667eea' }}>
                    Giảm {p.discountPercent}% | {p.startDate} - {p.endDate}
                  </p>
                </div>
                <button className="btn-action btn-delete" onClick={() => handleDelete(p.id)}>
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
                <h3>Tạo chương trình khuyến mãi</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>
                  <i className="fa fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tên chương trình <span className="required">*</span></label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Giảm giá mùa hè"
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả về chương trình..."
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Loại khuyến mãi</label>
                    <select
                      className="form-control"
                      value={form.type}
                      onChange={e => setForm({ ...form, type: e.target.value })}
                    >
                      <option value="discount">Giảm giá sản phẩm</option>
                      <option value="buy-x-get-y">Mua X tặng Y</option>
                      <option value="bundle">Combo giảm giá</option>
                      <option value="free-shipping">Miễn phí vận chuyển</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Giá trị giảm (%)</label>
                    <input
                      className="form-control"
                      type="number"
                      value={form.discountPercent}
                      onChange={e => setForm({ ...form, discountPercent: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Ngày bắt đầu <span className="required">*</span></label>
                    <input
                      className="form-control"
                      type="datetime-local"
                      value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ngày kết thúc <span className="required">*</span></label>
                    <input
                      className="form-control"
                      type="datetime-local"
                      value={form.endDate}
                      onChange={e => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
                <button className="btn-primary" onClick={handleSave}>
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
