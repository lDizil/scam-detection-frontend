import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart3, CheckCircle, AlertTriangle, Clock, TrendingUp, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { contentApi } from '../api/content';

interface StatsData {
  total_analyses: number;
  safe_count: number;
  suspicious_count: number;
  dangerous_count: number;
  average_risk_score: number;
  average_processing_time: number;
}

export function StatsOverview() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await contentApi.getStats();
      setStats(response);
    } catch (error) {
      const err = error as { response?: { status?: number }; request?: unknown };
      console.error('Failed to load stats:', error);
      if (err.response?.status === 401) {
        toast.error('Необходима авторизация');
      } else if (err.request) {
        toast.error('Не удалось подключиться к серверу');
      } else {
        toast.error('Ошибка при загрузке статистики');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Загрузка статистики...</p>
      </div>
    );
  }

  if (!stats || stats.total_analyses === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg text-gray-600 mb-2">Пока нет данных для статистики</h3>
            <p className="text-gray-500">
              Выполните несколько анализов контента, чтобы увидеть подробную статистику
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const riskScore = Math.round(stats.average_risk_score * 100);
  const riskLevel = riskScore < 30 ? 'low' : riskScore < 70 ? 'medium' : 'high';

  const statusData = [
    { name: 'Безопасно', value: stats.safe_count, color: '#10B981' },
    { name: 'Подозрительно', value: stats.suspicious_count, color: '#F59E0B' },
    { name: 'Опасно', value: stats.dangerous_count, color: '#EF4444' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего анализов</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total_analyses}</div>
            <p className="text-xs text-gray-500 mt-1">
              Общее количество проверок
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Уровень защиты</CardTitle>
            <Shield className={`h-4 w-4 ${
              riskLevel === 'low' ? 'text-green-600' :
              riskLevel === 'medium' ? 'text-orange-600' : 'text-red-600'
            }`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              riskLevel === 'low' ? 'text-green-600' :
              riskLevel === 'medium' ? 'text-orange-600' : 'text-red-600'
            }`}>
              {Math.round(100 - riskScore)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {riskLevel === 'low' ? 'Высокий уровень' : riskLevel === 'medium' ? 'Средний уровень' : 'Требует внимания'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Обнаружено угроз</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats.dangerous_count + stats.suspicious_count}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.dangerous_count} опасных, {stats.suspicious_count} подозрительных
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Среднее время</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(stats.average_processing_time / 1000).toFixed(2)}с</div>
            <p className="text-xs text-gray-500 mt-1">
              Обработка запроса
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Детальная статистика по угрозам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => {
                      const data = entry as unknown as { name: string; value: number };
                      const percent = ((data.value / stats.total_analyses) * 100).toFixed(0);
                      return `${data.name}: ${data.value} (${percent}%)`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex flex-col justify-center space-y-4">
              {stats.safe_count > 0 && (
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Безопасно</p>
                      <p className="text-sm text-green-700">{stats.safe_count} {stats.safe_count === 1 ? 'проверка' : stats.safe_count < 5 ? 'проверки' : 'проверок'}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {Math.round((stats.safe_count / stats.total_analyses) * 100)}%
                  </span>
                </div>
              )}

              {stats.suspicious_count > 0 && (
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                    <div>
                      <p className="font-semibold text-orange-900">Подозрительно</p>
                      <p className="text-sm text-orange-700">{stats.suspicious_count} {stats.suspicious_count === 1 ? 'проверка' : stats.suspicious_count < 5 ? 'проверки' : 'проверок'}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">
                    {Math.round((stats.suspicious_count / stats.total_analyses) * 100)}%
                  </span>
                </div>
              )}

              {stats.dangerous_count > 0 && (
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-900">Опасно</p>
                      <p className="text-sm text-red-700">{stats.dangerous_count} {stats.dangerous_count === 1 ? 'проверка' : stats.dangerous_count < 5 ? 'проверки' : 'проверок'}</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-red-600">
                    {Math.round((stats.dangerous_count / stats.total_analyses) * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Clock className="h-5 w-5 text-blue-600" />
              Производительность системы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Среднее время обработки</p>
                <p className="text-5xl font-bold text-blue-600">
                  {(stats.average_processing_time / 1000).toFixed(3)}
                  <span className="text-2xl text-gray-500">с</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.average_processing_time < 50 ? '⚡ Очень быстро' : 
                   stats.average_processing_time < 100 ? '✓ Быстро' : 
                   stats.average_processing_time < 200 ? '→ Средне' : '⏱ Медленно'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Обработано</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total_analyses}</p>
                  <p className="text-xs text-gray-500">запросов</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">Общее время</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {((stats.average_processing_time * stats.total_analyses) / 1000).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">секунд</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <AlertTriangle className="h-5 w-5 text-purple-600" />
              Анализ безопасности
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Средний уровень риска</p>
                <p className={`text-5xl font-bold ${
                  riskLevel === 'low' ? 'text-green-600' :
                  riskLevel === 'medium' ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {riskScore}%
                </p>
                <Progress value={riskScore} className="h-2 mt-3" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Безопасность</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(100 - riskScore)}%
                  </p>
                  <p className="text-xs text-gray-500">уровень</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-xs text-gray-600 mb-1">Найдено угроз</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.dangerous_count + stats.suspicious_count}
                  </p>
                  <p className="text-xs text-gray-500">штук</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
