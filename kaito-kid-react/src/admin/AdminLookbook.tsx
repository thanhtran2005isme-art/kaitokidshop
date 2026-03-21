// Quản lý Lookbook - match admin structure

import { useState, useEffect } from 'react';
import { formatCurrency } from '../utils/format';

interface Lookbook {
  id: number;
  name: string;
  style: string;
  description: string;
  image: string;
  products: number[];
  totalPrice: number;
  status: 'active' | 'inactive';
}

export default function AdminLookbook() {
  const [lookbooks, setLookbooks] = useState<Lookbook[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Lookbook>>({});
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('lookbooks') || '[]');
    if (saved.length > 0) {
      setLookbooks(saved);
    } else {
      const defaults: Lookbook[] = [
        { 
          id: 1, 
          name: 'Office Chic', 
          style: 'office', 
          description: '3 items – 5 outfit đi làm cả tuần', 
          image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2',
          products: [1, 2, 3],
          totalPrice: 1500000,
          status: 'active'
        },
        { 
          id: 2, 
          name: 'Street Style', 
          style: 'street', 
          description: 'Phong cách đường phố năng động', 
          image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
          products: [4, 5],
          totalPrice: 980000,
          status: 'active'
        },
      ];
      setLookbooks(defaults);
      localStorage.setItem('lookbooks', JSON.stringify(defaults));
    }
  }, []);

  const saveLookbooks = (list: Lookbook[]) => {
    setLookbooks(list);
    localStorage.setItem('lookbooks', JSON.stringify(list));
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', style: 'office', description: '', image: '', products: [], totalPrice: 0, status: 'active' });
    setImagePreview('');
    setShowModal(true);
  };

  const openEdit = (lookbook: Lookbook) => {
    setEditId(lookbook.id);
    setForm({ ...lookbook });
    setImagePreview(lookbook.image);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name?.trim()) {
      alert('Vui lòng nhập tên lookbook');
      return;
    }

    let list = [...lookbooks];
    if (editId) {
      list = list.map(l => l.id === editId ? { ...l, ...form } as Lookbook : l);
    } else {
      list.push({ id: Date.now(), ...form, products: [], totalPrice: 0 } as Lookbook);
    }
    
    saveLookbooks(list);
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Xóa lookbook này?')) {
      saveLookbooks(lookbooks.filter(l => l.id !== id));
    }
  };

  const getStyleLabel = (style: string) => {
    const labels: Record<string, string> = {
      office: 'Office Chic',
      street: 'Street Style',
      casual: 'Casual',
      party: 'Party',
      weekend: 'Weekend Chill',
      sport: 'Sporty'
    };
    return labels[style] || style;
  };

  const activeLookbooks = lookbooks.filter(l => l.status === 'active').length;
  const totalProducts = lookbooks.reduce((sum, l) => sum + l.products.length, 0);

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Quản lý Lookbook</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}>
            <i className="fa fa-plus"></i> Thêm Lookbook
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40, color: '#667eea' }}><i className="fa fa-images"></i></div>
            <div>
              <h3 style={{ fontSize: 28, margin: 0 }}>{lookbooks.length}</h3>
              <p style={{ margin: 0, color: '#888', fontSize: 14 }}>Tổng Lookbook</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40, color: '#10b981' }}><i className="fa fa-check-circle"></i></div>
            <div>
              <h3 style={{ fontSize: 28, margin: 0 }}>{activeLookbooks}</h3>
              <p style={{ margin: 0, color: '#888', fontSize: 14 }}>Đang hiển thị</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40, color: '#f59e0b' }}><i className="fa fa-box"></i></div>
            <div>
              <h3 style={{ fontSize: 28, margin: 0 }}>{totalProducts}</h3>
              <p style={{ margin: 0, color: '#888', fontSize: 14 }}>Sản phẩm trong Lookbook</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lookbook Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {lookbooks.map(lookbook => (
          <div key={lookbook.id} className="card">
            <div style={{ 
              height: 240, 
              backgroundImage: `url(${lookbook.image})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              borderRadius: '8px 8px 0 0',
              marginBottom: 16,
              position: 'relative'
            }}>
              <span className={`badge ${lookbook.status === 'active' ? 'badge-success' : 'badge-secondary'}`} style={{ position: 'absolute', top: 12, right: 12 }}>
                {lookbook.status === 'active' ? 'Hiển thị' : 'Ẩn'}
              </span>
            </div>
            <div style={{ padding: '0 16px 16px' }}>
              <h3 style={{ marginBottom: 4, fontSize: 18 }}>{lookbook.name}</h3>
              <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{getStyleLabel(lookbook.style)}</p>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 12, minHeight: 40 }}>{lookbook.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#888' }}>{lookbook.products.length} sản phẩm</span>
                <span style={{ fontWeight: 600, color: '#667eea' }}>{formatCurrency(lookbook.totalPrice)}</span>
              </div>
              <div className="action-buttons">
                <button className="btn-action btn-edit" onClick={() => openEdit(lookbook)}>
                  <i className="fa fa-edit"></i>
                </button>
                <button className="btn-action btn-delete" onClick={() => handleDelete(lookbook.id)}>
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {lookbooks.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <i className="fa fa-images" style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }}></i>
          <p style={{ color: '#888' }}>Chưa có lookbook nào</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal active" onClick={() => setShowModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editId ? 'Sửa Lookbook' : 'Thêm Lookbook mới'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label required">Tên Lookbook</label>
                    <input 
                      className="form-control" 
                      value={form.name || ''} 
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="VD: Office Chic, Street Style..."
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phong cách</label>
                    <select 
                      className="form-control" 
                      value={form.style || 'office'} 
                      onChange={e => setForm({ ...form, style: e.target.value })}
                    >
                      <option value="office">Office Chic</option>
                      <option value="street">Street Style</option>
                      <option value="casual">Casual</option>
                      <option value="party">Party</option>
                      <option value="weekend">Weekend Chill</option>
                      <option value="sport">Sporty</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mô tả ngắn</label>
                  <input 
                    className="form-control" 
                    value={form.description || ''} 
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="VD: 3 items – 5 outfit đi làm cả tuần"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hình ảnh Lookbook (URL)</label>
                  <input 
                    className="form-control" 
                    value={form.image || ''} 
                    onChange={e => { setForm({ ...form, image: e.target.value }); setImagePreview(e.target.value); }}
                    placeholder="https://example.com/image.jpg"
                  />
                  {imagePreview && (
                    <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden' }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Trạng thái</label>
                  <select 
                    className="form-control" 
                    value={form.status || 'active'} 
                    onChange={e => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
                  >
                    <option value="active">Hiển thị</option>
                    <option value="inactive">Ẩn</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="btn btn-primary" onClick={handleSave}>
                  <i className="fa fa-save"></i> Lưu Lookbook
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
