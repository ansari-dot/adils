import { apiClient } from './apiClient';
import { MediaItem } from '../types';

export const mediaApi = {
  getAll: (params?: { category?: string }): Promise<{ success: boolean; count: number; media: MediaItem[] }> => {
    return apiClient.get('/api/v1/media', params);
  },

  upload: (data: {
    name: string;
    url: string;
    category?: 'product' | 'course' | 'avatar' | 'banner';
    type?: 'image' | 'video';
    sizeBytes?: number;
  }): Promise<{ success: boolean; message: string; media: MediaItem }> => {
    return apiClient.post('/api/v1/media', data);
  },

  delete: (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/api/v1/media/${id}`);
  },
};
