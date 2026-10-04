import { apiClient } from './apiClient';
import { Order, OrderStatus } from '../types';

export const ordersApi = {
  getAll: (params?: {
    search?: string;
    status?: string;
    dateRange?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    orders: Order[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    return apiClient.get('/api/v1/orders/all', params);
  },

  getById: (id: string): Promise<{ success: boolean; order: Order }> => {
    return apiClient.get(`/api/v1/orders/${id}`);
  },

  updateStatus: (
    id: string,
    status: OrderStatus,
    note?: string
  ): Promise<{ success: boolean; message: string; order: Order }> => {
    return apiClient.put(`/api/v1/orders/${id}/status`, { status, note });
  },
};
