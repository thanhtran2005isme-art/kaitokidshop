import { apiClient, getApiErrorMessage } from './apiClient';
import { mapSessionUser, tokenStorage } from './tokenStorage';
import type { User } from '../types';
import type { LoginDTO, RegisterDTO, TokenResponseDTO, UserInfoDTO } from '../types/api';

interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export const authService = {
  isLoggedIn(): boolean {
    return !!tokenStorage.getAccessToken() && !!tokenStorage.getCurrentUser();
  },

  getCurrentUser(): User | null {
    return tokenStorage.getCurrentUser();
  },

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  },

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      const payload: LoginDTO = { email, password };
      const response = await apiClient.post<TokenResponseDTO>('/api/auth/login', payload);
      tokenStorage.saveSession(response.data);
      return { success: true, user: mapSessionUser(response.data.user) };
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error, 'Dang nhap that bai') };
    }
  },

  async register(data: RegisterData): Promise<AuthResult> {
    try {
      const payload: RegisterDTO = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      };
      const response = await apiClient.post<TokenResponseDTO>('/api/auth/register', payload);
      tokenStorage.saveSession(response.data);
      return { success: true, user: mapSessionUser(response.data.user) };
    } catch (error) {
      return { success: false, error: getApiErrorMessage(error, 'Dang ky that bai') };
    }
  },

  async getProfile(): Promise<User | null> {
    if (!tokenStorage.getAccessToken()) return null;

    try {
      const response = await apiClient.get<UserInfoDTO>('/api/auth/me');
      tokenStorage.saveUser(response.data);
      return mapSessionUser(response.data);
    } catch {
      tokenStorage.clearSession();
      return null;
    }
  },

  logout(): void {
    tokenStorage.clearSession();
  },
};
