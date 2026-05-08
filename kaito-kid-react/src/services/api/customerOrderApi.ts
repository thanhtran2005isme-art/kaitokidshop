import apiClient, { getErrorMessage } from '../apiClient';
import type { ApiResponse } from '../../types/api';

export interface CustomerOrderItemDTO {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export interface CustomerOrderDTO {
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
  couponCode?: string;
  paymentMethod: string;
  status: string; // 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled'
  note?: string;
  createdAt: string;
  items: CustomerOrderItemDTO[];
}

export const customerOrderApi = {
  /** Lấy danh sách đơn của user hiện tại (theo JWT) */
  async getMyOrders(): Promise<ApiResponse<CustomerOrderDTO[]>> {
    try {
      const response = await apiClient.get<CustomerOrderDTO[]>('/api/orders');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Lấy chi tiết 1 đơn */
  async getById(id: number): Promise<ApiResponse<CustomerOrderDTO>> {
    try {
      const response = await apiClient.get<CustomerOrderDTO>(`/api/orders/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Hủy đơn hàng */
  async cancel(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.put<{ message: string }>(`/api/orders/${id}/cancel`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },
};

export interface CreateReviewPayload {
  productId: number;
  orderId: number;
  rating: number;
  comment: string;
}

export const customerReviewApi = {
  async create(payload: CreateReviewPayload): Promise<ApiResponse<{ id: number }>> {
    try {
      const response = await apiClient.post<{ id: number }>('/api/reviews', payload);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },
};
