const MODULES = [
  { module_id: 1, name: 'categories', description: 'Categorías' },
  { module_id: 2, name: 'departments', description: 'Departamentos' },
  { module_id: 3, name: 'employees', description: 'Empleados' },
  { module_id: 4, name: 'modules', description: 'Módulos' },
  { module_id: 5, name: 'permissions', description: 'Permisos' },
  { module_id: 6, name: 'products', description: 'Productos' },
  { module_id: 7, name: 'purchases', description: 'Compras' },
  { module_id: 8, name: 'roles', description: 'Roles' },
  { module_id: 9, name: 'sales', description: 'Ventas' },
  { module_id: 10, name: 'suppliers', description: 'Proveedores' },
  { module_id: 11, name: 'system_movements', description: 'Movimientos del sistema' },
  { module_id: 12, name: 'tax_types', description: 'Tipos de impuesto' },
  { module_id: 13, name: 'users', description: 'Usuarios' }
];

export const getAllModules = async () => ({ data: { data: MODULES } });
export const getModuleById = async (id) => ({ data: { module: MODULES.find((item) => item.module_id === Number(id)) ?? null } });
export const updateModule = async () => {
  throw new Error('El backend no expone CRUD de módulos.');
};
export const deleteModule = async () => {
  throw new Error('El backend no expone CRUD de módulos.');
};
