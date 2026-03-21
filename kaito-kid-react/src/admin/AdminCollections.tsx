// Quản lý Bộ sưu tập - match admin structure

import { useState, useEffect } from 'react';

interface Collection {
  id: number;
  name: string;
  description: string;
  image: string;
  order: number;
  status: 'active' | 'hidden';
  productCount: number;
}

export default function AdminCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Collection>>({});
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('collections') || '[]');
    if (saved.length > 0) {
      setCollections(saved);
    } else {
      const defaults: Collection[] = [
        { id: 1, name: 'Summer 2024', description: 'Bộ sưu tập mùa hè năng động', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b', order: 1, status: 'active', productCount: 12 },
        { id: 2, name: 'Winter Collection', description: 'Ấm áp mùa đông', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d', order: 2, status: 'active', productCount: 8 },
        { id: 3, name: 'Street Style', description: 'Phong cách đường phố', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04', order: 3, status: 'active', productCount: 15 },
      ];
      setCollections(defaults);
      localStorage.setItem('collections', JSON.stringify(defaults));
    }
  }, []);

  const saveCollections = (list: Collection[]) => {
    setCollections(list);
    localStorage.setItem('collections', JSON.stringify(list));
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', description: '', image: '', order: 1, status: 'active', productCount: 0 });
    setImagePreview('');
    setShowModal(true);
  };

  const openEdit = (collection: Collection) => {
    setEditId(collection.id);
    setForm({ ...collection });
    setImagePreview(collection.image);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name?.trim()) {
      alert('Vui lòng nhập tên bộ sưu tập');
      return;
    }

    let list = [...collections];
    if (editId) {
      list = list.map(c => c.id === editId ? { ...c, ...form } as Collection : c);
    } else {
      list.push({ id: Date.now(), ...form, productCount: 0 } as Collection);
    }
    
    saveCollections(list);
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Xóa bộ sưu tập này?')) {
      saveCollections(collections.filter(c => c.id !== id));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setForm({ ...form, image: url });
    setImagePreview(url);
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Quản lý Bộ sưu tập</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}>
            <i className="fa fa-plus"></i> Thêm bộ sưu tập
          </button>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="collections-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
        {collections.map(collection => (
          <div key={collection.id} className="card collection-card">
            <div className="collection-image" style={{ 
              height: 200, 
              backgroundImage: `url(${collection.image})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              borderRadius: '8px 8px 0 0',
              marginBottom: 16
            }}></div>
            <div style={{ padding: '0 16px 16px' }}>
              <h3 style={{ marginBottom: 8, fontSize: 18 }}>{collection.name}</h3>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 12, minHeight: 40 }}>{collection.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#888' }}>{collection.productCount} sản phẩm</span>
                <span className={`badge ${collection.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                  {collection.status === 'active' ? 'Hiển thị' : 'Ẩn'}
                </span>
              </div>
              <div className="action-buttons">
                <button className="btn-action btn-edit" onClick={() => openEdit(collection)}>
                  <i className="fa fa-edit"></i>
                </button>
                <button className="btn-action btn-delete" onClick={() => handleDelete(collection.id)}>
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {collections.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <i className="fa fa-images" style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }}></i>
          <p style={{ color: '#888' }}>Chưa có bộ sưu tập nào</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal active" onClick={() => setShowModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editId ? 'Sửa bộ sưu tập' : 'Thêm bộ sưu tập'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label required">Tên bộ sưu tập</label>
                  <input 
                    className="form-control" 
                    value={form.name || ''} 
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ví dụ: Summer 2024"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea 
                    className="form-control" 
                    rows={4}
                    value={form.description || ''} 
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả về bộ sưu tập..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hình ảnh đại diện (URL)</label>
                  <input 
                    className="form-control" 
                    value={form.image || ''} 
                    onChange={handleImageChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  {imagePreview && (
                    <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden' }}>
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
                    </div>
                  )}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Thứ tự hiển thị</label>
                    <input 
                      className="form-control" 
                      type="number"
                      min="1"
                      value={form.order || 1} 
                      onChange={e => setForm({ ...form, order: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Trạng thái</label>
                    <select 
                      className="form-control" 
                      value={form.status || 'active'} 
                      onChange={e => setForm({ ...form, status: e.target.value as 'active' | 'hidden' })}
                    >
                      <option value="active">Hiển thị</option>
                      <option value="hidden">Ẩn</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="btn btn-primary" onClick={handleSave}>
                  <i className="fa fa-save"></i> Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
