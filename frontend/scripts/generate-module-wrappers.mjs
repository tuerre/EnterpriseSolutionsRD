import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();

const modules = [
  { folder: 'categories', base: 'Category', title: 'Categorías', hookFile: 'useCategories.js' },
  { folder: 'departments', base: 'Department', title: 'Departamentos', hookFile: 'useDepartments.js' },
  { folder: 'employees', base: 'Employee', title: 'Empleados', hookFile: 'useEmployees.js' },
  { folder: 'modules', base: 'Module', title: 'Módulos', hookFile: 'useModules.js' },
  { folder: 'permissions', base: 'Permission', title: 'Permisos', hookFile: 'usePermissions.js' },
  { folder: 'products', base: 'Product', title: 'Productos', hookFile: 'useProducts.js' },
  { folder: 'purchases', base: 'Purchase', title: 'Compras', hookFile: 'usePurchases.js' },
  { folder: 'roles', base: 'Role', title: 'Roles', hookFile: 'useRoles.js' },
  { folder: 'sales', base: 'Sale', title: 'Ventas', hookFile: 'useSales.js' },
  { folder: 'suppliers', base: 'Supplier', title: 'Proveedores', hookFile: 'useSuppliers.js' },
  { folder: 'system_movements', base: 'Movement', title: 'Movimientos del sistema', hookFile: 'useMovements.js' },
  { folder: 'tax_types', base: 'TaxType', title: 'Tipos de impuesto', hookFile: 'useTaxTypes.js' },
  { folder: 'users', base: 'User', title: 'Usuarios', hookFile: 'useUsers.js' }
];

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function write(path, content) {
  ensureDir(dirname(path));
  writeFileSync(path, content, 'utf8');
}

for (const item of modules) {
  const folder = join(root, 'src', 'modules', item.folder);
  ensureDir(folder);

  write(join(folder, `${item.base}Page.jsx`), `import ModulePlaceholder from '../../pages/ModulePlaceholder';\n\nexport default function ${item.base}Page() {\n  return <ModulePlaceholder title="${item.title}" />;\n}\n`);

  write(join(folder, `${item.base}Form.jsx`), `export default function ${item.base}Form() {\n  return null;\n}\n`);

  const hookName = item.hookFile.replace('.js', '');
  write(join(folder, item.hookFile), `export const ${hookName} = () => ({ query: { data: [], isLoading: false }, create: {}, update: {}, remove: {} });\n`);
}

console.log('Module wrapper files generated.');
