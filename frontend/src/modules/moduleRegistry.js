import {
  Activity,
  BarChart2,
  Building2,
  LayoutDashboard,
  Package,
  Percent,
  Receipt,
  ShoppingCart,
  Tag,
  Truck,
  Settings2,
  Users
} from 'lucide-react';

export const MODULE_ROUTES = [
  { name: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, title: 'Dashboard', visible: true },
  { name: 'categories', label: 'Categorías', path: '/categorias', icon: Tag, title: 'Categorías' },
  { name: 'departments', label: 'Departamentos', path: '/departamentos', icon: Building2, title: 'Departamentos', sidebarGroup: 'Funciones Administrativas' },
  { name: 'employees', label: 'Empleados', path: '/empleados', icon: Users, title: 'Empleados', sidebarGroup: 'Funciones Administrativas' },
  { name: 'products', label: 'Productos', path: '/productos', icon: Package, title: 'Productos' },
  { name: 'purchases', label: 'Compras', path: '/compras', icon: ShoppingCart, title: 'Compras' },
  { name: 'sales', label: 'Ventas', path: '/ventas', icon: Receipt, title: 'Ventas' },
  { name: 'suppliers', label: 'Proveedores', path: '/proveedores', icon: Truck, title: 'Proveedores', sidebarGroup: 'Funciones Administrativas' },
  { name: 'system_movements', label: 'Movimientos', path: '/movimientos', icon: Activity, title: 'Movimientos del sistema', sidebarGroup: 'Funciones Administrativas' },
  { name: 'tax_types', label: 'Impuestos', path: '/impuestos', icon: Percent, title: 'Tipos de impuesto' },
  { name: 'user_settings', label: 'Configuración de usuarios', path: '/configuracion-usuarios', icon: Settings2, title: 'Configuración de usuarios', visible: true }
];

export const ROUTE_TITLE_MAP = Object.fromEntries(MODULE_ROUTES.map((item) => [item.path, item.title]));

export const DASHBOARD_STATS = [
  { key: 'salesToday', title: 'Ventas de hoy', icon: BarChart2 },
  { key: 'salesMonth', title: 'Ventas del mes', icon: BarChart2 },
  { key: 'purchasesMonth', title: 'Compras del mes', icon: ShoppingCart },
  { key: 'criticalStock', title: 'Productos críticos', icon: Package },
  { key: 'activeEmployees', title: 'Empleados activos', icon: Users },
  { key: 'activeSuppliers', title: 'Proveedores activos', icon: Truck }
];
