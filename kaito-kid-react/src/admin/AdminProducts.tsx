// Quan ly san pham - thay the admin/products.html + admin-products.js

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { formatCurrency } from '../utils/format';
import type { Product } from '../types';

const defaultProduct = (): Partial<Product> => ({
  name: '', category: 'Ao', gender: 'Nam', price: 0, oldPrice: null,
  stock: 100, status: 'active', image: '', description: '', sku: 'SKU-' + Date.now(),
  isNew: false, isSale: false, isBestSeller: false, rating: 4.5, soldCount: 0,
  colors: [], sizes: ['S', 'M', 'L', 'XL'],
});

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Product>>(defaultProduct());

  useEffect(() => { setProducts(productService.getAll()); }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (p: Product) => { setEditId(p.id); setForm({ ...p }); setShowForm(true); };

  const handleSave = () => {
    if (!form.name || !form.price) { alert('Vui long nhap ten va gia'); return; }
    if (editId) {
      productService.update(editId, form);
    } else {
      productService.create(form as Omit<Product, 'id' | 'createdAt'>);
    }
    setProducts(productService.getAll());
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Xoa san pham nay?')) return;
    productService.delete(id);
    setProducts(productService.getAll());
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Quản lý sản phẩm ({products.length})</h1>
        <div className="page-actions">
          <Link to="/admin/products/add" className="btn-add">
            <i className="fa fa-plus"></i> Thêm sản phẩm
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="filters-bar">
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tim san pham..." />
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr>
              <th>Anh</th><th>Ten</th><th>SKU</th><th>Gia</th><th>Kho</th><th>Trang thai</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><img src={p.image} alt="" className="product-img" /></td>
                  <td><span className="product-name-cell">{p.name}</span><span className="product-sku">{p.category} - {p.gender}</span></td>
                  <td>{p.sku}</td>
                  <td>{formatCurrency(p.price)}{p.oldPrice ? <><br /><s style={{ color: '#999', fontSize: 12 }}>{formatCurrency(p.oldPrice)}</s></> : null}</td>
                  <td>{p.stock}</td>
                  <td><span className={`status-badge ${p.status === 'active' ? 'active' : p.status === 'draft' ? 'inactive' : 'out-of-stock'}`}>{p.status === 'active' ? 'Dang ban' : p.status === 'draft' ? 'Nhap' : 'Het hang'}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-action btn-edit" onClick={() => openEdit(p)}><i className="fa fa-edit"></i></button>
                      <button className="btn-action btn-delete" onClick={() => handleDelete(p.id)}><i className="fa fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="loading-row">Khong co san pham nao</p>}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal active" onClick={() => setShowForm(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editId ? 'Sua san pham' : 'Them san pham'}</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>x</button>
              </div>
              <div className="modal-body">
                <div className="form-group full-width"><label className="form-label required">Ten san pham</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Danh muc</label>
                    <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option>Ao</option><option>Quan</option><option>Vay</option><option>Phu kien</option>
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Gioi tinh</label>
                    <select className="form-control" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                      <option>Nam</option><option>Nu</option><option>Tre em</option><option>Unisex</option>
                    </select>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label required">Gia ban</label><input className="form-control" type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} /></div>
                  <div className="form-group"><label className="form-label">Gia goc</label><input className="form-control" type="number" value={form.oldPrice || ''} onChange={e => setForm({ ...form, oldPrice: Number(e.target.value) || null })} /></div>
                </div>
                <div className="form-grid">
                  <div className="form-group"><label className="form-label">Ton kho</label><input className="form-control" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} /></div>
                  <div className="form-group"><label className="form-label">SKU</label><input className="form-control" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} /></div>
                </div>
                <div className="form-group full-width"><label className="form-label">Link anh</label><input className="form-control" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></div>
                <div className="form-group full-width"><label className="form-label">Mo ta</label><textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
                <div className="d-flex gap-2">
                  <label className="form-check"><input className="form-check-input" type="checkbox" checked={form.isNew} onChange={e => setForm({ ...form, isNew: e.target.checked })} /><span className="form-check-label">Moi</span></label>
                  <label className="form-check"><input className="form-check-input" type="checkbox" checked={form.isSale} onChange={e => setForm({ ...form, isSale: e.target.checked })} /><span className="form-check-label">Sale</span></label>
                  <label className="form-check"><input className="form-check-input" type="checkbox" checked={form.isBestSeller} onChange={e => setForm({ ...form, isBestSeller: e.target.checked })} /><span className="form-check-label">Ban chay</span></label>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Huy</button>
                <button className="btn btn-primary" onClick={handleSave}><i className="fa fa-save"></i> Luu</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
