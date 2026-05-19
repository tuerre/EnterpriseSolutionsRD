import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar token y usuario del localStorage al iniciar
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // TODO: Reemplazar con llamada real al backend
      // const response = await axios.post('/api/auth/login', { email, password });

      // Mock de respuesta del servidor
      const mockResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: '1',
          nombre: 'Usuario Demo',
          email: email,
          rol: 'ADMIN' as UserRole,
          permisos: ['clientes.ver', 'clientes.crear', 'productos.ver', 'ventas.crear', 'reportes.ver']
        }
      };

      setToken(mockResponse.token);
      setUser(mockResponse.user);

      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));
    } catch (error) {
      console.error('Error en login:', error);
      throw new Error('Credenciales inválidas');
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
    return user.permisos.includes(permission);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.rol);
  };

  if (isLoading) {
    return <div className="size-full flex items-center justify-center">Cargando...</div>;
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
