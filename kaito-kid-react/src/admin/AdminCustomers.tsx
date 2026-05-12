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
    <div className="customers-admin-page customers-concierge-page">
      <div className="customers-concierge-shell">
        <aside className="customers-sideboard">
          <section className="customers-brand-card">
            <span className="customers-overline">Quản lý khách hàng</span>
            <h1>Khách hàng</h1>
            <p>
              Quản lý tệp khách, lọc phân khúc và mở nhanh hồ sơ chăm sóc trên cùng một màn hình.
            </p>
          </section>

          <section className="customers-side-panel customers-snapshot-panel">
            <div className="customers-side-head">
              <span className="customers-overline">Tổng quan</span>
              <strong>{stats.total} hồ sơ</strong>
            </div>

            <div className="customers-stat-stack">
              <article className="customers-stat-card">
                <div className="customers-stat-icon"><AdminIcon name="fa-users" /></div>
                <div><span>Tổng khách hàng</span><strong>{stats.total}</strong></div>
              </article>
              <article className="customers-stat-card">
                <div className="customers-stat-icon is-vip"><AdminIcon name="fa-star" /></div>
                <div><span>Khách VIP</span><strong>{stats.vip}</strong></div>
              </article>
              <article className="customers-stat-card">
                <div className="customers-stat-icon is-new"><AdminIcon name="fa-user-plus" /></div>
                <div><span>Khách mới</span><strong>{stats.newCustomers}</strong></div>
              </article>
              <article className="customers-stat-card">
                <div className="customers-stat-icon is-risk"><AdminIcon name="fa-refresh" /></div>
                <div><span>Cần kích hoạt lại</span><strong>{stats.atRisk}</strong></div>
              </article>
            </div>

            <div className="customers-money-block">
              <span className="customers-overline">Tổng chi tiêu</span>
              <strong>{formatCurrency(stats.totalRevenue)}</strong>
              <p>{stats.repeated} khách đã mua từ 2 đơn trở lên, {stats.tagged} hồ sơ đã có gắn tag.</p>
            </div>
          </section>

          <section className="customers-side-panel customers-filter-panel">
            <div className="customers-side-head">
              <span className="customers-overline">Bộ lọc</span>
              <strong>Lọc & tìm nhanh</strong>
            </div>

            <label className="customers-field">
              <span>Tìm kiếm</span>
              <div className="customers-search-wrap">
                <AdminIcon name="fa-search" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Tên, email, số điện thoại, tag..."
                />
              </div>
            </label>

            <label className="customers-field">
              <span>Phân nhóm</span>
              <select value={tierFilter} onChange={(event) => setTierFilter(event.target.value as 'all' | CustomerTier)}>
                <option value="all">Tất cả phân nhóm</option>
                {Object.entries(TIER_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label className="customers-field">
              <span>Chăm sóc</span>
              <select value={careFilter} onChange={(event) => setCareFilter(event.target.value as 'all' | CustomerCareStatus)}>
                <option value="all">Tất cả trạng thái</option>
                {CARE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <div className="customers-mini-note">
              <strong>{filteredCustomers.length}</strong>
              <span>khách phù hợp bộ lọc hiện tại</span>
            </div>
          </section>

          <section className="customers-side-panel customers-care-panel">
            <div className="customers-side-head">
              <span className="customers-overline">Nhịp chăm sóc</span>
              <strong>Nhịp chăm sóc</strong>
            </div>

            <div className="customers-care-list">
              {careCounts.map((item) => (
                <div key={item.value} className="customers-care-row">
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <span>{item.count}</span>
                </div>
              ))}
            </div>

            <div className="customers-side-footnote">
              <AdminIcon name="fa-circle-info" />
              <span>{stats.noPhone} khách chưa có số điện thoại để chăm sóc trực tiếp.</span>
            </div>
          </section>
        </aside>

        <section className="customers-roster-stage">
          <div className="customers-stage-head">
            <div>
              <span className="customers-overline">Danh sách</span>
              <h2>Danh sách khách hàng</h2>
              <p>Chọn một hồ sơ để mở panel chăm sóc chi tiết ở bên phải.</p>
            </div>
            <div className="customers-stage-badges">
              <span>{filteredCustomers.length} kết quả</span>
              <span>{stats.repeated} khách quay lại</span>
            </div>
          </div>

          <div className="customers-roster-list">
            {filteredCustomers.length === 0 ? (
              <div className="customers-roster-empty">
                <div className="customers-roster-empty-icon">
                  <AdminIcon name="fa-users" />
                </div>
                <strong>Không có khách hàng phù hợp</strong>
                <p>Hãy thử nới bộ lọc hoặc tìm với từ khóa ngắn hơn để xem thêm hồ sơ.</p>
              </div>
            ) : (
              filteredCustomers.map((customer) => {
                const isSelected = selectedCustomerKey === getCustomerKey(customer);

                return (
                  <article
                    key={customer.email}
                    className={`customers-roster-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedCustomerKey(getCustomerKey(customer))}
                  >
                    <div className="customers-roster-main">
                      <div className="customers-roster-avatar">{getInitials(customer.name)}</div>

                      <div className="customers-roster-copy">
                        <div className="customers-roster-topline">
                          <h3>{customer.name}</h3>
                          <div className="customers-pill-row">
                            <span className={`customer-tier-pill ${customer.tier}`}>{TIER_LABELS[customer.tier]}</span>
                            <span className={`customer-care-pill ${customer.careStatus}`}>{getCareLabel(customer.careStatus)}</span>
                          </div>
                        </div>

                        <div className="customers-meta-line">
                          <span>{customer.email}</span>
                          <span>{customer.phone || 'Chưa có số điện thoại'}</span>
                          <span>{customer.lastOrderAt ? `Mua gần nhất ${formatDate(customer.lastOrderAt)}` : 'Chưa có đơn hàng'}</span>
                        </div>

                        <div className="customers-metric-grid">
                          <div>
                            <span>Tổng chi tiêu</span>
                            <strong>{formatCurrency(customer.totalSpend)}</strong>
                          </div>
                          <div>
                            <span>Đơn hàng</span>
                            <strong>{customer.orderCount}</strong>
                          </div>
                          <div>
                            <span>Đơn hợp lệ</span>
                            <strong>{customer.completedOrders}</strong>
                          </div>
                          <div>
                            <span>Giá trị TB</span>
                            <strong>{formatCurrency(customer.averageOrderValue)}</strong>
                          </div>
                        </div>

                        <div className="customers-tag-strip">
                          {(customer.tags.length > 0 ? customer.tags : customer.topCategories.slice(0, 2)).map((tag) => (
                            <span key={tag} className="customers-tag-chip">{tag}</span>
                          ))}
                          {customer.tags.length === 0 && customer.topCategories.length === 0 ? (
                            <span className="customers-tag-chip is-muted">Chưa có tag hoặc sở thích nổi bật</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="customers-roster-actions">
                      <button type="button" className="customers-card-btn" onClick={(event) => {
                        event.stopPropagation();
                        setSelectedCustomerKey(getCustomerKey(customer));
                      }}>
                        <AdminIcon name="fa-eye" />
                        <span>Mở hồ sơ</span>
                      </button>
                      <button type="button" className="customers-card-btn is-danger" onClick={(event) => {
                        event.stopPropagation();
                        void handleDelete(customer);
                      }}>
                        <AdminIcon name="fa-trash" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <aside className="customers-dossier">
          {selectedCustomer ? (
            <>
              <section className="customers-dossier-hero">
                <div className="customers-dossier-avatar">{getInitials(selectedCustomer.name)}</div>
                <div className="customers-dossier-copy">
                  <span className="customers-overline">Hồ sơ khách hàng</span>
                  <h2>{selectedCustomer.name}</h2>
                  <p>{selectedCustomer.email} • {selectedCustomer.phone || 'Chưa có số điện thoại'}</p>
                  <div className="customers-pill-row">
                    <span className={`customer-tier-pill ${selectedCustomer.tier}`}>{TIER_LABELS[selectedCustomer.tier]}</span>
                    <span className={`customer-care-pill ${selectedCustomer.careStatus}`}>{getCareLabel(selectedCustomer.careStatus)}</span>
                  </div>
                </div>
              </section>

              <section className="customers-dossier-card">
                <div className="customers-dossier-head">
                  <div>
                    <span className="customers-overline">Tổng quan</span>
                    <h3>Tổng quan hồ sơ</h3>
                  </div>
                  <span className="customers-rank-badge">#{selectedRank || '--'} theo doanh thu</span>
                </div>

                <div className="customers-dossier-metrics">
                  <article><span>Tổng chi tiêu</span><strong>{formatCurrency(selectedCustomer.totalSpend)}</strong></article>
                  <article><span>Đơn hàng</span><strong>{selectedCustomer.orderCount}</strong></article>
                  <article><span>Tỷ trọng doanh thu</span><strong>{selectedRevenueShare}%</strong></article>
                  <article><span>Tham gia</span><strong>{selectedCustomer.createdAt ? formatDate(selectedCustomer.createdAt) : '--'}</strong></article>
                </div>

                <div className="customers-detail-list">
                  <div><span>Đơn đầu tiên</span><strong>{selectedCustomer.firstOrderAt ? formatDate(selectedCustomer.firstOrderAt) : '--'}</strong></div>
                  <div><span>Đơn gần nhất</span><strong>{selectedCustomer.lastOrderAt ? formatDate(selectedCustomer.lastOrderAt) : '--'}</strong></div>
                  <div><span>Trạng thái gần nhất</span><strong>{selectedCustomer.lastOrderStatus ? ORDER_STATUS_LABELS[selectedCustomer.lastOrderStatus] : 'Chưa có'}</strong></div>
                  <div><span>Lần cập nhật hồ sơ</span><strong>{selectedProfileUpdatedAt ? formatDate(selectedProfileUpdatedAt) : 'Chưa cập nhật'}</strong></div>
                </div>
              </section>

              <section className="customers-dossier-card">
                <div className="customers-dossier-head">
                  <div>
                    <span className="customers-overline">Chăm sóc</span>
                    <h3>Chăm sóc & ghi chú</h3>
                  </div>
                </div>

                <label className="customers-field">
                  <span>Trạng thái chăm sóc</span>
                  <select value={detailCareStatus} onChange={(event) => setDetailCareStatus(event.target.value as CustomerCareStatus)}>
                    {CARE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <small>{getCareDetail(detailCareStatus)}</small>
                </label>

                <label className="customers-field">
                  <span>Tags nội bộ</span>
                  <input
                    value={detailTags}
                    onChange={(event) => setDetailTags(event.target.value)}
                    placeholder="vip, quay lại, cần gọi lại"
                  />
                </label>

                <label className="customers-field">
                  <span>Ghi chú chăm sóc</span>
                  <textarea
                    rows={5}
                    value={detailNote}
                    onChange={(event) => setDetailNote(event.target.value)}
                    placeholder="Ghi chú về nhu cầu, ưu tiên, phản hồi, dịp cần liên hệ lại..."
                  />
                </label>

                <div className="customers-dossier-actions">
                  <button type="button" className="customers-primary-btn" onClick={saveSelectedCustomerProfile}>
                    <AdminIcon name="fa-save" />
                    <span>Lưu hồ sơ</span>
                  </button>
                  <button type="button" className="customers-ghost-btn is-danger" onClick={() => void handleDelete(selectedCustomer)}>
                    <AdminIcon name="fa-trash" />
                    <span>Xóa khách hàng</span>
                  </button>
                </div>
              </section>

              <section className="customers-dossier-card">
                <div className="customers-dossier-head">
                  <div>
                    <span className="customers-overline">Sở thích</span>
                    <h3>Sở thích & danh mục</h3>
                  </div>
                </div>

                <div className="customers-interest-block">
                  <span>Danh mục mua nhiều</span>
                  <div className="customer-tag-list">
                    {(selectedCustomer.topCategories.length > 0 ? selectedCustomer.topCategories : ['Chưa có dữ liệu']).map((category) => (
                      <span key={category} className="customer-tag">{category}</span>
                    ))}
                  </div>
                </div>

                <div className="customers-interest-block">
                  <span>Sản phẩm mua nhiều</span>
                  <div className="customer-tag-list">
                    {(selectedCustomer.purchasedProducts.length > 0 ? selectedCustomer.purchasedProducts : ['Chưa có dữ liệu']).map((product) => (
                      <span key={product} className="customer-tag subtle">{product}</span>
                    ))}
                  </div>
                </div>

                {selectedCustomer.tags.length > 0 ? (
                  <div className="customers-interest-block">
                    <span>Tags đã lưu</span>
                    <div className="customer-tag-list">
                      {selectedCustomer.tags.map((tag) => (
                        <span key={tag} className="customer-tag info">{tag}</span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              <section className="customers-dossier-card">
                <div className="customers-dossier-head">
                  <div>
                    <span className="customers-overline">Lịch sử đơn</span>
                    <h3>Lịch sử đơn hàng</h3>
                  </div>
                </div>

                {selectedCustomer.orders.length === 0 ? (
                  <div className="customers-dossier-empty">
                    <AdminIcon name="fa-shopping-bag" />
                    <p>Khách hàng này chưa có đơn hàng nào.</p>
                  </div>
                ) : (
                  <div className="customer-order-list">
                    {selectedCustomer.orders.map((order) => (
                      <article key={order.id} className="customer-order-item">
                        <div>
                          <strong>#{order.id}</strong>
                          <span>{formatDate(order.createdAt)} • {order.items.length} sản phẩm</span>
                        </div>
                        <div className="customer-order-meta">
                          <span className={`customer-order-status ${order.status}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                          <strong>{formatCurrency(order.total)}</strong>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <section className="customers-dossier-empty">
              <AdminIcon name="fa-user" />
              <strong>Chưa có hồ sơ nào được chọn</strong>
              <p>Hãy chọn một khách hàng trong danh sách để mở dossier chăm sóc chi tiết.</p>
            </section>
          )}
        </aside>
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
