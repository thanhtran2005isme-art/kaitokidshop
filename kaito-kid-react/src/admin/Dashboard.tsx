import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
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
import { readAdminSettings } from '../utils/adminSettingsConfig';
import { formatCurrency, formatDate } from '../utils/format';
import { readStoredReviews } from '../utils/reviewConfig';

interface Review {
  id: number;
  orderId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

type DashboardPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year';
type RevenueWindow = '7' | '30' | '90';

const PERIOD_OPTIONS: Array<{ value: DashboardPeriod; label: string; shortLabel: string }> = [
  { value: 'today', label: 'Hôm nay', shortLabel: 'hôm nay' },
  { value: 'week', label: '7 ngày qua', shortLabel: '7 ngày' },
  { value: 'month', label: '30 ngày qua', shortLabel: '30 ngày' },
  { value: 'quarter', label: '3 tháng qua', shortLabel: '3 tháng' },
  { value: 'year', label: 'Năm nay', shortLabel: 'năm nay' },
];

const CHART_WINDOWS: Array<{ value: RevenueWindow; label: string }> = [
  { value: '7', label: '7 ngày' },
  { value: '30', label: '30 ngày' },
  { value: '90', label: '90 ngày' },
];

const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

const STATUS_CHART_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];
const DASHBOARD_TOOLTIP_STYLE = {
  background: 'rgba(255, 255, 255, 0.97)',
  border: '1px solid rgba(99, 102, 241, 0.12)',
  borderRadius: '16px',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.12)',
} as const;

function renderDashboardLegendLabel(value: string) {
  return <span className="dashboard-chart-legend-label">{value}</span>;
}

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function endOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function isValidDate(value?: string) {
  if (!value) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPeriodRange(period: DashboardPeriod) {
  const now = new Date();
  const today = startOfDay(now);

  switch (period) {
    case 'today':
      return { start: today, end: endOfDay(now) };
    case 'week':
      return { start: addDays(today, -6), end: endOfDay(now) };
    case 'month':
      return { start: addDays(today, -29), end: endOfDay(now) };
    case 'quarter':
      return { start: addDays(today, -89), end: endOfDay(now) };
    case 'year':
      return { start: new Date(now.getFullYear(), 0, 1), end: endOfDay(now) };
    default:
      return { start: addDays(today, -29), end: endOfDay(now) };
  }
}

function getRollingWindowRange(windowSize: RevenueWindow) {
  const totalDays = Number(windowSize);
  const today = startOfDay(new Date());

  return {
    start: addDays(today, -(totalDays - 1)),
    end: endOfDay(new Date()),
  };
}

function isDateInRange(dateValue: string | undefined, start: Date, end: Date) {
  if (!isValidDate(dateValue)) {
    return false;
  }

  const date = new Date(dateValue as string);
  return date >= start && date <= end;
}

function formatShortCurrency(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} triệu`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}k`;
  }

  return `${Math.round(value)}`;
}

function formatRelativeTime(dateValue?: string) {
  if (!isValidDate(dateValue)) {
    return 'Mới cập nhật';
  }

  const diffInMinutes = Math.max(0, Math.floor((Date.now() - new Date(dateValue as string).getTime()) / 60000));

  if (diffInMinutes < 1) {
    return 'Vừa xong';
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  }

  return formatDate(dateValue as string);
}

function buildRevenueSeries(orders: Order[], windowSize: RevenueWindow) {
  const totalDays = Number(windowSize);
  const today = startOfDay(new Date());
  const firstDay = addDays(today, -(totalDays - 1));

  const series = Array.from({ length: totalDays }, (_, index) => {
    const date = addDays(firstDay, index);
    return {
      key: getLocalDateKey(date),
      label: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date),
      revenue: 0,
      orders: 0,
    };
  });

  const seriesMap = new Map(series.map((item) => [item.key, item]));

  orders.forEach((order) => {
    if (order.status === 'cancelled' || !isValidDate(order.createdAt)) {
      return;
    }

    const createdAt = new Date(order.createdAt);
    if (createdAt < firstDay) {
      return;
    }

    const bucket = seriesMap.get(getLocalDateKey(createdAt));
    if (!bucket) {
      return;
    }

    bucket.revenue += order.total || 0;
    bucket.orders += 1;
  });

  return series;
}

