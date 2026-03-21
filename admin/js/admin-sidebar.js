// Admin Sidebar Component - Shared across all pages

function renderSidebar(activePage = '') {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-header">
      <div class="sidebar-logo">
        <img src="/images/logokaitokid.png" alt="KAITO KID">
        <span class="sidebar-title">KAITO KID</span>
      </div>
      <button class="sidebar-toggle" id="sidebarToggle">
        <i class="fa fa-bars"></i>
      </button>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
          <a href="dashboard.html" class="nav-link">
            <i class="fa fa-chart-line"></i>
            <span>Dashboard</span>
          </a>
        </li>
        
        <li class="nav-item has-submenu ${activePage.includes('order') ? 'open' : ''}">
          <a href="#" class="nav-link">
            <i class="fa fa-shopping-cart"></i>
            <span>Đơn hàng</span>
            <i class="fa fa-chevron-down submenu-arrow"></i>
          </a>
          <ul class="submenu">
            <li><a href="orders.html" ${activePage === 'orders' ? 'class="active"' : ''}>Tất cả đơn hàng</a></li>
            <li><a href="orders.html?status=pending">Chờ xác nhận</a></li>
            <li><a href="orders.html?status=shipping">Đang giao</a></li>
            <li><a href="orders.html?status=completed">Hoàn thành</a></li>
            <li><a href="orders.html?status=cancelled">Đã huỷ</a></li>
          </ul>
        </li>

        <li class="nav-item has-submenu ${activePage.includes('product') || activePage.includes('categories') ? 'open' : ''}">
          <a href="#" class="nav-link">
            <i class="fa fa-box"></i>
            <span>Sản phẩm</span>
            <i class="fa fa-chevron-down submenu-arrow"></i>
          </a>
          <ul class="submenu">
            <li><a href="products.html" ${activePage === 'products' ? 'class="active"' : ''}>Danh sách sản phẩm</a></li>
            <li><a href="product-add.html">Thêm sản phẩm</a></li>
            <li><a href="categories.html" ${activePage === 'categories' ? 'class="active"' : ''}>Danh mục</a></li>
            <li><a href="collections.html">Bộ sưu tập</a></li>
            <li><a href="attributes.html">Thuộc tính</a></li>
          </ul>
        </li>

        <li class="nav-item has-submenu">
          <a href="#" class="nav-link">
            <i class="fa fa-warehouse"></i>
            <span>Kho hàng</span>
            <i class="fa fa-chevron-down submenu-arrow"></i>
          </a>
          <ul class="submenu">
            <li><a href="inventory.html">Tồn kho</a></li>
            <li><a href="inventory-history.html">Lịch sử nhập/xuất</a></li>
            <li><a href="inventory-alerts.html">Cảnh báo hết hàng</a></li>
          </ul>
        </li>

        <li class="nav-item ${activePage === 'customers' ? 'active' : ''}">
          <a href="customers.html" class="nav-link">
            <i class="fa fa-users"></i>
            <span>Khách hàng</span>
          </a>
        </li>

        <li class="nav-item has-submenu">
          <a href="#" class="nav-link">
            <i class="fa fa-tags"></i>
            <span>Khuyến mãi</span>
            <i class="fa fa-chevron-down submenu-arrow"></i>
          </a>
          <ul class="submenu">
            <li><a href="coupons.html">Mã giảm giá</a></li>
            <li><a href="promotions.html">Chương trình KM</a></li>
            <li><a href="flash-sales.html">Flash Sale</a></li>
          </ul>
        </li>

        <li class="nav-item has-submenu ${activePage === 'homepage' || activePage === 'lookbook' ? 'open' : ''}">
          <a href="#" class="nav-link">
            <i class="fa fa-palette"></i>
            <span>Giao diện</span>
            <i class="fa fa-chevron-down submenu-arrow"></i>
          </a>
          <ul class="submenu">
            <li><a href="homepage.html" ${activePage === 'homepage' ? 'class="active"' : ''}>Trang chủ</a></li>
            <li><a href="lookbook.html" ${activePage === 'lookbook' ? 'class="active"' : ''}>Lookbook</a></li>
            <li><a href="banners.html">Banner & Slider</a></li>
            <li><a href="pages.html">Trang nội dung</a></li>
            <li><a href="menus.html">Menu & Footer</a></li>
          </ul>
        </li>

        <li class="nav-item ${activePage === 'reviews' ? 'active' : ''}">
          <a href="reviews.html" class="nav-link">
            <i class="fa fa-star"></i>
            <span>Đánh giá</span>
          </a>
        </li>

        <li class="nav-item ${activePage === 'reports' ? 'active' : ''}">
          <a href="reports.html" class="nav-link">
            <i class="fa fa-chart-bar"></i>
            <span>Báo cáo</span>
          </a>
        </li>

        <li class="nav-item ${activePage === 'settings' ? 'active' : ''}">
          <a href="settings.html" class="nav-link">
            <i class="fa fa-cog"></i>
            <span>Cài đặt</span>
          </a>
        </li>
      </ul>
    </nav>

    <div class="sidebar-footer">
      <div class="admin-info">
        <div class="admin-avatar">
          <i class="fa fa-user-shield"></i>
        </div>
        <div class="admin-details">
          <span class="admin-name" id="adminName">Admin</span>
          <span class="admin-role">Owner</span>
        </div>
      </div>
    </div>
  `;
}

function renderTopBar() {
  const topBar = document.getElementById('topBar');
  if (!topBar) return;

  topBar.innerHTML = `
    <div class="top-bar-left">
      <button class="mobile-menu-btn" id="mobileMenuBtn">
        <i class="fa fa-bars"></i>
      </button>
      <div class="search-box">
        <i class="fa fa-search"></i>
        <input type="text" placeholder="Tìm kiếm..." id="globalSearch">
      </div>
    </div>
    <div class="top-bar-right">
      <button class="notification-btn">
        <i class="fa fa-bell"></i>
        <span class="notification-badge">5</span>
      </button>
      <a href="../index.html" class="view-site-btn" target="_blank">
        <i class="fa fa-external-link-alt"></i>
        <span>Xem trang chủ</span>
      </a>
      <div class="admin-dropdown">
        <button class="admin-btn">
          <div class="admin-avatar-small">
            <i class="fa fa-user"></i>
          </div>
          <span id="topAdminName">Admin</span>
          <i class="fa fa-chevron-down"></i>
        </button>
        <div class="admin-dropdown-menu">
          <a href="profile.html"><i class="fa fa-user"></i> Hồ sơ</a>
          <a href="settings.html"><i class="fa fa-cog"></i> Cài đặt</a>
          <div class="dropdown-divider"></div>
          <a href="#" id="logoutBtn"><i class="fa fa-sign-out-alt"></i> Đăng xuất</a>
        </div>
      </div>
    </div>
  `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const pageName = document.body.getAttribute('data-page') || '';
  renderSidebar(pageName);
  renderTopBar();
});
