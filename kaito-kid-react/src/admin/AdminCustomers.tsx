import { useEffect, useState } from 'react';
import { formatDate } from '../utils/format';

interface Customer {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

function readCustomers(): Customer[] {
  try {
    const data = JSON.parse(localStorage.getItem('users') || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setCustomers(readCustomers());
  }, []);

  const keyword = search.trim().toLowerCase();
  const filtered = customers.filter(customer =>
    customer.name?.toLowerCase().includes(keyword) ||
    customer.email?.toLowerCase().includes(keyword) ||
    customer.phone?.includes(search.trim())
  );

  const handleDelete = (email: string) => {
    if (!confirm('Xoa khach hang nay?')) return;

    const updated = customers.filter(customer => customer.email !== email);
    setCustomers(updated);
    localStorage.setItem('users', JSON.stringify(updated));
  };

  return (
    <>
      <div className="page-header">
        <h1>Quan ly khach hang ({customers.length})</h1>
      </div>

      <div className="card">
        <div className="filters-bar">
          <input
            className="search-input"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Tim khach hang..."
          />
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ten</th>
                <th>Email</th>
                <th>SDT</th>
                <th>Ngay dang ky</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer, index) => (
                <tr key={customer.id || customer.email || index}>
                  <td><span className="product-name-cell">{customer.name}</span></td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || '-'}</td>
                  <td>{customer.createdAt ? formatDate(customer.createdAt) : '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-action btn-delete" onClick={() => handleDelete(customer.email)}>
                        <i className="fa fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && <p className="loading-row">Chua co khach hang nao</p>}
        </div>
      </div>
    </>
  );
}
