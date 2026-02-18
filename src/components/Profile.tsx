import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Shield, ArrowLeft, User as UserIcon, Mail, AlertTriangle, Trash2, Save } from 'lucide-react';
import { SEO } from './common/SEO';
import { authApi, type User } from '../api/auth';
import { getRoleDisplayName } from '../utils/roleUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
  onLogout: () => void;
}

export function Profile({ user, onUpdate, onLogout }: ProfileProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username || formData.username.length < 3) {
      setError('Имя пользователя должно содержать минимум 3 символа');
      return;
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Введите корректный email адрес');
        return;
      }
    }

    const hasChanges = 
      formData.username !== user.username || 
      formData.email !== (user.email || '');

    if (!hasChanges) {
      setError('Нет изменений для сохранения');
      return;
    }

    setIsLoading(true);

    try {
      const updatedUser = await authApi.updateProfile({
        username: formData.username !== user.username ? formData.username : undefined,
        email: formData.email !== user.email ? (formData.email || undefined) : undefined,
      });

      onUpdate(updatedUser);
      setSuccess('Профиль успешно обновлён');
      setIsEditing(false);
    } catch (error) {
      const err = error as { response?: { data?: { error?: string; message?: string } }; request?: unknown; message?: string };
      let errorMessage = 'Ошибка при обновлении профиля';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.request) {
        errorMessage = 'Не удалось подключиться к серверу. Проверьте подключение.';
      } else if (err.message) {
        errorMessage = `Ошибка: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await authApi.deleteAccount();
      onLogout();
      navigate('/');
    } catch (error) {
      const err = error as { response?: { data?: { error?: string; message?: string } }; request?: unknown; message?: string };
      let errorMessage = 'Ошибка при удалении аккаунта';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.request) {
        errorMessage = 'Не удалось подключиться к серверу. Проверьте подключение.';
      } else if (err.message) {
        errorMessage = `Ошибка: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username,
      email: user.email || '',
    });
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Профиль"
        description="Личный профиль пользователя ScamGuard"
        noindex={true}
      />
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold">FraudGuard AI</span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="text-base px-5 py-2 h-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserIcon className="h-5 w-5 text-blue-600" />
              <span>Информация о профиле</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Роль:</span>
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
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Статус аккаунта:</span>
                <Badge variant={user.is_active ? 'default' : 'destructive'} className={
                  user.is_active ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''
                }>
                  {user.is_active ? 'Активен' : 'Заблокирован'}
                </Badge>
              </div>
            </div>
            
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                <Shield className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Имя пользователя
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="username"
                    className="pl-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData({ ...formData, username: e.target.value });
                      setError('');
                      setSuccess('');
                    }}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email (необязательно)
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="your@email.com"
                    className="pl-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setError('');
                      setSuccess('');
                    }}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {!isEditing ? (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    Редактировать профиль
                  </Button>
                ) : (
                  <>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-500 hover:bg-blue-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      Отмена
                    </Button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mt-6 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Опасная зона</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Удаление аккаунта необратимо. Все ваши данные и история анализов будут удалены.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Удалить аккаунт
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие невозможно отменить. Ваш аккаунт и все связанные данные будут удалены навсегда.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Удалить аккаунт
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
