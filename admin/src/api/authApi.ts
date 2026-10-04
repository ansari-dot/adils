import { apiClient } from './apiClient';
import { AdminUser } from '../types';

export interface LoginResponse {
  success: boolean;
  token: string;
  user: AdminUser;
  message?: string;
}

export const authApi = {
  login: (email: string, password: string): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/api/v1/auth/login', { email, password });
  },

  getMe: (): Promise<{ success: boolean; user: AdminUser }> => {
    return apiClient.get<{ success: boolean; user: AdminUser }>('/api/v1/auth/me');
  },

  updateProfile: (data: Partial<AdminUser>): Promise<{ success: boolean; user: AdminUser; message: string }> => {
    return apiClient.put<{ success: boolean; user: AdminUser; message: string }>('/api/v1/admin/profile', data);
  },

  changePassword: (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.put<{ success: boolean; message: string }>('/api/v1/admin/profile/password', {
      currentPassword,
      newPassword,
    });
  },
};
