import { apiClient } from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email?: string;
  password: string;
}

export type UserRole = 'user' | 'moderator' | 'admin';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileUpdateRequest {
  username?: string;
  email?: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post('/auth/register', data);
    // Бэкенд возвращает { user: {...}, access_token, refresh_token }
    return response.data.user || response.data;
  },

  login: async (data: LoginRequest): Promise<User> => {
    const response = await apiClient.post('/auth/login', data);
    // Бэкенд возвращает { user: {...}, access_token, refresh_token }
    return response.data.user || response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('user');
  },

  refresh: async (): Promise<void> => {
    await apiClient.post('/auth/refresh');
  },

  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  updateProfile: async (data: ProfileUpdateRequest): Promise<User> => {
    const response = await apiClient.put('/profile', data);
    return response.data;
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/account');
    localStorage.removeItem('user');
  },

  checkAuth: async (): Promise<User | null> => {
    try {
      const response = await apiClient.get('/profile');
      return response.data;
    } catch {
      return null;
    }
  },
};

