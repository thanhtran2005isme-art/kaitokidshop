// Quan ly khach hang - match admin structure

import { useState, useEffect } from 'react';
import { formatDate } from '../utils/format';

interface Customer {
  id?: number; name: string; email: string; phone?: string; createdAt?: string; password?: string;
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const users: Customer[] = JSON.parse(localStorage.getItem('users') || '[]');
    setCustomers(users);
  }, []);

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const handleDelete = (email: string) => {
    if (!confirm('Xoa khach hang nay?')) return;
    const updated = customers.filter(c => c.email !== email);
    setCustomers(updated);
    localStorage.setItem('users', JSON.stringify(updated));
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Quản lý khách hàng ({customers.length})</h1>
      </div>

      <div className="card">
        <div className="filters-bar">
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm khách hàng..." />
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead><tr>
              <th>Tên</th><th>Email</th><th>SĐT</th><th>Ngày đăng ký</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={i}>
                  <td><span className="product-name-cell">{c.name}</span></td>
                  <td>{c.email}</td>
                  <td>{c.phone || '-'}</td>
                  <td>{c.createdAt ? formatDate(c.createdAt) : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-action btn-delete" onClick={() => handleDelete(c.email)}><i className="fa fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="loading-row">Chưa có khách hàng nào</p>}
        </div>
      </div>
    </>
  );
}
