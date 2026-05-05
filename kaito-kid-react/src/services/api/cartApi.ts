import apiClient, { getErrorMessage } from '../apiClient';
import type { ApiResponse } from '../../types/api';

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

export interface AddToCartPayload {
  productId: number;
  size: string;
  color: string;
  quantity: number;
}

export const cartApi = {
  /** Lấy giỏ hàng của user hiện tại */
  async getCart(): Promise<ApiResponse<CartItemDTO[]>> {
    try {
      const response = await apiClient.get<CartItemDTO[]>('/api/cart');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Thêm sản phẩm vào giỏ */
  async addToCart(payload: AddToCartPayload): Promise<ApiResponse<CartItemDTO>> {
    try {
      const response = await apiClient.post<CartItemDTO>('/api/cart', payload);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Cập nhật số lượng item */
  async updateQuantity(cartItemId: number, quantity: number): Promise<ApiResponse<CartItemDTO>> {
    try {
      const response = await apiClient.put<CartItemDTO>(`/api/cart/${cartItemId}`, { quantity });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Xóa 1 item khỏi giỏ */
  async removeItem(cartItemId: number): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/api/cart/${cartItemId}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Xóa toàn bộ giỏ hàng */
  async clearCart(): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete('/api/cart');
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },
};
