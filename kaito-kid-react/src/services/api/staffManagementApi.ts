import apiClient, { getErrorMessage } from '../apiClient';
import type { ApiResponse } from '../../types/api';

export interface StaffListItem {
  id: number;
  email: string;
  hoTen: string;
  soDienThoai?: string;
  anhDaiDien?: string;
  vaiTroId: number;
  tenVaiTro: string;
  maVaiTro: string;
  laSuperAdmin: boolean;
  trangThai: boolean;
  biKhoa: boolean;
  lanDangNhapCuoi?: string;
  ngayVaoLam?: string;
  ngayTao: string;
}

export interface CreateStaffPayload {
  email: string;
  password: string;
  hoTen: string;
  soDienThoai?: string;
  anhDaiDien?: string;
  vaiTroId: number;
  ngaySinh?: string;
  gioiTinh?: string;
  diaChi?: string;
  ngayVaoLam?: string;
  ghiChu?: string;
  trangThai?: boolean;
}

export interface UpdateStaffPayload {
  hoTen: string;
  soDienThoai?: string;
  anhDaiDien?: string;
  vaiTroId: number;
  ngaySinh?: string;
  gioiTinh?: string;
  diaChi?: string;
  ngayVaoLam?: string;
  ghiChu?: string;
  trangThai?: boolean;
}

export interface RoleDTO {
  id: number;
  maVaiTro: string;
  tenVaiTro: string;
  moTa?: string;
  laMacDinh: boolean;
  trangThai: boolean;
  soNhanVien: number;
  quyenHanIds: number[];
}

export interface PermissionDTO {
  id: number;
  maQuyen: string;
  tenQuyen: string;
  nhom: string;
  moTa?: string;
}

export interface CreateRolePayload {
  maVaiTro: string;
  tenVaiTro: string;
  moTa?: string;
  trangThai?: boolean;
  quyenHanIds: number[];
}

export const staffManagementApi = {
  async getAll(params?: { search?: string; roleId?: number; active?: boolean }): Promise<ApiResponse<StaffListItem[]>> {
    try {
      const qs = new URLSearchParams();
      if (params?.search) qs.append('search', params.search);
      if (params?.roleId) qs.append('roleId', String(params.roleId));
      if (params?.active !== undefined) qs.append('active', String(params.active));
      const res = await apiClient.get<StaffListItem[]>(`/api/auth/staff-management?${qs}`);
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async getById(id: number): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.get(`/api/auth/staff-management/${id}`);
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async create(payload: CreateStaffPayload): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.post('/api/auth/staff-management', payload);
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async update(id: number, payload: UpdateStaffPayload): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.put(`/api/auth/staff-management/${id}`, payload);
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async resetPassword(id: number, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const res = await apiClient.post(`/api/auth/staff-management/${id}/reset-password`, { newPassword });
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async unlock(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const res = await apiClient.post(`/api/auth/staff-management/${id}/unlock`);
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async delete(id: number): Promise<ApiResponse<{ message: string }>> {
    try {
      const res = await apiClient.delete(`/api/auth/staff-management/${id}`);
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  // ===== ROLES =====
  async getRoles(): Promise<ApiResponse<RoleDTO[]>> {
    try {
      const res = await apiClient.get<RoleDTO[]>('/api/auth/staff-management/roles');
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async createRole(payload: CreateRolePayload): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.post('/api/auth/staff-management/roles', payload);
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async updateRole(id: number, payload: CreateRolePayload): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.put(`/api/auth/staff-management/roles/${id}`, payload);
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  async deleteRole(id: number): Promise<ApiResponse<any>> {
    try {
      const res = await apiClient.delete(`/api/auth/staff-management/roles/${id}`);
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },

  // ===== PERMISSIONS =====
  async getPermissions(): Promise<ApiResponse<PermissionDTO[]>> {
    try {
      const res = await apiClient.get<PermissionDTO[]>('/api/auth/staff-management/permissions');
      return { success: true, data: res.data };
    } catch (error) {
      return { success: false, error: getErrorMessage(error) };
    }
  },
};
