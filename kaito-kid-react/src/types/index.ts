// ============================================================
// KIỂU DỮ LIỆU DÙNG CHUNG CHO TOÀN BỘ PROJECT
// Map từ cấu trúc localStorage của project cũ
// ============================================================

// Sản phẩm - từ admin-products.js getSampleProducts()
export interface Product {
  id: number;
  name: string;
  category: string;
  gender: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  status: 'active' | 'out-of-stock' | 'draft';
  image: string;
  images?: string[];
  description: string;
  sku: string;
  isNew: boolean;
  isSale: boolean;
  isBestSeller: boolean;
  rating: number;
  soldCount: number;
  colors?: string[];
  sizes?: string[];
  specs?: string;
  createdAt?: string;
  updatedAt?: string;
}

// User - từ login.js handleRegister()
export interface User {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  username?: string;
  createdAt?: string;
}

// Item trong giỏ hàng - từ cart-page.js
export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

// Đơn hàng - từ checkout-page.js placeOrder()
export interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  items: CartItem[];
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode?: string;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
  note?: string;
  createdAt: string;
  updatedAt?: string;
}
