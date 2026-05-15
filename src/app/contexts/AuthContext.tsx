import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useDataStore } from './DataStoreContext';

export type UserRole = 'ADMIN' | 'VENDEDOR' | 'BODEGUERO' | 'READONLY';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  permisos: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { systemUsers = [], systemRoles = [] } = useDataStore() || {};
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        // Solo restaurar la sesión si el dominio es correcto
        if (parsedUser.email?.toLowerCase().endsWith('@empresa.com')) {
          setToken(savedToken);
          setUser(parsedUser);
        } else {
          // Limpiar si era una cuenta inválida (ej: gmail)
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    } catch (e) {
      console.error("Error al cargar sesión:", e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Limpiar estado previo
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const normalizedUsername = username.toLowerCase().trim();

      if (!normalizedUsername) {
        throw new Error('Ingrese un nombre de usuario');
      }

      // Buscar por username (insensible a mayúsculas) y contraseña
      const foundUser = systemUsers.find(u =>
        u.username.toLowerCase() === normalizedUsername &&
        u.password === password
      );

      if (!foundUser) {
        throw new Error('Usuario no encontrado o contraseña incorrecta');
      }

      if (foundUser.estado !== 'Activo') {
        throw new Error('Cuenta bloqueada. Contacte al administrador.');
      }

      const role = systemRoles.find(r => r.id === foundUser.rolId);

      const allPermissions: string[] = [];
      if (role) {
        Object.entries(role.permisos).forEach(([modulo, perms]) => {
          perms.forEach(p => allPermissions.push(`${modulo}.${p}`));
        });
      }

      const userToStore: User = {
        id: foundUser.id,
        nombre: foundUser.username,
        email: foundUser.email,
        rol: (role?.nombre.toUpperCase() || 'READONLY') as UserRole,
        permisos: allPermissions
      };

      const newToken = 'mock-jwt-token-' + Date.now();
      setToken(newToken);
      setUser(userToStore);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userToStore));
    } catch (error) {
      throw error instanceof Error ? error : new Error('Error al iniciar sesión');
    }
  };
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Buscar al usuario y su rol actual en tiempo real
    const dbUser = systemUsers.find(u => u.id === user.id);
    if (!dbUser) return false;

    const dbRole = systemRoles.find(r => r.id === dbUser.rolId);
    if (!dbRole) return false;

    // El permiso viene como 'modulo.accion' (ej: 'productos.crear')
    const [modulo, accion] = permission.split('.');
    const modulePerms = dbRole.permisos[modulo] || [];
    
    return modulePerms.includes(accion as any);
  };

  const hasRole = (rolesToCheck: UserRole[]): boolean => {
    if (!user) return false;
    
    const dbUser = systemUsers.find(u => u.id === user.id);
    if (!dbUser) return false;

    const dbRole = systemRoles.find(r => r.id === dbUser.rolId);
    if (!dbRole) return false;

    const currentRoleName = dbRole.nombre.toUpperCase() as UserRole;
    return rolesToCheck.includes(currentRoleName);
  };

  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh', 
        width: '100vw', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#0a0118',
        color: 'white',
        fontFamily: 'sans-serif'
      }}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-[#d946ef] border-t-transparent rounded-full"></div>
          <p className="font-bold tracking-widest uppercase text-xs opacity-50">Cargando Sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        hasPermission,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
