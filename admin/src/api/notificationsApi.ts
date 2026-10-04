import { apiClient } from './apiClient';
import { AdminNotification } from '../types';

export const notificationsApi = {
  getAll: (): Promise<{ success: boolean; count: number; notifications: AdminNotification[] }> => {
    return apiClient.get('/api/v1/notifications');
  },

  markAsRead: (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.put(`/api/v1/notifications/${id}/read`);
  },

  markAllAsRead: (): Promise<{ success: boolean; message: string }> => {
    return apiClient.put('/api/v1/notifications/read-all');
  },
};
