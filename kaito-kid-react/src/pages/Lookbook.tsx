// Trang Lookbook - thay thế lookbook page

import { useState, useEffect } from 'react';

interface LookbookItem {
  id: number; title: string; image: string; description?: string; tags?: string[];
}

export default function Lookbook() {
  const [items, setItems] = useState<LookbookItem[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('lookbooks') || '[]');
    if (saved.length > 0) {
      setItems(saved);
    } else {
      setItems([
        { id: 1, title: 'Street Style', image: '/images/slide_1.jpg', description: 'Phong cach duong pho nang dong', tags: ['Ao hoodie', 'Quan jogger', 'Sneakers'] },
        { id: 2, title: 'Office Look', image: '/images/slide_2.jpg', description: 'Thanh lich noi cong so', tags: ['Ao so mi', 'Quan tay', 'Giay da'] },
        { id: 3, title: 'Weekend Vibes', image: '/images/slide_3.jpg', description: 'Thoai mai cuoi tuan', tags: ['Ao thun', 'Quan short', 'Sandal'] },
        { id: 4, title: 'Date Night', image: '/images/london.png', description: 'Quyen ru cho buoi hen', tags: ['Dam da hoi', 'Clutch', 'Giay cao got'] },
      ]);
    }
  }, []);

  return (
    <>
      <div className="lookbook-hero">
        <h1>LOOKBOOK</h1>
        <p>Cam hung phoi do tu KAITO KID</p>
      </div>
      <div className="lookbook-container">
        <div className="lookbook-grid">
          {items.map(item => (
            <div key={item.id} className="lookbook-card">
              <div className="lookbook-image">
                <img src={item.image} alt={item.title} />
              </div>
              <div className="lookbook-overlay">
                <h3>{item.title}</h3>
                {item.description && <p>{item.description}</p>}
                {item.tags && (
                  <div className="lookbook-products">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="product-tag">{tag}</span>
                    ))}
                  </div>
                )}
                <button className="btn-shop-look">Mua ngay</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
