import type { CartItem, Order, Product, ProductVariant, User } from '../types';
import type {
  AccountDTO,
  AdminOrderDTO,
  AdminProductDTO,
  CartItemDTO,
  OrderDTO,
  ProductDTO,
  ProductDetailDTO,
  UserInfoDTO,
  WishlistDTO,
} from '../types/api';
import { mapSessionUser } from './tokenStorage';

type JsonRecord = Record<string, unknown>;

const asRecord = (value: unknown): JsonRecord => (typeof value === 'object' && value !== null ? value as JsonRecord : {});
const asString = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback);
const asIdString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
};
const asOptionalString = (value: unknown): string | undefined => {
  const result = asString(value).trim();
  return result || undefined;
};
const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};
const asBoolean = (value: unknown, fallback = false): boolean => (typeof value === 'boolean' ? value : fallback);

const parseStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
  if (typeof value !== 'string' || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }

  return [];
};

const parseVariants = (value: unknown): ProductVariant[] => {
  if (Array.isArray(value)) return value as ProductVariant[];
  if (typeof value !== 'string' || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as ProductVariant[] : [];
  } catch {
    return [];
  }
};

const normalizeProductStatus = (value: unknown): Product['status'] => {
  const status = asString(value, 'active');
  if (status === 'draft' || status === 'out-of-stock') return status;
  return 'active';
};

const normalizeOrderStatus = (value: unknown): Order['status'] => {
  const status = asString(value, 'pending');
  if (status === 'confirmed' || status === 'shipping' || status === 'completed' || status === 'cancelled') {
    return status;
  }
  return 'pending';
};

export function mapProduct(dto: ProductDTO | ProductDetailDTO | AdminProductDTO): Product;
export function mapProduct(dto: unknown): Product;
export function mapProduct(dto: unknown): Product {
  const data = asRecord(dto);
  const id = asNumber(data.id, Date.now());
  const oldPrice = data.oldPrice ?? data.giaCu;

  return {
    id,
    name: asString(data.name ?? data.tenSanPham, 'San pham'),
    category: asString(data.category ?? data.danhMuc, ''),
    subcategory: asOptionalString(data.subcategory ?? data.danhMucPhu),
    style: asOptionalString(data.style ?? data.phongCach),
    ageGroup: asOptionalString(data.ageGroup ?? data.nhomTuoi),
    gender: asString(data.gender ?? data.gioiTinh, ''),
    price: asNumber(data.price ?? data.gia),
    oldPrice: oldPrice === null || oldPrice === undefined ? null : asNumber(oldPrice),
    stock: asNumber(data.stock ?? data.tonKho),
    status: normalizeProductStatus(data.status ?? data.trangThai),
    image: asString(data.image ?? data.hinhAnh, ''),
    images: parseStringList(data.images ?? data.danhSachAnh),
    shortDescription: asOptionalString(data.shortDescription ?? data.moTaNgan),
    description: asString(data.description ?? data.moTaChiTiet, ''),
    sku: asString(data.sku ?? data.maSanPham, `SKU-${id}`),
    slug: asOptionalString(data.slug),
    menu: asOptionalString(data.menu),
    collection: asOptionalString(data.collection),
    metaTitle: asOptionalString(data.metaTitle),
    metaDescription: asOptionalString(data.metaDescription),
    isNew: asBoolean(data.isNew ?? data.laSanPhamMoi),
    isSale: asBoolean(data.isSale ?? data.dangGiamGia),
    isBestSeller: asBoolean(data.isBestSeller ?? data.banChayNhat),
    rating: asNumber(data.rating ?? data.diemDanhGia),
    soldCount: asNumber(data.soldCount ?? data.soLuongDaBan),
    colors: parseStringList(data.colors ?? data.danhSachMau),
    sizes: parseStringList(data.sizes ?? data.danhSachSize),
    variants: parseVariants(data.variants ?? data.bienThe),
    specs: asOptionalString(data.specs ?? data.thongSoKyThuat),
    createdAt: asOptionalString(data.createdAt ?? data.ngayTao),
    updatedAt: asOptionalString(data.updatedAt ?? data.ngayCapNhat),
  };
}

