import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserType } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedTypes: UserType[];
}

export default function ProtectedRoute({ children, allowedTypes }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedTypes.includes(user!.type)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
