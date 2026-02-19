import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Link as LinkIcon, MessageSquare, Trash2, Image as ImageIcon, Video as VideoIcon, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { contentApi, type HistoryCheck, type CheckFilters } from '../api/content';
import { getFileUrl } from '../utils/fileUtils';

export function AnalysisHistory() {
  const [history, setHistory] = useState<HistoryCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<CheckFilters>({
    page: 1,
    limit: 20,
    danger_level: undefined,
    check_type: undefined,
    status: undefined,
    search: '',
  });
  const [searchInput, setSearchInput] = useState('');

  const loadHistory = useCallback(async (newFilters: CheckFilters) => {
    setIsLoading(true);
    try {
      const response = await contentApi.getHistory(newFilters);
      setHistory(response.checks);
      setTotal(response.total);
      setCurrentPage(response.page);
      setTotalPages(Math.ceil(response.total / (newFilters.limit || 20)));
    } catch (error) {
      const err = error as { response?: { status?: number }; request?: unknown };
      console.error('Failed to load history:', error);
      if (err.response?.status === 401) {
        toast.error('Необходима авторизация');
      } else if (err.request) {
        toast.error('Не удалось подключиться к серверу');
      } else {
        toast.error('Ошибка при загрузке истории');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadHistory(filters);
  }, [filters, loadHistory]);

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

  const getRiskBadgeColor = (dangerScore: number) => {
    const score = dangerScore > 1 ? dangerScore : dangerScore * 100;
    if (score < 30) return 'bg-green-100 text-green-700 border border-green-300';
    if (score < 70) return 'bg-orange-100 text-orange-700 border border-orange-300';
    return 'bg-red-100 text-red-700 border border-red-300';
  };

  const formatDangerScore = (score: number) => {
    return score > 1 ? score.toFixed(2) : (score * 100).toFixed(2);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setFilters(prev => ({ ...prev, page }));
    }
  };

  const handleFilterChange = (key: keyof CheckFilters, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? undefined : value, page: 1 }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      page: 1,
      limit: 20,
      danger_level: undefined,
      check_type: undefined,
      status: undefined,
      search: '',
    });
  };

  const hasActiveFilters = !!(filters.danger_level || filters.check_type || filters.status || searchInput);

  const handleDelete = async (id: number) => {
    try {
      await contentApi.deleteCheck(id);
      toast.success('Запись удалена');
      loadHistory(filters);
    } catch (error) {
      const err = error as { response?: { status?: number } };
      console.error('Failed to delete check:', error);
      if (err.response?.status === 401) {
        toast.error('Необходима авторизация');
      } else if (err.response?.status === 403) {
        toast.error('Нет доступа к этой записи');
      } else if (err.response?.status === 500) {
        toast.error('Ошибка сервера при удалении', {
          description: 'Попробуйте позже или обратитесь к администратору'
        });
      } else {
        toast.error('Ошибка при удалении');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Строка поиска */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по содержимому..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Фильтры в одну строку */}
            <div className="flex flex-wrap gap-3 items-center">
              <Select 
                value={filters.danger_level || 'all'} 
                onValueChange={(value) => handleFilterChange('danger_level', value)}
              >
                <SelectTrigger className="w-48 bg-white">
                  <SelectValue placeholder="Уровень опасности" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white">
                  <SelectItem value="all">Все уровни</SelectItem>
                  <SelectItem value="low">Низкий риск</SelectItem>
                  <SelectItem value="medium">Средний риск</SelectItem>
                  <SelectItem value="high">Высокий риск</SelectItem>
                  <SelectItem value="critical">Критический</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.check_type || 'all'} 
                onValueChange={(value) => handleFilterChange('check_type', value)}
              >
                <SelectTrigger className="w-48 bg-white">
                  <SelectValue placeholder="Тип контента" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white">
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="text">📝 Текст</SelectItem>
                  <SelectItem value="url">🔗 URL</SelectItem>
                  <SelectItem value="image">🖼️ Изображение</SelectItem>
                  <SelectItem value="video">🎬 Видео</SelectItem>
                  <SelectItem value="batch">📦 Пакет</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.status || 'all'} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-48 bg-white">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white">
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="completed">Завершено</SelectItem>
                  <SelectItem value="processing">Обработка</SelectItem>
                  <SelectItem value="failed">Ошибка</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="h-4 w-4 mr-1" />
                  Сбросить фильтры
                </Button>
              )}

              <div className="ml-auto text-sm text-gray-600">
                Всего записей: {total}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading && history.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка истории...</p>
        </div>
      ) : !isLoading && history.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          {hasActiveFilters ? (
            <>
              <h3 className="text-lg text-gray-600 mb-2">Нет результатов по выбранным фильтрам</h3>
              <p className="text-gray-500 mb-4">
                Попробуйте изменить параметры фильтрации
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-4 w-4 mr-1" />
                Сбросить фильтры
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg text-gray-600 mb-2">История анализов пуста</h3>
              <p className="text-gray-500">
                Начните анализировать контент, чтобы увидеть результаты здесь
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => {
          const StatusIcon = getStatusIcon(item.danger_level, item.danger_score);
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3 flex-wrap gap-y-2">
                      {item.content_type === 'url' ? (
                        <LinkIcon className="h-5 w-5 text-blue-500" />
                      ) : item.content_type === 'image' ? (
                        <ImageIcon className="h-5 w-5 text-purple-500" />
                      ) : item.content_type === 'video' ? (
                        <VideoIcon className="h-5 w-5 text-pink-500" />
                      ) : (
                        <MessageSquare className="h-5 w-5 text-green-500" />
                      )}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          item.content_type === 'url' 
                            ? 'bg-blue-50 text-blue-700 border-blue-300' 
                            : item.content_type === 'image'
                            ? 'bg-purple-50 text-purple-700 border-purple-300'
                            : item.content_type === 'video'
                            ? 'bg-pink-50 text-pink-700 border-pink-300'
                            : 'bg-green-50 text-green-700 border-green-300'
                        }`}
                      >
                        {item.content_type === 'url' ? '🔗 URL' : item.content_type === 'image' ? '🖼️ Изображение' : item.content_type === 'video' ? '🎬 Видео' : '📝 Текст'}
                      </Badge>
                      <Badge className={getStatusBadge(item.danger_level, item.danger_score)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {getStatusText(item.danger_level, item.danger_score)}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Риск:</span>
                        <span className={`px-2.5 py-1 rounded-md font-semibold text-sm ${getRiskBadgeColor(item.danger_score)}`}>
                          {formatDangerScore(item.danger_score)}%
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
                      
                      {item.file_path && item.content_type === 'image' && (
                        <div className="mt-3">
                          <img 
                            src={getFileUrl(item.file_path)} 
                            alt="Проанализированное изображение" 
                            className="max-w-full max-h-64 rounded-lg border-2 border-gray-300 object-contain shadow-sm"
                            onError={(e) => {
                              console.error('Failed to load image:', getFileUrl(item.file_path));
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                                  <p>⚠️ Изображение недоступно</p>
                                  <p class="text-xs mt-1 text-yellow-600">Файл: ${item.file_path}</p>
                                </div>`;
                              }
                            }}
                          />
                        </div>
                      )}
                      
                      {item.file_path && item.content_type === 'video' && (
                        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800 mb-2">📹 Видео не сохраняется в системе</p>
                          <p className="text-xs text-blue-600">Анализ выполнен по транскрипции аудио</p>
                          <p className="text-xs text-gray-500 mt-1">Файл: {item.file_path}</p>
                        </div>
                      )}
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
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="ml-4 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    title="Удалить запись"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}

      {totalPages > 1 && !isLoading && history.length > 0 && (
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
    </div>
  );
}
