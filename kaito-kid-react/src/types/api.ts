import type { Order, Product, ProductVariant } from './index';

export interface ApiPagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TokenResponseDTO {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfoDTO;
}

export interface UserInfoDTO {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  role: 'admin' | 'user' | string;
  createdAt?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface ProductDTO {
  id: number;
  name: string;
  category: string;
  gender: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  status: Product['status'] | string;
  image: string;
  shortDescription?: string | null;
  sku: string;
  slug?: string | null;
  isNew: boolean;
  isSale: boolean;
  isBestSeller: boolean;
  rating: number;
  soldCount: number;
  colors?: string[];
  sizes?: string[];
}

export interface ProductDetailDTO extends ProductDTO {
  subcategory?: string | null;
  style?: string | null;
  ageGroup?: string | null;
  images?: string[];
  description?: string | null;
  menu?: string | null;
  collection?: string | null;
  specs?: string | null;
  variants?: ProductVariant[];
  reviews?: ReviewDTO[];
  createdAt?: string;
}

export interface ProductFilterDTO {
  gender?: string;
  category?: string;
  search?: string;
  isNew?: boolean;
  isSale?: boolean;
  isBestSeller?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface CartItemDTO {
  id: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export interface AddToCartDTO {
  productId: number;
  size: string;
  color: string;
  quantity: number;
}

export interface UpdateCartDTO {
  quantity: number;
}

export interface CreateOrderDTO {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  paymentMethod: string;
  couponCode?: string;
  note?: string;
}

export interface OrderDTO {
  id: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  paymentMethod: string;
  status: Order['status'] | string;
  note?: string | null;
  createdAt: string;
  items: OrderDetailDTO[];
}

export interface OrderDetailDTO {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export interface CouponValidateDTO {
  code: string;
  orderAmount: number;
}

export interface CouponResultDTO {
  isValid: boolean;
  message?: string | null;
  type?: string | null;
  discountAmount: number;
}

export interface AddressDTO {
  id: number;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
}

export interface CreateAddressDTO {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
}

export interface AccountDTO {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  createdAt?: string;
}

export interface UpdateAccountDTO {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface CollectionDTO {
  id: number;
  name: string;
  slug?: string | null;
  description?: string | null;
  image?: string | null;
  sortOrder?: number;
}

export interface LookbookDTO {
  id: number;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  image: string;
  link?: string | null;
  sortOrder?: number;
}

export interface ReviewDTO {
  id: number;
  productId: number;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  status?: string;
  adminReply?: string | null;
}

export interface WishlistDTO {
  id: number;
  productId: number;
  productName: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  createdAt: string;
}

export interface AdminProductDTO {
  id?: number;
  tenSanPham?: string;
  danhMucId?: number | null;
  danhMuc?: string;
  danhMucPhu?: string | null;
  phongCach?: string | null;
  nhomTuoi?: string | null;
  gioiTinh?: string;
  gia?: number;
  giaCu?: number | null;
  tonKho?: number;
  trangThai?: string;
  hinhAnh?: string;
  danhSachAnh?: string | null;
  moTaNgan?: string | null;
  moTaChiTiet?: string;
  maSanPham?: string;
  slug?: string | null;
  menu?: string | null;
  boSuuTapId?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  laSanPhamMoi?: boolean;
  dangGiamGia?: boolean;
  banChayNhat?: boolean;
  diemDanhGia?: number;
  soLuongDaBan?: number;
  danhSachMau?: string | null;
  danhSachSize?: string | null;
  bienThe?: string | null;
  thongSoKyThuat?: string | null;
  ngayTao?: string;
  ngayCapNhat?: string | null;
}

export interface AdminOrderDTO {
  id: number;
  maDonHang?: string;
  tenNguoiNhan?: string;
  soDienThoai?: string;
  email?: string;
  diaChiGiao?: string;
  tamTinh?: number;
  phiVanChuyen?: number;
  phiThanhToan?: number;
  giamGia?: number;
  tongTien?: number;
  maGiamGia?: string | null;
  phuongThucThanhToan?: string;
  trangThai?: string;
  ghiChu?: string | null;
  ngayTao?: string;
  ngayCapNhat?: string | null;
  chiTiet?: AdminOrderDetailDTO[];
}

export interface AdminOrderDetailDTO {
  id?: number;
  sanPhamId?: number;
  tenSanPham?: string;
  hinhAnhSP?: string;
  donGia?: number;
  kichCo?: string;
  mauSac?: string;
  soLuong?: number;
}

export interface AdminCustomerDTO {
  id: number;
  hoTen?: string;
  email?: string;
  soDienThoai?: string | null;
  vaiTro?: string;
  trangThai?: boolean;
  ngayTao?: string;
  orderCount?: number;
  totalSpent?: number;
}
