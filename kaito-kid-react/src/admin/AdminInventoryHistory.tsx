// Lịch sử Nhập/Xuất kho - match admin structure

import { useState, useEffect } from 'react';

interface HistoryItem {
  id: number;
  type: 'in' | 'out' | 'set';
  productName: string;
  sku: string;
  quantity: number;
  oldStock: number;
  newStock: number;
  note: string;
  createdBy: string;
  createdAt: string;
}

export default function AdminInventoryHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('inventoryHistory') || '[]');
    if (saved.length > 0) {
      setHistory(saved);
    } else {
      const defaults: HistoryItem[] = [
        { id: 1, type: 'in', productName: 'Áo sơ mi trắng', sku: 'ASM001', quantity: 50, oldStock: 20, newStock: 70, note: 'Nhập hàng từ nhà cung cấp ABC', createdBy: 'Admin', createdAt: '2024-03-15 10:30' },
        { id: 2, type: 'out', productName: 'Quần jeans xanh', sku: 'QJ002', quantity: 5, oldStock: 30, newStock: 25, note: 'Xuất hàng cho đơn #1234', createdBy: 'Admin', createdAt: '2024-03-15 14:20' },
        { id: 3, type: 'in', productName: 'Váy hoa nhí', sku: 'VHN003', quantity: 30, oldStock: 10, newStock: 40, note: 'Nhập hàng mới', createdBy: 'Admin', createdAt: '2024-03-16 09:15' },
        { id: 4, type: 'set', productName: 'Áo thun đen', sku: 'ATD004', quantity: 0, oldStock: 15, newStock: 20, note: 'Điều chỉnh tồn kho sau kiểm kê', createdBy: 'Admin', createdAt: '2024-03-16 16:45' },
      ];
      setHistory(defaults);
      localStorage.setItem('inventoryHistory', JSON.stringify(defaults));
    }
  }, []);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'in': return 'Nhập hàng';
      case 'out': return 'Xuất hàng';
      case 'set': return 'Đặt lại';
      default: return type;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'in': return 'badge-success';
      case 'out': return 'badge-danger';
      case 'set': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  const filteredHistory = history.filter(item => {
    if (typeFilter && item.type !== typeFilter) return false;
    if (dateFrom && item.createdAt < dateFrom) return false;
    if (dateTo && item.createdAt > dateTo) return false;
    return true;
  });

  const resetFilters = () => {
    setTypeFilter('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Lịch sử Nhập/Xuất</h1>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => window.history.back()}>
            <i className="fa fa-arrow-left"></i> Quay lại
          </button>
          <button className="btn btn-primary">
            <i className="fa fa-download"></i> Xuất Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="filters-bar">
          <select 
            className="form-control" 
            style={{ width: 200 }}
            value={typeFilter} 
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">Tất cả loại</option>
            <option value="in">Nhập hàng</option>
            <option value="out">Xuất hàng</option>
            <option value="set">Đặt lại</option>
          </select>
          <input 
            type="date" 
            className="form-control" 
            style={{ width: 180 }}
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
          />
          <input 
            type="date" 
            className="form-control" 
            style={{ width: 180 }}
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={resetFilters}>
            <i className="fa fa-redo"></i> Làm mới
          </button>
        </div>
      </div>

      {/* History Timeline */}
      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Loại</th>
                <th>Sản phẩm</th>
                <th>SKU</th>
                <th>Số lượng</th>
                <th>Tồn kho</th>
                <th>Ghi chú</th>
                <th>Người thực hiện</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(item => (
                <tr key={item.id}>
                  <td>{item.createdAt}</td>
                  <td>
                    <span className={`badge ${getTypeBadge(item.type)}`}>
                      {getTypeLabel(item.type)}
                    </span>
                  </td>
                  <td>
                    <span className="product-name-cell">{item.productName}</span>
                  </td>
                  <td><span className="product-sku">{item.sku}</span></td>
                  <td>
                    <span style={{ 
                      color: item.type === 'in' ? '#10b981' : item.type === 'out' ? '#ef4444' : '#f59e0b',
                      fontWeight: 600 
                    }}>
                      {item.type === 'in' ? '+' : item.type === 'out' ? '-' : ''}{item.quantity}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: '#888' }}>{item.oldStock}</span>
                    {' → '}
                    <span style={{ fontWeight: 600 }}>{item.newStock}</span>
                  </td>
                  <td style={{ fontSize: 13, color: '#666' }}>{item.note}</td>
                  <td>{item.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredHistory.length === 0 && (
            <p className="loading-row">Không có lịch sử nào</p>
          )}
        </div>
      </div>
    </>
  );
}
