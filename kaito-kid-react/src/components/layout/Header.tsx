// Header - giống y hệt index.html gốc với Top Bar + Mega Menu đầy đủ

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && searchQuery.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
      navigate('/');
    }
    setShowDropdown(false);
  };

  return (
    <header className="main-header">
      <div className="header-container">
          {/* Logo */}
          <div className="logo">
            <Link to="/">
              <img src="/images/logokaitokid.png" alt="KAITO KID" />
            </Link>
          </div>

          {/* Search Bar */}
          <form className="search-bar" onSubmit={handleSearch}>
            <input 
              type="text" 
              id="searchInput"
              placeholder="Tìm áo sơ mi, quần jeans, váy..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              autoComplete="off" 
            />
            <button type="submit"><i className="fa fa-search"></i></button>
            <div className="search-suggestions" id="searchSuggestions"></div>
          </form>

          {/* Header Icons */}
          <div className="header-actions">
            <div className="account-dropdown-wrapper">
              <a 
                href="#" 
                className="icon-link" 
                id="accountIcon"
                onClick={e => { e.preventDefault(); setShowDropdown(!showDropdown); }}
              >
                <i className="fa fa-user"></i>
              </a>
              <div 
                className="account-dropdown" 
                id="accountDropdown"
                style={{ display: showDropdown ? 'block' : 'none' }}
              >
                <div className="account-dropdown-content">
                  {/* Not logged in */}
                  {!user && (
                    <div className="account-guest" id="accountGuest">
                      <h4>Chào mừng bạn!</h4>
                      <p>Đăng nhập để trải nghiệm mua sắm tốt nhất</p>
                      <div className="account-actions">
                        <Link to="/login" className="btn-account-primary" onClick={() => setShowDropdown(false)}>Đăng nhập</Link>
                        <Link to="/login" className="btn-account-secondary" onClick={() => setShowDropdown(false)}>Đăng ký</Link>
                      </div>
                    </div>
                  )}
                  
                  {/* Logged in */}
                  {user && (
                    <div className="account-user" id="accountUser">
                      <div className="account-user-info">
                        <div className="account-avatar">
                          <i className="fa fa-user-circle"></i>
                        </div>
                        <div className="account-details">
                          <h4 id="userName">{user.name}</h4>
                          <p id="userEmail">{user.email}</p>
                        </div>
                      </div>
                      <div className="account-menu">
                        <Link to="/account" className="account-menu-item" onClick={() => setShowDropdown(false)}>
                          <i className="fa fa-user"></i>
                          <span>Thông tin tài khoản</span>
                        </Link>
                        <Link to="/orders" className="account-menu-item" onClick={() => setShowDropdown(false)}>
                          <i className="fa fa-box"></i>
                          <span>Đơn hàng của tôi</span>
                        </Link>
                        <Link to="/wishlist" className="account-menu-item" onClick={() => setShowDropdown(false)}>
                          <i className="fa fa-heart"></i>
                          <span>Sản phẩm yêu thích</span>
                        </Link>
                        <Link to="/address" className="account-menu-item" onClick={() => setShowDropdown(false)}>
                          <i className="fa fa-location-dot"></i>
                          <span>Địa chỉ giao hàng</span>
                        </Link>
                        {/* Admin button (only for admin) */}
                        {isAdmin && (
                          <Link 
                            to="/admin/dashboard" 
                            className="account-menu-item admin-item" 
                            id="adminMenuItem"
                            onClick={() => setShowDropdown(false)}
                          >
                            <i className="fa fa-shield-alt"></i>
                            <span>Trang quản trị</span>
                          </Link>
                        )}
                        <div className="account-divider"></div>
                        <a 
                          href="#" 
                          className="account-menu-item logout-item" 
                          id="logoutBtn"
                          onClick={e => { e.preventDefault(); handleLogout(); }}
                        >
                          <i className="fa fa-sign-out-alt"></i>
                          <span>Đăng xuất</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Link to="/wishlist" className="icon-link">
              <i className="fa fa-heart"></i>
              <span id="wishlist-count" className="cart-badge">0</span>
            </Link>
            <Link to="/cart" className="icon-link cart-link">
              <i className="fa fa-shopping-bag"></i>
              <span id="cart-count" className="cart-badge">{totalItems}</span>
            </Link>
            <button className="mobile-menu-btn" id="mobile-toggle">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>

        {/* Mega Menu */}
        <nav className="mega-menu">
          <ul className="menu-list" id="mainMenuList">
            {/* NỮ */}
            <li className="has-mega-dropdown">
              <Link to="/products?gender=Nữ">NỮ</Link>
              <div className="mega-dropdown">
                <div className="mega-dropdown-content">
                  <div className="mega-columns">
                    <div className="mega-column">
                      <h4>ÁO</h4>
                      <ul>
                        <li><Link to="/products?gender=Nữ&category=Áo thun">Áo thun</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Áo sơ mi">Áo sơ mi</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Áo kiểu">Áo kiểu</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Áo len">Áo len</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Áo polo">Áo polo</Link></li>
                      </ul>
                    </div>
                    <div className="mega-column">
                      <h4>QUẦN</h4>
                      <ul>
                        <li><Link to="/products?gender=Nữ&category=Quần jeans">Quần jeans</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Quần tây">Quần tây</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Quần short">Quần short</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Quần kaki">Quần kaki</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Quần legging">Quần legging</Link></li>
                      </ul>
                    </div>
                    <div className="mega-column">
                      <h4>VÁY & ĐẦM</h4>
                      <ul>
                        <li><Link to="/products?gender=Nữ&category=Váy midi">Váy midi</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Váy maxi">Váy maxi</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Đầm công sở">Đầm công sở</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Đầm dự tiệc">Đầm dự tiệc</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Đầm suông">Đầm suông</Link></li>
                      </ul>
                    </div>
                    <div className="mega-column">
                      <h4>OUTERWEAR</h4>
                      <ul>
                        <li><Link to="/products?gender=Nữ&category=Áo khoác blazer">Áo khoác blazer</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Áo khoác dạ">Áo khoác dạ</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Áo khoác jean">Áo khoác jean</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Áo khoác bomber">Áo khoác bomber</Link></li>
                        <li><Link to="/products?gender=Nữ&category=Áo cardigan">Áo cardigan</Link></li>
                      </ul>
                    </div>
                    <div className="mega-column">
                      <h4>PHONG CÁCH</h4>
                      <ul>
                        <li><Link to="/products?gender=Nữ&style=Đồ công sở">Đồ công sở</Link></li>
                        <li><Link to="/products?gender=Nữ&style=Đồ basic">Đồ basic</Link></li>
                        <li><Link to="/products?gender=Nữ&style=Đồ dự tiệc">Đồ dự tiệc</Link></li>
                        <li><Link to="/products?gender=Nữ&style=Đồ thể thao">Đồ thể thao</Link></li>
                        <li><Link to="/products?gender=Nữ&style=Đồ mặc nhà">Đồ mặc nhà</Link></li>
                      </ul>
                    </div>
                  </div>
                  <div className="mega-featured">
                    <div className="mega-featured-item">
                      <img src="/london.png" alt="New Collection" />
                      <div className="mega-featured-text">
                        <h5>Bộ sưu tập mới</h5>
                        <Link to="/collections">Xem tất cả →</Link>
                      </div>
                    </div>
                    <div className="mega-featured-item">
                      <img src="/Nhat.png" alt="Best Sellers" />
                      <div className="mega-featured-text">
                        <h5>Bán chạy nhất</h5>
                        <Link to="/products?gender=Nữ">Xem tất cả →</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            {/* NAM */}
            <li className="has-mega-dropdown">
              <Link to="/products?gender=Nam">NAM</Link>
              <div className="mega-dropdown">
                <div className="mega-dropdown-content">
                  <div className="mega-columns">
                    <div className="mega-column">
                      <h4>Áo</h4>
                      <ul>
                        <li><Link to="/products?gender=Nam&category=Áo thun">Áo thun</Link></li>
                        <li><Link to="/products?gender=Nam&category=Áo sơ mi">Áo sơ mi</Link></li>
                        <li><Link to="/products?gender=Nam&category=Áo polo">Áo polo</Link></li>
                        <li><Link to="/products?gender=Nam&category=Áo len">Áo len</Link></li>
                        <li><Link to="/products?gender=Nam&category=Áo hoodie">Áo hoodie</Link></li>
                      </ul>
                    </div>
                    <div className="mega-column">
                      <h4>Quần</h4>
                      <ul>
                        <li><Link to="/products?gender=Nam&category=Quần jeans">Quần jeans</Link></li>
                        <li><Link to="/products?gender=Nam&category=Quần tây">Quần tây</Link></li>
                        <li><Link to="/products?gender=Nam&category=Quần short">Quần short</Link></li>
                        <li><Link to="/products?gender=Nam&category=Quần kaki">Quần kaki</Link></li>
                        <li><Link to="/products?gender=Nam&category=Quần jogger">Quần jogger</Link></li>
                      </ul>
                    </div>
                    <div className="mega-column">
                      <h4>Outerwear</h4>
                      <ul>
                        <li><Link to="/products?gender=Nam&category=Áo khoác blazer">Áo khoác blazer</Link></li>
                        <li><Link to="/products?gender=Nam&category=Áo khoác dạ">Áo khoác dạ</Link></li>
                        <li><Link to="/products?gender=Nam&category=Áo khoác jean">Áo khoác jean</Link></li>
                        <li><Link to="/products?gender=Nam&category=Áo khoác bomber">Áo khoác bomber</Link></li>
                        <li><Link to="/products?gender=Nam&category=Áo khoác gió">Áo khoác gió</Link></li>
                      </ul>
                    </div>
                    <div className="mega-column">
                      <h4>Phụ kiện</h4>
                      <ul>
                        <li><Link to="/products?gender=Nam&category=Cà vạt">Cà vạt</Link></li>
                        <li><Link to="/products?gender=Nam&category=Thắt lưng">Thắt lưng</Link></li>
                        <li><Link to="/products?gender=Nam&category=Ví">Ví</Link></li>
                        <li><Link to="/products?gender=Nam&category=Túi xách">Túi xách</Link></li>
                        <li><Link to="/products?gender=Nam&category=Mũ nón">Mũ nón</Link></li>
                      </ul>
                    </div>
                    <div className="mega-column">
                      <h4>Phong cách</h4>
                      <ul>
                        <li><Link to="/products?gender=Nam&style=Đồ công sở">Đồ công sở</Link></li>
                        <li><Link to="/products?gender=Nam&style=Đồ basic">Đồ basic</Link></li>
                        <li><Link to="/products?gender=Nam&style=Đồ thể thao">Đồ thể thao</Link></li>
                        <li><Link to="/products?gender=Nam&style=Đồ streetwear">Đồ streetwear</Link></li>
                        <li><Link to="/products?gender=Nam&style=Đồ mặc nhà">Đồ mặc nhà</Link></li>
                      </ul>
                    </div>
                  </div>
                  <div className="mega-featured">
                    <div className="mega-featured-item">
                      <img src="/images/d53c7593-3c1b-437a-98bc-f71b44050b40.png" alt="Men Collection" />
                      <div className="mega-featured-text">
                        <h5>Thời trang nam</h5>
                        <Link to="/products?gender=Nam">Xem tất cả →</Link>
                      </div>
                    </div>
                    <div className="mega-featured-item">
                      <img src="/ChatGPT Image 22_35_00 22 thg 4, 2025.png" alt="Sale" />
                      <div className="mega-featured-text">
                        <h5>Giảm giá đặc biệt</h5>
                        <Link to="/products?filter=sale">Xem tất cả →</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            {/* TRẺ EM */}
            <li className="has-mega-dropdown">
              <Link to="/products?gender=Trẻ em">TRẺ EM</Link>
              <div className="mega-dropdown">
                <div className="mega-dropdown-content">
                  <div className="mega-columns">
                    <div className="mega-column">
                      <h4>Bé gái</h4>
                      <ul>
                        <li><Link to="/products?gender=Trẻ em&category=Áo bé gái">Áo bé gái</Link></li>
                        <li><Link to="/products?gender=Trẻ em&category=Quần bé gái">Quần bé gái</Link></li>
                        <li><Link to="/products?gender=Trẻ em&category=Váy đầm">Váy đầm</Link></li>
                        <li><Link to="/products?gender=Trẻ em&category=Đồ bộ">Đồ bộ</Link></li>
                        <li><Link to="/products?gender=Trẻ em&category=Áo khoác">Áo khoác</Link></li>
                      </ul>
                    </div>
                    <div className="mega-column">
                      <h4>Bé trai</h4>
                      <ul>
                        <li><Link to="/products?gender=Trẻ em&category=Áo bé trai">Áo bé trai</Link></li>
                        <li><Link to="/products?gender=Trẻ em&category=Quần bé trai">Quần bé trai</Link></li>
                        <li><Link to="/products?gender=Trẻ em&category=Đồ bộ">Đồ bộ</Link></li>
                        <li><Link to="/products?gender=Trẻ em&category=Áo khoác">Áo khoác</Link></li>
                        <li><Link to="/products?gender=Trẻ em&category=Đồ thể thao">Đồ thể thao</Link></li>
                      </ul>
                    </div>
                    <div className="mega-column">
                      <h4>Theo độ tuổi</h4>
                      <ul>
                        <li><Link to="/products?gender=Trẻ em&age=0-2">0-2 tuổi</Link></li>
                        <li><Link to="/products?gender=Trẻ em&age=3-5">3-5 tuổi</Link></li>
                        <li><Link to="/products?gender=Trẻ em&age=6-8">6-8 tuổi</Link></li>
                        <li><Link to="/products?gender=Trẻ em&age=9-12">9-12 tuổi</Link></li>
                        <li><Link to="/products?gender=Trẻ em&age=13-16">13-16 tuổi</Link></li>
                      </ul>
                    </div>
                  </div>
                  <div className="mega-featured">
                    <div className="mega-featured-item">
                      <img src="/london.png" alt="Kids Collection" />
                      <div className="mega-featured-text">
                        <h5>Bộ sưu tập trẻ em</h5>
                        <Link to="/products?gender=Trẻ em">Xem tất cả →</Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li><Link to="/products?filter=new">NEW IN</Link></li>
            <li><Link to="/products?filter=sale">SALE</Link></li>
            <li><Link to="/collections">BỘ SƯU TẬP</Link></li>
            <li><Link to="/lookbook">LOOKBOOK</Link></li>
          </ul>
        </nav>
      </header>
    );
}