export function productToAdminDTO(product: Partial<Product>): AdminProductDTO {
  return {
    tenSanPham: product.name || '',
    danhMuc: product.category || '',
    danhMucPhu: product.subcategory || null,
    phongCach: product.style || null,
    nhomTuoi: product.ageGroup || null,
    gioiTinh: product.gender || '',
    gia: product.price || 0,
    giaCu: product.oldPrice ?? null,
    tonKho: product.stock || 0,
    trangThai: product.status || 'active',
    hinhAnh: product.image || '',
    danhSachAnh: JSON.stringify(product.images || []),
    moTaNgan: product.shortDescription || null,
    moTaChiTiet: product.description || '',
    maSanPham: product.sku || `SKU-${Date.now()}`,
    slug: product.slug || null,
    menu: product.menu || null,
    metaTitle: product.metaTitle || null,
    metaDescription: product.metaDescription || null,
    laSanPhamMoi: !!product.isNew,
    dangGiamGia: !!product.isSale,
    banChayNhat: !!product.isBestSeller,
    diemDanhGia: product.rating || 0,
    soLuongDaBan: product.soldCount || 0,
    danhSachMau: JSON.stringify(product.colors || []),
    danhSachSize: JSON.stringify(product.sizes || []),
    bienThe: JSON.stringify(product.variants || []),
    thongSoKyThuat: product.specs || null,
  };
}

export function mapCartItem(dto: CartItemDTO): CartItem;
export function mapCartItem(dto: unknown): CartItem;
export function mapCartItem(dto: unknown): CartItem {
  const data = asRecord(dto);
  const productId = asNumber(data.productId ?? data.sanPhamId ?? data.id);

  return {
    id: asNumber(data.id, productId),
    productId,
    name: asString(data.name ?? data.productName ?? data.tenSanPham, ''),
    price: asNumber(data.price ?? data.donGia),
    image: asString(data.image ?? data.productImage ?? data.hinhAnhSP, ''),
    size: asString(data.size ?? data.kichCo, ''),
    color: asString(data.color ?? data.mauSac, ''),
    quantity: asNumber(data.quantity ?? data.soLuong, 1),
  };
}

export function mapOrder(dto: OrderDTO | AdminOrderDTO): Order;
export function mapOrder(dto: unknown): Order;
export function mapOrder(dto: unknown): Order {
  const data = asRecord(dto);
  const itemsSource = data.items ?? data.chiTiet;
  const items = Array.isArray(itemsSource) ? itemsSource.map(mapCartItem) : [];
  const id = asIdString(data.orderCode ?? data.maDonHang ?? data.id);

  return {
    id,
    orderCode: asOptionalString(data.orderCode ?? data.maDonHang),
    customer: {
      name: asString(data.customerName ?? data.tenNguoiNhan, ''),
      phone: asString(data.customerPhone ?? data.soDienThoai, ''),
      email: asString(data.customerEmail ?? data.email, ''),
      address: asString(data.customerAddress ?? data.diaChiGiao, ''),
    },
    items,
    subtotal: asNumber(data.subtotal ?? data.tamTinh),
    shippingFee: asNumber(data.shippingFee ?? data.phiVanChuyen),
    paymentFee: asNumber(data.paymentFee ?? data.phiThanhToan),
    discount: asNumber(data.discount ?? data.giamGia),
    total: asNumber(data.total ?? data.tongTien),
    couponCode: asOptionalString(data.couponCode ?? data.maGiamGia),
    paymentMethod: asString(data.paymentMethod ?? data.phuongThucThanhToan, 'COD'),
    status: normalizeOrderStatus(data.status ?? data.trangThai),
    note: asOptionalString(data.note ?? data.ghiChu),
    createdAt: asString(data.createdAt ?? data.ngayTao, new Date().toISOString()),
    updatedAt: asOptionalString(data.updatedAt ?? data.ngayCapNhat),
  };
}

export function mapWishlistProduct(dto: WishlistDTO): Product {
  return {
    id: dto.productId,
    name: dto.productName,
    category: '',
    gender: '',
    price: Number(dto.price),
    oldPrice: dto.oldPrice === null || dto.oldPrice === undefined ? null : Number(dto.oldPrice),
    stock: 1,
    status: 'active',
    image: dto.image,
    description: '',
    sku: `P-${dto.productId}`,
    isNew: false,
    isSale: !!dto.oldPrice,
    isBestSeller: false,
    rating: 0,
    soldCount: 0,
  };
}

export function mapUser(dto: UserInfoDTO | AccountDTO): User {
  if ('role' in dto) return mapSessionUser(dto);
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    phone: dto.phone || undefined,
    avatar: dto.avatar || undefined,
    role: 'user',
    createdAt: dto.createdAt,
  };
}

export function unwrapItems<T>(payload: T[] | { items?: T[] }): T[] {
  return Array.isArray(payload) ? payload : payload.items || [];
}
