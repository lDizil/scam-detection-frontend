import { Navigate } from 'react-router-dom';
import type { User, UserRole } from '../api/auth';
import { hasRole } from '../utils/roleUtils';

interface ProtectedRouteProps {
  user: User | null;
  requiredRoles?: UserRole[];
  children: React.ReactNode;
}

export function ProtectedRoute({ user, requiredRoles, children }: ProtectedRouteProps) {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!user.is_active) {
    return <Navigate to="/auth?blocked=true" replace />;
  }

  if (requiredRoles && !hasRole(user, requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
