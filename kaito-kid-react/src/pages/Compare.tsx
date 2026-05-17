import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PiX, PiScalesBold, PiCheckBold } from 'react-icons/pi';
import { productApi } from '../services/api';
import type { Product } from '../types';
import { formatCurrency } from '../utils/format';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Compare() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const ids = useMemo<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('kk_compare') || '[]');
    } catch { return []; }
  }, []);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    void Promise.all(ids.map((id) => productApi.getById(id))).then((results) => {
      setProducts(results.filter((r) => r.success && r.data).map((r) => r.data as Product));
      setLoading(false);
    });
  }, [ids]);

  const removeProduct = (id: number) => {
    const list: number[] = JSON.parse(localStorage.getItem('kk_compare') || '[]');
    const next = list.filter((x) => x !== id);
    localStorage.setItem('kk_compare', JSON.stringify(next));
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success('Đã xoá khỏi danh sách');
  };

  const clearAll = () => {
    if (!confirm('Xoá toàn bộ danh sách so sánh?')) return;
    localStorage.removeItem('kk_compare');
    setProducts([]);
  };

  if (loading) {
    return <div style={{ padding: 80, textAlign: 'center', color: '#64748b' }}>Đang tải...</div>;
  }

  if (products.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', padding: 40, textAlign: 'center' }}>
        <PiScalesBold style={{ fontSize: 64, color: '#cbd5e1' }} />
        <h2 style={{ margin: '16px 0 8px' }}>Chưa có sản phẩm để so sánh</h2>
        <p style={{ color: '#64748b' }}>Thêm sản phẩm vào danh sách so sánh từ trang chi tiết để xem chúng cạnh nhau.</p>
        <button
          onClick={() => navigate('/products')}
          style={{ marginTop: 16, padding: '12px 28px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
        >
          Khám phá sản phẩm
        </button>
      </div>
    );
  }

  // Tổng hợp tất cả attribute để so sánh
  const allColors = Array.from(new Set(products.flatMap((p) => p.colors || [])));
  const allSizes = Array.from(new Set(products.flatMap((p) => p.sizes || [])));

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '24px 20px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 600, color: '#0f172a' }}>
          <PiScalesBold style={{ verticalAlign: -2, marginRight: 10 }} />
          So sánh sản phẩm ({products.length}/4)
        </h1>
        <button
          onClick={clearAll}
          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 14 }}
        >Xoá tất cả</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', minWidth: 720, borderCollapse: 'separate', borderSpacing: 12 }}>
          <thead>
            <tr>
              <th style={{ minWidth: 140 }}></th>
              {products.map((p) => (
                <th key={p.id} style={{ width: 240, verticalAlign: 'top' }}>
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
                    <button
                      onClick={() => removeProduct(p.id)}
                      title="Xoá"
                      style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', color: '#dc2626' }}
                    ><PiX /></button>
                    <Link to={`/product/${p.id}`}>
                      <img src={p.image} alt={p.name} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} />
                    </Link>
                    <div style={{ padding: 12 }}>
                      <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: '#0f172a', fontWeight: 600, fontSize: 14, display: 'block', minHeight: 38 }}>
                        {p.name}
                      </Link>
                      <div style={{ marginTop: 6, fontSize: 16, fontWeight: 700, color: '#dc2626' }}>{formatCurrency(p.price)}</div>
                      {p.oldPrice && <div style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'line-through' }}>{formatCurrency(p.oldPrice)}</div>}
                      <button
                        onClick={() => {
                          const size = p.sizes?.[0] || '';
                          const color = p.colors?.[0] || '';
                          void addItem(p, size, color, 1);
                          toast.success('Đã thêm vào giỏ');
                        }}
                        style={{ marginTop: 10, width: '100%', padding: '8px 12px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                      >
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Row label="Mã sản phẩm" values={products.map((p) => p.sku)} />
            <Row label="Danh mục" values={products.map((p) => `${p.category}${p.subcategory ? ' / ' + p.subcategory : ''}`)} />
            <Row label="Giới tính" values={products.map((p) => p.gender)} />
            <Row label="Phong cách" values={products.map((p) => p.style || '—')} />
            <Row label="Đánh giá" values={products.map((p) => `${(p.rating || 0).toFixed(1)} ★`)} />
            <Row label="Đã bán" values={products.map((p) => p.soldCount.toLocaleString('vi-VN'))} />
            <Row label="Tồn kho" values={products.map((p) => `${p.stock}`)} />
            {allColors.length > 0 && (
              <tr>
                <td style={cellLabel}>Màu sắc</td>
                {products.map((p) => (
                  <td key={p.id} style={cellValue}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {allColors.map((c) => (
                        <span
                          key={c}
                          style={{
                            padding: '2px 8px', borderRadius: 10, fontSize: 11,
                            background: p.colors?.includes(c) ? '#dcfce7' : '#f1f5f9',
                            color: p.colors?.includes(c) ? '#166534' : '#cbd5e1',
                          }}
                          title={p.colors?.includes(c) ? 'Có' : 'Không có'}
                        >
                          {p.colors?.includes(c) ? <PiCheckBold style={{ verticalAlign: -2 }} /> : '–'} {c}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            )}
            {allSizes.length > 0 && (
              <Row label="Kích cỡ" values={products.map((p) => (p.sizes || []).join(', ') || '—')} />
            )}
            <Row label="New" values={products.map((p) => p.isNew ? '✓' : '—')} />
            <Row label="Sale" values={products.map((p) => p.isSale ? '✓' : '—')} />
            <Row label="Best seller" values={products.map((p) => p.isBestSeller ? '✓' : '—')} />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ label, values }: { label: string; values: (string | number)[] }) {
  return (
    <tr>
      <td style={cellLabel}>{label}</td>
      {values.map((v, i) => <td key={i} style={cellValue}>{v}</td>)}
    </tr>
  );
}

const cellLabel: React.CSSProperties = {
  padding: '12px 16px', background: '#f8fafc', fontWeight: 600, color: '#475569', fontSize: 13, borderRadius: 6,
};
const cellValue: React.CSSProperties = {
  padding: '12px 16px', textAlign: 'center', fontSize: 13, color: '#0f172a', background: '#fff', borderRadius: 6, border: '1px solid #f1f5f9',
};
