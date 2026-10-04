import { apiClient } from './apiClient';
import { Course, Enrollment } from '../types';

export const coursesApi = {
  getAll: (params?: { search?: string; category?: string }): Promise<{ success: boolean; count: number; courses: Course[] }> => {
    return apiClient.get('/api/v1/courses', params);
  },

  getById: (id: string): Promise<{ success: boolean; course: Course; enrollments: Enrollment[] }> => {
    return apiClient.get(`/api/v1/courses/${id}`);
  },

  create: (data: Partial<Course>): Promise<{ success: boolean; message: string; course: Course }> => {
    return apiClient.post('/api/v1/courses', data);
  },

  update: (id: string, data: Partial<Course>): Promise<{ success: boolean; message: string; course: Course }> => {
    return apiClient.put(`/api/v1/courses/${id}`, data);
  },

  delete: (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete(`/api/v1/courses/${id}`);
  },
};
