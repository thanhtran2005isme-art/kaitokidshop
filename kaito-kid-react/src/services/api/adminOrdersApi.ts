/**
 * Admin Orders API Service
 */

import apiClient, { getErrorMessage } from '../apiClient';
import type { ApiResponse } from '../../types/api';
import type { Order, CartItem } from '../../types';

// Backend DonHang DTO
export interface DonHangDTO {
  id: number;
  maDonHang: string;
  nguoiDungId: number;
  tenNguoiNhan: string;
  soDienThoai: string;
  email: string;
  diaChiGiao: string;
  tinhThanh?: string;
  quanHuyen?: string;
  phuongXa?: string;
  tamTinh: number;
  phiVanChuyen: number;
  phiThanhToan: number;
  giamGia: number;
  tongTien: number;
  maGiamGia?: string;
  phuongThucThanhToan: string;
  trangThai: string;
  ghiChu?: string;
  ghiChuAdmin?: string;
  ngayXacNhan?: string;
  ngayGiaoHang?: string;
  ngayHoanThanh?: string;
  ngayTao: string;
  ngayCapNhat?: string;
  chiTiet: ChiTietDonHangDTO[];
}

export interface ChiTietDonHangDTO {
  id: number;
  donHangId: number;
  sanPhamId: number;
  tenSanPham: string;
  hinhAnhSP: string;
  donGia: number;
  kichCo: string;
  mauSac: string;
  soLuong: number;
}

export interface OrdersPagedResult {
  items: DonHangDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UpdateStatusPayload {
  trangThai: string;
  ghiChuAdmin?: string;
}

// Mapper: DonHangDTO -> Order
function mapDonHangToOrder(dto: DonHangDTO): Order {
  const items: CartItem[] = dto.chiTiet.map((ct) => ({
    id: ct.sanPhamId,
    name: ct.tenSanPham,
    price: ct.donGia,
    image: ct.hinhAnhSP,
    size: ct.kichCo,
    color: ct.mauSac,
    quantity: ct.soLuong,
  }));

  return {
    id: dto.maDonHang || dto.id.toString(),
    orderCode: dto.maDonHang,
    customer: {
      name: dto.tenNguoiNhan,
      phone: dto.soDienThoai,
      email: dto.email,
      address: dto.diaChiGiao,
    },
    items,
    total: dto.tongTien,
    subtotal: dto.tamTinh,
    shippingFee: dto.phiVanChuyen,
    paymentFee: dto.phiThanhToan || undefined,
    discount: dto.giamGia,
    couponCode: dto.maGiamGia,
    paymentMethod: dto.phuongThucThanhToan,
    status: dto.trangThai as Order['status'],
    note: dto.ghiChu,
    createdAt: dto.ngayTao,
    updatedAt: dto.ngayCapNhat,
  };
}

export const adminOrdersApi = {
  /**
   * Get all orders with filters and pagination
   */
  async getAll(params: {
    status?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<{ orders: Order[]; total: number; page: number; pageSize: number }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      const response = await apiClient.get<OrdersPagedResult>(
        `/api/admin/orders?${queryParams.toString()}`
      );

      const orders = response.data.items.map(mapDonHangToOrder);

      return {
        success: true,
        data: {
          orders,
          total: response.data.total,
          page: response.data.page,
          pageSize: response.data.pageSize,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * Get order by ID
   */
  async getById(id: number): Promise<ApiResponse<Order>> {
    try {
      const response = await apiClient.get<DonHangDTO>(`/api/admin/orders/${id}`);
      const order = mapDonHangToOrder(response.data);
      return {
        success: true,
        data: order,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * Update order status
   */
  async updateStatus(
    id: number,
    status: Order['status'],
    adminNote?: string
  ): Promise<ApiResponse<Order>> {
    try {
      const payload: UpdateStatusPayload = {
        trangThai: status,
        ghiChuAdmin: adminNote,
      };

      const response = await apiClient.put<DonHangDTO>(`/api/admin/orders/${id}/status`, payload);
      const order = mapDonHangToOrder(response.data);

      return {
        success: true,
        data: order,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * Get order statistics
   */
  async getStats(): Promise<
    ApiResponse<{
      total: number;
      pending: number;
      confirmed: number;
      shipping: number;
      completed: number;
      cancelled: number;
      revenue: number;
    }>
  > {
    try {
      const response = await apiClient.get<{
        total: number;
        pending: number;
        confirmed: number;
        shipping: number;
        completed: number;
        cancelled: number;
        revenue: number;
      }>('/api/admin/orders/stats');

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },
};
