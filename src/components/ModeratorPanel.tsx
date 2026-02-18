import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { moderatorApi } from '../api/moderator';
import type { HistoryCheck } from '../api/content';
import { Activity, ChevronLeft, ChevronRight, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GlobalStats {
  total_analyses: number;
  safe_count: number;
  suspicious_count: number;
  dangerous_count: number;
  average_risk_score: number;
}

export function ModeratorPanel() {
  const [checks, setChecks] = useState<HistoryCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const limit = 20;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [checksData, statsData] = await Promise.all([
        moderatorApi.getAllChecks(page, limit),
        moderatorApi.getGlobalStats(),
      ]);
      setChecks(checksData.checks);
      setTotal(checksData.total);
      setStats(statsData);
    } catch (error) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getDangerBadge = (level: string) => {
    const normalizedLevel = level.toLowerCase();
    
    if (normalizedLevel === 'safe' || normalizedLevel === 'low' || normalizedLevel === 'безопасно') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        <ShieldCheck className="h-3 w-3 mr-1" />
        Безопасно
      </Badge>;
    }
    
    if (normalizedLevel === 'medium' || normalizedLevel === 'suspicious' || normalizedLevel === 'подозрительно') {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Подозрительно
      </Badge>;
    }
    
    if (normalizedLevel === 'high') {
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Высокий риск
      </Badge>;
    }
    
    if (normalizedLevel === 'critical' || normalizedLevel === 'dangerous' || normalizedLevel === 'опасно') {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
        <XCircle className="h-3 w-3 mr-1" />
        Опасно
      </Badge>;
    }
    
    return <Badge variant="secondary">{level}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU');
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && checks.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Глобальная статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Всего проверок
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_analyses || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <ShieldCheck className="h-4 w-4 mr-1 text-green-600" />
                Безопасных
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.safe_count || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1 text-yellow-600" />
                Подозрительных
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.suspicious_count || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <XCircle className="h-4 w-4 mr-1 text-red-600" />
                Опасных
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.dangerous_count || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Таблица всех проверок */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Все проверки пользователей</span>
          </CardTitle>
          <CardDescription>
            Всего проверок в системе: {total}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Заголовок</TableHead>
                  <TableHead>Тип</TableHead>
                  <TableHead>Уровень опасности</TableHead>
                  <TableHead>Счёт</TableHead>
                  <TableHead>Дата</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Проверок не найдено
                    </TableCell>
                  </TableRow>
                ) : (
                  checks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell className="font-mono text-sm">{check.id}</TableCell>
                      <TableCell className="text-sm">
                        {check.username || `ID: ${check.user_id || '-'}`}
                      </TableCell>
                      <TableCell className="max-w-xs truncate font-medium">
                        {check.title || 'Без названия'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{check.content_type}</Badge>
                      </TableCell>
                      <TableCell>{getDangerBadge(check.danger_level)}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          check.danger_score >= 70 ? 'text-red-600' :
                          check.danger_score >= 40 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {check.danger_score.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(check.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Страница {page} из {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Назад
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                >
                  Вперёд
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
