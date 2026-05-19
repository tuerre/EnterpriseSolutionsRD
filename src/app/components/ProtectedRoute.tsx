import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: UserRole[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !hasRole(roles)) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0118]">
        <div className="text-center glass rounded-3xl p-12 border border-white/20 max-w-md animate-fadeIn">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.4)]">
            <ShieldAlert className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black gradient-text mb-3 tracking-tight">Acceso Denegado</h2>
          <p className="text-[#94a3b8] font-medium">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
