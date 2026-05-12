import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product } from '../types';
import AdminIcon from '../components/admin/AdminIcon';

interface CollectionOption {
  id: number;
  name: string;
  slug: string;
  status?: 'active' | 'hidden';
}

interface BuilderFormState {
  name: string;
  shortDesc: string;
  description: string;
  specs: string;
  price: number;
  salePrice: number;
  menu: ProductMenuKey | '';
  category: string;
  style: string;
  ageGroup: string;
  collection: string;
  status: Product['status'];
  sku: string;
  slug: string;
  metaTitle: string;
  metaDesc: string;
  isNew: boolean;
  isBestSeller: boolean;
}

const MENU_TO_GENDER: Record<ProductMenuKey, Product['gender']> = {
  nu: 'Nu',
  nam: 'Nam',
  treem: 'Tre em',
};

const MENU_OPTIONS: Array<{ value: ProductMenuKey; label: string; description: string }> = [
  { value: 'nu', label: 'Nữ', description: 'Sản phẩm nữ.' },
  { value: 'nam', label: 'Nam', description: 'Sản phẩm nam.' },
  { value: 'treem', label: 'Trẻ em', description: 'Sản phẩm trẻ em.' },
];

const STATUS_OPTIONS: Array<{
  value: Product['status'];
  label: string;
  hint: string;
  icon: string;
}> = [
  {
    value: 'active',
    label: 'Đang bán',
    hint: 'Hiển thị trên storefront.',
    icon: 'fa-check-circle',
  },
  {
    value: 'draft',
    label: 'Bản nháp',
    hint: 'Lưu để bổ sung sau.',
    icon: 'fa-folder-open',
  },
  {
    value: 'out-of-stock',
    label: 'Hết hàng',
    hint: 'Tạo SKU, mở bán sau.',
    icon: 'fa-box-open',
  },
];

const DEFAULT_COLLECTIONS: CollectionOption[] = [
  { id: 1, name: 'Summer 2024', slug: 'summer-2024', status: 'active' },
  { id: 2, name: 'Office Style', slug: 'office-style', status: 'active' },
  { id: 3, name: 'Street Wear', slug: 'street-wear', status: 'active' },
];

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const COLOR_OPTIONS = [
  { name: 'Trắng', color: '#ffffff', border: true },
  { name: 'Đen', color: '#111827' },
  { name: 'Xám', color: '#9ca3af' },
  { name: 'Xanh navy', color: '#1e3a8a' },
  { name: 'Xanh dương', color: '#3b82f6' },
  { name: 'Đỏ', color: '#ef4444' },
  { name: 'Hồng', color: '#ec4899' },
  { name: 'Vàng', color: '#fbbf24' },
];

const STUDIO_STEPS = [
  { id: 'identity', label: 'Thông tin', icon: 'fa-pen-ruler', detail: 'Tên và mô tả.' },
  { id: 'media', label: 'Ảnh', icon: 'fa-image', detail: 'Cover và gallery.' },
  { id: 'pricing', label: 'Giá', icon: 'fa-tag', detail: 'Giá bán và sale.' },
  { id: 'variants', label: 'Size/màu', icon: 'fa-layer-group', detail: 'Biến thể.' },
  { id: 'publishing', label: 'Phân loại', icon: 'fa-diagram-project', detail: 'Menu và danh mục.' },
  { id: 'seo', label: 'SEO', icon: 'fa-globe', detail: 'Slug và meta.' },
];

const DEFAULT_FORM: BuilderFormState = {
  name: '',
  shortDesc: '',
  description: '',
  specs: '',
  price: 0,
  salePrice: 0,
  menu: '',
  category: '',
  style: '',
  ageGroup: '',
  collection: '',
  status: 'active',
  sku: '',
  slug: '',
  metaTitle: '',
  metaDesc: '',
  isNew: true,
  isBestSeller: false,
};

