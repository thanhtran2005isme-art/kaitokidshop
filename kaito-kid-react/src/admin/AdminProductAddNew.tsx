/**
 * Admin Product Add - API Version
 * Simplified form to create products via backend API
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminIcon from '../components/admin/AdminIcon';
import { useAdminUi } from '../components/admin/AdminUiProvider';
import { adminProductsApi } from '../services/api';
import type { Product } from '../types';

function slugify(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminProductAdd() {
  const { notify } = useAdminUi();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'Ao',
    gender: 'Unisex',
    price: 0,
    oldPrice: 0,
    stock: 0,
    status: 'active' as Product['status'],
    image: '',
    description: '',
    sku: '',
    slug: '',
    isNew: false,
    isSale: false,
    isBestSeller: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      notify({ tone: 'error', message: 'Vui lòng nhập tên sản phẩm' });
      return;
    }

    if (form.price <= 0) {
      notify({ tone: 'error', message: 'Giá sản phẩm phải lớn hơn 0' });
      return;
    }

    setSaving(true);

    const product: Partial<Product> = {
      name: form.name.trim(),
      category: form.category,
      gender: form.gender,
      price: form.price,
      oldPrice: form.oldPrice > 0 ? form.oldPrice : null,
      stock: form.stock,
      status: form.status,
      image: form.image.trim() || '/placeholder.jpg',
      description: form.description.trim() || form.name.trim(),
      sku: form.sku.trim() || `SKU-${Date.now()}`,
      slug: form.slug.trim() || slugify(form.name),
      isNew: form.isNew,
      isSale: form.isSale,
      isBestSeller: form.isBestSeller,
      rating: 0,
      soldCount: 0,
      colors: ['Trắng'],
      sizes: ['M', 'L', 'XL'],
    };

    const result = await adminProductsApi.create(product);

    setSaving(false);

    if (result.success) {
      notify({ tone: 'success', message: 'Đã tạo sản phẩm thành công' });
      navigate('/admin/products');
    } else {
      notify({ tone: 'error', message: result.error || 'Không thể tạo sản phẩm' });
    }
  };

  return (
    <div className="product-add-page">
      <div className="page-header">
        <div>
          <h1>Thêm sản phẩm mới</h1>
          <p>Nhập thông tin cơ bản để tạo sản phẩm mới trong catalog.</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/admin/products')}
            disabled={saving}
          >
            <AdminIcon name="fa-arrow-left" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-section">
          <h2>Thông tin cơ bản</h2>

          <div className="form-group">
            <label className="form-label required">Tên sản phẩm</label>
            <input
              type="text"
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ví dụ: Áo sơ mi trắng"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Danh mục</label>
              <select
                className="form-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Ao">Áo</option>
                <option value="Quan">Quần</option>
                <option value="Vay">Váy</option>
                <option value="Dam">Đầm</option>
                <option value="Phu kien">Phụ kiện</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Giới tính</label>
              <select
                className="form-select"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
                <option value="Unisex">Unisex</option>
                <option value="Tre em">Trẻ em</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mô tả chi tiết về sản phẩm..."
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Giá và tồn kho</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label required">Giá bán (VNĐ)</label>
              <input
                type="number"
                className="form-input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Giá gốc (VNĐ)</label>
              <input
                type="number"
                className="form-input"
                value={form.oldPrice}
                onChange={(e) => setForm({ ...form, oldPrice: Number(e.target.value) })}
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tồn kho</label>
              <input
                type="number"
                className="form-input"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Hình ảnh và SEO</h2>

          <div className="form-group">
            <label className="form-label">URL hình ảnh</label>
            <input
              type="text"
              className="form-input"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">SKU</label>
              <input
                type="text"
                className="form-input"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="Tự động tạo nếu để trống"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Slug</label>
              <input
                type="text"
                className="form-input"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="Tự động tạo từ tên"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Trạng thái và cờ</h2>

          <div className="form-group">
            <label className="form-label">Trạng thái</label>
            <select
              className="form-select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Product['status'] })}
            >
              <option value="active">Đang bán</option>
              <option value="draft">Nháp</option>
              <option value="out-of-stock">Hết hàng</option>
            </select>
          </div>

          <div className="form-checkboxes">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
              />
              <span>Sản phẩm mới</span>
            </label>

            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={form.isSale}
                onChange={(e) => setForm({ ...form, isSale: e.target.checked })}
              />
              <span>Đang sale</span>
            </label>

            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={form.isBestSeller}
                onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
              />
              <span>Best seller</span>
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin/products')} disabled={saving}>
            Hủy
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Tạo sản phẩm'}
          </button>
        </div>
      </form>
    </div>
  );
}
