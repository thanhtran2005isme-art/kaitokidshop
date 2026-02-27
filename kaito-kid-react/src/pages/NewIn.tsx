// Trang sản phẩm mới - chuyển từ samphammoi.html
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';
import '../styles/products-page.css';

const PRODUCTS_PER_PAGE = 12;

export default function NewIn() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState('');

  useEffect(() => {
    // Lấy SP mới (isNew === true)
    const products = productService.getActive().filter(p => p.isNew);
    setAllProducts(products);
  }, []);

  const sorted = useMemo(() => {
    const result = [...allProducts];
    switch (sortType) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.sort((a, b) => b.id - a.id); break;
    }
    return result;
  }, [allProducts, sortType]);

  const totalPages = Math.ceil(sorted.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = sorted.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/">TRANG CHỦ</Link> / <span>SẢN PHẨM MỚI</span>
      </nav>

      <div className="page-banner">
        <h1>✨ NEW ARRIVALS</h1>
        <p>Khám phá những mẫu mới nhất vừa cập bến</p>
      </div>

      <div className="allsanpham">
        <main className="product-area full-width">
          <div className="header-filter">
            <h2>SẢN PHẨM MỚI</h2>
            <div className="filters">
              <select value={sortType} onChange={e => { setSortType(e.target.value); setCurrentPage(1); }}>
                <option value="">Sắp xếp</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>
          </div>

          <div className="BanChay">
            <div className="sanphams">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map(p => <ProductCard key={p.id} product={p} />)
              ) : (
                <p style={{ textAlign: 'center', padding: 40, gridColumn: '1/-1' }}>Chưa có sản phẩm mới</p>
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {currentPage > 1 && <a className="page" onClick={() => goToPage(currentPage - 1)}>&laquo;</a>}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(i => (
                <a key={i} className={`page ${i === currentPage ? 'active' : ''}`} onClick={() => goToPage(i)}>{i}</a>
              ))}
              {currentPage < totalPages && <a className="page" onClick={() => goToPage(currentPage + 1)}>&raquo;</a>}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
