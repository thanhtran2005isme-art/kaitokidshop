// Trang thời trang nữ - kết nối backend
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { productApi, categoryApi, type CategoryDTO } from '../services/api';
import { attributeApi, type AttributeDTO } from '../services/api/attributeApi';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';
import '../styles/products-page.css';

const PRODUCTS_PER_PAGE = 12;
const ALL_LABEL = 'Tất cả sản phẩm nữ';
const GENDER = 'Nữ';
const GENDER_KEY = 'nu';

interface CategoryNode {
  id: number;
  name: string;
  children: CategoryNode[];
}

export default function WomenProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [subCategory, setSubCategory] = useState(ALL_LABEL);
  const [loading, setLoading] = useState(true);

  // Lọc nâng cao: size, màu, giá
  const [sizeOptions, setSizeOptions] = useState<string[]>([]);
  const [colorOptions, setColorOptions] = useState<string[]>([]);
  const [filterSize, setFilterSize] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [filterPrice, setFilterPrice] = useState('');

  // Load products + categories từ backend
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      const [productsResult, categories, attrs] = await Promise.all([
        productApi.getAll({ gender: GENDER, pageSize: 100 }),
        categoryApi.getAll().catch(() => [] as CategoryDTO[]),
        attributeApi.getPublic().catch(() => [] as AttributeDTO[]),
      ]);

      if (productsResult.success && productsResult.data) {
        setAllProducts(productsResult.data.products);
      }

      // Build cây danh mục lọc theo gender
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

      setSizeOptions(attrs.filter((a) => a.nhomThuocTinh === 'size').map((a) => a.giaTri));
      setColorOptions(attrs.filter((a) => a.nhomThuocTinh === 'color').map((a) => a.giaTri));

      setLoading(false);
    };
    void loadData();
  }, []);

  const filtered = useMemo(() => {
    let list = allProducts;

    if (subCategory !== ALL_LABEL) {
      const keyword = subCategory.trim().toLowerCase();
      list = list.filter((product) => {
        const cat = (product.category || '').trim().toLowerCase();
        const sub = (product.subcategory || '').trim().toLowerCase();
        return sub === keyword || cat === keyword;
      });
    }

    if (filterSize) {
      list = list.filter((p) => (p.sizes || []).map((s) => s.toLowerCase()).includes(filterSize.toLowerCase()));
    }

    if (filterColor) {
      list = list.filter((p) => (p.colors || []).map((c) => c.toLowerCase()).includes(filterColor.toLowerCase()));
    }

    if (filterPrice) {
      list = list.filter((p) => {
        const price = p.price || 0;
        if (filterPrice === '0-200') return price < 200_000;
        if (filterPrice === '200-500') return price >= 200_000 && price < 500_000;
        if (filterPrice === '500-1000') return price >= 500_000 && price < 1_000_000;
        if (filterPrice === '1000+') return price >= 1_000_000;
        return true;
      });
    }

    return list;
  }, [allProducts, subCategory, filterSize, filterColor, filterPrice]);

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filtered.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  const goToPage = (page: number) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleFilter = (cat: string) => { setSubCategory(cat); setCurrentPage(1); };

  return (
    <>
      <nav className="breadcrumb">
        <Link to="/">TRANG CHỦ</Link> / <span>THỜI TRANG NỮ</span>
      </nav>

      <div className="allsanpham">
        <aside className="danhmuc">
          <h3>Danh mục Nữ</h3>
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
            <h2>{subCategory === ALL_LABEL ? 'THỜI TRANG NỮ' : subCategory.toUpperCase()}</h2>
            <div className="filters">
              <select value={filterSize} onChange={(e) => { setFilterSize(e.target.value); setCurrentPage(1); }}>
                <option value="">Kích cỡ</option>
                {sizeOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterColor} onChange={(e) => { setFilterColor(e.target.value); setCurrentPage(1); }}>
                <option value="">Màu sắc</option>
                {colorOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={filterPrice} onChange={(e) => { setFilterPrice(e.target.value); setCurrentPage(1); }}>
                <option value="">Giá</option>
                <option value="0-200">Dưới 200k</option>
                <option value="200-500">200k - 500k</option>
                <option value="500-1000">500k - 1tr</option>
                <option value="1000+">Trên 1tr</option>
              </select>
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
