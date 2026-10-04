import { apiClient } from './apiClient';
import { Product } from '../types';

export const productsApi = {
  getAll: (params?: {
    search?: string;
    category?: string;
    stock?: string;
    popular?: string;
    sort?: string;
  }): Promise<{ success: boolean; count: number; products: Product[] }> => {
    return apiClient.get('/api/v1/products', params);
  },

  getById: (id: string): Promise<{ success: boolean; product: Product }> => {
    return apiClient.get(`/api/v1/products/${id}`);
  },

  create: (data: Partial<Product>): Promise<{ success: boolean; message: string; product: Product }> => {
    return apiClient.post('/api/v1/products', data);
  },

  update: (id: string, data: Partial<Product>): Promise<{ success: boolean; message: string; product: Product }> => {
    return apiClient.put(`/api/v1/products/${id}`, data);
  },

  delete: (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/api/v1/products/${id}`);
  },
};
