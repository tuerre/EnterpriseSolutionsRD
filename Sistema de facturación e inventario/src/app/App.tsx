import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataStoreProvider } from './contexts/DataStoreContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Clientes } from './pages/Clientes';
import { Productos } from './pages/Productos';
import { Inventario } from './pages/Inventario';
import { Ventas } from './pages/Ventas';
import { Empleados } from './pages/Empleados';
import { Reportes } from './pages/Reportes';
import { Admin } from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataStoreProvider>
          <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirect raíz a dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard - accesible para todos los roles */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* Clientes - accesible para todos */}
            <Route path="clientes" element={<Clientes />} />

            {/* Productos - accesible para todos */}
            <Route path="productos" element={<Productos />} />

            {/* Inventario - solo ADMIN y BODEGUERO */}
            <Route
              path="inventario"
              element={
                <ProtectedRoute roles={['ADMIN', 'BODEGUERO']}>
                  <Inventario />
                </ProtectedRoute>
              }
            />

            {/* Ventas - solo ADMIN y VENDEDOR */}
            <Route
              path="ventas"
              element={
                <ProtectedRoute roles={['ADMIN', 'VENDEDOR']}>
                  <Ventas />
                </ProtectedRoute>
              }
            />

            {/* Empleados - solo ADMIN */}
            <Route
              path="empleados"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <Empleados />
                </ProtectedRoute>
              }
            />

            {/* Reportes - accesible para todos */}
            <Route path="reportes" element={<Reportes />} />

            {/* Admin - solo ADMIN */}
            <Route
              path="admin"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Ruta 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DataStoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}