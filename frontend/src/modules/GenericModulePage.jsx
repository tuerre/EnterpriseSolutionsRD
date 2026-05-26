import CategoryPage from './categories/CategoryPage';
import DepartmentPage from './departments/DepartmentPage';
import EmployeePage from './employees/EmployeePage';
import ProductPage from './products/ProductsPage';
import SupplierPage from './suppliers/SuppliersPage';
import RolePage from './roles/RolesPage';
import TaxTypePage from './tax_types/TaxTypesPage';
import PermissionPage from './permissions/PermissionPage';
import PurchasePage from './purchases/PurchasePage';
import SalePage from './sales/SalePage';
import MovementPage from './system_movements/MovementPage';
import UserPage from './users/UserPage';
import ModulePlaceholder from '../pages/ModulePlaceholder';

export default function GenericModulePage({ module, title }) {
  if (module === 'categories') return <CategoryPage />;
  if (module === 'departments') return <DepartmentPage />;
  if (module === 'employees') return <EmployeePage />;
  if (module === 'products') return <ProductPage />;
  if (module === 'suppliers') return <SupplierPage />;
  if (module === 'roles') return <RolePage />;
  if (module === 'tax_types') return <TaxTypePage />;
  if (module === 'permissions') return <PermissionPage />;
  if (module === 'purchases') return <PurchasePage />;
  if (module === 'sales') return <SalePage />;
  if (module === 'system_movements') return <MovementPage />;
  if (module === 'users') return <UserPage />;

  return <ModulePlaceholder title={title} />;
}
