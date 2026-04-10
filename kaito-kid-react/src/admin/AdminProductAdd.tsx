import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product } from '../types';

type ProductForm = {
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  oldPrice: number;
  category: string;
  subcategory: string;
  gender: string;
  stock: number;
  status: Product['status'];
  image: string;
  images: string;
  sku: string;
  slug: string;
  menu: string;
  collection: string;
  colors: string;
  sizes: string;
  specs: string;
  isNew: boolean;
  isSale: boolean;
  isBestSeller: boolean;
};

const initialForm: ProductForm = {
  name: '',
  description: '',
  shortDescription: '',
  price: 0,
  oldPrice: 0,
  category: 'Ao',
  subcategory: '',
  gender: 'Nam',
  stock: 0,
  status: 'active',
  image: '',
  images: '',
  sku: '',
  slug: '',
  menu: '',
  collection: '',
  colors: '',
  sizes: 'S,M,L,XL',
  specs: '',
  isNew: true,
  isSale: false,
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

function splitList(value: string): string[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

export default function AdminProductAdd() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProductForm>(initialForm);

  const updateForm = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      alert('Vui long nhap ten san pham');
      return;
    }

    if (form.price <= 0) {
      alert('Vui long nhap gia ban hop le');
      return;
    }

    const gallery = splitList(form.images);
    const image = form.image.trim() || gallery[0] || '';
    const sku = form.sku.trim() || `SKU-${Date.now()}`;

    const newProduct: Omit<Product, 'id' | 'createdAt'> = {
      name: form.name.trim(),
      category: form.category,
      subcategory: form.subcategory || undefined,
      gender: form.gender,
      price: form.price,
      oldPrice: form.oldPrice > 0 ? form.oldPrice : null,
      stock: form.stock,
      status: form.status,
      image,
      images: gallery.length > 0 ? gallery : image ? [image] : [],
      shortDescription: form.shortDescription || undefined,
      description: form.description,
      sku,
      slug: form.slug.trim() || slugify(form.name),
      menu: form.menu || undefined,
      collection: form.collection || undefined,
      isNew: form.isNew,
      isSale: form.isSale || form.oldPrice > form.price,
      isBestSeller: form.isBestSeller,
      rating: 0,
      soldCount: 0,
      colors: splitList(form.colors),
      sizes: splitList(form.sizes),
      variants: [],
      specs: form.specs || undefined,
      updatedAt: undefined,
    };

    productService.create(newProduct);
    alert('Da them san pham thanh cong');
    navigate('/admin/products');
  };

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1>Them san pham moi</h1>
        <div className="page-actions">
          <button className="btn-secondary" onClick={() => navigate('/admin/products')}>
            <i className="fa fa-times"></i> Huy
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <i className="fa fa-save"></i> Luu san pham
          </button>
        </div>
      </div>

      <div className="form-grid">
        <div className="form-card">
          <h3 className="form-card-title">Thong tin chinh</h3>
          <div className="form-group">
            <label>Ten san pham *</label>
            <input value={form.name} onChange={event => updateForm('name', event.target.value)} />
          </div>
          <div className="form-group">
            <label>Mo ta ngan</label>
            <input value={form.shortDescription} onChange={event => updateForm('shortDescription', event.target.value)} />
          </div>
          <div className="form-group">
            <label>Mo ta chi tiet</label>
            <textarea rows={6} value={form.description} onChange={event => updateForm('description', event.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Gia ban *</label>
              <input type="number" value={form.price || ''} onChange={event => updateForm('price', Number(event.target.value))} />
            </div>
            <div className="form-group">
              <label>Gia goc</label>
              <input type="number" value={form.oldPrice || ''} onChange={event => updateForm('oldPrice', Number(event.target.value))} />
            </div>
          </div>
        </div>

        <div className="form-card">
          <h3 className="form-card-title">Phan loai</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Danh muc</label>
              <select value={form.category} onChange={event => updateForm('category', event.target.value)}>
                <option value="Ao">Ao</option>
                <option value="Quan">Quan</option>
                <option value="Vay">Vay</option>
                <option value="Dam">Dam</option>
                <option value="Phu kien">Phu kien</option>
              </select>
            </div>
            <div className="form-group">
              <label>Gioi tinh</label>
              <select value={form.gender} onChange={event => updateForm('gender', event.target.value)}>
                <option value="Nu">Nu</option>
                <option value="Nam">Nam</option>
                <option value="Tre em">Tre em</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Danh muc phu</label>
            <input value={form.subcategory} onChange={event => updateForm('subcategory', event.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ton kho</label>
              <input type="number" value={form.stock} onChange={event => updateForm('stock', Number(event.target.value))} />
            </div>
            <div className="form-group">
              <label>Trang thai</label>
              <select value={form.status} onChange={event => updateForm('status', event.target.value as Product['status'])}>
                <option value="active">Dang ban</option>
                <option value="draft">Nhap</option>
                <option value="out-of-stock">Het hang</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-card">
          <h3 className="form-card-title">Anh va bien the</h3>
          <div className="form-group">
            <label>Anh dai dien</label>
            <input value={form.image} onChange={event => updateForm('image', event.target.value)} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Gallery, cach nhau bang dau phay</label>
            <textarea rows={3} value={form.images} onChange={event => updateForm('images', event.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Mau sac</label>
              <input value={form.colors} onChange={event => updateForm('colors', event.target.value)} placeholder="Trang, Den" />
            </div>
            <div className="form-group">
              <label>Size</label>
              <input value={form.sizes} onChange={event => updateForm('sizes', event.target.value)} placeholder="S, M, L" />
            </div>
          </div>
        </div>

        <div className="form-card">
          <h3 className="form-card-title">SEO va hien thi</h3>
          <div className="form-row">
            <div className="form-group">
              <label>SKU</label>
              <input value={form.sku} onChange={event => updateForm('sku', event.target.value)} />
            </div>
            <div className="form-group">
              <label>Slug</label>
              <input value={form.slug} onChange={event => updateForm('slug', event.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Menu</label>
              <input value={form.menu} onChange={event => updateForm('menu', event.target.value)} />
            </div>
            <div className="form-group">
              <label>Collection</label>
              <input value={form.collection} onChange={event => updateForm('collection', event.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Thong so</label>
            <textarea rows={3} value={form.specs} onChange={event => updateForm('specs', event.target.value)} />
          </div>
          <div className="d-flex gap-2">
            <label className="form-check">
              <input type="checkbox" checked={form.isNew} onChange={event => updateForm('isNew', event.target.checked)} />
              <span>Moi</span>
            </label>
            <label className="form-check">
              <input type="checkbox" checked={form.isSale} onChange={event => updateForm('isSale', event.target.checked)} />
              <span>Sale</span>
            </label>
            <label className="form-check">
              <input type="checkbox" checked={form.isBestSeller} onChange={event => updateForm('isBestSeller', event.target.checked)} />
              <span>Ban chay</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
