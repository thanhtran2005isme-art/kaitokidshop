// Cảnh báo Hết hàng - match admin structure

import { useState, useEffect } from 'react';

interface AlertProduct {
  id: number;
  name: string;
  sku: string;
  image: string;
  stock: number;
  minStock: number;
  alertLevel: 'critical' | 'warning' | 'low';
}

export default function AdminInventoryAlerts() {
  const [products, setProducts] = useState<AlertProduct[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [warningThreshold, setWarningThreshold] = useState(10);
  const [lowThreshold, setLowThreshold] = useState(20);

  useEffect(() => {
    // Load products from localStorage and filter by stock levels
    const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const alertProducts: AlertProduct[] = allProducts
      .filter((p: any) => p.stock <= 20)
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        sku: p.sku || `SKU${p.id}`,
        image: p.image,
        stock: p.stock,
        minStock: 10,
        alertLevel: p.stock === 0 ? 'critical' : p.stock <= 10 ? 'warning' : 'low'
      }));
    setProducts(alertProducts);
  }, []);

  const criticalProducts = products.filter(p => p.alertLevel === 'critical');
  const warningProducts = products.filter(p => p.alertLevel === 'warning');
  const lowProducts = products.filter(p => p.alertLevel === 'low');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('alertSettings', JSON.stringify({ warningThreshold, lowThreshold }));
    setShowSettings(false);
    alert('Đã lưu cài đặt cảnh báo');
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Cảnh báo Hết hàng</h1>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => window.history.back()}>
            <i className="fa fa-arrow-left"></i> Quay lại
          </button>
          <button className="btn btn-primary" onClick={() => setShowSettings(true)}>
            <i className="fa fa-cog"></i> Cài đặt cảnh báo
          </button>
        </div>
      </div>

      {/* Alert Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 48 }}><i className="fa fa-times-circle"></i></div>
            <div>
              <h3 style={{ fontSize: 32, margin: 0 }}>{criticalProducts.length}</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>Hết hàng</p>
            </div>
          </div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 48 }}><i className="fa fa-exclamation-triangle"></i></div>
            <div>
              <h3 style={{ fontSize: 32, margin: 0 }}>{warningProducts.length}</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>Sắp hết</p>
            </div>
          </div>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 48 }}><i className="fa fa-info-circle"></i></div>
            <div>
              <h3 style={{ fontSize: 32, margin: 0 }}>{lowProducts.length}</h3>
              <p style={{ margin: 0, opacity: 0.9 }}>Tồn kho thấp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalProducts.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(239, 68, 68, 0.1)' }}>
            <h3 style={{ margin: 0, color: '#ef4444' }}>
              <i className="fa fa-times-circle"></i> Hết hàng (Cần nhập ngay)
            </h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>SKU</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {criticalProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={p.image} alt={p.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }} />
                        <span className="product-name-cell">{p.name}</span>
                      </div>
                    </td>
                    <td><span className="product-sku">{p.sku}</span></td>
                    <td><span style={{ color: '#ef4444', fontWeight: 600, fontSize: 16 }}>{p.stock}</span></td>
                    <td><span className="badge badge-danger">Hết hàng</span></td>
                    <td>
                      <button className="btn btn-sm btn-primary">
                        <i className="fa fa-plus"></i> Nhập hàng
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Warning Alerts */}
      {warningProducts.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(245, 158, 11, 0.1)' }}>
            <h3 style={{ margin: 0, color: '#f59e0b' }}>
              <i className="fa fa-exclamation-triangle"></i> Sắp hết hàng (≤ {warningThreshold} sản phẩm)
            </h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>SKU</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {warningProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={p.image} alt={p.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }} />
                        <span className="product-name-cell">{p.name}</span>
                      </div>
                    </td>
                    <td><span className="product-sku">{p.sku}</span></td>
                    <td><span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 16 }}>{p.stock}</span></td>
                    <td><span className="badge badge-warning">Sắp hết</span></td>
                    <td>
                      <button className="btn btn-sm btn-primary">
                        <i className="fa fa-plus"></i> Nhập hàng
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Low Stock Alerts */}
      {lowProducts.length > 0 && (
        <div className="card">
          <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(59, 130, 246, 0.1)' }}>
            <h3 style={{ margin: 0, color: '#3b82f6' }}>
              <i className="fa fa-info-circle"></i> Tồn kho thấp (≤ {lowThreshold} sản phẩm)
            </h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>SKU</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lowProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img src={p.image} alt={p.name} style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }} />
                        <span className="product-name-cell">{p.name}</span>
                      </div>
                    </td>
                    <td><span className="product-sku">{p.sku}</span></td>
                    <td><span style={{ color: '#3b82f6', fontWeight: 600, fontSize: 16 }}>{p.stock}</span></td>
                    <td><span className="badge badge-info">Tồn kho thấp</span></td>
                    <td>
                      <button className="btn btn-sm btn-primary">
                        <i className="fa fa-plus"></i> Nhập hàng
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {products.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <i className="fa fa-check-circle" style={{ fontSize: 64, color: '#10b981', marginBottom: 16 }}></i>
          <h3 style={{ marginBottom: 8 }}>Tất cả sản phẩm đều đủ hàng</h3>
          <p style={{ color: '#888' }}>Không có cảnh báo nào</p>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal active" onClick={() => setShowSettings(false)}>
          <div className="modal-dialog" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3>Cài đặt Cảnh báo</h3>
                <button className="modal-close" onClick={() => setShowSettings(false)}>×</button>
              </div>
              <form onSubmit={handleSaveSettings} className="modal-body">
                <div className="form-group">
                  <label className="form-label">Ngưỡng cảnh báo "Sắp hết"</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    min="1"
                    value={warningThreshold}
                    onChange={e => setWarningThreshold(Number(e.target.value))}
                  />
                  <small style={{ color: '#888', fontSize: 12 }}>Cảnh báo khi tồn kho ≤ giá trị này</small>
                </div>

                <div className="form-group">
                  <label className="form-label">Ngưỡng cảnh báo "Tồn kho thấp"</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    min="1"
                    value={lowThreshold}
                    onChange={e => setLowThreshold(Number(e.target.value))}
                  />
                  <small style={{ color: '#888', fontSize: 12 }}>Cảnh báo khi tồn kho ≤ giá trị này</small>
                </div>

                <label className="form-check">
                  <input className="form-check-input" type="checkbox" defaultChecked />
                  <span className="form-check-label">Gửi email thông báo</span>
                </label>

                <label className="form-check">
                  <input className="form-check-input" type="checkbox" defaultChecked />
                  <span className="form-check-label">Hiển thị thông báo trên hệ thống</span>
                </label>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSettings(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fa fa-save"></i> Lưu cài đặt
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