export default function Dashboard() {
  const adminSettings = readAdminSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [period, setPeriod] = useState<DashboardPeriod>('month');
  const [chartWindow, setChartWindow] = useState<RevenueWindow>('30');

  useEffect(() => {
    const savedOrders = orderService
      .getAll()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const savedProducts = productService.getAll();
    const savedCustomers: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const savedReviews: Review[] = readStoredReviews().map((review) => ({
      id: review.id,
      orderId: review.orderId,
      productName: review.productName,
      customerName: review.customerName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    }));

    setOrders(savedOrders);
    setProducts(savedProducts);
    setCustomers(savedCustomers);
    setReviews(
      savedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
  }, []);

  const selectedPeriod = PERIOD_OPTIONS.find((option) => option.value === period) || PERIOD_OPTIONS[2];
  const selectedChartWindow = CHART_WINDOWS.find((option) => option.value === chartWindow) || CHART_WINDOWS[1];
  const periodRange = getPeriodRange(period);
  const chartRange = getRollingWindowRange(chartWindow);
  const weekRange = getPeriodRange('week');

  const filteredOrders = orders.filter((order) => isDateInRange(order.createdAt, periodRange.start, periodRange.end));
  const validOrders = filteredOrders.filter((order) => order.status !== 'cancelled');
  const periodRevenue = validOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const periodAverageOrderValue = validOrders.length > 0 ? periodRevenue / validOrders.length : 0;
  const newCustomers = customers.filter((customer) =>
    isDateInRange(customer.createdAt, periodRange.start, periodRange.end)
  ).length;
  const lowStockProducts = products.filter((product) => product.stock > 0 && product.stock <= 10).length;
  const outOfStockProducts = products.filter(
    (product) => product.stock <= 0 || product.status === 'out-of-stock'
  ).length;
  const activeProducts = products.filter((product) => product.status === 'active').length;
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  const pendingOrdersInPeriod = filteredOrders.filter((order) => order.status === 'pending').length;
  const shippingOrdersInPeriod = filteredOrders.filter(
    (order) => order.status === 'shipping' || order.status === 'confirmed'
  ).length;
  const completedOrders = filteredOrders.filter((order) => order.status === 'completed').length;
  const cancelledOrders = filteredOrders.filter((order) => order.status === 'cancelled').length;
  const completionRate = filteredOrders.length > 0 ? Math.round((completedOrders / filteredOrders.length) * 100) : 0;
  const totalUnitsSold = products.reduce((sum, product) => sum + (product.soldCount || 0), 0);
  const averageReviewRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const chartOrders = orders.filter((order) => isDateInRange(order.createdAt, chartRange.start, chartRange.end));
  const chartValidOrders = chartOrders.filter((order) => order.status !== 'cancelled');
  const chartRevenue = chartValidOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const chartAverageOrderValue = chartValidOrders.length > 0 ? chartRevenue / chartValidOrders.length : 0;

  const revenueSeries = buildRevenueSeries(orders, chartWindow);
  const hasRevenueSeries = revenueSeries.some((item) => item.revenue > 0 || item.orders > 0);

  const statusChartData = [
    { name: 'Chờ xác nhận', value: filteredOrders.filter((order) => order.status === 'pending').length },
    {
      name: 'Đang giao',
      value: filteredOrders.filter(
        (order) => order.status === 'confirmed' || order.status === 'shipping'
      ).length,
    },
    { name: 'Hoàn thành', value: completedOrders },
    { name: 'Đã hủy', value: cancelledOrders },
  ];
  const hasStatusData = statusChartData.some((item) => item.value > 0);

  const topProducts = [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 5);
  const recentOrders = orders.slice(0, 5);
  const latestPendingOrder = orders.find((order) => order.status === 'pending');
  const latestCancelledOrder = orders.find((order) => order.status === 'cancelled');
  const latestReview = reviews[0];
  const latestCustomer = [...customers]
    .filter((customer) => isValidDate(customer.createdAt))
    .sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())[0];
  const customersThisWeek = customers.filter((customer) =>
    isDateInRange(customer.createdAt, weekRange.start, weekRange.end)
  ).length;
  const lowestStockProduct = [...products]
    .filter((product) => product.stock > 0)
    .sort((a, b) => a.stock - b.stock)[0];

  const statCards = [
    {
      eyebrow: 'Revenue pulse',
      label: `Doanh thu ${selectedPeriod.shortLabel}`,
      value: formatCurrency(periodRevenue),
      iconClass: 'revenue',
      icon: 'fa-dollar-sign',
      change: `${validOrders.length} đơn hợp lệ`,
      changeType: periodRevenue > 0 ? 'positive' : 'neutral',
      changeIcon: 'fa-receipt',
    },
    {
      eyebrow: 'Order flow',
      label: `Đơn hàng ${selectedPeriod.shortLabel}`,
      value: String(filteredOrders.length),
      iconClass: 'orders',
      icon: 'fa-shopping-cart',
      change: `${pendingOrders} đơn chờ xử lý`,
      changeType: pendingOrders > 0 ? 'positive' : 'neutral',
      changeIcon: 'fa-clock',
    },
    {
      eyebrow: 'Customer growth',
      label: `Khách mới ${selectedPeriod.shortLabel}`,
      value: String(newCustomers),
      iconClass: 'shipping',
      icon: 'fa-users',
      change: `${customers.length} tài khoản`,
      changeType: newCustomers > 0 ? 'positive' : 'neutral',
      changeIcon: 'fa-user-plus',
    },
    {
      eyebrow: 'Inventory watch',
      label: 'Sản phẩm sắp hết hàng',
      value: String(lowStockProducts),
      iconClass: 'alert',
      icon: 'fa-exclamation-triangle',
      change: `${outOfStockProducts} sản phẩm đã hết hàng`,
      changeType: outOfStockProducts > 0 ? 'negative' : 'neutral',
      changeIcon: 'fa-box-open',
    },
  ];

  const heroHighlights = [
    {
      title: 'Doanh thu chốt trong kỳ',
      value: formatCurrency(periodRevenue),
      meta: `${validOrders.length} đơn hợp lệ, trung bình ${formatCurrency(periodAverageOrderValue)}/đơn`,
      icon: 'fa-chart-line',
      tone: 'indigo',
    },
    {
      title: 'Khách hàng mới',
      value: `${newCustomers}`,
      meta: `${customersThisWeek} khách mới trong 7 ngày gần nhất`,
      icon: 'fa-user-plus',
      tone: 'emerald',
    },
    {
      title: 'Sức khỏe tồn kho',
      value: `${lowStockProducts + outOfStockProducts} SKU`,
      meta:
        outOfStockProducts > 0
          ? `${outOfStockProducts} sản phẩm đã hết hàng, cần bổ sung sớm`
          : 'Tồn kho đang ổn, chỉ còn vài SKU cần theo dõi',
      icon: 'fa-warehouse',
      tone: 'amber',
    },
  ];

  const heroMiniMetrics = [
    {
      label: 'AOV',
      value: formatCurrency(periodAverageOrderValue),
      icon: 'fa-receipt',
      tone: 'indigo',
    },
    {
      label: 'SP đang bán',
      value: String(activeProducts),
      icon: 'fa-box',
      tone: 'sky',
    },
    {
      label: 'Điểm đánh giá',
      value: reviews.length > 0 ? `${averageReviewRating.toFixed(1)}/5` : 'Chưa có',
      icon: 'fa-star',
      tone: 'amber',
    },
    {
      label: 'Hoàn thành',
      value: `${completionRate}%`,
      icon: 'fa-check-circle',
      tone: 'emerald',
    },
  ];

  const operationSpotlight =
    pendingOrders > 0
      ? {
          icon: 'fa-clock',
          tone: 'warning',
          title: `${pendingOrders} đơn đang chờ xác nhận`,
          description: latestPendingOrder
            ? `Đơn gần nhất là #${latestPendingOrder.id}, hãy ưu tiên xử lý để giữ trải nghiệm mua hàng mượt hơn.`
            : 'Có đơn hàng đang đợi đội ngũ xử lý.',
          ctaLabel: 'Mở danh sách đơn chờ',
          to: '/admin/orders?status=pending',
        }
      : outOfStockProducts > 0
        ? {
            icon: 'fa-box-open',
            tone: 'danger',
            title: `${outOfStockProducts} sản phẩm đã hết hàng`,
            description: 'Kiểm tra lại tồn kho và lịch nhập hàng để tránh hụt đơn trong khung giờ cao điểm.',
            ctaLabel: 'Xem cảnh báo tồn kho',
            to: '/admin/inventory/alerts',
          }
        : {
            icon: 'fa-check-circle',
            tone: 'success',
            title: 'Vận hành đang ở trạng thái tốt',
            description: 'Không có cảnh báo lớn cần ưu tiên ngay. Đây là thời điểm phù hợp để tối ưu trưng bày và chiến dịch.',
            ctaLabel: 'Mở trang sản phẩm',
            to: '/admin/products',
          };

  const notifications = [
    adminSettings.notifyNewOrder && pendingOrders > 0
      ? {
          id: 'pending-orders',
          iconClass: 'order',
          icon: 'fa-shopping-cart',
          text: `Có ${pendingOrders} đơn hàng đang chờ xác nhận`,
          meta: latestPendingOrder ? `Mới nhất: #${latestPendingOrder.id}` : 'Cần xử lý sớm',
          time: latestPendingOrder ? formatRelativeTime(latestPendingOrder.createdAt) : 'Mới cập nhật',
          to: '/admin/orders?status=pending',
        }
      : null,
    adminSettings.notifyCancelOrder && cancelledOrders > 0
      ? {
          id: 'cancelled-orders',
          iconClass: 'order',
          icon: 'fa-ban',
          text: `${cancelledOrders} đơn hàng đã bị hủy trong kỳ đã chọn`,
          meta: latestCancelledOrder ? `Gần nhất: #${latestCancelledOrder.id}` : 'Cần kiểm tra lý do hủy',
          time: latestCancelledOrder ? formatRelativeTime(latestCancelledOrder.createdAt) : 'Mới cập nhật',
          to: '/admin/orders?status=cancelled',
        }
      : null,
    (adminSettings.notifyLowStock && lowStockProducts > 0) ||
    (adminSettings.notifyOutOfStock && outOfStockProducts > 0)
      ? {
          id: 'inventory-alert',
          iconClass: 'stock',
          icon: 'fa-exclamation-triangle',
          text: `${lowStockProducts} sản phẩm sắp hết hàng, ${outOfStockProducts} sản phẩm đã hết`,
          meta: lowestStockProduct
            ? `${lowestStockProduct.name} chỉ còn ${lowestStockProduct.stock} sản phẩm`
            : 'Kiểm tra tồn kho để nhập hàng',
          time: 'Cần kiểm tra ngay',
          to: '/admin/inventory/alerts',
        }
      : null,
    adminSettings.notifyNewReview && latestReview
      ? {
          id: 'latest-review',
          iconClass: 'review',
          icon: 'fa-star',
          text: `Đánh giá mới từ ${latestReview.customerName}`,
          meta: `${latestReview.productName} • ${latestReview.rating}/5 sao`,
          time: formatRelativeTime(latestReview.createdAt),
          to: '/admin/reviews',
        }
      : null,
    adminSettings.notifyNewCustomer && customersThisWeek > 0
      ? {
          id: 'new-customers',
          iconClass: 'customer',
          icon: 'fa-user-plus',
          text: `${customersThisWeek} khách hàng mới trong 7 ngày qua`,
          meta: latestCustomer ? `Gần nhất: ${latestCustomer.name}` : 'Danh sách khách mới đã cập nhật',
          time: latestCustomer ? formatRelativeTime(latestCustomer.createdAt) : 'Tuần này',
          to: '/admin/customers',
        }
      : null,
  ].filter(Boolean) as Array<{
    id: string;
    iconClass: string;
    icon: string;
    text: string;
    meta: string;
    time: string;
    to: string;
  }>;

  return (
    <div className="dashboard-admin-page">
      <div className="page-header dashboard-page-header">
        <div className="dashboard-page-copy">
          <span className="dashboard-page-eyebrow">Admin command center</span>
          <h1>Dashboard</h1>
          <p>
            Theo dõi doanh thu, đơn hàng, khách hàng và vận hành trong <strong>{selectedPeriod.label}</strong> theo
            một bố cục rõ nhịp hơn để ra quyết định nhanh.
          </p>
        </div>

        <div className="page-actions dashboard-page-actions">
          <label className="dashboard-filter-shell">
            <AdminIcon name="fa-calendar-alt" />
            <select
              className="date-filter"
              value={period}
              onChange={(event) => setPeriod(event.target.value as DashboardPeriod)}
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Link to="/admin/orders" className="dashboard-action-button subtle">
            <AdminIcon name="fa-shopping-cart" />
            <span>Xem đơn hàng</span>
          </Link>

          <Link to="/admin/products" className="dashboard-action-button primary">
            <AdminIcon name="fa-box" />
            <span>Quản lý sản phẩm</span>
          </Link>
        </div>
      </div>

      <section className="dashboard-hero">
        <div className="dashboard-hero-main">
          <span className="dashboard-hero-badge">
            <AdminIcon name="fa-bolt" />
            Performance snapshot
          </span>

          <h2>
            {periodRevenue > 0
              ? `Cửa hàng đang chốt ${formatShortCurrency(periodRevenue)} trong ${selectedPeriod.shortLabel}.`
              : `Chưa có doanh thu nổi bật trong ${selectedPeriod.shortLabel}.`}
          </h2>

          <p>
            {pendingOrders > 0
              ? `Hiện có ${pendingOrders} đơn đang chờ xử lý. Ưu tiên xác nhận đơn và theo dõi các SKU sắp hết để giữ nhịp bán hàng ổn định.`
              : `Vận hành đang khá êm. Đây là lúc phù hợp để tối ưu banner, sản phẩm nổi bật và chuẩn bị chiến dịch tiếp theo.`}
          </p>

          <div className="dashboard-hero-highlight-grid">
            {heroHighlights.map((item) => (
              <div key={item.title} className={`dashboard-hero-highlight tone-${item.tone}`}>
                <div className="dashboard-hero-highlight-icon">
                  <AdminIcon name={item.icon} />
                </div>
                <div className="dashboard-hero-highlight-copy">
                  <span>{item.title}</span>
                  <strong>{item.value}</strong>
                  <p>{item.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-hero-side">
          <div className={`dashboard-spotlight-card tone-${operationSpotlight.tone}`}>
            <div className="dashboard-card-kicker">Cần chú ý</div>
            <div className="dashboard-spotlight-icon">
              <AdminIcon name={operationSpotlight.icon} />
            </div>
            <h3>{operationSpotlight.title}</h3>
            <p>{operationSpotlight.description}</p>
            <Link to={operationSpotlight.to} className="dashboard-inline-link">
              <span>{operationSpotlight.ctaLabel}</span>
              <AdminIcon name="fa-arrow-right" />
            </Link>
          </div>

          <div className="dashboard-mini-grid">
            {heroMiniMetrics.map((metric) => (
              <div key={metric.label} className={`dashboard-mini-card tone-${metric.tone}`}>
                <div className="dashboard-mini-icon">
                  <AdminIcon name={metric.icon} />
                </div>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="dashboard-section-heading">
        <div>
          <span>KPI chính</span>
          <h2>Toàn cảnh kinh doanh</h2>
        </div>
        <p>Những chỉ số cần nhìn đầu tiên để biết cửa hàng đang tăng tốc ở đâu và đang nghẽn ở đâu.</p>
      </div>

      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className={`stat-icon ${card.iconClass}`}>
              <AdminIcon name={card.icon} />
            </div>
            <div className="stat-content">
              <span className="stat-eyebrow">{card.eyebrow}</span>
              <span className="stat-label">{card.label}</span>
              <h3 className="stat-value">{card.value}</h3>
              <span className={`stat-change ${card.changeType}`}>
                <AdminIcon name={card.changeIcon} /> {card.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-section-heading">
        <div>
          <span>Biểu đồ</span>
          <h2>Nhịp doanh thu và trạng thái đơn hàng</h2>
        </div>
        <p>Dùng biểu đồ để đọc xu hướng nhanh thay vì chỉ nhìn từng con số rời rạc.</p>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="card-header">
            <div>
              <div className="dashboard-card-kicker">Revenue trend</div>
              <h3>Doanh thu theo thời gian</h3>
              <p className="dashboard-card-description">
                Theo dõi dòng tiền trong {selectedChartWindow.label} gần nhất để nhận ra ngày bán tốt nhất.
              </p>
            </div>

            <label className="dashboard-filter-shell compact">
              <AdminIcon name="fa-chart-line" />
              <select
                className="chart-filter"
                value={chartWindow}
                onChange={(event) => setChartWindow(event.target.value as RevenueWindow)}
              >
                {CHART_WINDOWS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="chart-container">
            {hasRevenueSeries ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueSeries}>
                  <defs>
                    <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.36} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.18)" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={formatShortCurrency}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    width={72}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Doanh thu']}
                    labelFormatter={(label) => `Ngày ${label}`}
                    contentStyle={DASHBOARD_TOOLTIP_STYLE}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#dashboardRevenue)"
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty-state">
                <AdminIcon name="fa-chart-line" />
                <p>Chưa có doanh thu trong khoảng thời gian đã chọn.</p>
              </div>
            )}
          </div>

          <div className="chart-summary">
            <div className="summary-pill">
              <span>Doanh thu</span>
              <strong>{formatCurrency(chartRevenue)}</strong>
            </div>
            <div className="summary-pill">
              <span>Đơn hợp lệ</span>
              <strong>{chartValidOrders.length}</strong>
            </div>
            <div className="summary-pill">
              <span>TB / đơn</span>
              <strong>{formatCurrency(chartAverageOrderValue)}</strong>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="card-header">
            <div>
              <div className="dashboard-card-kicker">Order status</div>
              <h3>Đơn hàng theo trạng thái</h3>
              <p className="dashboard-card-description">Kiểm tra ngay xem đội vận hành đang dồn lực ở bước nào.</p>
            </div>
          </div>

          <div className="chart-container">
            {hasStatusData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ value }) => (value > 0 ? `${value}` : '')}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={entry.name} fill={STATUS_CHART_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, data) => [
                      Number(value ?? 0),
                      typeof data?.payload?.name === 'string' ? data.payload.name : 'Đơn hàng',
                    ]}
                    contentStyle={DASHBOARD_TOOLTIP_STYLE}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={renderDashboardLegendLabel}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty-state">
                <AdminIcon name="fa-box-open" />
                <p>Chưa có đơn hàng trong kỳ để hiển thị trạng thái.</p>
              </div>
            )}
          </div>

          <div className="chart-summary">
            <div className="summary-pill">
              <span>Chờ xác nhận</span>
              <strong>{pendingOrdersInPeriod}</strong>
            </div>
            <div className="summary-pill">
              <span>Đang giao</span>
              <strong>{shippingOrdersInPeriod}</strong>
            </div>
            <div className="summary-pill">
              <span>Hoàn thành</span>
              <strong>{completedOrders}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section-heading">
        <div>
          <span>Vận hành</span>
          <h2>Danh sách cần theo dõi</h2>
        </div>
        <p>Ghép sản phẩm, đơn hàng và cảnh báo vào cùng một nhịp để thao tác nhanh hơn trong ngày.</p>
      </div>

      <div className="bottom-row">
        <div className="data-card">
          <div className="card-header">
            <div>
              <div className="dashboard-card-kicker">Best sellers</div>
              <h3>Sản phẩm bán chạy</h3>
              <p className="dashboard-card-description">Những SKU đang mang về doanh thu và sức kéo tốt nhất.</p>
            </div>
            <Link to="/admin/products">Xem tất cả</Link>
          </div>
          <div className="product-list">
            {topProducts.map((product) => (
              <div key={product.id} className="product-item">
                <img src={product.image} alt={product.name} className="product-image" />
                <div className="product-info">
                  <div className="product-name">{product.name}</div>
                  <div className="product-meta-row">
                    <span className="product-sales">
                      <AdminIcon name="fa-fire" /> Đã bán {product.soldCount}
                    </span>
                    <span className={`product-stock ${product.stock <= 10 ? 'is-low' : ''}`}>
                      <AdminIcon name="fa-box" /> Tồn {product.stock}
                    </span>
                  </div>
                </div>
                <div className="product-revenue">{formatCurrency(product.price)}</div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="dashboard-empty-text">Chưa có dữ liệu sản phẩm.</p>}
          </div>
        </div>

        <div className="data-card">
          <div className="card-header">
            <div>
              <div className="dashboard-card-kicker">Latest orders</div>
              <h3>Đơn hàng gần đây</h3>
              <p className="dashboard-card-description">Theo dõi các đơn mới nhất để xử lý nhanh các điểm nghẽn.</p>
            </div>
            <Link to="/admin/orders">Xem tất cả</Link>
          </div>
          <div className="order-list">
            {recentOrders.map((order) => (
              <div key={order.id} className="order-item">
                <div className="order-header">
                  <span className="order-id">#{order.id}</span>
                  <span className={`order-status ${order.status}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                </div>
                <div className="order-details">
                  <span>
                    {order.customer.name} • {order.items.length} sản phẩm
                  </span>
                  <span className="order-total">{formatCurrency(order.total)}</span>
                </div>
                <div className="order-meta-row">
                  <span>
                    <AdminIcon name="fa-calendar-alt" /> {formatDate(order.createdAt)}
                  </span>
                  <span>
                    <AdminIcon name="fa-truck" /> {order.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <p className="dashboard-empty-text">Chưa có đơn hàng nào.</p>}
          </div>
        </div>

        <div className="data-card">
          <div className="card-header">
            <div>
              <div className="dashboard-card-kicker">Operations feed</div>
              <h3>Thông báo vận hành</h3>
              <p className="dashboard-card-description">Các tín hiệu cần phản ứng nhanh từ đơn hàng, đánh giá và tồn kho.</p>
            </div>
          </div>
          <div className="notification-list">
            {notifications.map((notification) => (
              <Link key={notification.id} to={notification.to} className="notification-link">
                <div className="notification-item">
                  <div className={`notification-icon ${notification.iconClass}`}>
                    <AdminIcon name={notification.icon} />
                  </div>
                  <div className="notification-content">
                    <div className="notification-text">{notification.text}</div>
                    <div className="notification-meta">{notification.meta}</div>
                    <div className="notification-time">{notification.time}</div>
                  </div>
                </div>
              </Link>
            ))}
            {notifications.length === 0 && (
              <div className="chart-empty-state notification-empty-state">
                <AdminIcon name="fa-check-circle" />
                <p>Hiện chưa có cảnh báo vận hành nào cần xử lý.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-footer-strip">
        <div className="dashboard-footer-metric">
          <span>Sản phẩm đã bán</span>
          <strong>{totalUnitsSold}</strong>
        </div>
        <div className="dashboard-footer-metric">
          <span>Khách hàng toàn hệ thống</span>
          <strong>{customers.length}</strong>
        </div>
        <div className="dashboard-footer-metric">
          <span>Review gần nhất</span>
          <strong>{latestReview ? latestReview.customerName : 'Chưa có'}</strong>
        </div>
      </div>
    </div>
  );
}
