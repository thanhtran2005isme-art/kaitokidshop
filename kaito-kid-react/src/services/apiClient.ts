import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from './tokenStorage';
import type { TokenResponseDTO } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5155';

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isRefreshRequest = originalRequest?.url?.includes('/api/auth/refresh');

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry || isRefreshRequest) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      tokenStorage.clearSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    refreshPromise ??= apiClient
      .post<TokenResponseDTO>('/api/auth/refresh', { refreshToken })
      .then(response => {
        tokenStorage.saveSession(response.data);
        return response.data.accessToken;
      })
      .catch(() => {
        tokenStorage.clearSession();
        if (window.location.pathname !== '/login') {
          window.location.assign('/login');
        }
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });

    const newToken = await refreshPromise;
    if (!newToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return apiClient(originalRequest);
  }
);

export function getApiErrorMessage(error: unknown, fallback = 'Co loi xay ra'): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data;
    if (isErrorPayload(payload)) {
      return payload.message || payload.error || fallback;
    }
    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

function isErrorPayload(value: unknown): value is { message?: string; error?: string } {
  return typeof value === 'object' && value !== null;
}
