import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { contentApi, type HistoryCheck } from '../api/content';

interface AnalysisHistoryProps {
  userId: string;
}

export function AnalysisHistory({ }: AnalysisHistoryProps) {
  const [history, setHistory] = useState<HistoryCheck[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryCheck[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const loadHistory = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await contentApi.getHistory(page, limit);
      setHistory(response.checks);
      setFilteredHistory(response.checks);
      setTotal(response.total);
      setCurrentPage(response.page);
      setTotalPages(Math.ceil(response.total / limit));
    } catch (error: any) {
      console.error('Failed to load history:', error);
      if (error.response?.status === 401) {
        toast.error('Необходима авторизация');
      } else if (error.request) {
        toast.error('Не удалось подключиться к серверу');
      } else {
        toast.error('Ошибка при загрузке истории');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(1);
  }, []);

  useEffect(() => {
    let filtered = history;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.danger_level === statusFilter);
    }
    setFilteredHistory(filtered);
  }, [history, statusFilter]);

  const getStatusBadge = (dangerLevel: string, dangerScore: number) => {
    const score = dangerScore > 1 ? dangerScore : dangerScore * 100;
    if (score <= 1) {
      return 'bg-green-600 text-white border-2 border-green-700 font-bold shadow-md';
    }
    const variants: Record<string, string> = {
      safe: 'bg-green-100 text-green-800',
      low: 'bg-green-100 text-green-800',
      legitimate: 'bg-green-100 text-green-800',
      medium: 'bg-orange-100 text-orange-800',
      suspicious: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
      critical: 'bg-red-600 text-white border-2 border-red-700 font-bold shadow-md',
      phishing: 'bg-red-100 text-red-800',
      dangerous: 'bg-red-100 text-red-800'
    };
    return variants[dangerLevel] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (dangerLevel: string, dangerScore: number) => {
    const score = dangerScore > 1 ? dangerScore : dangerScore * 100;
    if (score <= 1) {
      return CheckCircle;
    }
    if (dangerLevel === 'safe' || dangerLevel === 'low' || dangerLevel === 'legitimate') {
      return CheckCircle;
    }
    return AlertTriangle;
  };

  const getStatusText = (dangerLevel: string, dangerScore: number) => {
    const score = dangerScore > 1 ? dangerScore : dangerScore * 100;
    if (score <= 1) {
      return 'Критическая удача';
    }
    const statusTexts: Record<string, string> = {
      safe: 'Безопасно',
      low: 'Низкий риск',
      legitimate: 'Легитимный',
      medium: 'Средний риск',
      suspicious: 'Подозрительно',
      high: 'Высокий риск',
      critical: 'Критическая неудача',
      phishing: 'Фишинг',
      dangerous: 'Опасно'
    };
    return statusTexts[dangerLevel] || dangerLevel;
  };

  const getRiskBadgeColor = (dangerScore: number, contentType?: string, dangerLevel?: string) => {
    let score = dangerScore > 1 ? dangerScore : dangerScore * 100;
    
    if (contentType === 'url' && (dangerLevel === 'safe' || dangerLevel === 'low' || dangerLevel === 'legitimate')) {
      score = 100 - score;
    }
    
    if (score < 30) return 'bg-green-100 text-green-700 border border-green-300';
    if (score < 70) return 'bg-orange-100 text-orange-700 border border-orange-300';
    return 'bg-red-100 text-red-700 border border-red-300';
  };

  const formatDangerScore = (score: number, contentType?: string, dangerLevel?: string) => {
    let finalScore = score > 1 ? score : score * 100;
    
    if (contentType === 'url' && (dangerLevel === 'safe' || dangerLevel === 'low' || dangerLevel === 'legitimate')) {
      finalScore = 100 - finalScore;
    }
    
    return finalScore.toFixed(2);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadHistory(page);
    }
  };

  if (isLoading && history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Загрузка истории...</p>
      </div>
    );
  }

  if (!isLoading && history.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg text-gray-600 mb-2">История анализов пуста</h3>
        <p className="text-gray-500">
          Начните анализировать контент, чтобы увидеть результаты здесь
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Фильтры с повышенным z-index для правильного наложения dropdown */}
      <div className="flex flex-wrap gap-4 items-center relative z-10">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-white">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-white">
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="low">Низкий риск</SelectItem>
            <SelectItem value="medium">Средний риск</SelectItem>
            <SelectItem value="high">Высокий риск</SelectItem>
            <SelectItem value="critical">Критическая неудача</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-sm text-gray-600">
          Всего записей: {total}
        </div>
      </div>

      <div className="space-y-4">
        {filteredHistory.map((item) => {
          const StatusIcon = getStatusIcon(item.danger_level, item.danger_score);
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3 flex-wrap gap-y-2">
                      {item.content_type === 'url' ? (
                        <LinkIcon className="h-5 w-5 text-blue-500" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-gray-500" />
                      )}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          item.content_type === 'url' 
                            ? 'bg-blue-50 text-blue-700 border-blue-300' 
                            : 'bg-gray-50 text-gray-700 border-gray-300'
                        }`}
                      >
                        {item.content_type === 'url' ? 'URL' : 'Текст'}
                      </Badge>
                      <Badge className={getStatusBadge(item.danger_level, item.danger_score)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {getStatusText(item.danger_level, item.danger_score)}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Риск:</span>
                        <span className={`px-2.5 py-1 rounded-md font-semibold text-sm ${getRiskBadgeColor(item.danger_score, item.content_type, item.danger_level)}`}>
                          {formatDangerScore(item.danger_score, item.content_type, item.danger_level)}%
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className={`text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200 ${
                        item.content_type === 'url' ? 'break-all' : ''
                      }`}>
                        {item.content.length > 200 
                          ? item.content.substring(0, 200) + '...' 
                          : item.content
                        }
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(item.created_at).toLocaleString('ru-RU')}
                      </span>
                      <span>
                        Время обработки: {(item.processing_time_ms / 1000).toFixed(3)}с
                      </span>
                      <span>ID: #{item.id}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button 
                  key={pageNum} 
                  variant={currentPage === pageNum ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => handlePageChange(pageNum)} 
                  disabled={isLoading} 
                  className="w-10"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {filteredHistory.length === 0 && history.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Не найдено записей, соответствующих фильтрам</p>
        </div>
      )}
    </div>
  );
}
