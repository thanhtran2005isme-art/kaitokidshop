// Trang danh sách sản phẩm - kết nối backend API

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../services/api';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';
import { toCanonicalGender } from '../utils/productTaxonomy';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const gender = searchParams.get('gender');
  const category = searchParams.get('category');
  const style = searchParams.get('style');
  const age = searchParams.get('age');
  const collection = searchParams.get('collection');
  const filter = searchParams.get('filter');
  const search = searchParams.get('search');
  const canonicalGender = toCanonicalGender(gender);

  const getTitle = () => {
    if (collection) return collection.replace(/-/g, ' ');
    if (category) return category;
    if (style) return style;
    if (age) return `Độ tuổi ${age}`;
    if (canonicalGender === 'Nu') return 'Thoi trang nu';
    if (canonicalGender === 'Nam') return 'Thoi trang nam';
    if (canonicalGender === 'Tre em') return 'Thoi trang tre em';
    if (canonicalGender === 'Unisex') return 'Thoi trang unisex';
    if (filter === 'bestseller') return 'Sản phẩm bán chạy';
    if (filter === 'sale') return 'Sản phẩm đang giảm giá';
    if (filter === 'new') return 'Sản phẩm mới';
    if (search) return `Kết quả tìm kiếm: "${search}"`;
    return 'Tất cả sản phẩm';
  };

  const isSalePage = filter === 'sale';

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);

      // Map URL filter -> API params
      const params: Parameters<typeof productApi.getAll>[0] = {
        pageSize: 50,
        page: 1,
      };

      if (gender) params.gender = gender;
      if (category) params.category = category;
      if (search) params.search = search;
      if (filter === 'new') params.isNew = true;
      if (filter === 'sale') params.isSale = true;
      if (filter === 'bestseller') params.isBestSeller = true;

      const result = await productApi.getAll(params);

      if (result.success && result.data) {
        let items = result.data.products;

        // Client-side filter for style/age/collection (backend không hỗ trợ)
        if (style) {
          items = items.filter((p) => (p.style || '').toLowerCase() === style.toLowerCase());
        }
        if (age) {
          items = items.filter((p) => (p.ageGroup || '').toLowerCase() === age.toLowerCase());
        }
        if (collection) {
          items = items.filter((p) => (p.collection || '').trim() === collection);
        }

        setProducts(items);
        setTotal(items.length);
      } else {
        setProducts([]);
        setTotal(0);
      }
      setLoading(false);
    };

    void loadProducts();
  }, [age, category, collection, gender, filter, style, search]);

  return (
    <>
      <div className={`page-banner ${isSalePage ? 'sale-banner' : ''}`}>
        <h1>{getTitle()}</h1>
        <p>{total} sản phẩm</p>
      </div>
      <div className="allsanpham">
        <div className="product-area full-width">
          {loading ? (
            <div className="no-products">
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="sanphams">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>Chưa có sản phẩm nào</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
