// Roles del sistema
export const ROLES = {
  ADMIN: 'ADMIN',
  VENDEDOR: 'VENDEDOR',
  BODEGUERO: 'BODEGUERO',
  READONLY: 'READONLY'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Permisos del sistema
export const PERMISSIONS = {
  // Clientes
  CLIENTES_VER: 'clientes.ver',
  CLIENTES_CREAR: 'clientes.crear',
  CLIENTES_EDITAR: 'clientes.editar',
  CLIENTES_ELIMINAR: 'clientes.eliminar',

  // Productos
  PRODUCTOS_VER: 'productos.ver',
  PRODUCTOS_CREAR: 'productos.crear',
  PRODUCTOS_EDITAR: 'productos.editar',
  PRODUCTOS_ELIMINAR: 'productos.eliminar',

  // Inventario
  INVENTARIO_VER: 'inventario.ver',
  INVENTARIO_AJUSTAR: 'inventario.ajustar',

  // Ventas
  VENTAS_VER: 'ventas.ver',
  VENTAS_CREAR: 'ventas.crear',
  VENTAS_ANULAR: 'ventas.anular',

  // Empleados
  EMPLEADOS_VER: 'empleados.ver',
  EMPLEADOS_GESTIONAR: 'empleados.gestionar',

  // Reportes
  REPORTES_VER: 'reportes.ver',
  REPORTES_EXPORTAR: 'reportes.exportar',

  // Admin
  USUARIOS_GESTIONAR: 'usuarios.gestionar',
  SISTEMA_CONFIGURAR: 'sistema.configurar',
  AUDITORIA_VER: 'auditoria.ver'
} as const;

// Estados
export const ESTADOS = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  BLOQUEADO: 'Bloqueado',
  PENDIENTE: 'Pendiente',
  COMPLETADA: 'Completada',
  ANULADA: 'Anulada'
} as const;

// Estados de inventario
export const ESTADOS_INVENTARIO = {
  NORMAL: 'normal',
  BAJO: 'bajo',
  CRITICO: 'critico'
} as const;

// Departamentos
export const DEPARTAMENTOS = [
  'Ventas',
  'Bodega',
  'Administración',
  'Contabilidad',
  'Gerencia'
] as const;

// Categorías de productos (mock - deberían venir del backend)
export const CATEGORIAS = [
  'Computadoras',
  'Accesorios',
  'Monitores',
  'Impresoras',
  'Redes',
  'Audio',
  'Almacenamiento',
  'Software'
] as const;

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
} as const;

// Mensajes del sistema
export const MESSAGES = {
  ERROR_GENERICO: 'Ha ocurrido un error. Por favor, intenta de nuevo.',
  ERROR_CONEXION: 'Error de conexión con el servidor.',
  ERROR_AUTENTICACION: 'Credenciales inválidas.',
  ERROR_PERMISOS: 'No tienes permisos para realizar esta acción.',
  SUCCESS_CREAR: 'Registro creado exitosamente.',
  SUCCESS_ACTUALIZAR: 'Registro actualizado exitosamente.',
  SUCCESS_ELIMINAR: 'Registro eliminado exitosamente.',
  CONFIRM_ELIMINAR: '¿Estás seguro de que deseas eliminar este registro?'
} as const;

// Rutas del sistema
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CLIENTES: '/clientes',
  PRODUCTOS: '/productos',
  INVENTARIO: '/inventario',
  VENTAS: '/ventas',
  EMPLEADOS: '/empleados',
  REPORTES: '/reportes',
  ADMIN: '/admin'
} as const;
