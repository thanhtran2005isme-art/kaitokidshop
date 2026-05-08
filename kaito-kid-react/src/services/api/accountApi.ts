import apiClient, { getErrorMessage } from '../apiClient';
import type { ApiResponse } from '../../types/api';

export interface AccountDTO {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface UpdateAccountPayload {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const accountApi = {
  /** Lấy thông tin tài khoản hiện tại */
  async getProfile(): Promise<ApiResponse<AccountDTO>> {
    try {
      const response = await apiClient.get<AccountDTO>('/api/account');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Cập nhật profile (name, phone, avatar) */
  async updateProfile(data: UpdateAccountPayload): Promise<ApiResponse<AccountDTO>> {
    try {
      const response = await apiClient.put<AccountDTO>('/api/account', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /** Đổi mật khẩu */
  async changePassword(data: ChangePasswordPayload): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.post<{ message: string }>('/api/auth/change-password', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },
};