function slugify(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trim()}...`;
}

function formatCurrency(value: number) {
  if (value <= 0) {
    return 'Chưa đặt giá';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

function getLengthTone(length: number, min: number, max: number) {
  if (length === 0) {
    return 'empty';
  }

  if (length < min) {
    return 'short';
  }

  if (length > max) {
    return 'long';
  }

  return 'good';
}

function readStoredCollections(): CollectionOption[] {
  try {
    const rawCollections = JSON.parse(localStorage.getItem('collections') || '[]');

    if (Array.isArray(rawCollections) && rawCollections.length > 0) {
      const normalizedCollections = rawCollections
        .map((collection: Partial<CollectionOption>, index: number) => {
          const name = String(collection.name || '').trim();

          if (!name) {
            return null;
          }

          return {
            id: Number(collection.id) || index + 1,
            name,
            slug: slugify(String(collection.slug || name)),
            status: collection.status === 'hidden' ? 'hidden' : 'active',
          };
        })
        .filter(Boolean) as CollectionOption[];

      if (normalizedCollections.length > 0) {
        return normalizedCollections;
      }
    }
  } catch {
    return DEFAULT_COLLECTIONS;
  }

  return DEFAULT_COLLECTIONS;
}

function buildSkuCandidate(name: string, menu: ProductMenuKey | '', category: string) {
  const namePart = slugify(name).replace(/-/g, '').toUpperCase().slice(0, 8) || 'NEWITEM';
  const menuPart = menu ? menu.toUpperCase() : 'GEN';
  const categoryPart = (toCanonicalCategory(category) || 'Ao').replace(/\s+/g, '').toUpperCase();
  return `${menuPart}-${categoryPart}-${namePart}`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error(`Không the đọc file ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function getPrimaryActionLabel(status: Product['status']) {
  switch (status) {
    case 'draft':
      return 'Tạo bản nháp';
    case 'out-of-stock':
      return 'Tạo và đánh dấu hết hàng';
    case 'active':
    default:
      return 'Tạo sản phẩm';
  }
}

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

  useEffect(() => {
    setCollectionOptions(readStoredCollections());
  }, []);

  const activeCategoryGroups = form.menu ? getMenuTaxonomyGroups(form.menu, ['category']) : [];
  const activeCategoryOptions = form.menu ? getMenuCategoryOptions(form.menu, ['category']) : [];
  const activeStyleOptions = form.menu && form.menu !== 'treem' ? getMenuCategoryOptions(form.menu, ['style']) : [];
  const activeAgeOptions = form.menu === 'treem' ? getMenuCategoryOptions(form.menu, ['age']) : [];
  const selectedMenuLabel = MENU_OPTIONS.find((option) => option.value === form.menu)?.label || 'Chưa chọn menu';
  const selectedCategoryOption = activeCategoryOptions.find((option) => option.value === form.category);
  const selectedCategoryLabel = selectedCategoryOption?.label || 'Chưa chọn danh mục';
  const selectedCategoryGroupLabel = selectedCategoryOption?.group || 'Chưa có nhóm';
  const selectedStyleLabel = activeStyleOptions.find((option) => option.value === form.style)?.label || 'Không chọn';
  const selectedAgeLabel = activeAgeOptions.find((option) => option.value === form.ageGroup)?.label || 'Không chọn';
  const selectedCollectionLabel =
    collectionOptions.find((collection) => collection.slug === form.collection)?.name || 'Không có collection';
  const suggestedSlug = slugify(form.name.trim() || 'san-pham-mới');
  const resolvedSlug = slugify(form.slug.trim()) || suggestedSlug;
  const suggestedSku = buildSkuCandidate(form.name.trim(), form.menu, form.category);
  const resolvedSku = form.sku.trim().toUpperCase() || suggestedSku;
  const hasSalePrice = form.salePrice > 0 && form.salePrice < form.price;
  const invalidSalePrice = form.salePrice > 0 && form.price > 0 && form.salePrice >= form.price;
  const effectivePrice = hasSalePrice ? form.salePrice : form.price;
  const resolvedMetaTitle = form.metaTitle.trim() || form.name.trim();
  const resolvedMetaDesc = form.metaDesc.trim() || truncate(form.shortDesc.trim() || form.description.trim(), 155);
  const seoTitleTone = getLengthTone(resolvedMetaTitle.length, 35, 65);
  const seoDescTone = getLengthTone(resolvedMetaDesc.length, 70, 160);
  const previewDescription =
    truncate(form.shortDesc.trim() || form.description.trim(), 140) || 'Mô tả ngắn cho sản phẩm sẽ hiển thị ở đây.';
  const coverImage = images[0] || '';

  const variantPairs = useMemo(() => {
    const sizes = selectedSizes.length > 0 ? selectedSizes : [];
    const colors = selectedColors.length > 0 ? selectedColors : [];

    if (sizes.length === 0 || colors.length === 0) {
      return [];
    }

    return sizes.flatMap((size) =>
      colors.map((color) => ({
        key: `${size}-${color}`,
        size,
        color,
        sku: `${resolvedSku}-${size.replace(/\s+/g, '').toUpperCase()}-${slugify(color).toUpperCase()}`,
      }))
    );
  }, [resolvedSku, selectedColors, selectedSizes]);

  const checklist = useMemo(
    () => [
      {
        key: 'name',
        label: 'Tên rõ ràng',
        description: 'Tên sản phẩm đủ để nhận diện nhanh.',
        done: form.name.trim().length >= 8,
      },
      {
        key: 'media',
        label: 'Có ảnh cover',
        description: 'Cần tối thiểu 1 ảnh để hiển thị.',
        done: images.length > 0,
      },
      {
        key: 'pricing',
        label: 'Giá hợp lệ',
        description: 'Giá gốc lớn hơn 0, giá sale nhỏ hơn giá gốc.',
        done: form.price > 0 && !invalidSalePrice,
      },
      {
        key: 'taxonomy',
        label: 'Có danh mục',
        description: 'Chọn menu và danh mục chính.',
        done: !!form.menu && !!form.category,
      },
      {
        key: 'variants',
        label: 'Có size / màu',
        description: 'Chọn size và màu nếu sản phẩm có biến thể.',
        done: selectedSizes.length > 0 && selectedColors.length > 0,
      },
      {
        key: 'seo',
        label: 'SEO cơ bản',
        description: 'Slug, title và description đã đủ dùng.',
        done: resolvedSlug.length >= 5 && seoTitleTone === 'good' && seoDescTone === 'good',
      },
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

  return (
    <div className="product-add-page">
      <div className="page-header product-builder-header">
        <div className="product-builder-copy">
          <span className="product-builder-eyebrow">Catalog</span>
          <h1>{form.name.trim() || 'Thêm sản phẩm mới'}</h1>
          <p>Nhập thông tin cần thiết để tạo sản phẩm. Các phần nâng cao có thể bổ sung sau.</p>
        </div>

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

      <section className="builder-compact-bar">
        <div className="builder-compact-progress">
          <span>Hoàn thiện</span>
          <strong>{completionRate}%</strong>
          <div className="builder-progress-bar">
            <span style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        <div className="builder-compact-checks">
          {checklist.slice(0, 4).map((item) => (
            <span key={item.key} className={item.done ? 'done' : ''}>
              <AdminIcon name={item.done ? 'fa-check-circle' : 'fa-circle'} />
              {item.label}
            </span>
          ))}
        </div>

        <nav className="builder-compact-nav" aria-label="Đi tới phần nhập liệu">
          {STUDIO_STEPS.map((step) => (
            <a key={step.id} href={`#${step.id}`}>
              <AdminIcon name={step.icon} />
              <span>{step.label}</span>
            </a>
          ))}
        </nav>

        {invalidSalePrice && (
          <div className="builder-inline-alert danger">
            <AdminIcon name="fa-circle-exclamation" />
            <span>Giá sale cần nhỏ hơn giá gốc.</span>
          </div>
        )}
      </section>

      <div className="builder-workspace">
        <div className="builder-main">
          <section id="identity" className="builder-section-card">
            <div className="builder-section-header">
              <div>
                <span className="builder-section-kicker">01. Thông tin</span>
                <h2>Thông tin chính</h2>
                <p>Tên, mô tả ngắn và điểm nhấn cơ bản của sản phẩm.</p>
              </div>
            </div>

            <div className="builder-field-group">
              <label className="builder-label required">Tên sản phẩm</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Ví dụ: Áo sơ mi trắng basic"
              />
            </div>

            <div className="builder-two-column">
              <div className="builder-field-group">
                <label className="builder-label">Mô tả ngắn</label>
                <textarea
                  className="builder-textarea compact"
                  rows={4}
                  value={form.shortDesc}
                  onChange={(event) => handleShortDescChange(event.target.value)}
                  placeholder="Mô tả ngắn để hiển thị trên card sản phẩm."
                />
              </div>

              <div className="builder-field-group">
                <label className="builder-label">Thông số / điểm nhấn</label>
                <textarea
                  className="builder-textarea compact"
                  rows={4}
                  value={form.specs}
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, specs: event.target.value }))}
                  placeholder="Chất liệu, form, điểm nhấn..."
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mô tả chi tiết</label>
              <textarea
                rows={8}
                value={form.description}
                onChange={(event) => setForm((currentForm) => ({ ...currentForm, description: event.target.value }))}
                placeholder="Mô tả chi tiết cho trang sản phẩm."
              />
            </div>
          </div>

          {/* Images */}
          <div className="form-card">
            <h3 className="form-card-title">Hình ảnh sản phẩm</h3>

          <section id="media" className="builder-section-card">
            <div className="builder-section-header">
              <div>
                <span className="builder-section-kicker">02. Ảnh</span>
                <h2>Ảnh sản phẩm</h2>
                <p>Thêm ảnh cover và gallery để sản phẩm hiển thị rõ ràng.</p>
              </div>
            </div>

            <div className="builder-media-grid">
              <div className="builder-media-workbench">
                <div className="builder-tab-row">
                  <button
                    type="button"
                    className={`builder-tab ${imageTab === 'upload' ? 'active' : ''}`}
                    onClick={() => setImageTab('upload')}
                  >
                    <AdminIcon name="fa-cloud-upload-alt" />
                    <span>Tải từ máy</span>
                  </button>
                  <button
                    type="button"
                    className={`builder-tab ${imageTab === 'url' ? 'active' : ''}`}
                    onClick={() => setImageTab('url')}
                  >
                    <AdminIcon name="fa-link" />
                    <span>Thêm URL</span>
                  </button>
                </div>

                {imageTab === 'upload' ? (
                  <div className="builder-upload-shell">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden-file-input"
                      onChange={handleUploadFiles}
                    />
                    <button
                      type="button"
                      className="builder-upload-dropzone"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <AdminIcon name={isUploading ? 'fa-spinner fa-spin' : 'fa-image'} />
                      <strong>{isUploading ? 'Đang xử lý hình ảnh...' : 'Chọn ảnh sản phẩm'}</strong>
                      <span>Nên dùng ảnh cover tỉ lệ 3:4 hoặc 1:1.</span>
                    </button>
                  </div>
                ) : (
                  <div className="builder-url-shell">
                    <div className="builder-url-row">
                      <input
                        className="builder-input"
                        type="text"
                        value={imageUrl}
                        onChange={(event) => setImageUrl(event.target.value)}
                        placeholder="https://example.com/product-image.jpg"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                      />
                      <button type="button" className="builder-inline-btn" onClick={handleAddImageUrl}>
                        <AdminIcon name="fa-plus" />
                        <span>Thêm</span>
                      </button>
                    </div>
                    <p className="builder-help-text">Hỗ trợ ảnh JPG, PNG hoặc WEBP.</p>
                  </div>
                )}

                <div className="builder-gallery-grid">
                  {images.length > 0 ? (
                    images.map((image, index) => (
                      <article key={`${image}-${index}`} className={`builder-gallery-card ${index === 0 ? 'cover' : ''}`}>
                        <img src={image} alt={`Product gallery ${index + 1}`} />
                        <div className="builder-gallery-overlay">
                          {index !== 0 ? (
                            <button type="button" className="builder-gallery-action" onClick={() => handleSetPrimaryImage(index)}>
                              <AdminIcon name="fa-star" />
                              <span>Đặt làm cover</span>
                            </button>
                          ) : (
                            <span className="builder-gallery-badge">Cover</span>
                          )}
                          <button type="button" className="builder-gallery-remove" onClick={() => handleRemoveImage(index)}>
                            <AdminIcon name="fa-times" />
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="builder-gallery-empty">
                      <AdminIcon name="fa-image" />
                      <h3>Chưa có ảnh</h3>
                      <p>Thêm ít nhất một ảnh cover.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="builder-cover-preview">
                <div className="builder-cover-frame">
                  {coverImage ? (
                    <img src={coverImage} alt={form.name || 'Cover preview'} />
                  ) : (
                    <div className="builder-cover-placeholder">
                      <AdminIcon name="fa-image" />
                      <span>Xem trước cover</span>
                    </div>
                  )}
                </div>

                <div className="builder-cover-meta">
                  <strong>{coverImage ? 'Ảnh cover đã sẵn sàng' : 'Cần một ảnh cover'}</strong>
                  <p>
                    {coverImage
                       ? 'Ảnh đầu tiên sẽ dùng làm ảnh chính.'
                      : 'Có thể đặt ảnh bất kỳ làm cover.'}
                  </p>
                  <div className="builder-cover-stats">
                    <span>
                      <AdminIcon name="fa-images" />
                      {images.length} ảnh
                    </span>
                    <span>
                      <AdminIcon name="fa-layer-group" />
                      {variantPairs.length > 0 ? `${variantPairs.length} variant` : 'đang dùng mặc định'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="pricing" className="builder-section-card">
            <div className="builder-section-header">
              <div>
                <span className="builder-section-kicker">03. Giá</span>
                <h2>Giá bán</h2>
                <p>Nhập giá gốc, giá sale nếu có và các nhãn hiển thị.</p>
              </div>
            </div>

            <div className="builder-pricing-grid">
              <div className="builder-pricing-fields">
                <div className="builder-two-column">
                  <div className="builder-field-group has-suffix">
                    <label className="builder-label required">Giá gốc</label>
                    <input
                      className="builder-input"
                      type="number"
                      value={form.price || ''}
                      onChange={(event) => setForm((currentForm) => ({ ...currentForm, price: Number(event.target.value) }))}
                      min="0"
                      placeholder="0"
                    />
                    <span className="builder-suffix">VND</span>
                  </div>

                  <div className="builder-field-group has-suffix">
                    <label className="builder-label">Giá sale</label>
                    <input
                      className="builder-input"
                      type="number"
                      value={form.salePrice || ''}
                      onChange={(event) => setForm((currentForm) => ({ ...currentForm, salePrice: Number(event.target.value) }))}
                      min="0"
                      placeholder="0"
                    />
                    <span className="builder-suffix">VND</span>
                  </div>
                </div>

                <div className={`builder-price-alert ${hasSalePrice ? 'sale' : invalidSalePrice ? 'danger' : 'neutral'}`}>
                  <AdminIcon name={hasSalePrice ? 'fa-tag' : invalidSalePrice ? 'fa-circle-exclamation' : 'fa-info-circle'} />
                  <span>
                    {hasSalePrice
                      ? `Giá bán thực tế sẽ là ${formatCurrency(form.salePrice)}, giảm ${Math.round(
                          ((form.price - form.salePrice) / form.price) * 100
                        )}% so với giá gốc.`
                      : invalidSalePrice
                         ? 'Giá sale cần nhỏ hơn giá gốc.'
                        : 'Không nhập giá sale thì sản phẩm dùng giá gốc.'}
                  </span>
                </div>
              </div>

              <div className="builder-pricing-preview">
                <div className="builder-price-card">
                  <span className="builder-price-kicker">Giá hiển thị</span>
                  <strong>{formatCurrency(effectivePrice)}</strong>
                  {hasSalePrice ? <small>{formatCurrency(form.price)}</small> : <small>Không có khuyến mãi đang áp dụng</small>}
                </div>

                <div className="builder-flag-toggle-grid">
                  <button
                    type="button"
                    className={`builder-flag-toggle ${form.isNew ? 'active' : ''}`}
                    onClick={() => setForm((currentForm) => ({ ...currentForm, isNew: !currentForm.isNew }))}
                  >
                    <AdminIcon name="fa-fire" />
                    <span>Đánh dấu New</span>
                  </button>
                  <button
                    type="button"
                    className={`builder-flag-toggle ${form.isBestSeller ? 'active' : ''}`}
                    onClick={() => setForm((currentForm) => ({ ...currentForm, isBestSeller: !currentForm.isBestSeller }))}
                  >
                    <AdminIcon name="fa-trophy" />
                    <span>Đánh dấu Best Seller</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section id="variants" className="builder-section-card">
            <div className="builder-section-header">
              <div>
                <span className="builder-section-kicker">04. Biến thể</span>
                <h2>Size và màu</h2>
                <p>Chọn size, màu cơ bản. Tồn kho chi tiết cập nhật ở trang Kho.</p>
              </div>
            </div>

            <div className="builder-variant-grid">
              <div className="builder-field-group">
                <label className="builder-label">Size</label>
                <div className="builder-size-grid">
                  {DEFAULT_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`builder-size-chip ${selectedSizes.includes(size) ? 'active' : ''}`}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="builder-field-group">
                <label className="builder-label">Bảng màu</label>
                <div className="builder-color-grid">
                  {COLOR_OPTIONS.map((colorOption) => (
                    <button
                      key={colorOption.name}
                      type="button"
                      className={`builder-color-chip ${selectedColors.includes(colorOption.name) ? 'active' : ''}`}
                      onClick={() => toggleColor(colorOption.name)}
                    >
                      <span
                        className={`builder-color-swatch ${colorOption.border ? 'bordered' : ''}`}
                        style={{ background: colorOption.color }}
                      />
                      <span>{colorOption.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="builder-variant-summary">
              <div className="builder-variant-summary-head">
                <div>
                  <strong>{variantPairs.length > 0 ? `${variantPairs.length} tổ hợp variant` : 'Chưa chọn đủ size và màu'}</strong>
                  <p>
                    {variantPairs.length > 0
                      ? 'Kiểm tra nhanh các tổ hợp sẽ được tạo.'
                      : 'Chọn ít nhất 1 size và 1 màu nếu sản phẩm có biến thể.'}
                  </p>
                </div>
                <span className="builder-variant-counter">
                  <AdminIcon name="fa-layer-group" />
                  {variantPairs.length || 0}
                </span>
              </div>

              {variantPairs.length > 0 ? (
                <div className="builder-variant-chip-grid">
                  {variantPairs.slice(0, 12).map((variant) => (
                    <div key={variant.key} className="builder-variant-chip">
                      <strong>
                        {variant.size} / {variant.color}
                      </strong>
                      <span>{variant.sku}</span>
                    </div>
                  ))}
                  {variantPairs.length > 12 && (
                    <div className="builder-variant-chip more">
                      <strong>+{variantPairs.length - 12}</strong>
                      <span>variant sẽ được tạo thêm</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="builder-variant-empty">
                  <AdminIcon name="fa-info-circle" />
                  <span>Nếu bỏ trống, hệ thống dùng size M và màu Trắng mặc định.</span>
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
        <aside className="builder-sidebar">
          <section id="publishing" className="builder-side-card">
            <div className="builder-side-header">
              <span className="builder-section-kicker">05. Phân loại</span>
              <h3>Trạng thái & danh mục</h3>
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
              <p className="builder-help-text">Danh mục quyết định nơi sản phẩm hiển thị trên website.</p>
            </div>

            {activeStyleOptions.length > 0 && (
              <div className="builder-field-group">
                <label className="builder-label">Phong cách</label>
                <select
                  className="builder-select"
                  value={form.style}
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, style: event.target.value }))}
                  disabled={!form.menu}
                >
                  <option value="">Không chọn</option>
                  {activeStyleOptions.map((styleOption) => (
                    <option key={styleOption.value} value={styleOption.value}>
                      {styleOption.label}
                    </option>
                  ))}
                </select>
                <p className="builder-help-text">Dùng cho bộ lọc phong cách.</p>
              </div>
            )}

            {activeAgeOptions.length > 0 && (
              <div className="builder-field-group">
                <label className="builder-label">Độ tuổi</label>
                <select
                  className="builder-select"
                  value={form.ageGroup}
                  onChange={(event) => setForm((currentForm) => ({ ...currentForm, ageGroup: event.target.value }))}
                  disabled={!form.menu}
                >
                  <option value="">Không chọn</option>
                  {activeAgeOptions.map((ageOption) => (
                    <option key={ageOption.value} value={ageOption.value}>
                      {ageOption.label}
                    </option>
                  ))}
                </select>
                <p className="builder-help-text">Dùng cho menu Trẻ em.</p>
              </div>
            )}

            <div className="builder-field-group">
              <label className="builder-label">Collection</label>
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

            <div className="builder-taxonomy-summary">
              <span>
                <strong>Menu:</strong> {selectedMenuLabel}
              </span>
              <span>
                <strong>Danh mục:</strong> {selectedCategoryLabel}
              </span>
              <span>
                <strong>Nhóm:</strong> {selectedCategoryGroupLabel}
              </span>
              {activeStyleOptions.length > 0 && (
                <span>
                  <strong>Phong cách:</strong> {selectedStyleLabel}
                </span>
              )}
              {activeAgeOptions.length > 0 && (
                <span>
                  <strong>Độ tuổi:</strong> {selectedAgeLabel}
                </span>
              )}
              <span>
                <strong>Collection:</strong> {selectedCollectionLabel}
              </span>
            </div>
          </section>

          <section className="builder-side-card">
            <div className="builder-side-header">
              <span className="builder-section-kicker">06. SKU</span>
              <h3>Mã sản phẩm</h3>
            </div>

            <div className="builder-field-group">
              <div className="builder-inline-label">
                <label className="builder-label">SKU</label>
                <button type="button" className="builder-inline-link" onClick={() => regenerateField('sku')}>
                  <AdminIcon name="fa-refresh" />
                  <span>Tạo lại</span>
                </button>
              </div>
              <input
                type="text"
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })}
                placeholder="Tự động tạo"
              />
              <p className="builder-help-text">Có thể để trống để hệ thống tự tạo SKU.</p>
            </div>

            <div className="builder-info-card">
              <AdminIcon name="fa-box-open" />
              <div>
                <strong>Tồn kho quản lý riêng</strong>
                <p>
                  Sau khi tạo sản phẩm, vào <Link to="/admin/inventory">Kho hàng</Link> để cập nhật số lượng.
                </p>
              </div>
            </div>
          </div>

          <section id="seo" className="builder-side-card">
            <div className="builder-side-header">
              <span className="builder-section-kicker">07. SEO</span>
              <h3>Slug và meta</h3>
            </div>

            <div className="builder-field-group">
              <div className="builder-inline-label">
                <label className="builder-label">URL slug</label>
                <button type="button" className="builder-inline-link" onClick={() => regenerateField('slug')}>
                  <AdminIcon name="fa-refresh" />
                  <span>Đề xuất lại</span>
                </button>
              </div>
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

            <div className="builder-search-preview">
              <span className="builder-search-domain">https://kaitokid.vn/products/{resolvedSlug || 'san-pham-mới'}</span>
              <strong>{resolvedMetaTitle || form.name.trim() || 'Meta title sẽ hiển thị ở đây'}</strong>
              <p>{resolvedMetaDesc || 'Meta description sẽ xuất hiện ở đây để bạn kiểm tra nhận diện trên kết quả tìm kiếm.'}</p>
            </div>
          </section>

          <section className="builder-side-card">
            <div className="builder-side-header">
              <span className="builder-section-kicker">Preview</span>
              <h3>Card sản phẩm</h3>
            </div>

            <article className="builder-preview-product">
              <div className="builder-preview-media">
                {coverImage ? (
                  <img src={coverImage} alt={form.name || 'Preview'} />
                ) : (
                  <div className="builder-preview-placeholder">
                    <AdminIcon name="fa-image" />
                  </div>
                )}

                <div className="builder-preview-badges">
                  {form.isNew && <span className="preview-badge new">NEW</span>}
                  {hasSalePrice && <span className="preview-badge sale">SALE</span>}
                  {form.isBestSeller && <span className="preview-badge best">BEST</span>}
                </div>
              </div>

              <div className="builder-preview-body">
                <span className="builder-preview-meta">
                  {selectedCategoryLabel} • {selectedMenuLabel}
                </span>
                <h4>{form.name.trim() || 'Tên sản phẩm sẽ hiển thị tại đây'}</h4>
                <p>{previewDescription}</p>
                <div className="builder-preview-price">
                  <strong>{formatCurrency(effectivePrice)}</strong>
                  {hasSalePrice ? <small>{formatCurrency(form.price)}</small> : null}
                </div>
                <div className="builder-preview-variants">
                  <span>{selectedSizes.length > 0 ? selectedSizes.join(', ') : 'Size mặc định M'}</span>
                  <span>{selectedColors.length > 0 ? selectedColors.join(', ') : 'Màu mặc định Trắng'}</span>
                </div>
              </div>
            </article>
          </section>

        </aside>
      </div>
    </div>
  );
}
