/**
 * Auth API Service
 */

import apiClient, { getErrorMessage } from '../apiClient';
import { tokenStorage } from '../tokenStorage';
import type { LoginDTO, RegisterDTO, TokenDTO, UserInfoDTO } from '../../types/api';
import type { User } from '../../types';

export const authApi = {
  /**
   * Đăng nhập
   */
  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const payload: LoginDTO = { email, password };
      const response = await apiClient.post<TokenDTO>('/api/auth/login', payload);

      const { accessToken, refreshToken, user: userInfo } = response.data;

      // Lưu tokens
      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(refreshToken);

      // Map UserInfoDTO sang User
      const user: User = {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        avatar: userInfo.avatar,
        role: userInfo.role.toLowerCase() === 'admin' ? 'admin' : 'user',
      };

      tokenStorage.setCurrentUser(user);

      return { success: true, user };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /**
   * Đăng ký
   */
  async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const payload: RegisterDTO = {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
      };

      await apiClient.post('/api/auth/register', payload);
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /**
   * Lấy thông tin user hiện tại
   */
  async getCurrentUser(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await apiClient.get<UserInfoDTO>('/api/auth/me');
      const userInfo = response.data;

      const user: User = {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        avatar: userInfo.avatar,
        role: userInfo.role.toLowerCase() === 'admin' ? 'admin' : 'user',
      };

      tokenStorage.setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  /**
   * Đăng xuất
   */
  logout(): void {
    tokenStorage.clearAll();
  },

  /**
   * Kiểm tra đã đăng nhập
   */
  isLoggedIn(): boolean {
    return tokenStorage.isLoggedIn();
  },

  /**
   * Lấy user từ localStorage
   */
  getStoredUser(): User | null {
    return tokenStorage.getCurrentUser();
  },
};
