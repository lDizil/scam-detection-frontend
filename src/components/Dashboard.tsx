import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Shield, LogOut, Upload, History, BarChart3, AlertTriangle, User as UserIcon, Users, Activity } from 'lucide-react';
import { SEO } from './common/SEO';
import { ContentAnalyzer } from './ContentAnalyzer';
import { AnalysisHistory } from './AnalysisHistory';
import { StatsOverview } from './StatsOverview';
import { AdminPanel } from './AdminPanel';
import { ModeratorPanel } from './ModeratorPanel';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from '../api/auth';
import { isAdmin, isModerator, getRoleDisplayName } from '../utils/roleUtils';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('analyze');
  const navigate = useNavigate();
  
  const userIsAdmin = isAdmin(user);
  const userIsModerator = isModerator(user);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Панель управления"
        description="Личный кабинет пользователя ScamGuard - анализ контента, история проверок и статистика"
        noindex={true}
      />
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">FraudGuard AI</span>
          </Link>

          
          <div className="flex items-center space-x-4">
            <div className="text-lg flex items-center space-x-3">
              <p className="text-gray-600">
                Добро пожаловать, <span className="font-semibold text-gray-900">
                  {user.username || user.email || 'Пользователь'}
                </span>
              </p>
              <Badge variant={
                user.role === 'admin' ? 'destructive' :
                user.role === 'moderator' ? 'default' :
                'secondary'
              } className={
                user.role === 'admin' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
                user.role === 'moderator' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                ''
              }>
                {getRoleDisplayName(user.role)}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/profile')} 
              className="text-base px-5 py-2 h-auto"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Профиль
            </Button>
            <Button variant="outline" onClick={onLogout} className="text-base px-5 py-2 h-auto">
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
          <h1 className="text-4xl font-bold mb-3">Панель управления</h1>
          <p className="text-gray-600 text-lg">
            Анализируйте контент на предмет мошенничества с помощью нашей ИИ-системы
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${
            userIsAdmin ? 'grid-cols-5 max-w-4xl' :
            userIsModerator ? 'grid-cols-4 max-w-3xl' :
            'grid-cols-3 max-w-xl'
          }`}>
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
            
            {/* Вкладка для модераторов и админов */}
            {userIsModerator && (
              <TabsTrigger value="moderator" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Модерация</span>
              </TabsTrigger>
            )}
            
            {/* Вкладка только для админов */}
            {userIsAdmin && (
              <TabsTrigger value="admin" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Администрирование</span>
              </TabsTrigger>
            )}
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
          
          {/* Панель модератора */}
          {userIsModerator && (
            <TabsContent value="moderator" className="space-y-6">
              <ModeratorPanel />
            </TabsContent>
          )}
          
          {/* Панель администратора */}
          {userIsAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <AdminPanel currentUserId={user.id} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}

