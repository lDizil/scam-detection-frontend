import { describe, it, expect } from 'vitest';
import {
  hasRole,
  isAdmin,
  isModerator,
  isUser,
  isActive,
  getRoleDisplayName,
} from './roleUtils';
import { mockUsers } from '../test/testUtils';

describe('roleUtils', () => {
  describe('hasRole', () => {
    it('должен возвращать true если у пользователя есть требуемая роль', () => {
      expect(hasRole(mockUsers.admin, ['admin'])).toBe(true);
      expect(hasRole(mockUsers.moderator, ['moderator'])).toBe(true);
      expect(hasRole(mockUsers.user, ['user'])).toBe(true);
    });

    it('должен возвращать false если у пользователя нет требуемой роли', () => {
      expect(hasRole(mockUsers.user, ['admin'])).toBe(false);
      expect(hasRole(mockUsers.user, ['moderator'])).toBe(false);
      expect(hasRole(mockUsers.moderator, ['admin'])).toBe(false);
    });

    it('должен проверять несколько ролей', () => {
      expect(hasRole(mockUsers.admin, ['admin', 'moderator'])).toBe(true);
      expect(hasRole(mockUsers.moderator, ['admin', 'moderator'])).toBe(true);
      expect(hasRole(mockUsers.user, ['admin', 'moderator'])).toBe(false);
    });

    it('должен возвращать false для заблокированного пользователя', () => {
      expect(hasRole(mockUsers.blockedUser, ['user'])).toBe(false);
    });

    it('должен возвращать false для null пользователя', () => {
      expect(hasRole(null, ['user'])).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('должен возвращать true только для администратора', () => {
      expect(isAdmin(mockUsers.admin)).toBe(true);
      expect(isAdmin(mockUsers.moderator)).toBe(false);
      expect(isAdmin(mockUsers.user)).toBe(false);
      expect(isAdmin(null)).toBe(false);
    });
  });

  describe('isModerator', () => {
    it('должен возвращать true для модератора и администратора', () => {
      expect(isModerator(mockUsers.admin)).toBe(true);
      expect(isModerator(mockUsers.moderator)).toBe(true);
      expect(isModerator(mockUsers.user)).toBe(false);
      expect(isModerator(null)).toBe(false);
    });
  });

  describe('isUser', () => {
    it('должен возвращать true для всех ролей', () => {
      expect(isUser(mockUsers.admin)).toBe(true);
      expect(isUser(mockUsers.moderator)).toBe(true);
      expect(isUser(mockUsers.user)).toBe(true);
      expect(isUser(null)).toBe(false);
    });
  });

  describe('isActive', () => {
    it('должен проверять активность пользователя', () => {
      expect(isActive(mockUsers.user)).toBe(true);
      expect(isActive(mockUsers.blockedUser)).toBe(false);
      expect(isActive(null)).toBe(false);
    });
  });

  describe('getRoleDisplayName', () => {
    it('должен возвращать отображаемое имя роли', () => {
      expect(getRoleDisplayName('admin')).toBe('Администратор');
      expect(getRoleDisplayName('moderator')).toBe('Модератор');
      expect(getRoleDisplayName('user')).toBe('Пользователь');
    });

    it('должен возвращать саму роль для неизвестной роли', () => {
      expect(getRoleDisplayName('unknown' as any)).toBe('unknown');
    });
  });
});
