// Quản lý Thuộc tính - match admin structure

import { useState, useEffect } from 'react';

interface Attribute {
  id: number;
  name: string;
  type: 'text' | 'select' | 'color';
  values: string[];
}

export default function AdminAttributes() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Attribute>>({});
  const [valuesText, setValuesText] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('attributes') || '[]');
    if (saved.length > 0) {
      setAttributes(saved);
    } else {
      const defaults: Attribute[] = [
        { id: 1, name: 'Chất liệu', type: 'select', values: ['Cotton', 'Polyester', 'Linen', 'Silk', 'Denim'] },
        { id: 2, name: 'Kiểu dáng', type: 'select', values: ['Slim fit', 'Regular fit', 'Oversized', 'Cropped'] },
        { id: 3, name: 'Màu sắc', type: 'color', values: ['Đen', 'Trắng', 'Xám', 'Xanh navy', 'Be'] },
        { id: 4, name: 'Size', type: 'select', values: ['S', 'M', 'L', 'XL', 'XXL'] },
      ];
      setAttributes(defaults);
      localStorage.setItem('attributes', JSON.stringify(defaults));
    }
  }, []);

  const saveAttributes = (list: Attribute[]) => {
    setAttributes(list);
    localStorage.setItem('attributes', JSON.stringify(list));
  };

  const openAdd = () => {
    setEditId(null);
    setForm({ name: '', type: 'text', values: [] });
    setValuesText('');
    setShowModal(true);
  };

  const openEdit = (attr: Attribute) => {
    setEditId(attr.id);
    setForm({ ...attr });
    setValuesText(attr.values.join('\n'));
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name?.trim()) {
      alert('Vui lòng nhập tên thuộc tính');
      return;
    }

    const values = valuesText.split('\n').map(v => v.trim()).filter(v => v);
    
    let list = [...attributes];
    if (editId) {
      list = list.map(a => a.id === editId ? { ...a, ...form, values } as Attribute : a);
    } else {
      list.push({ id: Date.now(), ...form, values } as Attribute);
    }
    
    saveAttributes(list);
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Xóa thuộc tính này?')) {
      saveAttributes(attributes.filter(a => a.id !== id));
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Văn bản';
      case 'select': return 'Lựa chọn';
      case 'color': return 'Màu sắc';
      default: return type;
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Quản lý Thuộc tính</h1>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openAdd}>
            <i className="fa fa-plus"></i> Thêm thuộc tính
          </button>
        </div>
      </div>

      {/* Attributes List */}
      <div className="attributes-container" style={{ display: 'grid', gap: 20 }}>
        {attributes.map(attr => (
          <div key={attr.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ marginBottom: 4, fontSize: 18 }}>{attr.name}</h3>
                <span className="badge badge-info" style={{ fontSize: 12 }}>
                  {getTypeLabel(attr.type)}
                </span>
              </div>
              <div className="action-buttons">
                <button className="btn-action btn-edit" onClick={() => openEdit(attr)}>
                  <i className="fa fa-edit"></i>
                </button>
                <button className="btn-action btn-delete" onClick={() => handleDelete(attr.id)}>
                  <i className="fa fa-trash"></i>
                </button>
              </div>
            </div>

            {attr.values.length > 0 && (
              <div>
                <label style={{ fontSize: 13, color: '#888', marginBottom: 8, display: 'block' }}>
                  Giá trị ({attr.values.length}):
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {attr.values.map((value, idx) => (
                    <span key={idx} className="badge badge-secondary" style={{ fontSize: 13 }}>
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {attributes.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <i className="fa fa-tags" style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }}></i>
          <p style={{ color: '#888' }}>Chưa có thuộc tính nào</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal active" onClick={() => setShowModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>{editId ? 'Sửa thuộc tính' : 'Thêm thuộc tính'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label required">Tên thuộc tính</label>
                  <input 
                    className="form-control" 
                    value={form.name || ''} 
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ví dụ: Chất liệu, Kiểu dáng"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Loại thuộc tính</label>
                  <select 
                    className="form-control" 
                    value={form.type || 'text'} 
                    onChange={e => setForm({ ...form, type: e.target.value as 'text' | 'select' | 'color' })}
                  >
                    <option value="text">Văn bản</option>
                    <option value="select">Lựa chọn</option>
                    <option value="color">Màu sắc</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Giá trị <span style={{ fontSize: 12, color: '#888', fontWeight: 400 }}>(Nhập mỗi giá trị trên một dòng)</span>
                  </label>
                  <textarea 
                    className="form-control" 
                    rows={6}
                    value={valuesText} 
                    onChange={e => setValuesText(e.target.value)}
                    placeholder="Cotton&#10;Polyester&#10;Linen&#10;Silk"
                  />
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
