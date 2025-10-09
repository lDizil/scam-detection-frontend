import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Shield, AlertTriangle, CheckCircle, BarChart3, Calendar } from 'lucide-react';

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

interface StatsOverviewProps {
  userId: string;
}

interface StatsData {
  totalAnalyses: number;
  safeCount: number;
  suspiciousCount: number;
  dangerousCount: number;
  averageRiskScore: number;
  averageProcessingTime: number;
  typeBreakdown: { type: string; count: number }[];
  dailyStats: { date: string; count: number; avgRisk: number }[];
}

export function StatsOverview({ userId }: StatsOverviewProps) {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem(`fraudAnalysis_${userId}`);
    if (savedHistory) {
      const history: AnalysisResult[] = JSON.parse(savedHistory);
      calculateStats(history);
    } else {
      setStats({
        totalAnalyses: 0,
        safeCount: 0,
        suspiciousCount: 0,
        dangerousCount: 0,
        averageRiskScore: 0,
        averageProcessingTime: 0,
        typeBreakdown: [],
        dailyStats: []
      });
    }
  }, [userId]);

  const calculateStats = (history: AnalysisResult[]) => {
    const totalAnalyses = history.length;
    const safeCount = history.filter(item => item.status === 'safe').length;
    const suspiciousCount = history.filter(item => item.status === 'suspicious').length;
    const dangerousCount = history.filter(item => item.status === 'dangerous').length;

    const averageRiskScore = totalAnalyses > 0 
      ? Math.round(history.reduce((sum, item) => sum + item.riskScore, 0) / totalAnalyses)
      : 0;

    const averageProcessingTime = totalAnalyses > 0
      ? Math.round(history.reduce((sum, item) => sum + item.processingTime, 0) / totalAnalyses)
      : 0;

    const typeBreakdown = [
      { type: 'Текст', count: history.filter(item => item.type === 'text').length },
      { type: 'Изображения', count: history.filter(item => item.type === 'image').length },
      { type: 'Видео', count: history.filter(item => item.type === 'video').length },
      { type: 'URL', count: history.filter(item => item.type === 'url').length }
    ].filter(item => item.count > 0);

    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayItems = history.filter(item => 
        item.timestamp.split('T')[0] === dateStr
      );

      dailyStats.push({
        date: date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
        count: dayItems.length,
        avgRisk: dayItems.length > 0 
          ? Math.round(dayItems.reduce((sum, item) => sum + item.riskScore, 0) / dayItems.length)
          : 0
      });
    }

    setStats({
      totalAnalyses,
      safeCount,
      suspiciousCount,
      dangerousCount,
      averageRiskScore,
      averageProcessingTime,
      typeBreakdown,
      dailyStats
    });
  };

  if (!stats) {
    return <div>Загрузка статистики...</div>;
  }

  const statusData = [
    { name: 'Безопасно', value: stats.safeCount, color: '#10B981' },
    { name: 'Подозрительно', value: stats.suspiciousCount, color: '#F59E0B' },
    { name: 'Опасно', value: stats.dangerousCount, color: '#EF4444' }
  ].filter(item => item.value > 0);

  const riskLevel = stats.averageRiskScore < 30 ? 'low' : 
                   stats.averageRiskScore < 70 ? 'medium' : 'high';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Всего анализов</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalAnalyses}</div>
            <p className="text-xs text-muted-foreground">
              Общее количество проверок
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Безопасных</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{stats.safeCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalAnalyses > 0 
                ? `${Math.round((stats.safeCount / stats.totalAnalyses) * 100)}% от общего`
                : '0% от общего'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Средний риск</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${
              riskLevel === 'low' ? 'text-green-600' :
              riskLevel === 'medium' ? 'text-orange-600' : 'text-red-600'
            }`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${
              riskLevel === 'low' ? 'text-green-600' :
              riskLevel === 'medium' ? 'text-orange-600' : 'text-red-600'
            }`}>
              {stats.averageRiskScore}/100
            </div>
            <Progress 
              value={stats.averageRiskScore} 
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Среднее время</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{(stats.averageProcessingTime / 1000).toFixed(1)}с</div>
            <p className="text-xs text-muted-foreground">
              Время обработки
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.totalAnalyses > 0 && (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Распределение по статусам</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => {
                        const { name, percent } = props;
                        const entry = statusData.find(item => item.name === name);
                        const value = entry?.value ?? 0;
                        return `${name}: ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`;
                      }}
                      outerRadius={80}
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
              </CardContent>
            </Card>

            {/* Content Types */}
            <Card>
              <CardHeader>
                <CardTitle>Типы контента</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.typeBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Daily Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Активность за последние 7 дней</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="count" fill="#3B82F6" name="Количество анализов" />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="avgRisk" 
                    stroke="#F59E0B" 
                    strokeWidth={2}
                    name="Средний риск"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {stats.totalAnalyses === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg text-gray-600 mb-2">Пока нет данных для статистики</h3>
            <p className="text-gray-500">
              Выполните несколько анализов контента, чтобы увидеть подробную статистику
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
