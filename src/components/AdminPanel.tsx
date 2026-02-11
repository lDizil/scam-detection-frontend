import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { adminApi } from '../api/admin';
import type { User, UserRole } from '../api/auth';
import { Users, Ban, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface AdminPanelProps {
  currentUserId: string;
}

export function AdminPanel({ currentUserId }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const limit = 20;

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers(page, limit);
      setUsers(data.users);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Не удалось загрузить список пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setUpdatingUserId(userId);
      await adminApi.changeUserRole(userId, newRole);
      toast.success('Роль пользователя изменена');
      await loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Не удалось изменить роль');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    if (userId === currentUserId) {
      toast.error('Вы не можете заблокировать самого себя');
      return;
    }
    
    try {
      setUpdatingUserId(userId);
      await adminApi.changeUserStatus(userId, !currentStatus);
      toast.success(currentStatus ? 'Пользователь заблокирован' : 'Пользователь разблокирован');
      await loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Не удалось изменить статус');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Управление пользователями</span>
          </CardTitle>
          <CardDescription>
            Всего пользователей: {total}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user.id}
                    className={user.id === currentUserId ? 'bg-blue-50' : ''}
                  >
                    <TableCell className="font-mono text-sm">
                      {user.id}
                      {user.id === currentUserId && <Badge variant="outline" className="ml-2 text-xs">Вы</Badge>}
                    </TableCell>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                        disabled={updatingUserId === user.id}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Пользователь</SelectItem>
                          <SelectItem value="moderator">Модератор</SelectItem>
                          <SelectItem value="admin">Администратор</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.is_active ? 'default' : 'destructive'}
                        className={user.is_active 
                          ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                          : 'bg-red-100 text-red-800 hover:bg-red-100'
                        }
                      >
                        {user.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Активен
                          </>
                        ) : (
                          <>
                            <Ban className="h-3 w-3 mr-1" />
                            Заблокирован
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleStatusToggle(user.id, user.is_active)}
                        disabled={updatingUserId === user.id || user.id === currentUserId}
                        className={user.is_active 
                          ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400 disabled:text-white disabled:opacity-100' 
                          : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400 disabled:text-white disabled:opacity-100'
                        }
                      >
                        {user.is_active ? 'Заблокировать' : 'Разблокировать'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
