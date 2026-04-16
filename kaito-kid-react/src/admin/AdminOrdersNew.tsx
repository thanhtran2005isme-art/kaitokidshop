import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminIcon from '../components/admin/AdminIcon';
import LoadingSpinner from '../components/LoadingSpinner';
import { orderApi } from '../services/api';
import type { OrderDTO } from '../types/api';
import { formatCurrency, formatDate, formatDateShort } from '../utils/format';
import toast from 'react-hot-toast';

type StatusFilter = 'all' | OrderDTO['status'];

const STATUS_OPTIONS: Array<{ value: OrderDTO['status']; label: string }> = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const statusMap: Record<OrderDTO['status'], string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const STATUS_META: Record<
  OrderDTO['status'],
  { label: string; icon: string; tone: 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled' }
> = {
  pending: { label: 'Chờ xác nhận', icon: 'fa-clock', tone: 'pending' },
  confirmed: { label: 'Đã xác nhận', icon: 'fa-check-circle', tone: 'confirmed' },
  shipping: { label: 'Đang giao', icon: 'fa-truck', tone: 'shipping' },
  completed: { label: 'Hoàn thành', icon: 'fa-check-circle', tone: 'completed' },
  cancelled: { label: 'Đã hủy', icon: 'fa-ban', tone: 'cancelled' },
};

function getStatusFilter(value: string | null): StatusFilter {
  if (
    value === 'pending' ||
    value === 'confirmed' ||
    value === 'shipping' ||
    value === 'completed' ||
    value === 'cancelled'
  ) {
    return value;
  }
  return 'all';
}

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderDTO['status']>('pending');
  const [adminNote, setAdminNote] = useState('');
  
  const statusFilter = getStatusFilter(searchParams.get('status'));
  const searchQuery = searchParams.get('search') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 20;

  // Fetch orders from backend
  useEffect(() => {
    fetchOrders();
  }, [statusFilter, searchQuery, currentPage]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const response = await orderApi.getOrders({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
        page: currentPage,
        pageSize,
      });
      
      // Ensure items array exists for each order
      const ordersWithItems = (response.items || []).map(order => ({
        ...order,
        items: order.items || []
      }));
      
      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus() {
    if (!selectedOrder) return;

    try {
      setUpdatingStatus(true);
      await orderApi.updateOrderStatus(selectedOrder.id, {
        trangThai: newStatus,
        ghiChuAdmin: adminNote || undefined,
      });
      
      toast.success('Cập nhật trạng thái thành công');
      setSelectedOrder(null);
      setAdminNote('');
      fetchOrders(); // Refresh list
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setUpdatingStatus(false);
    }
  }

  function handleStatusFilterChange(status: StatusFilter) {
    const params = new URLSearchParams(searchParams);
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    params.set('page', '1');
    setSearchParams(params);
  }

  function handleSearchChange(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    setSearchParams(params);
  }

  function openOrderDetail(order: OrderDTO) {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setAdminNote(order.adminNote || '');
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-header">
        <h1>
          <AdminIcon name="fa-shopping-cart" />
          Quản lý đơn hàng
        </h1>
      </div>

      {/* Filters */}
      <div className="admin-orders-filters">
        <div className="status-tabs">
          <button
            className={`status-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => handleStatusFilterChange('all')}
          >
            Tất cả
          </button>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`status-tab ${statusFilter === opt.value ? 'active' : ''}`}
              onClick={() => handleStatusFilterChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên, SĐT..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <AdminIcon name="fa-search" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-orders-table">
        {orders.length === 0 ? (
          <div className="empty-state">
            <AdminIcon name="fa-inbox" />
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{order.customerName || 'N/A'}</div>
                      <div className="customer-phone">{order.customerPhone || 'N/A'}</div>
                    </div>
                  </td>
                  <td>{order.items?.length || 0} sản phẩm</td>
                  <td className="order-total">{formatCurrency(order.total || 0)}</td>
                  <td>
                    <span className={`status-badge ${order.status || 'pending'}`}>
                      <AdminIcon name={STATUS_META[order.status]?.icon || 'fa-clock'} />
                      {statusMap[order.status] || 'N/A'}
                    </span>
                  </td>
                  <td>{order.createdAt ? formatDateShort(order.createdAt) : 'N/A'}</td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => openOrderDetail(order)}
                    >
                      <AdminIcon name="fa-eye" />
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal active" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content order-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {/* Customer Info */}
              <div className="section">
                <h4>Thông tin khách hàng</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">Tên:</span>
                    <span className="value">{selectedOrder.customerName}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">SĐT:</span>
                    <span className="value">{selectedOrder.customerPhone}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedOrder.customerEmail}</span>
                  </div>
                  <div className="info-item full-width">
                    <span className="label">Địa chỉ:</span>
                    <span className="value">{selectedOrder.customerAddress}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="section">
                <h4>Sản phẩm ({selectedOrder.items?.length || 0})</h4>
                <div className="order-items">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="order-item">
                      <img src={item.image} alt={item.productName} />
                      <div className="item-info">
                        <div className="item-name">{item.productName}</div>
                        <div className="item-variant">
                          {item.color} {item.size && `, ${item.size}`} × {item.quantity}
                        </div>
                        <div className="item-price">{formatCurrency(item.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="section">
                <h4>Tổng kết</h4>
                <div className="summary-rows">
                  <div className="summary-row">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Phí ship:</span>
                    <span>{formatCurrency(selectedOrder.shippingFee)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="summary-row">
                      <span>Giảm giá:</span>
                      <span>-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>Tổng cộng:</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="section">
                <h4>Cập nhật trạng thái</h4>
                <div className="status-update-form">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderDTO['status'])}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <textarea
                    placeholder="Ghi chú của admin (tùy chọn)..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                  />

                  <button
                    className="btn-update-status"
                    onClick={handleUpdateStatus}
                    disabled={updatingStatus || newStatus === selectedOrder.status}
                  >
                    {updatingStatus ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                  </button>
                </div>
              </div>

              {selectedOrder.note && (
                <div className="section">
                  <h4>Ghi chú khách hàng</h4>
                  <p className="customer-note">{selectedOrder.note}</p>
                </div>
              )}

              {selectedOrder.adminNote && (
                <div className="section">
                  <h4>Ghi chú admin</h4>
                  <p className="admin-note">{selectedOrder.adminNote}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
