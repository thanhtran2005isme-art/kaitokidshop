import apiClient, { getErrorMessage } from '../apiClient';
import type { ApiResponse } from '../../types/api';

export interface LookbookDTO {
  id: number;
  tieuDe: string;
  tieuDePhu?: string;
  moTa?: string;
  hinhAnh: string;
  lienKet?: string;
  trangThai: string; // 'active' | 'hidden'
  thuTu: number;
  ngayTao: string;
}

// Public DTO (from LookbooksController)
export interface PublicLookbookDTO {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  sortOrder: number;
}

export interface CreateLookbookDTO {
  tieuDe: string;
  tieuDePhu?: string;
  moTa?: string;
  hinhAnh: string;
  lienKet?: string;
  trangThai: string;
  thuTu: number;
}

export const lookbookApi = {
  /**
   * Public: Get all active lookbooks
   * GET /api/lookbooks
   */
  async getPublic(): Promise<ApiResponse<PublicLookbookDTO[]>> {
    try {
      const response = await apiClient.get<PublicLookbookDTO[]>('/api/lookbooks');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async getAll(): Promise<ApiResponse<LookbookDTO[]>> {
    try {
      const response = await apiClient.get<LookbookDTO[]>('/api/admin/lookbook');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async create(data: CreateLookbookDTO): Promise<ApiResponse<LookbookDTO>> {
    try {
      const response = await apiClient.post<LookbookDTO>('/api/admin/lookbook', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async update(id: number, data: CreateLookbookDTO): Promise<ApiResponse<LookbookDTO>> {
    try {
      const response = await apiClient.put<LookbookDTO>(`/api/admin/lookbook/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/api/admin/lookbook/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },
};
