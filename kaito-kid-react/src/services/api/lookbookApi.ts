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
