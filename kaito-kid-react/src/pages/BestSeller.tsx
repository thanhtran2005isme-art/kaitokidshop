// Trang sản phẩm bán chạy - chuyển từ bestseller.html
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';
import '../styles/products-page.css';

type SortType = 'sold-desc' | 'price-asc' | 'price-desc' | 'newest';
type CategoryFilter = 'Tất cả' | 'Nữ' | 'Nam' | 'Trẻ em';

const PRODUCTS_PER_PAGE = 12;

export default function BestSeller() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState<SortType>('sold-desc');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('Tất cả');

  useEffect(() => {
    // Lấy tất cả SP active, sắp xếp theo soldCount giảm dần
    const products = productService.getActive().sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    setAllProducts(products);
  }, []);

  const filtered = useMemo(() => {
    let result = [...allProducts];

    // Lọc theo danh mục
    if (categoryFilter !== 'Tất cả') {
      result = result.filter(p => {
        const gender = (p.gender || '').toLowerCase();
        if (categoryFilter === 'Nữ') return gender === 'nữ' || gender === 'nu';
        if (categoryFilter === 'Nam') return gender === 'nam';
        if (categoryFilter === 'Trẻ em') return gender === 'trẻ em' || gender === 'tre em' || gender === 'treem';
        return true;
      });
    }

    // Sắp xếp
    switch (sortType) {
      case 'sold-desc': result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)); break;
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.sort((a, b) => b.id - a.id); break;
    }
    return result;
  }, [allProducts, categoryFilter, sortType]);

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filtered.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryFilter = (cat: CategoryFilter) => {
    setCategoryFilter(cat);
    setCurrentPage(1);
  };

  const handleSort = (sort: SortType) => {
    setSortType(sort);
    setCurrentPage(1);
  };

  const getTitle = () => {
    if (categoryFilter === 'Tất cả') return '🏆 SẢN PHẨM BÁN CHẠY';
    return `🏆 BÁN CHẠY - ${categoryFilter.toUpperCase()}`;
  };

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/">TRANG CHỦ</Link> / <span>SẢN PHẨM BÁN CHẠY</span>
      </nav>

      <div className="allsanpham">
        <aside className="danhmuc">
          <h3>Lọc sản phẩm</h3>
          <ul className="danhsach">
            {(['Tất cả', 'Nữ', 'Nam', 'Trẻ em'] as CategoryFilter[]).map(cat => (
              <li key={cat}>
                <strong
                  onClick={() => handleCategoryFilter(cat)}
                  style={{ color: categoryFilter === cat ? '#667eea' : undefined, cursor: 'pointer' }}
                >
                  {cat === 'Tất cả' ? 'Tất cả sản phẩm' : `Thời trang ${cat}`}
                </strong>
              </li>
            ))}
          </ul>

          <h3 style={{ marginTop: 20 }}>Sắp xếp theo</h3>
          <ul className="danhsach">
            {([
              { key: 'sold-desc' as SortType, label: '🔥 Bán chạy nhất' },
              { key: 'price-asc' as SortType, label: '💰 Giá thấp đến cao' },
              { key: 'price-desc' as SortType, label: '💎 Giá cao đến thấp' },
              { key: 'newest' as SortType, label: '✨ Mới nhất' },
            ]).map(s => (
              <li key={s.key}>
                <a
                  href="#"
                  className={`sort-link ${sortType === s.key ? 'active' : ''}`}
                  onClick={e => { e.preventDefault(); handleSort(s.key); }}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <main className="product-area">
          <div className="header-filter">
            <h2>{getTitle()}</h2>
            <p className="bestseller-desc">Những sản phẩm được yêu thích và mua nhiều nhất</p>
          </div>

          <div className="BanChay">
            <div className="sanphams">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map(p => <ProductCard key={p.id} product={p} />)
              ) : (
                <p style={{ textAlign: 'center', padding: 40, gridColumn: '1/-1' }}>Chưa có sản phẩm bán chạy</p>
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {currentPage > 1 && <a className="page" onClick={() => goToPage(currentPage - 1)}>&laquo;</a>}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(i => i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1))
                .map((i, idx, arr) => (
                  <span key={i}>
                    {idx > 0 && arr[idx - 1] < i - 1 && <span className="dots">...</span>}
                    <a className={`page ${i === currentPage ? 'active' : ''}`} onClick={() => goToPage(i)}>{i}</a>
                  </span>
                ))}
              {currentPage < totalPages && <a className="page" onClick={() => goToPage(currentPage + 1)}>&raquo;</a>}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
