import { apiClient } from './client';
import type { HistoryResponse, StatsResponse } from './content';

export interface GlobalStatsResponse extends StatsResponse {
  total_users?: number;
  active_users?: number;
}

export const moderatorApi = {
  getAllChecks: async (page = 1, limit = 20): Promise<HistoryResponse> => {
    const response = await apiClient.get<HistoryResponse>(
      '/analysis/all',
      { params: { page, limit } }
    );
    return response.data;
  },

  getGlobalStats: async (): Promise<GlobalStatsResponse> => {
    const response = await apiClient.get<GlobalStatsResponse>('/analysis/global-stats');
    return response.data;
  },
};
