import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import AdminIcon from '../components/admin/AdminIcon';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import type { Order, Product, User } from '../types';
import { formatCurrency } from '../utils/format';
import { buildReportSnapshot, type ReportPeriod } from '../utils/reportAnalytics';

const PERIOD_OPTIONS: Array<{ value: ReportPeriod; label: string; description: string }> = [
  { value: 'today', label: 'Hôm nay', description: 'Theo dõi biến động ngay trong ngày để phản ứng thật nhanh.' },
  { value: 'week', label: '7 ngày qua', description: 'Xem đà tăng giảm ngắn hạn của đơn hàng và doanh thu.' },
  { value: 'month', label: '30 ngày qua', description: 'Khoảng nhìn cân bằng nhất để đánh giá hiệu quả bán hàng.' },
  { value: 'quarter', label: '3 tháng qua', description: 'Phù hợp để nhìn xu hướng theo chiến dịch hoặc mùa vụ.' },
  { value: 'year', label: 'Năm nay', description: 'Bức tranh lớn cho tăng trưởng doanh thu và cơ cấu danh mục.' },
];

const STATUS_COLORS = ['#d97706', '#0f766e', '#2563eb', '#dc2626'];
const BAR_COLORS = ['#c96f4a', '#d39262', '#647a62', '#4f6d7a', '#9b5c5c'];

function normalizeUsers(rawUsers: Array<Partial<User>>): User[] {
  return rawUsers.map((user, index) => ({
    id: user.id || index + 1,
    name: user.name || 'Khách hàng',
    email: user.email || `guest-${index + 1}@example.com`,
    phone: user.phone,
    role: user.role === 'admin' ? 'admin' : 'user',
    createdAt: user.createdAt,
  }));
}

