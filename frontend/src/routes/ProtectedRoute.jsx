import { Navigate, Outlet } from 'react-router-dom';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../hooks/useAuth';
import AccessDenied from '../pages/AccessDenied';

export default function ProtectedRoute({ moduleName, children }) {
  const { user, isLoading, hasPermission } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Spinner size={24} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (moduleName && !hasPermission(moduleName, 'can_read')) {
    return <AccessDenied />;
  }

  return children || <Outlet />;
}
