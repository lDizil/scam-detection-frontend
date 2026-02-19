import { apiClient } from './client';
import type { HistoryResponse, StatsResponse, CheckFilters } from './content';

export interface GlobalStatsResponse extends StatsResponse {
  total_users?: number;
  active_users?: number;
}

export const moderatorApi = {
  getAllChecks: async (filters: CheckFilters = {}): Promise<HistoryResponse> => {
    const { page = 1, limit = 20, ...restFilters } = filters;
    const params: Record<string, string | number> = { page, limit };
    
    if (restFilters.check_type) params.check_type = restFilters.check_type;
    if (restFilters.danger_level) params.danger_level = restFilters.danger_level;
    if (restFilters.status) params.status = restFilters.status;
    if (restFilters.search) params.search = restFilters.search;
    if (restFilters.date_from) params.date_from = restFilters.date_from;
    if (restFilters.date_to) params.date_to = restFilters.date_to;
    
    const response = await apiClient.get<HistoryResponse>(
      '/analysis/all',
      { params }
    );
    return response.data;
  },

  getGlobalStats: async (): Promise<GlobalStatsResponse> => {
    const response = await apiClient.get<GlobalStatsResponse>('/analysis/global-stats');
    return response.data;
  },
};
