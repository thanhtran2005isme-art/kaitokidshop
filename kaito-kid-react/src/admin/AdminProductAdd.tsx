import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product } from '../types';

export default function AdminProductAdd() {
  const navigate = useNavigate();
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [images, setImages] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '',
    shortDesc: '',
    description: '',
    price: 0,
    salePrice: 0,
    menu: '',
    category: '',
    collection: '',
    status: 'active' as const,
    sku: '',
    slug: '',
    metaTitle: '',
    metaDesc: '',
  });

  const categories: Record<string, { value: string; label: string }[]> = {
    nu: [
      { value: 'ao-nu', label: 'Áo nữ' },
      { value: 'quan-nu', label: 'Quần nữ' },
      { value: 'dam-nu', label: 'Đầm nữ' },
      { value: 'vay-nu', label: 'Váy nữ' },
    ],
    nam: [
      { value: 'ao-nam', label: 'Áo nam' },
      { value: 'quan-nam', label: 'Quần nam' },
      { value: 'ao-khoac-nam', label: 'Áo khoác nam' },
    ],
    treem: [
      { value: 'ao-tre-em', label: 'Áo trẻ em' },
      { value: 'quan-tre-em', label: 'Quần trẻ em' },
    ],
  };

  const colors = [
    { name: 'Trắng', color: '#ffffff', border: true },
    { name: 'Đen', color: '#000000' },
    { name: 'Xám', color: '#9ca3af' },
    { name: 'Xanh navy', color: '#1e3a8a' },
    { name: 'Xanh dương', color: '#3b82f6' },
    { name: 'Đỏ', color: '#ef4444' },
    { name: 'Hồng', color: '#ec4899' },
    { name: 'Vàng', color: '#fbbf24' },
  ];

  const handleAddImageUrl = () => {
    const input = document.getElementById('imageUrlInput') as HTMLInputElement;
    const url = input.value.trim();
    if (url && url.startsWith('http')) {
      setImages([...images, url]);
      input.value = '';
    } else {
      alert('Vui lòng nhập URL hợp lệ (bắt đầu bằng http)');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.menu || !form.category) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (images.length === 0) {
      alert('Vui lòng thêm ít nhất 1 hình ảnh');
      return;
    }

    const newProduct: Omit<Product, 'id'> = {
      name: form.name,
      description: form.description,
      price: form.price,
      oldPrice: form.salePrice > 0 ? form.price : null,
      image: images[0],
      images: images,
      category: form.category,
      gender: form.menu === 'nu' ? 'Nữ' : form.menu === 'nam' ? 'Nam' : 'Trẻ em',
      sizes: selectedSizes.length > 0 ? selectedSizes : ['M'],
      colors: selectedColors.length > 0 ? selectedColors : ['Trắng'],
      stock: 0,
      soldCount: 0,
      rating: 0,
      status: form.status,
      sku: form.sku || `SKU-${Date.now()}`,
      isNew: true,
      isSale: form.salePrice > 0,
      isBestSeller: false,
    };

    productService.create(newProduct);
    alert('Đã thêm sản phẩm thành công!');
    navigate('/admin/products');
  };

  const discountPercent =
    form.price > 0 && form.salePrice > 0
      ? Math.round(((form.price - form.salePrice) / form.price) * 100)
      : 0;

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1>Thêm sản phẩm mới</h1>
        <div className="page-actions">
          <button className="btn-secondary" onClick={() => navigate('/admin/products')}>
            <i className="fa fa-times"></i> Hủy
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <i className="fa fa-save"></i> Lưu sản phẩm
          </button>
        </div>
      </div>

      <div className="form-layout">
        {/* Left Column */}
        <div className="form-main">
          {/* Basic Info */}
          <div className="form-card">
            <h3 className="form-card-title">Thông tin cơ bản</h3>

            <div className="form-group">
              <label>
                Tên sản phẩm <span className="required">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ví dụ: Áo sơ mi trắng basic"
              />
            </div>

            <div className="form-group">
              <label>Mô tả ngắn</label>
              <textarea
                rows={3}
                value={form.shortDesc}
                onChange={e => setForm({ ...form, shortDesc: e.target.value })}
                placeholder="Mô tả ngắn gọn về sản phẩm..."
              />
            </div>

            <div className="form-group">
              <label>Mô tả chi tiết</label>
              <textarea
                rows={8}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Mô tả chi tiết về sản phẩm, chất liệu, cách bảo quản..."
              />
            </div>
          </div>

          {/* Images */}
          <div className="form-card">
            <h3 className="form-card-title">Hình ảnh sản phẩm</h3>

            <div className="image-upload-tabs">
              <button
                type="button"
                className={`image-tab ${imageTab === 'upload' ? 'active' : ''}`}
                onClick={() => setImageTab('upload')}
              >
                <i className="fa fa-cloud-upload-alt"></i> Tải ảnh lên
              </button>
              <button
                type="button"
                className={`image-tab ${imageTab === 'url' ? 'active' : ''}`}
                onClick={() => setImageTab('url')}
              >
                <i className="fa fa-link"></i> Nhập URL
              </button>
            </div>

            <div className="image-upload-area">
              {imageTab === 'upload' ? (
                <div className="image-upload-box">
                  <i className="fa fa-cloud-upload-alt"></i>
                  <p>Tính năng upload file đang phát triển</p>
                  <span>Vui lòng dùng tab "Nhập URL"</span>
                </div>
              ) : (
                <div className="image-url-box">
                  <div className="url-input-group">
                    <input
                      type="text"
                      id="imageUrlInput"
                      placeholder="Nhập URL hình ảnh (https://...)"
                    />
                    <button type="button" className="btn-add-url" onClick={handleAddImageUrl}>
                      <i className="fa fa-plus"></i> Thêm
                    </button>
                  </div>
                  <p className="url-hint">Ví dụ: https://example.com/image.jpg</p>
                </div>
              )}

              <div className="image-preview-grid">
                {images.map((img, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={img} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                    {index === 0 && <span className="image-main-badge">Ảnh chính</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="form-card">
            <h3 className="form-card-title">Giá bán</h3>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Giá gốc <span className="required">*</span>
                </label>
                <input
                  type="number"
                  value={form.price || ''}
                  onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                />
                <span className="input-suffix">đ</span>
              </div>

              <div className="form-group">
                <label>Giá khuyến mãi</label>
                <input
                  type="number"
                  value={form.salePrice || ''}
                  onChange={e => setForm({ ...form, salePrice: Number(e.target.value) })}
                  placeholder="0"
                  min="0"
                />
                <span className="input-suffix">đ</span>
              </div>
            </div>

            {discountPercent > 0 && (
              <div className="discount-preview">
                <i className="fa fa-tag"></i>
                <span>
                  Giảm <strong>{discountPercent}%</strong>
                </span>
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="form-card">
            <h3 className="form-card-title">Biến thể sản phẩm</h3>

            <div className="variant-options">
              <div className="form-group">
                <label>Kích thước</label>
                <div className="checkbox-group">
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <label key={size} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                      />
                      {size}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Màu sắc</label>
                <div className="color-picker-group">
                  {colors.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      className={`color-btn ${selectedColors.includes(c.name) ? 'active' : ''}`}
                      style={{
                        background: c.color,
                        border: c.border ? '1px solid #ddd' : 'none',
                      }}
                      onClick={() => toggleColor(c.name)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="form-sidebar">
          {/* Status */}
          <div className="form-card">
            <h3 className="form-card-title">Trạng thái</h3>

            <div className="form-group">
              <label>Hiển thị</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as any })}
              >
                <option value="active">Đang bán</option>
                <option value="draft">Nháp</option>
                <option value="hidden">Ẩn</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="form-card">
            <h3 className="form-card-title">Danh mục</h3>

            <div className="form-group">
              <label>
                Menu <span className="required">*</span>
              </label>
              <select
                value={form.menu}
                onChange={e => setForm({ ...form, menu: e.target.value, category: '' })}
              >
                <option value="">Chọn menu</option>
                <option value="nu">Nữ</option>
                <option value="nam">Nam</option>
                <option value="treem">Trẻ em</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Danh mục chính <span className="required">*</span>
              </label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                disabled={!form.menu}
              >
                <option value="">
                  {form.menu ? 'Chọn danh mục' : 'Chọn menu trước'}
                </option>
                {form.menu &&
                  categories[form.menu]?.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label>Bộ sưu tập</label>
              <select
                value={form.collection}
                onChange={e => setForm({ ...form, collection: e.target.value })}
              >
                <option value="">Không có</option>
                <option value="summer-2024">Summer 2024</option>
                <option value="office-style">Office Style</option>
                <option value="street-wear">Street Wear</option>
              </select>
            </div>
          </div>

          {/* Inventory */}
          <div className="form-card">
            <h3 className="form-card-title">Kho hàng</h3>

            <div className="form-group">
              <label>SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })}
                placeholder="Tự động tạo"
              />
            </div>

            <div className="inventory-note">
              <i className="fa fa-info-circle"></i>
              <span>
                Số lượng tồn kho sẽ được quản lý tại <a href="/admin/inventory">Kho hàng</a> sau
                khi tạo sản phẩm
              </span>
            </div>
          </div>

          {/* SEO */}
          <div className="form-card">
            <h3 className="form-card-title">SEO</h3>

            <div className="form-group">
              <label>URL slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => setForm({ ...form, slug: e.target.value })}
                placeholder="ao-so-mi-trang-basic"
              />
            </div>

            <div className="form-group">
              <label>Meta title</label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={e => setForm({ ...form, metaTitle: e.target.value })}
                placeholder="Tiêu đề SEO"
              />
            </div>

            <div className="form-group">
              <label>Meta description</label>
              <textarea
                rows={3}
                value={form.metaDesc}
                onChange={e => setForm({ ...form, metaDesc: e.target.value })}
                placeholder="Mô tả SEO..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
