import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOwner?: boolean;
}

export default function ProtectedRoute({ children, requireOwner = false }: ProtectedRouteProps) {
  const { user, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireOwner && user.role !== 'owner') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
