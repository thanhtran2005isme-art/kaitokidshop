import { useState, useEffect } from 'react';

interface FlashSale {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  discountPercent: number;
  productIds: number[];
  status: 'active' | 'upcoming' | 'ended';
}

export default function AdminFlashSales() {
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', discountPercent: 20 });

  useEffect(() => {
    setSales(JSON.parse(localStorage.getItem('flashSales') || '[]'));
  }, []);

  const saveSales = (list: FlashSale[]) => {
    setSales(list);
    localStorage.setItem('flashSales', JSON.stringify(list));
  };

  const handleSave = () => {
    if (!form.name || !form.startDate || !form.endDate) {
      alert('Điền đầy đủ thông tin');
      return;
    }
    const newSale: FlashSale = {
      id: Date.now(),
      ...form,
      productIds: [],
      status: 'upcoming'
    };
    saveSales([...sales, newSale]);
    setShowForm(false);
    setForm({ name: '', startDate: '', endDate: '', discountPercent: 20 });
  };

  const handleDelete = (id: number) => {
    if (confirm('Xóa flash sale?')) saveSales(sales.filter(s => s.id !== id));
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1>⚡ Flash Sale</h1>
        <div className="page-actions">
          <button className="btn-add" onClick={() => setShowForm(true)}>
            <i className="fa fa-plus"></i> Tạo Flash Sale
          </button>
        </div>
      </div>

      <div className="flash-sales-grid">
        {sales.length === 0 ? (
          <div className="data-card" style={{ textAlign: 'center', padding: 40 }}>
            <i className="fa fa-bolt" style={{ fontSize: 40, color: '#ccc', marginBottom: 12 }}></i>
            <p style={{ color: '#666' }}>Chưa có flash sale nào</p>
          </div>
        ) : (
          sales.map(s => (
            <div key={s.id} className="data-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ marginBottom: 8 }}>{s.name}</h3>
                  <p style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>
                    Giảm {s.discountPercent}%
                  </p>
                  <p style={{ fontSize: 13, color: '#666' }}>
                    {s.startDate} - {s.endDate}
                  </p>
                </div>
                <button className="btn-action btn-delete" onClick={() => handleDelete(s.id)}>
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="modal" style={{ display: 'flex' }} onClick={() => setShowForm(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Tạo Flash Sale</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>
                  <i className="fa fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tên Flash Sale <span className="required">*</span></label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="VD: Flash Sale 12h trưa"
                  />
                </div>
                <div className="form-group">
                  <label>Giảm giá (%)</label>
                  <input
                    className="form-control"
                    type="number"
                    value={form.discountPercent}
                    onChange={e => setForm({ ...form, discountPercent: Number(e.target.value) })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Thời gian bắt đầu <span className="required">*</span></label>
                    <input
                      className="form-control"
                      type="datetime-local"
                      value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Thời gian kết thúc <span className="required">*</span></label>
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
