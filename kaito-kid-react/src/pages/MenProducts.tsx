// Trang thời trang nam - chuyển từ sanphamnam.html
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';
import { matchesProductListingCategory, PRODUCT_MENU_TAXONOMY } from '../utils/productTaxonomy';
import '../styles/products-page.css';

const PRODUCTS_PER_PAGE = 12;
const MEN_TAXONOMY = PRODUCT_MENU_TAXONOMY.nam;
const MEN_CATEGORIES: Array<{ label: string; value?: string; children?: string[] }> = [
  { label: MEN_TAXONOMY.allLabel, value: MEN_TAXONOMY.allLabel },
  ...MEN_TAXONOMY.groups,
];

export default function MenProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [subCategory, setSubCategory] = useState(MEN_TAXONOMY.allLabel);

  useEffect(() => {
    const products = productService.getByGender('Nam');
    setAllProducts(products);
  }, []);

  const filtered = useMemo(() => {
    if (subCategory === MEN_TAXONOMY.allLabel) return allProducts;
    return allProducts.filter((product) => matchesProductListingCategory(product, subCategory));
  }, [allProducts, subCategory]);

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filtered.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  const goToPage = (page: number) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleFilter = (cat: string) => { setSubCategory(cat); setCurrentPage(1); };

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/">TRANG CHỦ</Link> / <span>THỜI TRANG NAM</span>
      </nav>

      <div className="allsanpham">
        <aside className="danhmuc">
          <h3>Danh mục Nam</h3>
          <ul className="danhsach">
            {MEN_CATEGORIES.map((cat, idx) => (
              <li key={idx}>
                <strong
                  onClick={() => handleFilter(cat.value || cat.label)}
                  style={{ cursor: cat.children ? 'default' : 'pointer' }}
                >
                  {cat.label}
                </strong>
                {cat.children && (
                  <ul>
                    {cat.children.map(child => (
                      <li key={child}>
                        <a href="#" onClick={e => { e.preventDefault(); handleFilter(child); }}>{child}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </aside>

        <main className="product-area">
          <div className="header-filter">
            <h2>{subCategory === 'Tất cả sản phẩm nam' ? 'THỜI TRANG NAM' : subCategory.toUpperCase()}</h2>
            <div className="filters">
              <span>Kích cỡ ▾</span>
              <span>Màu sắc ▾</span>
              <span>Giá ▾</span>
            </div>
          </div>

          <div className="BanChay">
            <div className="sanphams">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map(p => <ProductCard key={p.id} product={p} />)
              ) : (
                <p style={{ textAlign: 'center', padding: 40, gridColumn: '1/-1' }}>Không tìm thấy sản phẩm nào</p>
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
