import { apiClient } from './apiClient';
import { CalculatorConfig, CalculatorStats } from '../types';

export const calculatorApi = {
  getConfig: (): Promise<{ success: boolean; config: CalculatorConfig }> => {
    return apiClient.get('/api/v1/calculator/config');
  },

  updateConfig: (data: Partial<CalculatorConfig>): Promise<{ success: boolean; message: string; config: CalculatorConfig }> => {
    return apiClient.put('/api/v1/calculator/config', data);
  },

  getStats: (): Promise<{ success: boolean; stats: CalculatorStats }> => {
    return apiClient.get('/api/v1/calculator/stats');
  },
};
