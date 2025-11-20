import { apiClient } from './client';

export interface TextAnalysisResponse {
  check_id: number;
  success: boolean;
  prediction: {
    label: string;
    confidence: number;
    is_scam: boolean;
  };
  processing_time: number;
}

export interface BatchAnalysisResponse {
  check_ids: number[];
  success: boolean;
  predictions: Array<{
    label: string;
    confidence: number;
    is_scam: boolean;
  }>;
  processing_time: number;
}

export interface HistoryCheck {
  id: number;
  title: string;
  content: string;
  danger_score: number;
  danger_level: string;
  status: string;
  processing_time_ms: number;
  created_at: string;
}

export interface HistoryResponse {
  checks: HistoryCheck[];
  total: number;
  page: number;
  limit: number;
}

// Request types
export interface TextAnalysisRequest {
  text: string;
}

export interface BatchAnalysisRequest {
  texts: string[];
}

// API methods
export const contentApi = {
  // Анализ одного текста
  analyzeText: async (text: string): Promise<TextAnalysisResponse> => {
    const response = await apiClient.post<TextAnalysisResponse>(
      '/analysis/text',
      { text }
    );
    return response.data;
  },

  // Пакетный анализ (до 100 текстов)
  analyzeBatch: async (texts: string[]): Promise<BatchAnalysisResponse> => {
    if (texts.length > 100) {
      throw new Error('Максимум 100 текстов за раз');
    }
    const response = await apiClient.post<BatchAnalysisResponse>(
      '/analysis/batch',
      { texts }
    );
    return response.data;
  },

  // История анализов
  getHistory: async (page = 1, limit = 20): Promise<HistoryResponse> => {
    const response = await apiClient.get<HistoryResponse>(
      '/analysis/history',
      { params: { page, limit } }
    );
    return response.data;
  },
};
