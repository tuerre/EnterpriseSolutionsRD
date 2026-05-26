import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Warehouse,
  ShoppingCart,
  BarChart3,
  UserCircle,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/clientes', label: 'Clientes', icon: Users },
  { path: '/productos', label: 'Productos', icon: Package },
  { path: '/inventario', label: 'Inventario', icon: Warehouse, roles: ['ADMIN', 'BODEGUERO'] },
  { path: '/ventas', label: 'Ventas', icon: ShoppingCart, roles: ['ADMIN', 'VENDEDOR'] },
  { path: '/empleados', label: 'Empleados', icon: UserCircle, roles: ['ADMIN'] },
  { path: '/reportes', label: 'Reportes', icon: BarChart3 },
  { path: '/admin', label: 'Administración', icon: Settings, roles: ['ADMIN'] },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout, hasRole } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    return hasRole(item.roles as any);
  });

  return (
    <div className="w-72 glass border-r border-white/10 flex flex-col h-full backdrop-blur-2xl">
      {/* Logo y título */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10b981] to-[#34d399] flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black gradient-text tracking-tight">
              Enterprise Solutions
            </h1>
            <p className="text-xs text-[#94a3b8] font-medium">
              Business Management
            </p>
          </div>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="p-4 border-b border-white/10">
        <div className="glass glass-hover rounded-xl p-3 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#10b981] to-[#6ee7b7] flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {user?.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">
                {user?.nombre}
              </p>
              <p className="text-xs text-[#94a3b8] font-medium">
                {user?.rol}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1.5">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative
                    ${isActive
                      ? 'bg-[rgba(16,185,129,0.2)] text-white border-l-4 border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                      : 'text-[#94a3b8] hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-[#10b981]' : 'group-hover:text-[#10b981]'}`} />
                  <span className="text-sm font-semibold">{item.label}</span>
                  {isActive && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="group flex items-center gap-3 px-4 py-3 w-full rounded-xl text-[#94a3b8] hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          <span className="text-sm font-semibold">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
