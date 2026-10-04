import { apiClient } from './apiClient';
import { AuditLog } from '../types';

export const auditLogsApi = {
  getAll: (params?: { resourceType?: string }): Promise<{ success: boolean; count: number; logs: AuditLog[] }> => {
    return apiClient.get('/api/v1/admin/audit-logs', params);
  },
};
