// Trang danh sách sản phẩm - thay the 7 file HTML cu

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';
import { matchesProductListingCategory, matchesTaxonomyValue, toCanonicalGender } from '../utils/productTaxonomy';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [filtered, setFiltered] = useState<Product[]>([]);

  const gender = searchParams.get('gender');
  const category = searchParams.get('category');
  const style = searchParams.get('style');
  const age = searchParams.get('age');
  const collection = searchParams.get('collection');
  const filter = searchParams.get('filter');
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
    return 'Tất cả sản phẩm';
  };

  const isSalePage = filter === 'sale';

  useEffect(() => {
    let result: Product[];
    if (gender) {
      result = productService.getByGender(gender);
    } else if (filter === 'bestseller') {
      result = productService.getBestSellers(50);
    } else if (filter === 'sale') {
      result = productService.getSaleProducts(50);
    } else if (filter === 'new') {
      result = productService.getNewArrivals(50);
    } else {
      result = productService.getActive();
    }

    if (category) {
      result = result.filter((product) => matchesProductListingCategory(product, category));
    }

    if (style) {
      result = result.filter((product) => matchesTaxonomyValue(product.style, style));
    }

    if (age) {
      result = result.filter((product) => matchesTaxonomyValue(product.ageGroup, age));
    }

    if (collection) {
      result = result.filter((product) => (product.collection || '').trim() === collection);
    }

    setFiltered(result);
  }, [age, category, collection, gender, filter, style]);

  return (
    <>
      <div className={`page-banner ${isSalePage ? 'sale-banner' : ''}`}>
        <h1>{getTitle()}</h1>
        <p>{filtered.length} sản phẩm</p>
      </div>
      <div className="allsanpham">
        <div className="product-area full-width">
          {filtered.length > 0 ? (
            <div className="sanphams">
              {filtered.map(p => (
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
