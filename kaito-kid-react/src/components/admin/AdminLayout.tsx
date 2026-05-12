// Admin Layout - match admin-layout.css glassmorphism design

import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface MenuItem {
  path?: string;
  icon: string;
  label: string;
  submenu?: { path: string; label: string }[];
}

const menuItems: MenuItem[] = [
  { path: '/admin/dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
  {
    icon: 'fa-shopping-cart',
    label: 'Đơn hàng',
    submenu: [
      { path: '/admin/orders', label: 'Tất cả đơn hàng' },
      { path: '/admin/orders?status=pending', label: 'Chờ xác nhận' },
      { path: '/admin/orders?status=shipping', label: 'Đang giao' },
      { path: '/admin/orders?status=completed', label: 'Hoàn thành' },
      { path: '/admin/orders?status=cancelled', label: 'Đã huỷ' },
    ],
  },
  {
    icon: 'fa-box',
    label: 'Sản phẩm',
    submenu: [
      { path: '/admin/products', label: 'Danh sách sản phẩm' },
      { path: '/admin/products/add', label: 'Thêm sản phẩm' },
      { path: '/admin/categories', label: 'Danh mục' },
      { path: '/admin/collections', label: 'Bộ sưu tập' },
      { path: '/admin/attributes', label: 'Thuộc tính' },
    ],
  },
  {
    icon: 'fa-warehouse',
    label: 'Kho hàng',
    submenu: [
      { path: '/admin/inventory', label: 'Tồn kho' },
      { path: '/admin/inventory/history', label: 'Lịch sử nhập/xuất' },
      { path: '/admin/inventory/alerts', label: 'Cảnh báo hết hàng' },
    ],
  },
  { path: '/admin/customers', icon: 'fa-users', label: 'Khách hàng' },
  {
    icon: 'fa-tags',
    label: 'Khuyến mãi',
    submenu: [
      { path: '/admin/coupons', label: 'Mã giảm giá' },
      { path: '/admin/promotions', label: 'Chương trình KM' },
      { path: '/admin/flash-sales', label: 'Flash Sale' },
    ],
  },
  {
    icon: 'fa-palette',
    label: 'Giao diện',
    submenu: [
      { path: '/admin/homepage', label: 'Trang chủ' },
      { path: '/admin/banners', label: 'Banner & Slider' },
      { path: '/admin/pages', label: 'Trang nội dung' },
      { path: '/admin/menus', label: 'Menu & Footer' },
    ],
  },
  { path: '/admin/reviews', icon: 'fa-star', label: 'Đánh giá' },
  { path: '/admin/reports', icon: 'fa-chart-bar', label: 'Báo cáo' },
  { path: '/admin/settings', icon: 'fa-cog', label: 'Cài đặt' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const handleLogout = () => {
    if (confirm('Đăng xuất?')) {
      logout();
      navigate('/login');
    }
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const isActive = (item: MenuItem) => {
    if (item.path) {
      return location.pathname === item.path;
    }
    if (item.submenu) {
      return item.submenu.some(sub => location.pathname === sub.path.split('?')[0]);
    }
    return false;
  };

  return (
    <div
      className={`admin-wrapper ${location.pathname.startsWith('/admin/dashboard') ? 'dashboard-frame' : ''} ${
        location.pathname.startsWith('/admin/products/add') ? 'product-builder-frame' : ''
      }`}
    >
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/images/logokaitokid.png" alt="KAITO KID" />
            <span className="sidebar-title">KAITO KID</span>
          </div>
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            <i className="fa fa-bars"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item, index) => (
              <li
                key={index}
                className={`nav-item ${item.submenu ? 'has-submenu' : ''} ${isActive(item) ? 'active' : ''} ${openSubmenu === item.label ? 'open' : ''}`}
              >
                {item.path ? (
                  <Link to={item.path} className="nav-link">
                    <i className={`fa ${item.icon}`}></i>
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <>
                    <a
                      href="#"
                      className="nav-link"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSubmenu(item.label);
                      }}
                    >
                      <i className={`fa ${item.icon}`}></i>
                      <span>{item.label}</span>
                      <i className="fa fa-chevron-down submenu-arrow"></i>
                    </a>
                    {item.submenu && (
                      <ul className="submenu">
                        {item.submenu.map((sub, subIndex) => (
                          <li key={subIndex}>
                            <Link to={sub.path}>{sub.label}</Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <div className="admin-avatar">
              <i className="fa fa-user-shield"></i>
            </div>
            <div className="admin-details">
              <span className="admin-name">{user?.name || 'Admin'}</span>
              <span className="admin-role">Owner</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button className="mobile-menu-btn" onClick={() => setCollapsed(!collapsed)}>
              <i className="fa fa-bars"></i>
            </button>
            <div className="search-box">
              <i className="fa fa-search"></i>
              <input type="text" placeholder="Tìm đơn hàng, sản phẩm, khách hàng..." />
            </div>
          </div>
          <div className="top-bar-right">
            <button className="notification-btn">
              <i className="fa fa-bell"></i>
              <span className="notification-badge">5</span>
            </button>
            <a href="/" className="view-site-btn" target="_blank">
              <i className="fa fa-external-link-alt"></i>
              <span>Xem trang chủ</span>
            </a>
            <div className="admin-dropdown">
              <button className="admin-btn">
                <div className="admin-avatar-small">
                  <i className="fa fa-user"></i>
                </div>
                <span>{user?.name || 'Admin'}</span>
                <i className="fa fa-chevron-down"></i>
              </button>
              <div className="admin-dropdown-menu">
                <Link to="/admin/settings"><i className="fa fa-cog"></i> Cài đặt</Link>
                <div className="dropdown-divider"></div>
                <a href="#" onClick={e => { e.preventDefault(); handleLogout(); }}>
                  <i className="fa fa-sign-out-alt"></i> Đăng xuất
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
