import { apiClient } from './apiClient';
import { DashboardStats, RevenueDataPoint, PopularProduct, GlobalSearchResults } from '../types';

export const dashboardApi = {
  getStats: (): Promise<{ success: boolean; stats: DashboardStats }> => {
    return apiClient.get<{ success: boolean; stats: DashboardStats }>('/api/v1/admin/dashboard/stats');
  },

  getRevenue: (period: '7d' | '30d' | '90d' | '1y' = '7d'): Promise<{ success: boolean; period: string; data: RevenueDataPoint[] }> => {
    return apiClient.get<{ success: boolean; period: string; data: RevenueDataPoint[] }>('/api/v1/admin/dashboard/revenue', { period });
  },

  getOrdersBreakdown: (): Promise<{
    success: boolean;
    statusBreakdown: { pending: number; processing: number; completed: number; cancelled: number };
  }> => {
    return apiClient.get<{
      success: boolean;
      statusBreakdown: { pending: number; processing: number; completed: number; cancelled: number };
    }>('/api/v1/admin/dashboard/orders');
  },

  getPopularProducts: (): Promise<{ success: boolean; popular: PopularProduct[] }> => {
    return apiClient.get<{ success: boolean; popular: PopularProduct[] }>('/api/v1/admin/dashboard/popular-products');
  },

  globalSearch: (q: string): Promise<{ success: boolean; results: GlobalSearchResults }> => {
    return apiClient.get<{ success: boolean; results: GlobalSearchResults }>('/api/v1/admin/search', { q });
  },
};
