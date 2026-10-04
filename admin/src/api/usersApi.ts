import { apiClient } from './apiClient';
import { UserSummary, UserDetail, AccountStatus } from '../types';

export const usersApi = {
  getAll: (params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    users: UserSummary[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    return apiClient.get('/api/v1/users/all', params);
  },

  getById: (id: string): Promise<UserDetail & { success: boolean }> => {
    return apiClient.get<UserDetail & { success: boolean }>(`/api/v1/users/${id}`);
  },

  updateStatus: (id: string, status: AccountStatus): Promise<{ success: boolean; message: string }> => {
    return apiClient.put<{ success: boolean; message: string }>(`/api/v1/users/${id}/status`, { status });
  },
};
