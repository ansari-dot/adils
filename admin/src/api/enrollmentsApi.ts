import { apiClient } from './apiClient';
import { Enrollment } from '../types';

export const enrollmentsApi = {
  getAll: (params?: { courseId?: string; status?: string; search?: string }): Promise<{
    success: boolean;
    count: number;
    enrollments: Enrollment[];
  }> => {
    return apiClient.get('/api/v1/enrollments', params);
  },
};
