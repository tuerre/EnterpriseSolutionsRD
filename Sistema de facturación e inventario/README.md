# 🚀 Enterprise Solutions - Sistema de Gestión Empresarial

Frontend del sistema de facturación e inventario desarrollado con React, TypeScript, Tailwind CSS y React Router. Diseño **Cyber-Modern / Dark Premium** con Glassmorphism.

## 🚀 Tecnologías

- **React 18.3.1** - Librería UI
- **TypeScript** - Tipado estático
- **Vite 6.3.5** - Build tool y dev server
- **React Router DOM 7.15.0** - Enrutamiento
- **Tailwind CSS 4.1.12** - Estilos con utilidades personalizadas
- **Axios 1.16.0** - Cliente HTTP con interceptores JWT
- **Lucide React** - Iconos minimalistas
- **Radix UI** - Componentes primitivos accesibles
- **Material UI** - Componentes adicionales

## 🎨 Sistema de Diseño

### Cyber-Modern / Dark Premium
- **Glassmorphism**: Efectos de vidrio con backdrop-blur
- **Gradientes Vibrantes**: Magenta (#d946ef) → Púrpura (#7c3aed)
- **Fondo Profundo**: Púrpura noche (#0a0118) con grid pattern
- **Animaciones Suaves**: Transiciones de 300-500ms
- **Tipografía Gradiente**: Títulos con efecto degradado

Ver documentación completa en [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)

## 📁 Estructura del Proyecto

```
src/app/
├── components/
│   ├── common/          # Componentes reutilizables (Button, Card)
│   ├── layout/          # Componentes de layout (Sidebar, Navbar, MainLayout)
│   ├── ui/              # Componentes UI base (shadcn/ui)
│   └── ProtectedRoute.tsx
├── contexts/
│   └── AuthContext.tsx  # Contexto de autenticación y roles
├── pages/               # Vistas principales del sistema
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Clientes.tsx
│   ├── Productos.tsx
│   ├── Inventario.tsx
│   ├── Ventas.tsx
│   ├── Empleados.tsx
│   ├── Reportes.tsx
│   └── Admin.tsx
└── utils/
    └── axios.ts         # Configuración de Axios con interceptores JWT
```

## 🔐 Sistema de Roles y Permisos

El sistema implementa 4 roles con permisos diferenciados:

### ADMIN
- Acceso completo a todas las funcionalidades
- Gestión de usuarios del sistema
- Configuración y administración

### VENDEDOR
- Dashboard y reportes (lectura)
- Clientes (CRUD completo)
- Productos (lectura)
- Ventas (crear y gestionar)

### BODEGUERO
- Dashboard y reportes (lectura)
- Productos (lectura)
- Inventario (gestión completa)
- Control de stock

### READONLY
- Solo lectura en Dashboard y Reportes
- Sin permisos de escritura

## 🎨 Módulos Implementados

### 1. **Dashboard**
- KPIs principales (ventas, clientes, productos, transacciones)
- Alertas de inventario
- Ventas recientes
- Estadísticas en tiempo real

### 2. **Clientes**
- Listado paginado con búsqueda
- CRUD completo
- Filtros avanzados
- Estados (Activo/Inactivo)

### 3. **Productos**
- Catálogo visual en grid
- Gestión de categorías
- Control de SKU
- Indicadores de stock

### 4. **Inventario** (ADMIN, BODEGUERO)
- Control de stock por producto
- Alertas de stock bajo y crítico
- Ajuste de inventario
- Umbrales mínimos y máximos

### 5. **Ventas** (ADMIN, VENDEDOR)
- Carrito de compras interactivo
- Historial de facturas
- Estados de venta
- Detalle de transacciones

### 6. **Empleados** (ADMIN)
- Gestión de personal
- Organización por departamentos
- Asignación de roles
- Control de estados

### 7. **Reportes**
- Filtros por fecha
- Ventas mensuales
- Top productos más vendidos
- KPIs del negocio
- Gráficos y visualizaciones

### 8. **Administración** (ADMIN)
- Gestión de usuarios del sistema
- Asignación de roles
- Bloqueo/desbloqueo de usuarios
- Configuración de seguridad
- Auditoría y logs

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_ENV=development
```

### Instalación

```bash
# Instalar dependencias
pnpm install

# Modo desarrollo (el servidor ya está corriendo en Figma Make)
# No ejecutar vite manualmente

# Build para producción
pnpm build
```

## 🔌 Integración con Backend

### Axios Interceptors

El sistema incluye interceptores configurados para:

1. **Request Interceptor**: Agrega automáticamente el token JWT a todas las peticiones
2. **Response Interceptor**: Maneja errores globalmente (401, 403, 404, 500)

### Endpoints Esperados

El frontend espera los siguientes endpoints del backend:

```
POST   /api/auth/login           # Autenticación
POST   /api/auth/logout          # Cerrar sesión
GET    /api/clientes             # Listar clientes
POST   /api/clientes             # Crear cliente
PUT    /api/clientes/:id         # Actualizar cliente
DELETE /api/clientes/:id         # Eliminar cliente
GET    /api/productos            # Listar productos
POST   /api/productos            # Crear producto
GET    /api/inventario           # Estado del inventario
PUT    /api/inventario/:id       # Ajustar stock
GET    /api/ventas               # Historial de ventas
POST   /api/ventas               # Crear venta
GET    /api/empleados            # Listar empleados
GET    /api/reportes/ventas      # Reportes de ventas
GET    /api/reportes/productos   # Reportes de productos
GET    /api/usuarios             # Gestión de usuarios (Admin)
```

## 🎯 Características Implementadas

✅ Autenticación con JWT
✅ Sistema de roles y permisos (RBAC)
✅ Rutas protegidas por rol
✅ Layout responsive con sidebar y navbar
✅ Componentes reutilizables
✅ Interceptores HTTP para manejo de tokens
✅ Mock data para desarrollo
✅ Búsqueda y filtros en tablas
✅ Estados visuales (badges, alertas)
✅ Validación de formularios
✅ Manejo de errores global

## 📝 Próximos Pasos

### Para conectar con el backend real:

1. **Actualizar AuthContext.tsx** (línea 39):
   - Descomentar la llamada axios real
   - Eliminar el mock response
   - Ajustar la estructura de respuesta según el backend

2. **Crear servicios API**:
   ```typescript
   // src/app/services/clientesService.ts
   import axios from '../utils/axios';
   
   export const clientesService = {
     getAll: () => axios.get('/clientes'),
     getById: (id) => axios.get(`/clientes/${id}`),
     create: (data) => axios.post('/clientes', data),
     update: (id, data) => axios.put(`/clientes/${id}`, data),
     delete: (id) => axios.delete(`/clientes/${id}`)
   };
   ```

3. **Implementar formularios**:
   - Agregar react-hook-form para validación
   - Crear modales de creación/edición
   - Integrar con los servicios API

4. **Agregar notificaciones**:
   - Usar sonner (ya instalado) para toasts
   - Feedback de operaciones exitosas/errores

5. **Optimizaciones**:
   - React Query para cache y estados de carga
   - Paginación del lado del servidor
   - Virtualización de listas largas

## 🛡️ Seguridad

- Tokens JWT almacenados en localStorage
- Validación de roles en frontend (también debe validarse en backend)
- Rutas protegidas con ProtectedRoute
- Logout automático en token expirado (401)
- CORS debe configurarse en el backend

## 📱 Responsividad

- Mobile-first design
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Sidebar colapsable (a implementar en mobile)
- Grid responsive en productos y dashboard

## 🎨 Tema y Estilos

- Tailwind CSS v4 con variables CSS
- Modo oscuro preparado (no activado)
- Tokens de diseño en `src/styles/theme.css`
- Componentes base de Radix UI para accesibilidad

---

## 🎨 Vista Previa del Diseño

### Características Visuales

✨ **Glassmorphism**
- Contenedores con efecto de vidrio esmerilado
- Backdrop blur de 24-40px
- Bordes sutiles con opacidad del 10-20%

🌈 **Gradientes Vibrantes**
- Magenta a Púrpura en botones principales
- Texto con gradiente en títulos
- Sombras con glow effect colorido

🌌 **Fondo Profundo**
- Grid pattern infinito de 40x40px
- Gradientes animados flotantes
- Púrpura noche profundo (#0a0118)

⚡ **Animaciones Premium**
- Fade in con slide vertical
- Scale en clicks (active:scale-95)
- Pulse en notificaciones
- Transiciones suaves de 300ms

🎯 **Componentes Modernos**
- Sidebar con glassmorphism
- Search bar con focus ring magenta
- Cards con hover effects
- Badges con semi-transparencia

---

**Enterprise Solutions** - Powered by Innovation • 2026

