import { apiClient } from './apiClient';
import { CustomCakeRequest, CustomRequestStatus } from '../types';

export const customRequestsApi = {
  getAll: (params?: { search?: string; status?: string }): Promise<{ success: boolean; count: number; requests: CustomCakeRequest[] }> => {
    return apiClient.get('/api/v1/customizations/all-requests', params);
  },

  getById: (id: string): Promise<{ success: boolean; request: CustomCakeRequest }> => {
    return apiClient.get(`/api/v1/customizations/request/${id}`);
  },

  updateStatus: (
    id: string,
    status: CustomRequestStatus,
    adminNotes?: string,
    estimatedCost?: number
  ): Promise<{ success: boolean; message: string; request: CustomCakeRequest }> => {
    return apiClient.put(`/api/v1/customizations/request/${id}/status`, {
      status,
      adminNotes,
      estimatedCost,
    });
  },
};
