import { useState, useEffect } from 'react';

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: 'published' | 'draft' | 'private';
  order: number;
  createdAt: string;
}

export default function AdminPages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    status: 'published' as const,
    order: 1,
  });

  useEffect(() => {
    setPages(JSON.parse(localStorage.getItem('pages') || '[]'));
  }, []);

  const savePages = (list: Page[]) => {
    setPages(list);
    localStorage.setItem('pages', JSON.stringify(list));
  };

  const handleSave = () => {
    if (!form.title || !form.slug || !form.content) {
      alert('Điền đầy đủ thông tin');
      return;
    }
    const newPage: Page = {
      id: Date.now(),
      ...form,
      createdAt: new Date().toISOString(),
    };
    savePages([...pages, newPage]);
    setShowForm(false);
    setForm({
      title: '',
      slug: '',
      content: '',
      status: 'published',
      order: 1,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Xóa trang này?')) savePages(pages.filter(p => p.id !== id));
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1>Quản lý Trang nội dung</h1>
        <div className="page-actions">
          <button className="btn-add" onClick={() => setShowForm(true)}>
            <i className="fa fa-plus"></i> Thêm trang
          </button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Tiêu đề trang</th>
                <th style={{ width: 150 }}>URL</th>
                <th style={{ width: 120 }}>Trạng thái</th>
                <th style={{ width: 150 }}>Ngày tạo</th>
                <th style={{ width: 150 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                    Chưa có trang nào
                  </td>
                </tr>
              ) : (
                pages.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.title}</td>
                    <td>/{p.slug}</td>
                    <td>
                      <span
                        className={`badge ${
                          p.status === 'published'
                            ? 'badge-success'
                            : p.status === 'draft'
                            ? 'badge-warning'
                            : 'badge-secondary'
                        }`}
                      >
                        {p.status === 'published'
                          ? 'Đã xuất bản'
                          : p.status === 'draft'
                          ? 'Bản nháp'
                          : 'Riêng tư'}
                      </span>
                    </td>
                    <td>{new Date(p.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button className="btn-action btn-delete" onClick={() => handleDelete(p.id)}>
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal" style={{ display: 'flex' }} onClick={() => setShowForm(false)}>
          <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Thêm trang mới</h3>
                <button className="modal-close" onClick={() => setShowForm(false)}>
                  <i className="fa fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tiêu đề trang <span className="required">*</span></label>
                  <input
                    className="form-control"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="Nhập tiêu đề trang"
                  />
                </div>
                <div className="form-group">
                  <label>URL (slug) <span className="required">*</span></label>
                  <input
                    className="form-control"
                    value={form.slug}
                    onChange={e => setForm({ ...form, slug: e.target.value })}
                    placeholder="ve-chung-toi"
                    pattern="[a-z0-9-]+"
                  />
                  <small style={{ color: '#666', fontSize: 12, marginTop: 4, display: 'block' }}>
                    Chỉ dùng chữ thường, số và dấu gạch ngang. Ví dụ: ve-chung-toi, chinh-sach-bao-mat
                  </small>
                </div>
                <div className="form-group">
                  <label>Nội dung trang <span className="required">*</span></label>
                  <textarea
                    className="form-control"
                    rows={15}
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                    placeholder="Nhập nội dung trang..."
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Trạng thái</label>
                    <select
                      className="form-control"
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value as any })}
                    >
                      <option value="published">Đã xuất bản</option>
                      <option value="draft">Bản nháp</option>
                      <option value="private">Riêng tư</option>
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
                  <i className="fa fa-save"></i> Lưu trang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
