import type { User, UserRole } from '../api/auth';

export function hasRole(user: User | null, roles: UserRole[]): boolean {
  if (!user || !user.is_active) return false;
  return roles.includes(user.role);
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, ['admin']);
}

export function isModerator(user: User | null): boolean {
  return hasRole(user, ['moderator', 'admin']);
}

export function isUser(user: User | null): boolean {
  return hasRole(user, ['user', 'moderator', 'admin']);
}

export function isActive(user: User | null): boolean {
  return user?.is_active === true;
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    user: 'Пользователь',
    moderator: 'Модератор',
    admin: 'Администратор',
  };
  return roleNames[role] || role;
}
