import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { BarChart2, ShoppingCart, AlertTriangle, Users, Truck } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getAllSales } from '../api/sales.api';
import { getAllPurchases } from '../api/purchases.api';
import { getAllProducts, getLowStockProducts } from '../api/products.api';
import { getAllEmployees } from '../api/employees.api';
import { getAllSuppliers } from '../api/suppliers.api';

export default function Dashboard() {
  const { user, hasPermission } = useAuth();

  const results = useQueries({
    queries: [
      { queryKey: ['sales'], queryFn: async () => (await getAllSales()).data },
      { queryKey: ['purchases'], queryFn: async () => (await getAllPurchases()).data },
      { queryKey: ['products'], queryFn: async () => (await getAllProducts({ limit: 100 })).data },
      { queryKey: ['low-stock'], queryFn: async () => (await getLowStockProducts()).data },
      { queryKey: ['employees'], queryFn: async () => (await getAllEmployees()).data },
      { queryKey: ['suppliers'], queryFn: async () => (await getAllSuppliers({ limit: 100 })).data }
    ]
  });

  const [salesQuery, purchasesQuery, productsQuery, lowStockQuery, employeesQuery, suppliersQuery] = results;
  const sales = salesQuery.data?.data || [];
  const purchases = purchasesQuery.data?.data || [];
  const products = productsQuery.data?.data?.products || [];
  const lowStock = lowStockQuery.data?.products || [];
  const employees = employeesQuery.data?.data || [];
  const suppliers = suppliersQuery.data?.data?.suppliers || [];

  const stats = useMemo(() => {
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const monthKey = today.toISOString().slice(0, 7);

    const salesToday = sales.filter((sale) => String(sale.sale_date || sale.created_at || '').slice(0, 10) === todayKey).reduce((sum, sale) => sum + Number(sale.total_final || 0), 0);
    const salesMonth = sales.filter((sale) => String(sale.sale_date || sale.created_at || '').slice(0, 7) === monthKey).reduce((sum, sale) => sum + Number(sale.total_final || 0), 0);
    const purchasesMonth = purchases.filter((purchase) => String(purchase.purchase_date || '').slice(0, 7) === monthKey).reduce((sum, purchase) => sum + Number(purchase.total_amount || 0), 0);

    return {
      salesToday: hasPermission('sales', 'can_read') ? formatCurrency(salesToday) : 'Sin acceso',
      salesMonth: hasPermission('sales', 'can_read') ? formatCurrency(salesMonth) : 'Sin acceso',
      purchasesMonth: hasPermission('purchases', 'can_read') ? formatCurrency(purchasesMonth) : 'Sin acceso',
      criticalStock: hasPermission('products', 'can_read') ? lowStock.length : 'Sin acceso',
      activeEmployees: hasPermission('employees', 'can_read') ? employees.filter((employee) => employee.is_active !== false).length : 'Sin acceso',
      activeSuppliers: hasPermission('suppliers', 'can_read') ? suppliers.filter((supplier) => supplier.is_active !== false).length : 'Sin acceso'
    };
  }, [sales, purchases, lowStock, employees, suppliers, hasPermission]);

  const latestSales = sales.slice(0, 5).map((sale) => ({
    id: sale.sale_id,
    invoice: sale.invoice_number,
    date: formatDate(sale.sale_date),
    total: formatCurrency(sale.total_final)
  }));

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300 }}>Bienvenido, {user?.username || 'usuario'}</div>
        <p style={{ color: 'var(--text2)', marginTop: 8 }}>Resumen operativo del negocio.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
        <StatCard title="Ventas de hoy" value={stats.salesToday} icon={BarChart2} />
        <StatCard title="Ventas del mes" value={stats.salesMonth} icon={BarChart2} />
        <StatCard title="Compras del mes" value={stats.purchasesMonth} icon={ShoppingCart} />
        <StatCard title="Productos críticos" value={stats.criticalStock} icon={AlertTriangle} />
        <StatCard title="Empleados activos" value={stats.activeEmployees} icon={Users} />
        <StatCard title="Proveedores activos" value={stats.activeSuppliers} icon={Truck} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300 }}>Últimas 5 ventas</h2>
            <a href="/ventas" style={{ color: 'var(--text2)', fontSize: 13 }}>Ver todas</a>
          </div>
          <Table
            columns={[
              { key: 'invoice', label: 'Factura' },
              { key: 'date', label: 'Fecha' },
              { key: 'total', label: 'Total' }
            ]}
            data={latestSales}
            isLoading={salesQuery.isLoading}
            emptyMessage="No hay ventas registradas aún"
          />
        </section>

        <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300 }}>Stock crítico</h2>
            <a href="/productos" style={{ color: 'var(--text2)', fontSize: 13 }}>Ver productos</a>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {lowStock.length > 0 ? lowStock.map((product) => (
              <div key={product.product_id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div>{product.product_name}</div>
                  <div style={{ color: 'var(--text2)', fontSize: 13 }}>{product.categories?.category_name || 'Sin categoría'}</div>
                </div>
                <Badge status={`Stock ${product.stock}`}>{product.stock}</Badge>
              </div>
            )) : <div style={{ color: 'var(--text2)' }}>No hay productos críticos.</div>}
          </div>
        </section>
      </div>
    </div>
  );
}
