// Trang thời trang nam - kết nối backend
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productApi, categoryApi, type CategoryDTO } from '../services/api';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';
import '../styles/products-page.css';

const PRODUCTS_PER_PAGE = 12;
const ALL_LABEL = 'Tất cả sản phẩm nam';
const GENDER = 'Nam';
const GENDER_KEY = 'nam';

interface CategoryNode {
  id: number;
  name: string;
  children: CategoryNode[];
}

export default function MenProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [subCategory, setSubCategory] = useState(ALL_LABEL);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [productsResult, categories] = await Promise.all([
        productApi.getAll({ gender: GENDER, pageSize: 100 }),
        categoryApi.getAll().catch(() => [] as CategoryDTO[]),
      ]);

      if (productsResult.success && productsResult.data) {
        setAllProducts(productsResult.data.products);
      }

      const roots = categories
        .filter((c) => !c.danhMucChaId && (c.gioiTinh === 'all' || c.gioiTinh === GENDER_KEY))
        .sort((a, b) => a.thuTu - b.thuTu)
        .map<CategoryNode>((root) => ({
          id: root.id,
          name: root.tenDanhMuc,
          children: categories
            .filter((c) => c.danhMucChaId === root.id)
            .sort((a, b) => a.thuTu - b.thuTu)
            .map((child) => ({ id: child.id, name: child.tenDanhMuc, children: [] })),
        }));
      setCategoryTree(roots);

      setLoading(false);
    };
    void loadData();
  }, []);

  const filtered = useMemo(() => {
    if (subCategory === ALL_LABEL) return allProducts;
    const keyword = subCategory.trim().toLowerCase();
    return allProducts.filter((product) => {
      const cat = (product.category || '').trim().toLowerCase();
      const sub = (product.subcategory || '').trim().toLowerCase();
      // Match chính xác: subcategory hoặc category
      return sub === keyword || cat === keyword;
    });
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
            <li>
              <strong
                onClick={() => handleFilter(ALL_LABEL)}
                style={{ cursor: 'pointer', color: subCategory === ALL_LABEL ? '#dc2626' : undefined }}
              >
                {ALL_LABEL}
              </strong>
            </li>
            {categoryTree.map((root) => (
              <li key={root.id}>
                <strong
                  onClick={() => handleFilter(root.name)}
                  style={{ cursor: 'pointer', color: subCategory === root.name ? '#dc2626' : undefined }}
                >
                  {root.name}
                </strong>
                {root.children.length > 0 && (
                  <ul>
                    {root.children.map((child) => (
                      <li key={child.id}>
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); handleFilter(child.name); }}
                          style={{ color: subCategory === child.name ? '#dc2626' : undefined, fontWeight: subCategory === child.name ? 600 : undefined }}
                        >
                          {child.name}
                        </a>
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
            <h2>{subCategory === ALL_LABEL ? 'THỜI TRANG NAM' : subCategory.toUpperCase()}</h2>
            <div className="filters">
              <span>Kích cỡ ▾</span>
              <span>Màu sắc ▾</span>
              <span>Giá ▾</span>
            </div>
          </div>

          <div className="BanChay">
            <div className="sanphams">
              {loading ? (
                <p style={{ textAlign: 'center', padding: 40, gridColumn: '1/-1' }}>Đang tải sản phẩm...</p>
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => <ProductCard key={p.id} product={p} />)
              ) : (
                <p style={{ textAlign: 'center', padding: 40, gridColumn: '1/-1' }}>Không tìm thấy sản phẩm nào</p>
              )}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              {currentPage > 1 && <a className="page" onClick={() => goToPage(currentPage - 1)}>&laquo;</a>}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((i) => i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1))
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