function formatChange(value: number, direction: 'up' | 'down' | 'neutral') {
  const prefix = direction === 'up' ? '+' : direction === 'down' ? '-' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

function toCsvCell(value: string | number | undefined) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export default function AdminReports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [period, setPeriod] = useState<ReportPeriod>('month');

  useEffect(() => {
    setOrders(orderService.getAll());
    setProducts(productService.getAll());
    setUsers(normalizeUsers(JSON.parse(localStorage.getItem('users') || '[]')));
  }, []);

  const snapshot = useMemo(
    () => buildReportSnapshot(orders, products, users, period),
    [orders, period, products, users],
  );

  const activePeriod = PERIOD_OPTIONS.find((option) => option.value === period) || PERIOD_OPTIONS[2];
  const hasRevenueData = snapshot.revenueSeries.some((point) => point.revenue > 0);
  const hasStatusData = snapshot.statusData.some((point) => point.value > 0);
  const hasTopProducts = snapshot.topProducts.length > 0;
  const hasCategoryData = snapshot.categoryData.length > 0;
  const topProduct = snapshot.topProducts[0];
  const topCategory = snapshot.categoryData[0];
  const leadStatus = [...snapshot.statusData].sort((left, right) => right.value - left.value)[0];

  const statCards = [
    { label: 'Doanh thu', value: formatCurrency(snapshot.revenue), icon: 'fa-line-chart', change: snapshot.revenueChange },
    { label: 'Đơn hàng', value: String(snapshot.orderCount), icon: 'fa-shopping-cart', change: snapshot.orderChange },
    { label: 'Khách mới', value: String(snapshot.newCustomers), icon: 'fa-user-plus', change: snapshot.customerChange },
    { label: 'Giá trị đơn TB', value: formatCurrency(snapshot.averageOrderValue), icon: 'fa-money', change: snapshot.averageOrderChange },
  ];

  const exportReport = () => {
    const lines = [
      ['Metric', 'Value'].join(','),
      ['Revenue', toCsvCell(snapshot.revenue)].join(','),
      ['Orders', toCsvCell(snapshot.orderCount)].join(','),
      ['Items Sold', toCsvCell(snapshot.itemsSold)].join(','),
      ['New Customers', toCsvCell(snapshot.newCustomers)].join(','),
      ['Average Order Value', toCsvCell(snapshot.averageOrderValue)].join(','),
      '',
      ['Top Products'].join(','),
      ['Product', 'Quantity', 'Revenue', 'Share'].join(','),
      ...snapshot.topProducts.map((product) =>
        [toCsvCell(product.name), toCsvCell(product.quantity), toCsvCell(product.revenue), toCsvCell(product.share)].join(','),
      ),
      '',
      ['Categories'].join(','),
      ['Category', 'Quantity', 'Revenue', 'Share'].join(','),
      ...snapshot.categoryData.map((category) =>
        [toCsvCell(category.category), toCsvCell(category.quantity), toCsvCell(category.revenue), toCsvCell(category.share)].join(','),
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reports-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderEmptyState = (icon: string, title: string, description: string) => (
    <div className="reports-empty">
      <div className="reports-empty-icon">
        <AdminIcon name={icon} />
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );

  return (
    <div className="reports-admin-page reports-atelier-page">
      <div className="reports-shell">
      <section className="reports-hero">
        <div className="reports-hero-top">
          <div className="reports-hero-copy">
            <span className="reports-overline">Business reporting</span>
            <h1>Báo cáo vận hành</h1>
            <p>{activePeriod.description}</p>
          </div>
          <div className="reports-hero-actions">
            <select className="reports-period-select" value={period} onChange={(event) => setPeriod(event.target.value as ReportPeriod)}>
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button className="reports-export-btn" onClick={exportReport}>
              <AdminIcon name="fa-download" />
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>

        <div className="reports-hero-grid">
          <article className="reports-focus-card">
            <span className="reports-overline">Focus period</span>
            <h2>{activePeriod.label}</h2>
            <div className="reports-focus-stats">
              <div><span>Sản phẩm đã bán</span><strong>{snapshot.itemsSold}</strong></div>
              <div><span>Đơn trong kỳ</span><strong>{snapshot.currentOrders.length}</strong></div>
              <div><span>Khách mới</span><strong>{snapshot.newCustomers}</strong></div>
            </div>
          </article>

          <div className="reports-kpi-grid">
            {statCards.map((card) => (
              <article key={card.label} className="reports-kpi-card">
                <div className="reports-kpi-icon"><AdminIcon name={card.icon} /></div>
                <div className="reports-kpi-copy">
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                  <small className={`reports-change is-${card.change.direction}`}>
                    <AdminIcon name={card.change.direction === 'up' ? 'fa-arrow-up' : card.change.direction === 'down' ? 'fa-arrow-down' : 'fa-minus'} />
                    {formatChange(card.change.value, card.change.direction)} so với kỳ trước
                  </small>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="reports-glance-grid">
        <article className="reports-glance-card">
          <span className="reports-overline">Top performer</span>
          <strong>{topProduct?.name || 'Chưa có sản phẩm nổi bật'}</strong>
          <p>{topProduct ? `${topProduct.quantity} sản phẩm | ${formatCurrency(topProduct.revenue)} | ${topProduct.share}% doanh thu nhóm top` : 'Cần thêm dữ liệu bán hàng để xác định sản phẩm dẫn đầu.'}</p>
        </article>
        <article className="reports-glance-card">
          <span className="reports-overline">Category leader</span>
          <strong>{topCategory?.category || 'Chưa có danh mục nổi bật'}</strong>
          <p>{topCategory ? `${topCategory.quantity} sản phẩm | ${formatCurrency(topCategory.revenue)} | ${topCategory.share}% tỷ trọng` : 'Chưa có dữ liệu danh mục trong giai đoạn này.'}</p>
        </article>
        <article className="reports-glance-card">
          <span className="reports-overline">Order status</span>
          <strong>{leadStatus?.name || 'Chưa có trạng thái áp đảo'}</strong>
          <p>{leadStatus ? `${leadStatus.value} đơn đang tập trung vào trạng thái này.` : 'Chưa có đơn hàng đủ dữ liệu để phân tích trạng thái.'}</p>
        </article>
      </section>

      <section className="reports-visual-grid">
        <article className={`reports-panel reports-panel-wide ${!hasRevenueData ? 'is-empty' : ''}`}>
          <div className="reports-panel-head">
            <div><h3>Doanh thu theo thời gian</h3><p>Quan sát nhịp tăng trưởng theo từng mốc trong kỳ.</p></div>
            <span className="reports-chip">{snapshot.itemsSold} sản phẩm đã bán</span>
          </div>
          <div className="reports-chart-box">
            {hasRevenueData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={snapshot.revenueSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(120, 102, 84, 0.16)" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#7a6857' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#7a6857' }} tickLine={false} axisLine={false} width={76} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value || 0)), 'Doanh thu']} contentStyle={{ borderRadius: 18, border: '1px solid rgba(120, 102, 84, 0.16)', boxShadow: '0 16px 40px rgba(54, 40, 28, 0.12)' }} />
                  <Bar dataKey="revenue" radius={[10, 10, 0, 0]} fill="#c96f4a" />
                </BarChart>
              </ResponsiveContainer>
            ) : renderEmptyState('fa-bar-chart', 'Chưa có doanh thu trong kỳ này', 'Biểu đồ sẽ tự hiển thị ngay khi hệ thống ghi nhận đơn hàng hợp lệ trong giai đoạn đang xem.')}
          </div>
        </article>

        <article className={`reports-panel ${!hasStatusData ? 'is-empty' : ''}`}>
          <div className="reports-panel-head">
            <div><h3>Đơn hàng theo trạng thái</h3><p>Tỷ trọng phân bổ đơn đang đi qua hệ thống.</p></div>
            <span className="reports-chip">{snapshot.currentOrders.length} đơn</span>
          </div>
          <div className="reports-chart-box">
            {hasStatusData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={snapshot.statusData} dataKey="value" innerRadius={58} outerRadius={102} paddingAngle={4}>
                    {snapshot.statusData.map((entry, index) => <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : renderEmptyState('fa-box-open', 'Chưa có đơn hàng để phân tích', 'Khi có đơn phát sinh trong kỳ, hệ thống sẽ tự phân bổ trạng thái và hiển thị tỷ trọng ở đây.')}
          </div>
        </article>

        <article className={`reports-panel ${!hasTopProducts ? 'is-empty' : ''}`}>
          <div className="reports-panel-head">
            <div><h3>Top sản phẩm theo doanh thu</h3><p>Những SKU đang kéo doanh thu mạnh nhất.</p></div>
            <Link to="/admin/products" className="reports-inline-link">Xem sản phẩm</Link>
          </div>
          <div className="reports-chart-box">
            {hasTopProducts ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={snapshot.topProducts.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(120, 102, 84, 0.14)" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#7a6857' }} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" width={138} tick={{ fontSize: 12, fill: '#7a6857' }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value || 0)), 'Doanh thu']} />
                  <Bar dataKey="revenue" radius={[0, 10, 10, 0]}>{snapshot.topProducts.slice(0, 5).map((product, index) => <Cell key={product.name} fill={BAR_COLORS[index % BAR_COLORS.length]} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : renderEmptyState('fa-cube', 'Chưa có dữ liệu sản phẩm', 'Top sản phẩm sẽ xuất hiện khi có doanh thu được ghi nhận từ các SKU trong giai đoạn hiện tại.')}
          </div>
        </article>

        <article className={`reports-panel reports-panel-wide ${!hasCategoryData ? 'is-empty' : ''}`}>
          <div className="reports-panel-head">
            <div><h3>Danh mục đóng góp doanh thu</h3><p>So sánh hiệu quả giữa các nhóm sản phẩm.</p></div>
            <span className="reports-chip">{snapshot.categoryData.length} danh mục</span>
          </div>
          <div className="reports-chart-box">
            {hasCategoryData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={snapshot.categoryData.slice(0, 6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(120, 102, 84, 0.14)" />
                  <XAxis dataKey="category" tick={{ fontSize: 12, fill: '#7a6857' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#7a6857' }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value || 0)), 'Doanh thu']} />
                  <Bar dataKey="revenue" radius={[10, 10, 0, 0]} fill="#647a62" />
                </BarChart>
              </ResponsiveContainer>
            ) : renderEmptyState('fa-tags', 'Chưa có dữ liệu danh mục', 'Khi đơn hàng có sản phẩm thuộc các nhóm khác nhau, báo cáo đóng góp danh mục sẽ hiển thị rõ tại đây.')}
          </div>
        </article>
      </section>

      <section className="reports-table-grid">
        <article className="reports-table-panel">
          <div className="reports-panel-head">
            <div><h3>Top sản phẩm bán chạy</h3><p>Danh sách chi tiết để bám sát nhóm SKU đang kéo doanh thu.</p></div>
            <Link to="/admin/products" className="reports-inline-link">Xem tất cả</Link>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>Sản phẩm</th><th>Số lượng</th><th>Doanh thu</th><th>Tỷ trọng</th></tr></thead>
              <tbody>
                {snapshot.topProducts.length === 0 ? <tr><td colSpan={4} className="loading-row">Chưa có dữ liệu sản phẩm.</td></tr> : snapshot.topProducts.map((product) => (
                  <tr key={product.productId || product.name}>
                    <td><span className="product-name-cell">{product.name}</span></td>
                    <td>{product.quantity}</td>
                    <td><span className="order-price">{formatCurrency(product.revenue)}</span></td>
                    <td>{product.share}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="reports-table-panel">
          <div className="reports-panel-head">
            <div><h3>Báo cáo theo danh mục</h3><p>So sánh quy mô bán ra và tỷ trọng đóng góp của từng nhóm.</p></div>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>Danh mục</th><th>Số lượng</th><th>Doanh thu</th><th>Tỷ trọng</th></tr></thead>
              <tbody>
                {snapshot.categoryData.length === 0 ? <tr><td colSpan={4} className="loading-row">Chưa có dữ liệu danh mục.</td></tr> : snapshot.categoryData.map((category) => (
                  <tr key={category.category}>
                    <td>{category.category}</td>
                    <td>{category.quantity}</td>
                    <td><span className="order-price">{formatCurrency(category.revenue)}</span></td>
                    <td>{category.share}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
      </div>
    </div>
  );
}
