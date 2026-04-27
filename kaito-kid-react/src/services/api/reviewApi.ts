import apiClient, { getErrorMessage } from '../apiClient';
import type { ApiResponse } from '../../types/api';

export interface ReviewDTO {
  id: number;
  sanPhamId: number;
  nguoiDungId: number;
  tenKhachHang: string;
  donHangId: number;
  soSao: number;
  noiDung: string;
  trangThai: string; // 'pending' | 'approved' | 'rejected'
  phanHoiAdmin?: string;
  ngayTao: string;
}

export interface ReviewListResponse {
  items: ReviewDTO[];
  total: number;
  page: number;
  pageSize: number;
}

export const reviewApi = {
  /** Lấy tất cả reviews (Admin) */
  async getAll(params?: { status?: string; page?: number; pageSize?: number }): Promise<ApiResponse<ReviewListResponse>> {
    try {
      const response = await apiClient.get<ReviewListResponse>('/api/admin/reviews', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Duyệt review */
  async approve(id: number): Promise<ApiResponse<ReviewDTO>> {
    try {
      const response = await apiClient.put<ReviewDTO>(`/api/admin/reviews/${id}/approve`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Từ chối review */
  async reject(id: number): Promise<ApiResponse<ReviewDTO>> {
    try {
      const response = await apiClient.put<ReviewDTO>(`/api/admin/reviews/${id}/reject`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Phản hồi review */
  async reply(id: number, phanHoiAdmin: string): Promise<ApiResponse<ReviewDTO>> {
    try {
      const response = await apiClient.put<ReviewDTO>(`/api/admin/reviews/${id}/reply`, { phanHoiAdmin });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Xóa review */
  async delete(id: number): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/api/admin/reviews/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },
};
