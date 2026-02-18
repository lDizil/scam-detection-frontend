import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/testUtils';
import { ProtectedRoute } from './ProtectedRoute';
import { mockUsers } from '../test/testUtils';
import { Route, Routes } from 'react-router-dom';

const renderWithRoutes = (ui: React.ReactElement) => {
  return render(
    <Routes>
      <Route path="/" element={ui} />
      <Route path="/auth" element={<div>Auth Page</div>} />
      <Route path="/dashboard" element={<div>Dashboard</div>} />
    </Routes>
  );
};

describe('ProtectedRoute', () => {
  it('должен рендерить детей для авторизованного пользователя', () => {
    renderWithRoutes(
      <ProtectedRoute user={mockUsers.user}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('должен перенаправлять на /auth для неавторизованного пользователя', () => {
    renderWithRoutes(
      <ProtectedRoute user={null}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Auth Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('должен перенаправлять на /auth для заблокированного пользователя', () => {
    renderWithRoutes(
      <ProtectedRoute user={mockUsers.blockedUser}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Auth Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('должен проверять требуемые роли', () => {
    const { unmount } = renderWithRoutes(
      <ProtectedRoute user={mockUsers.admin} requiredRoles={['admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    unmount();

    renderWithRoutes(
      <ProtectedRoute user={mockUsers.user} requiredRoles={['admin']}>
        <div>Admin Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('должен разрешать доступ если роль пользователя в списке разрешенных', () => {
    renderWithRoutes(
      <ProtectedRoute user={mockUsers.moderator} requiredRoles={['admin', 'moderator']}>
        <div>Moderator Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Moderator Content')).toBeInTheDocument();
  });

  it('должен рендерить детей если роли не требуются', () => {
    renderWithRoutes(
      <ProtectedRoute user={mockUsers.user}>
        <div>User Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('User Content')).toBeInTheDocument();
  });
});
