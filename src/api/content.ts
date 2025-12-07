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

export interface UrlAnalysisResponse {
  check_id: number;
  url: string;
  verdict: string;
  confidence: number;
  reasons: string[];
  checked_at: string;
}

export interface ImageAnalysisResponse {
  check_id: number;
  success: boolean;
  extracted_text: string;
  prediction: {
    label: string;
    confidence: number;
    is_scam: boolean;
  };
  processing_time: number;
  message?: string;
}

export interface VideoAnalysisResponse {
  check_id: number;
  success: boolean;
  transcription: string;
  prediction: {
    label: string;
    confidence: number;
    is_scam: boolean;
  };
  processing_time: number;
  message?: string;
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
  content_type: string;
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

export interface StatsResponse {
  total_analyses: number;
  safe_count: number;
  suspicious_count: number;
  dangerous_count: number;
  average_risk_score: number;
  average_processing_time: number;
}

export interface TextAnalysisRequest {
  text: string;
}

export interface UrlAnalysisRequest {
  url: string;
}

export interface BatchAnalysisRequest {
  texts: string[];
}

export const contentApi = {
  analyzeText: async (text: string): Promise<TextAnalysisResponse> => {
    const response = await apiClient.post<TextAnalysisResponse>(
      '/analysis/text',
      { text }
    );
    return response.data;
  },

  analyzeUrl: async (url: string): Promise<UrlAnalysisResponse> => {
    const response = await apiClient.post<UrlAnalysisResponse>(
      '/analysis/url',
      { url }
    );
    return response.data;
  },

  analyzeImage: async (file: File): Promise<ImageAnalysisResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiClient.post<ImageAnalysisResponse>(
      '/analysis/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  analyzeVideo: async (file: File): Promise<VideoAnalysisResponse> => {
    const formData = new FormData();
    formData.append('video', file);
    
    const response = await apiClient.post<VideoAnalysisResponse>(
      '/analysis/video',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

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

  getHistory: async (page = 1, limit = 20): Promise<HistoryResponse> => {
    const response = await apiClient.get<HistoryResponse>(
      '/analysis/history',
      { params: { page, limit } }
    );
    return response.data;
  },

  getStats: async (): Promise<StatsResponse> => {
    const response = await apiClient.get<StatsResponse>('/analysis/stats');
    return response.data;
  },

  deleteCheck: async (id: number): Promise<void> => {
    await apiClient.delete(`/analysis/history/${id}`);
  },
};
