// Quan ly danh muc - match admin structure

import { useState, useEffect } from 'react';

interface Category { id: number; name: string; slug: string; description: string; productCount: number; }

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('categories') || '[]');
    if (saved.length > 0) { setCategories(saved); }
    else {
      const defaults: Category[] = [
        { id: 1, name: 'Áo', slug: 'ao', description: 'Áo sơ mi, áo thun, áo khoác', productCount: 0 },
        { id: 2, name: 'Quần', slug: 'quan', description: 'Quần jeans, quần tây, quần short', productCount: 0 },
        { id: 3, name: 'Váy', slug: 'vay', description: 'Váy liền, chân váy', productCount: 0 },
        { id: 4, name: 'Phụ kiện', slug: 'phu-kien', description: 'Túi, mũ, thắt lưng', productCount: 0 },
      ];
      setCategories(defaults);
      localStorage.setItem('categories', JSON.stringify(defaults));
    }
  }, []);

  const saveCats = (list: Category[]) => { setCategories(list); localStorage.setItem('categories', JSON.stringify(list)); };

  const handleSave = () => {
    if (!name.trim()) return;
    let list = [...categories];
    if (editId) {
      list = list.map(c => c.id === editId ? { ...c, name, description: desc } : c);
    } else {
      list.push({ id: Date.now(), name, slug: name.toLowerCase().replace(/\s+/g, '-'), description: desc, productCount: 0 });
    }
    saveCats(list);
    setShowForm(false); setName(''); setDesc(''); setEditId(null);
  };

  const handleDelete = (id: number) => { if (confirm('Xóa danh mục?')) saveCats(categories.filter(c => c.id !== id)); };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Quản lý danh mục</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setEditId(null); setName(''); setDesc(''); setShowForm(true); }}>
            <i className="fa fa-plus"></i> Thêm danh mục
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {categories.map(c => (
          <div key={c.id} className="card">
            <h3 style={{ marginBottom: 8 }}>{c.name}</h3>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>{c.description}</p>
            <div className="action-buttons">
              <button className="btn-action btn-edit" onClick={() => { setEditId(c.id); setName(c.name); setDesc(c.description); setShowForm(true); }}>
                <i className="fa fa-edit"></i>
              </button>
              <button className="btn-action btn-delete" onClick={() => handleDelete(c.id)}><i className="fa fa-trash"></i></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal active" onClick={() => setShowForm(false)}>
          <div className="modal-dialog" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editId ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-group"><label className="form-label required">Tên</label><input className="form-control" value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="form-group"><label className="form-label">Mô tả</label><input className="form-control" value={desc} onChange={e => setDesc(e.target.value)} /></div>
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
