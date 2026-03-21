// Trang danh sach san pham - thay the 7 file HTML cu

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import type { Product } from '../types';
import ProductCard from '../components/product/ProductCard';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [filtered, setFiltered] = useState<Product[]>([]);

  const gender = searchParams.get('gender');
  const filter = searchParams.get('filter');

  const getTitle = () => {
    if (gender === 'Nu') return 'Thoi trang nu';
    if (gender === 'Nam') return 'Thoi trang nam';
    if (gender === 'Tre em') return 'Thoi trang tre em';
    if (filter === 'bestseller') return 'San pham ban chay';
    if (filter === 'sale') return 'San pham dang giam gia';
    if (filter === 'new') return 'San pham moi';
    return 'Tat ca san pham';
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
    setFiltered(result);
  }, [gender, filter]);

  return (
    <>
      <div className={`page-banner ${isSalePage ? 'sale-banner' : ''}`}>
        <h1>{getTitle()}</h1>
        <p>{filtered.length} san pham</p>
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
              <p>Chua co san pham nao</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
