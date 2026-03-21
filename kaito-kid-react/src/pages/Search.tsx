// Trang tìm kiếm sản phẩm

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const q = query.toLowerCase();
      const all = productService.getActive();
      setResults(all.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      ));
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ marginBottom: 8 }}>Kết quả tìm kiếm</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        {query ? `Tìm thấy ${results.length} sản phẩm cho "${query}"` : 'Nhập từ khóa để tìm kiếm'}
      </p>
      {results.length > 0 ? (
        <div className="product-grid">
          {results.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : query.length >= 2 ? (
        <div className="empty-state">
          <i className="fa fa-search" style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }}></i>
          <p>Không tìm thấy sản phẩm phù hợp</p>
        </div>
      ) : null}
    </div>
  );
}