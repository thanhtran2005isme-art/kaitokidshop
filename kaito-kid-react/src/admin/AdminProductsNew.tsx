/**
 * Admin Products - API Version
 * Simplified version using backend API
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminIcon from '../components/admin/AdminIcon';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAdminUi } from '../components/admin/AdminUiProvider';
import { adminProductsApi } from '../services/api';
import type { Product } from '../types';
import { formatCurrency } from '../utils/format';

const STATUS_LABELS: Record<Product['status'], string> = {
  active: 'Đang bán',
  draft: 'Nháp',
  'out-of-stock': 'Hết hàng',
};

export default function AdminProducts() {
  const { confirm, notify } = useAdminUi();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  useEffect(() => {
    loadProducts();
  }, [search, statusFilter, categoryFilter, page]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const result = await adminProductsApi.getAll({
        search,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        page,
        pageSize,
      });

      if (result.success && result.data) {
        setProducts(result.data.products);
        setTotal(result.data.total);
      } else {
        notify({
          tone: 'error',
          message: result.error || 'Không thể tải danh sách sản phẩm',
        });
      }
    } catch (error) {
      console.error('Error loading products:', error);
      notify({
        tone: 'error',
        message: 'Đã xảy ra lỗi khi tải sản phẩm',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    const accepted = await confirm({
      title: 'Xóa sản phẩm',
      message: `Bạn có chắc muốn xóa sản phẩm "${name}"? Hành động này không thể hoàn tác.`,
      confirmLabel: 'Xóa sản phẩm',
      tone: 'danger',
      icon: 'fa-trash',
    });

    if (!accepted) return;

    const result = await adminProductsApi.delete(id);
    if (result.success) {
      notify({
        tone: 'success',
        message: 'Đã xóa sản phẩm thành công',
      });
      loadProducts();
    } else {
      notify({
        tone: 'error',
        message: result.error || 'Không thể xóa sản phẩm',
      });
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const activeCount = products.filter((p) => p.status === 'active').length;
  const draftCount = products.filter((p) => p.status === 'draft').length;
  const outOfStockCount = products.filter((p) => p.status === 'out-of-stock').length;

  if (loading && products.length === 0) {
    return (
      <div className="products-admin-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="products-admin-page">
      <div className="page-header products-page-header">
        <div className="products-page-copy">
          <span className="products-page-eyebrow">Catalog command center</span>
          <h1>Quản lý sản phẩm</h1>
          <p>Quản lý catalog, tồn kho và trạng thái sản phẩm từ backend database.</p>
        </div>

        <div className="page-actions products-page-actions">
          <Link to="/admin/products/add" className="products-header-button primary">
            <AdminIcon name="fa-plus" />
            <span>Thêm sản phẩm</span>
          </Link>
        </div>
      </div>

      <div className="products-overview-grid">
        <button
          type="button"
          className={`products-overview-card all ${!statusFilter ? 'active' : ''}`}
          onClick={() => setStatusFilter('')}
        >
          <div className="products-overview-icon all">
            <AdminIcon name="fa-shopping-bag" />
          </div>
          <div className="products-overview-copy">
            <span>Tất cả</span>
            <strong>{total}</strong>
            <p>Toàn bộ catalog</p>
          </div>
        </button>

        <button
          type="button"
          className={`products-overview-card active ${statusFilter === 'active' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'active' ? '' : 'active')}
        >
          <div className="products-overview-icon active">
            <AdminIcon name="fa-check-circle" />
          </div>
          <div className="products-overview-copy">
            <span>Đang bán</span>
            <strong>{activeCount}</strong>
            <p>Sản phẩm active</p>
          </div>
        </button>

        <button
          type="button"
          className={`products-overview-card draft ${statusFilter === 'draft' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'draft' ? '' : 'draft')}
        >
          <div className="products-overview-icon draft">
            <AdminIcon name="fa-folder-open" />
          </div>
          <div className="products-overview-copy">
            <span>Nháp</span>
            <strong>{draftCount}</strong>
            <p>Chưa xuất bản</p>
          </div>
        </button>

        <button
          type="button"
          className={`products-overview-card out-of-stock ${statusFilter === 'out-of-stock' ? 'active' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'out-of-stock' ? '' : 'out-of-stock')}
        >
          <div className="products-overview-icon out-of-stock">
            <AdminIcon name="fa-box-open" />
          </div>
          <div className="products-overview-copy">
            <span>Hết hàng</span>
            <strong>{outOfStockCount}</strong>
            <p>Cần nhập thêm</p>
          </div>
        </button>
      </div>

      <section className="products-filter-panel">
        <div className="products-filter-row">
          <label className="products-search-shell">
            <AdminIcon name="fa-search" />
            <input
              className="search-input products-search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo tên hoặc SKU..."
            />
            {search && (
              <button type="button" className="products-inline-clear" onClick={() => setSearch('')}>
                <AdminIcon name="fa-times" />
              </button>
            )}
          </label>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="draft">Nháp</option>
            <option value="out-of-stock">Hết hàng</option>
          </select>

          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả danh mục</option>
            <option value="Ao">Áo</option>
            <option value="Quan">Quần</option>
            <option value="Vay">Váy</option>
            <option value="Dam">Đầm</option>
          </select>

          <button
            type="button"
            className="btn-filter-reset"
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setCategoryFilter('');
              setPage(1);
            }}
          >
            <AdminIcon name="fa-rotate-left" />
            <span>Xóa bộ lọc</span>
          </button>
        </div>
      </section>

      <section className="products-list-shell">
        <div className="products-list-toolbar">
          <div className="products-list-copy">
            <span className="products-list-eyebrow">Catalog view</span>
            <h2>
              Hiển thị {products.length} / {total} sản phẩm
            </h2>
            <p>Dữ liệu được load trực tiếp từ database.</p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <LoadingSpinner />
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            <AdminIcon name="fa-box-open" />
            <p style={{ marginTop: '16px' }}>Không tìm thấy sản phẩm nào.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table products-data-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Giá bán</th>
                    <th>Tồn kho</th>
                    <th>Đã bán</th>
                    <th>Trạng thái</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="product-row-main">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="product-img" />
                          ) : (
                            <div className="product-img product-img-placeholder">
                              <AdminIcon name="fa-image" />
                            </div>
                          )}
                          <div className="product-row-copy">
                            <strong className="product-name-cell">{product.name}</strong>
                            <span className="product-subline">
                              {product.category} • {product.gender}
                            </span>
                            <span className="product-subline">SKU: {product.sku || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="product-price-cell">
                          <strong>{formatCurrency(product.price)}</strong>
                          {product.oldPrice && (
                            <span className="product-old-price">{formatCurrency(product.oldPrice)}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`product-stock-badge ${product.stock <= 10 ? 'low' : ''}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td>{product.soldCount || 0}</td>
                      <td>
                        <span className={`product-status-badge ${product.status}`}>
                          {STATUS_LABELS[product.status]}
                        </span>
                      </td>
                      <td>
                        <div className="product-actions">
                          <Link
                            to={`/admin/products/${product.id}/edit`}
                            className="product-action-btn"
                            title="Chỉnh sửa"
                          >
                            <AdminIcon name="fa-edit" />
                          </Link>
                          <button
                            type="button"
                            className="product-action-btn danger"
                            onClick={() => handleDelete(product.id, product.name)}
                            title="Xóa"
                          >
                            <AdminIcon name="fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination-shell">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <AdminIcon name="fa-chevron-left" />
                  <span>Trước</span>
                </button>

                <div className="pagination-info">
                  Trang {page} / {totalPages}
                </div>

                <button
                  type="button"
                  className="pagination-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <span>Sau</span>
                  <AdminIcon name="fa-chevron-right" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
