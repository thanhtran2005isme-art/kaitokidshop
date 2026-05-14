// Trang sản phẩm giảm giá - liên kết backend
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../services/api';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import '../styles/products-page.css';

const PRODUCTS_PER_PAGE = 12;

export default function Sale() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState('');
  const [discountFilter, setDiscountFilter] = useState('');

  useEffect(() => {
    fetchSaleProducts();
  }, []);

  async function fetchSaleProducts() {
    try {
      setLoading(true);
      const response = await productApi.getAll({
        isSale: true,
        page: 1,
        pageSize: 100,
      });

      if (response.success && response.data) {
        // Chỉ giữ những sản phẩm thực sự có giảm giá
        const saleProducts = response.data.products.filter(
          p => p.isSale || (p.oldPrice && p.oldPrice > p.price)
        );
        setAllProducts(saleProducts);
      } else {
        toast.error(response.error || 'Không thể tải sản phẩm giảm giá');
        setAllProducts([]);
      }
    } catch (error) {
      console.error('Failed to fetch sale products:', error);
      toast.error('Không thể tải sản phẩm giảm giá');
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let result = [...allProducts];

    // Lọc theo mức giảm giá
    if (discountFilter) {
      const minDiscount = parseInt(discountFilter);
      result = result.filter(p => {
        if (!p.oldPrice || p.oldPrice <= p.price) return false;
        const discount = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
        return discount >= minDiscount;
      });
    }

    // Sắp xếp
    switch (sortType) {
      case 'discount-desc':
        result.sort((a, b) => {
          const dA = a.oldPrice ? Math.round(((a.oldPrice - a.price) / a.oldPrice) * 100) : 0;
          const dB = b.oldPrice ? Math.round(((b.oldPrice - b.price) / b.oldPrice) * 100) : 0;
          return dB - dA;
        });
        break;
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
    }
    return result;
  }, [allProducts, discountFilter, sortType]);

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filtered.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/">TRANG CHỦ</Link> / <span>GIẢM GIÁ</span>
      </nav>

      <div className="page-banner sale-banner">
        <h1>🔥 SALE - GIẢM GIÁ SỐC</h1>
        <p>Săn deal hot - Giảm đến 50% toàn bộ sản phẩm</p>
      </div>

      <div className="allsanpham">
        <main className="product-area full-width">
          <div className="header-filter">
            <h2>SẢN PHẨM GIẢM GIÁ</h2>
            <div className="filters">
              <select value={discountFilter} onChange={e => { setDiscountFilter(e.target.value); setCurrentPage(1); }}>
                <option value="">Tất cả</option>
                <option value="10">Giảm từ 10%</option>
                <option value="20">Giảm từ 20%</option>
                <option value="30">Giảm từ 30%</option>
                <option value="50">Giảm từ 50%</option>
              </select>
              <select value={sortType} onChange={e => { setSortType(e.target.value); setCurrentPage(1); }}>
                <option value="">Sắp xếp</option>
                <option value="discount-desc">Giảm nhiều nhất</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
              </select>
            </div>
          </div>

          <div className="BanChay">
            <div className="sanphams">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map(p => <ProductCard key={p.id} product={p} />)
              ) : (
                <p style={{ textAlign: 'center', padding: 40, gridColumn: '1/-1' }}>Chưa có sản phẩm giảm giá</p>
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
