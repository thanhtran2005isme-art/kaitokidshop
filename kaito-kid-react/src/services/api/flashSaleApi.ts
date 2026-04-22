import apiClient, { getErrorMessage } from '../apiClient';
import type { ApiResponse } from '../../types/api';

export interface FlashSaleItemDTO {
  id?: number;
  flashSaleId?: number;
  sanPhamId: number;
  giaFlashSale: number;
  soLuongGioiHan: number;
  daBan: number;
}

export interface FlashSaleDTO {
  id: number;
  tenFlashSale: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: boolean;
  ngayTao: string;
  chiTiet: FlashSaleItemDTO[];
}

export interface CreateFlashSaleDTO {
  tenFlashSale: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: boolean;
  chiTiet: FlashSaleItemDTO[];
}

export const flashSaleApi = {
  async getAll(): Promise<ApiResponse<FlashSaleDTO[]>> {
    try {
      const response = await apiClient.get<FlashSaleDTO[]>('/api/admin/flash-sales');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async getById(id: number): Promise<ApiResponse<FlashSaleDTO>> {
    try {
      const response = await apiClient.get<FlashSaleDTO>(`/api/admin/flash-sales/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async create(data: CreateFlashSaleDTO): Promise<ApiResponse<FlashSaleDTO>> {
    try {
      const response = await apiClient.post<FlashSaleDTO>('/api/admin/flash-sales', data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async update(id: number, data: CreateFlashSaleDTO): Promise<ApiResponse<FlashSaleDTO>> {
    try {
      const response = await apiClient.put<FlashSaleDTO>(`/api/admin/flash-sales/${id}`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async delete(id: number): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/api/admin/flash-sales/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },
};
