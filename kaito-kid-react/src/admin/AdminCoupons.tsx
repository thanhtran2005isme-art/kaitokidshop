// Quan ly ma giam gia - match admin structure

import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/format';

interface Coupon {
  id: number; code: string; description: string; discountType: 'percent' | 'fixed';
  discountValue: number; maxDiscount?: number; minOrder: number;
  quantity: number; used: number; startDate: string; endDate: string;
  status: 'active' | 'expired'; isPublic: boolean;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Coupon>>({});

  useEffect(() => { setCoupons(JSON.parse(localStorage.getItem('coupons') || '[]')); }, []);
  const saveCoupons = (list: Coupon[]) => { setCoupons(list); localStorage.setItem('coupons', JSON.stringify(list)); };

  const openAdd = () => {
    setEditId(null);
    setForm({ code: '', description: '', discountType: 'percent', discountValue: 10, minOrder: 0, quantity: 100, used: 0, startDate: new Date().toISOString().split('T')[0], endDate: '', status: 'active', isPublic: true });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.code || !form.endDate) { alert('Nhập mã và ngày hết hạn'); return; }
    let list = [...coupons];
    if (editId) { list = list.map(c => c.id === editId ? { ...c, ...form } as Coupon : c); }
    else { list.push({ id: Date.now(), ...form } as Coupon); }
    saveCoupons(list);
    setShowForm(false);
  };

  const handleDelete = (id: number) => { if (confirm('Xóa mã này?')) saveCoupons(coupons.filter(c => c.id !== id)); };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Mã giảm giá ({coupons.length})</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}><i className="fa fa-plus"></i> Thêm mã</button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr>
              <th>Mã</th><th>Giảm giá</th><th>Đơn tối thiểu</th><th>Đã dùng</th><th>Hết hạn</th><th></th>
            </tr></thead>
            <tbody>
              {coupons.map(c => (
                <tr key={c.id}>
                  <td><span className="product-name-cell">{c.code}</span><span className="product-sku">{c.description}</span></td>
                  <td>{c.discountType === 'percent' ? `${c.discountValue}%` : formatCurrency(c.discountValue)}</td>
                  <td>{c.minOrder > 0 ? formatCurrency(c.minOrder) : 'Không'}</td>
                  <td>{c.used}/{c.quantity}</td>
                  <td>{c.endDate}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-action btn-edit" onClick={() => { setEditId(c.id); setForm({ ...c }); setShowForm(true); }}><i className="fa fa-edit"></i></button>
                      <button className="btn-action btn-delete" onClick={() => handleDelete(c.id)}><i className="fa fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && <p className="loading-row">Chưa có mã giảm giá</p>}
        </div>
      </div>

      {showForm && (
        <div className="modal active" onClick={() => setShowForm(false)}>
          <div className="modal-dialog" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header"><h3>{editId ? 'Sửa mã' : 'Thêm mã giảm giá'}</h3><button className="modal-close" onClick={() => setShowForm(false)}>×</button></div>
              <div className="modal-body">
                <div className="form-group"><label className="form-label required">Mã</label><input className="form-control" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} /></div>
                <div className="form-group"><label className="form-label">Mô tả</label><input className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Loại</label>
                    <select className="form-control" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value as 'percent' | 'fixed' })}>
                      <option value="percent">Phần trăm</option><option value="fixed">Số tiền</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Giá trị</label><input className="form-control" type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: Number(e.target.value) })} /></div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Đơn tối thiểu</label><input className="form-control" type="number" value={form.minOrder} onChange={e => setForm({ ...form, minOrder: Number(e.target.value) })} /></div>
                  <div className="form-group"><label className="form-label">Số lượng</label><input className="form-control" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
                </div>
                <div className="form-group"><label className="form-label required">Ngày hết hạn</label><input className="form-control" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
                <label className="form-check"><input className="form-check-input" type="checkbox" checked={form.isPublic} onChange={e => setForm({ ...form, isPublic: e.target.checked })} /><span className="form-check-label">Hiển thị công khai</span></label>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
                <button className="btn btn-primary" onClick={handleSave}><i className="fa fa-save"></i> Lưu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
