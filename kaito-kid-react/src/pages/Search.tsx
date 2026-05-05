// Trang tìm kiếm sản phẩm - kết nối backend API

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../services/api';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();

    // Keyword dưới 2 ký tự: không gọi API, hiện empty state
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    // Debounce 300ms để tránh fetch liên tục khi user gõ
    const timer = window.setTimeout(async () => {
      const result = await productApi.getAll({
        search: trimmed,
        page: 1,
        pageSize: 50,
      });

      if (cancelled) return;

      if (result.success && result.data) {
        setResults(result.data.products);
      } else {
        setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ marginBottom: 8 }}>Kết quả tìm kiếm</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        {!query.trim()
          ? 'Nhập từ khóa để tìm kiếm'
          : query.trim().length < 2
          ? 'Nhập ít nhất 2 ký tự để tìm kiếm'
          : loading
          ? 'Đang tìm...'
          : `Tìm thấy ${results.length} sản phẩm cho "${query}"`}
      </p>

      {loading ? (
        <div className="empty-state">
          <i className="fa fa-spinner fa-spin" style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }}></i>
          <p>Đang tải kết quả...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="product-grid">
          {results.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : query.trim().length >= 2 ? (
        <div className="empty-state">
          <i className="fa fa-search" style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }}></i>
          <p>Không tìm thấy sản phẩm phù hợp</p>
        </div>
      ) : null}
    </div>
  );
}
