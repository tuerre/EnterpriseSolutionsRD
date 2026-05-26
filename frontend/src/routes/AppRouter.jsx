import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import AccessDenied from '../pages/AccessDenied';
import NotFound from '../pages/NotFound';
import { MODULE_ROUTES } from '../modules/moduleRegistry';
import GenericModulePage from '../modules/GenericModulePage';
import UserPage from '../modules/users/UserPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/acceso-denegado" element={<AccessDenied />} />
      <Route path="/roles" element={<Navigate to="/configuracion-usuarios" replace />} />
      <Route path="/permisos" element={<Navigate to="/configuracion-usuarios" replace />} />
      <Route path="/usuarios" element={<Navigate to="/configuracion-usuarios" replace />} />
      <Route path="/modulos" element={<Navigate to="/dashboard" replace />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          {MODULE_ROUTES.filter((route) => route.name !== 'dashboard').map((route) => (
            <Route
              key={route.path}
              path={route.path.slice(1)}
              element={
                <ProtectedRoute moduleName={route.name === 'user_settings' ? 'users' : route.name}>
                  {route.name === 'user_settings'
                    ? <UserPage />
                    : <GenericModulePage module={route.name} title={route.title} />}
                </ProtectedRoute>
              }
            />
          ))}
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
