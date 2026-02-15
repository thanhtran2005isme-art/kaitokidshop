// App.tsx - Router chính
// Gom tất cả 20+ file HTML thành routes

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/admin/AdminLayout';
import { AdminUiProvider } from './components/admin/AdminUiProvider';
import ProtectedRoute from './components/ProtectedRoute';

// Customer Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Wishlist from './pages/Wishlist';
import Account from './pages/Account';
import Address from './pages/Address';
import Search from './pages/Search';
import Collections from './pages/Collections';
import Lookbook from './pages/Lookbook';
import BestSeller from './pages/BestSeller';
import NewIn from './pages/NewIn';
import Sale from './pages/Sale';
import WomenProducts from './pages/WomenProducts';
import MenProducts from './pages/MenProducts';
import KidsProducts from './pages/KidsProducts';

// Admin Pages
import Dashboard from './admin/Dashboard';
import AdminProducts from './admin/AdminProducts';
import AdminProductAdd from './admin/AdminProductAdd';
import AdminOrders from './admin/AdminOrders';
import AdminCustomers from './admin/AdminCustomers';
import AdminCategories from './admin/AdminCategories';
import AdminCollections from './admin/AdminCollections';
import AdminAttributes from './admin/AdminAttributes';
import AdminInventory from './admin/AdminInventory';
import AdminInventoryHistory from './admin/AdminInventoryHistory';
import AdminInventoryAlerts from './admin/AdminInventoryAlerts';
import AdminCoupons from './admin/AdminCoupons';
import AdminFlashSales from './admin/AdminFlashSales';
import AdminPromotions from './admin/AdminPromotions';
import AdminReviews from './admin/AdminReviews';
import AdminReports from './admin/AdminReports';
import AdminHomepage from './admin/AdminHomepage';
import AdminBanners from './admin/AdminBanners';
import AdminPages from './admin/AdminPages';
import AdminMenus from './admin/AdminMenus';
import AdminLookbook from './admin/AdminLookbook';
import AdminProfile from './admin/AdminProfile';
import AdminSettings from './admin/AdminSettings';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Trang khách hàng - dùng chung Header + Footer */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/search" element={<Search />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/lookbook" element={<Lookbook />} />
              <Route path="/bestseller" element={<BestSeller />} />
              <Route path="/new-in" element={<NewIn />} />
              <Route path="/sale" element={<Sale />} />
              <Route path="/women" element={<WomenProducts />} />
              <Route path="/men" element={<MenProducts />} />
              <Route path="/kids" element={<KidsProducts />} />

              {/* Trang cần đăng nhập */}
              <Route element={<ProtectedRoute />}>
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orders" element={<OrderTracking />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/account" element={<Account />} />
                <Route path="/address" element={<Address />} />
              </Route>
            </Route>

            {/* Trang Admin - dùng Sidebar riêng */}
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin" element={<AdminUiProvider><AdminLayout /></AdminUiProvider>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/add" element={<AdminProductAdd />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="collections" element={<AdminCollections />} />
                <Route path="attributes" element={<AdminAttributes />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="inventory/history" element={<AdminInventoryHistory />} />
                <Route path="inventory/alerts" element={<AdminInventoryAlerts />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="flash-sales" element={<AdminFlashSales />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="homepage" element={<AdminHomepage />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="pages" element={<AdminPages />} />
                <Route path="menus" element={<AdminMenus />} />
                <Route path="lookbook" element={<AdminLookbook />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
