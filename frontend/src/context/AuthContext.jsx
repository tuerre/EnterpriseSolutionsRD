import { createContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest, logout as logoutRequest, me as meRequest } from '../api/auth.api';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext(null);

const normalizePermission = (permissions, moduleName) => {
  const permission = Array.isArray(permissions)
    ? permissions.find((item) => item.modules?.name === moduleName || item.module_name === moduleName)
    : null;

  if (!permission) {
    return null;
  }

  return {
    module_id: permission.module_id ?? permission.modules?.module_id ?? null,
    module_name: permission.module_name ?? permission.modules?.name ?? null,
    can_read: Boolean(permission.can_read),
    can_insert: Boolean(permission.can_insert),
    can_update: Boolean(permission.can_update),
    can_delete: Boolean(permission.can_delete)
  };
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token');

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await meRequest();
        const userData = data?.user ?? null;
        const permissionData = Array.isArray(data?.permissions) ? data.permissions : [];

        setToken(storedToken);
        setUser(userData);
        setPermissions(permissionData);
      } catch (error) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setPermissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (username, password) => {
    const { data } = await loginRequest(username, password);
    const sessionToken = data?.token ?? null;

    if (!sessionToken) {
      throw new Error(data?.error || 'No se pudo iniciar sesión');
    }

    localStorage.setItem('token', sessionToken);
    setToken(sessionToken);
    const session = await meRequest();
    setUser(session.data?.user ?? data.user ?? null);
    setPermissions(Array.isArray(session.data?.permissions) ? session.data.permissions : []);
    toast.success('Sesión iniciada exitosamente');
    navigate('/dashboard', { replace: true });
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Ignore logout network errors and clear local state anyway.
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setPermissions([]);
      navigate('/login', { replace: true });
    }
  };

  const hasPermission = (moduleName, action) => {
    const permission = normalizePermission(permissions, moduleName);
    return permission ? Boolean(permission[action]) : false;
  };

  const value = useMemo(() => ({
    user,
    permissions,
    token,
    isLoading,
    login,
    logout,
    hasPermission
  }), [user, permissions, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
