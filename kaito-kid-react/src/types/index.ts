export interface Product {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  style?: string;
  ageGroup?: string;
  gender: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  status: 'active' | 'out-of-stock' | 'draft';
  image: string;
  images?: string[];
  shortDescription?: string;
  description: string;
  sku: string;
  slug?: string;
  menu?: string;
  collection?: string;
  metaTitle?: string;
  metaDescription?: string;
  isNew: boolean;
  isSale: boolean;
  isBestSeller: boolean;
  rating: number;
  soldCount: number;
  colors?: string[];
  sizes?: string[];
  variants?: ProductVariant[];
  specs?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  key?: string;
  size: string;
  color: string;
  sku: string;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'user';
  username?: string;
  createdAt?: string;
}

export interface CartItem {
  id: number;
  productId?: number;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderCode?: string;
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
  paymentFee?: number;
  discount: number;
  couponCode?: string;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
  note?: string;
  createdAt: string;
  updatedAt?: string;
}
