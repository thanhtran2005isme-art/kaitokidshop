import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import type { Product } from '../types';

export default function AdminHomepage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<{
    newArrivals: number[];
    saleProducts: number[];
    bestSellers: number[];
  }>({ newArrivals: [], saleProducts: [], bestSellers: [] });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setProducts(productService.getAll());
    setSections(
      JSON.parse(
        localStorage.getItem('homepageSections') ||
          '{"newArrivals":[],"saleProducts":[],"bestSellers":[]}'
      )
    );
  }, []);

  const toggleProduct = (
    section: 'newArrivals' | 'saleProducts' | 'bestSellers',
    id: number
  ) => {
    setSections(prev => {
      const list = prev[section].includes(id)
        ? prev[section].filter(x => x !== id)
        : [...prev[section], id];
      return { ...prev, [section]: list };
    });
  };

  const handleSave = () => {
    localStorage.setItem('homepageSections', JSON.stringify(sections));
    setMsg('Đã lưu cấu hình trang chủ!');
    setTimeout(() => setMsg(''), 3000);
  };

  const sectionConfig = [
    { key: 'newArrivals' as const, title: 'NEW ARRIVALS', icon: 'fa-sparkles' },
    { key: 'saleProducts' as const, title: '🔥 ĐANG GIẢM GIÁ', icon: 'fa-fire' },
    { key: 'bestSellers' as const, title: 'BEST SELLERS', icon: 'fa-trophy' },
  ];

  return (
    <div className="content-wrapper">
      <div className="page-header">
        <h1>Quản lý Trang chủ</h1>
        <div className="page-actions">
          <button className="btn-add" onClick={handleSave}>
            <i className="fa fa-save"></i> Lưu thay đổi
          </button>
        </div>
      </div>

      {msg && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          <i className="fa fa-check-circle"></i> {msg}
        </div>
      )}

      {sectionConfig.map(sec => (
        <div key={sec.key} className="section-card">
          <div className="section-header">
            <div className="section-title">
              <i className={`fa ${sec.icon}`}></i>
              <h3>{sec.title}</h3>
            </div>
            <span style={{ color: '#666', fontSize: 14 }}>
              {sections[sec.key].length} sản phẩm
            </span>
          </div>
          <p className="section-desc">Sản phẩm hiển thị trên trang chủ</p>
          <div className="selected-products">
            {products.filter(p => p.status === 'active').length === 0 ? (
              <p className="empty-text">Chưa có sản phẩm active</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {products
                  .filter(p => p.status === 'active')
                  .map(p => (
                    <label
                      key={p.id}
                      className="checkbox-label"
                      style={{
                        padding: '8px 12px',
                        background: sections[sec.key].includes(p.id)
                          ? '#eef2ff'
                          : '#f9f9f9',
                        border: sections[sec.key].includes(p.id)
                          ? '1px solid #667eea'
                          : '1px solid #eee',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={sections[sec.key].includes(p.id)}
                        onChange={() => toggleProduct(sec.key, p.id)}
                      />
                      <span>{p.name}</span>
                    </label>
                  ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
