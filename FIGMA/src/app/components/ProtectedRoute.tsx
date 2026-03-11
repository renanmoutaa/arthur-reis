import { Navigate } from 'react-router';
import { authUtils } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  if (!authUtils.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !authUtils.isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
