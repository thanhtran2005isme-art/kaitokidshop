// Trang bộ sưu tập - thay thế bosuutap.html + collections.js

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Collection {
  id: number; name: string; description: string; image: string; productCount?: number;
}

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('collections') || '[]');
    if (saved.length > 0) {
      setCollections(saved);
    } else {
      setCollections([
        { id: 1, name: 'Xuân Hè 2025', description: 'Bộ sưu tập mới nhất cho mùa xuân hè', image: '/images/slide_1.jpg', productCount: 24 },
        { id: 2, name: 'Thu Đông 2024', description: 'Phong cách ấm áp cho mùa thu đông', image: '/images/slide_2.jpg', productCount: 18 },
        { id: 3, name: 'Streetwear', description: 'Thời trang đường phố năng động', image: '/images/slide_3.jpg', productCount: 32 },
      ]);
    }
  }, []);

  return (
    <>
      <div className="page-banner collection-banner">
        <h1>Bộ sưu tập</h1>
        <p>Khám phá các bộ sưu tập thời trang mới nhất</p>
      </div>
      <div className="collections-container">
        <div className="collections-grid">
          {collections.map(col => (
            <div key={col.id} className="collection-card">
              <div className="collection-image">
                <img src={col.image} alt={col.name} />
                <div className="collection-overlay">
                  <Link to="/products" className="btn-view">Xem bộ sưu tập</Link>
                </div>
              </div>
              <div className="collection-info">
                <h3>{col.name}</h3>
                <p>{col.description}</p>
                {col.productCount && <span className="product-count">{col.productCount} sản phẩm</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
