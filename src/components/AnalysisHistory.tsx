import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FileText, Image, Video, Upload, Search, Calendar, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { toast } from "sonner";

interface AnalysisResult {
  id: string;
  type: 'text' | 'image' | 'video' | 'url';
  content: string;
  riskScore: number;
  status: 'safe' | 'suspicious' | 'dangerous';
  details: string[];
  timestamp: string;
  processingTime: number;
}

interface AnalysisHistoryProps {
  userId: string;
}

export function AnalysisHistory({ userId }: AnalysisHistoryProps) {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<AnalysisResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    const savedHistory = localStorage.getItem(`fraudAnalysis_${userId}`);
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory);
      setHistory(parsedHistory);
      setFilteredHistory(parsedHistory);
    }
  }, [userId]);

  useEffect(() => {
    let filtered = history;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    setFilteredHistory(filtered);
  }, [history, searchTerm, statusFilter, typeFilter]);

  const getTypeIcon = (type: string) => {
    const icons = {
      text: FileText,
      image: Image,
      video: Video,
      url: Upload
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      safe: 'bg-green-100 text-green-800',
      suspicious: 'bg-orange-100 text-orange-800',
      dangerous: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || variants.safe;
  };

  const getStatusIcon = (status: string) => {
    return status === 'safe' ? CheckCircle : AlertTriangle;
  };

  const handleDeleteItem = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(`fraudAnalysis_${userId}`, JSON.stringify(updatedHistory));
    toast.success('Запись удалена');
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem(`fraudAnalysis_${userId}`);
    toast.success('История очищена');
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-orange-600';
    return 'text-red-600';
  };

  if (history.length === 0) {
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
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Поиск по контенту..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="safe">Безопасно</SelectItem>
            <SelectItem value="suspicious">Подозрительно</SelectItem>
            <SelectItem value="dangerous">Опасно</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Тип контента" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="text">Текст</SelectItem>
            <SelectItem value="image">Изображение</SelectItem>
            <SelectItem value="video">Видео</SelectItem>
            <SelectItem value="url">URL</SelectItem>
          </SelectContent>
        </Select>

        {history.length > 0 && (
          <Button variant="outline" onClick={clearAllHistory}>
            <Trash2 className="h-4 w-4 mr-2" />
            Очистить все
          </Button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Показано {filteredHistory.length} из {history.length} записей
      </div>

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.map((item) => {
          const TypeIcon = getTypeIcon(item.type);
          const StatusIcon = getStatusIcon(item.status);

          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <TypeIcon className="h-5 w-5 text-gray-500" />
                      <Badge className={getStatusBadge(item.status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {item.status === 'safe' ? 'Безопасно' : 
                         item.status === 'suspicious' ? 'Подозрительно' : 'Опасно'}
                      </Badge>
                      <span className={`text-sm ${getRiskColor(item.riskScore)}`}>
                        Риск: {item.riskScore}/100
                      </span>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">
                        {item.type === 'text' ? 'Текст:' :
                         item.type === 'image' ? 'Изображение:' :
                         item.type === 'video' ? 'Видео:' : 'URL:'}
                      </p>
                      <p className="text-sm break-all bg-gray-50 p-2 rounded">
                        {item.content.length > 100 
                          ? `${item.content.substring(0, 100)}...` 
                          : item.content}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(item.timestamp).toLocaleString('ru-RU')}
                      </span>
                      <span>
                        Время обработки: {(item.processingTime / 1000).toFixed(1)}с
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Analysis Details */}
                {item.details.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm mb-2">Детали анализа:</p>
                    <ul className="space-y-1">
                      {item.details.slice(0, 2).map((detail, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start">
                          <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {detail}
                        </li>
                      ))}
                      {item.details.length > 2 && (
                        <li className="text-xs text-gray-500">
                          и еще {item.details.length - 2} деталей...
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredHistory.length === 0 && history.length > 0 && (
        <div className="text-center py-8">
          <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">
            Не найдено записей, соответствующих фильтрам
          </p>
        </div>
      )}
    </div>
  );
}

