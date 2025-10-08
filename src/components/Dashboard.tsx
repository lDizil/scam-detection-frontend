import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Shield, LogOut, Upload, History, BarChart3, AlertTriangle, Home } from 'lucide-react';
import { ContentAnalyzer } from './ContentAnalyzer';
import { AnalysisHistory } from './AnalysisHistory';
import { StatsOverview } from './StatsOverview';

interface User {
  id: string;
  email: string;
  name: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('analyze');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl">FraudGuard AI</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => window.location.href = '/'}>
              <Home className="h-4 w-4 mr-2" />
              На главную
            </Button>
            <div className="text-sm">
              <p className="text-gray-600">Добро пожаловать,</p>
              <p>{user.name}</p>
            </div>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Панель управления</h1>
          <p className="text-gray-600">
            Анализируйте контент на предмет мошенничества с помощью нашей ИИ-системы
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="analyze" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Анализ</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>История</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Статистика</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span>Анализ контента</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContentAnalyzer userId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-blue-500" />
                  <span>История анализов</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnalysisHistory userId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <StatsOverview userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

