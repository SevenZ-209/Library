import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'librarian' | 'reader')[];
}

export function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined text-primary animate-spin text-4xl">
          progress_activity
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
