// Quan ly kho hang - match admin structure

import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import type { Product } from '../types';

export default function AdminInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { setProducts(productService.getAll()); }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const lowStock = products.filter(p => p.stock <= 10);

  const updateStock = (id: number, newStock: number) => {
    productService.update(id, { stock: Math.max(0, newStock) });
    setProducts(productService.getAll());
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Quản lý kho hàng</h1>
      </div>

      {lowStock.length > 0 && (
        <div className="alert alert-warning mb-3">
          <i className="fa fa-exclamation-triangle"></i>
          <span>{lowStock.length} sản phẩm sắp hết hàng (≤10)</span>
        </div>
      )}

      <div className="card">
        <div className="filters-bar">
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm sản phẩm..." />
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr>
              <th>Sản phẩm</th><th>SKU</th><th>Tồn kho</th><th>Trạng thái</th><th>Cập nhật</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ background: p.stock <= 10 ? 'rgba(239,68,68,0.05)' : 'transparent' }}>
                  <td><span className="product-name-cell">{p.name}</span></td>
                  <td>{p.sku}</td>
                  <td><strong style={{ color: p.stock <= 10 ? '#e74c3c' : '#10b981' }}>{p.stock}</strong></td>
                  <td>
                    <span className={`status-badge ${p.stock === 0 ? 'out-of-stock' : p.stock <= 10 ? 'inactive' : 'active'}`}>
                      {p.stock === 0 ? 'Hết hàng' : p.stock <= 10 ? 'Sắp hết' : 'Còn hàng'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1">
                      <button className="btn btn-sm btn-outline" onClick={() => updateStock(p.id, p.stock - 1)}>-</button>
                      <span style={{ width: 40, textAlign: 'center', fontWeight: 600 }}>{p.stock}</span>
                      <button className="btn btn-sm btn-outline" onClick={() => updateStock(p.id, p.stock + 1)}>+</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
