import { apiClient } from './client';
import type { User, UserRole } from './auth';

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface ChangeRoleRequest {
  role: UserRole;
}

export interface ChangeStatusRequest {
  is_active: boolean;
}

export const adminApi = {
  getUsers: async (page = 1, limit = 20): Promise<UserListResponse> => {
    const response = await apiClient.get<UserListResponse>(
      '/admin/users',
      { params: { page, limit } }
    );
    return response.data;
  },

  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/admin/users/${id}`);
    return response.data;
  },

  changeUserRole: async (id: string, role: UserRole): Promise<User> => {
    const response = await apiClient.put<User>(
      `/admin/users/${id}/role`,
      { role }
    );
    return response.data;
  },

  changeUserStatus: async (id: string, is_active: boolean): Promise<User> => {
    const response = await apiClient.put<User>(
      `/admin/users/${id}/status`,
      { is_active }
    );
    return response.data;
  },
};
