// Trang Lookbook - liên kết backend

import { useState, useEffect } from 'react';
import { lookbookApi, type PublicLookbookDTO } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Lookbook() {
  const [items, setItems] = useState<PublicLookbookDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLookbooks();
  }, []);

  async function fetchLookbooks() {
    try {
      setLoading(true);
      const response = await lookbookApi.getPublic();
      if (response.success && response.data) {
        setItems(response.data);
      } else {
        toast.error(response.error || 'Không thể tải lookbook');
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to fetch lookbooks:', error);
      toast.error('Không thể tải lookbook');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="lookbook-page">
      <div className="lookbook-hero">
        <h1>LOOKBOOK</h1>
        <p>Cảm hứng phối đồ từ KAITO KID</p>
      </div>
      <div className="lookbook-container">
        <div className="lookbook-grid">
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 40, gridColumn: '1/-1' }}>
              Chưa có lookbook nào
            </p>
          ) : (
            items.map(item => (
              <div key={item.id} className="lookbook-card">
                <div className="lookbook-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="lookbook-overlay">
                  <h3>{item.title}</h3>
                  {item.subtitle && <p style={{ fontStyle: 'italic' }}>{item.subtitle}</p>}
                  {item.description && <p>{item.description}</p>}
                  {item.link && (
                    <a href={item.link} className="btn-shop-look">
                      Mua ngay
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
