import { useMemo, useState } from 'react';
import { Edit2, Plus, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import { getAllCategories } from '../../api/categories.api';
import { getAllSuppliers } from '../../api/suppliers.api';
import { getLatestTaxType } from '../../api/tax_types.api';
import { useProducts } from './useProducts';
import ProductForm from './ProductForm';

export default function ProductsPage() {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const moduleHook = useProducts({ search: searchTerm, category_id: categoryFilter || undefined, page, limit: 10 });
  const products = moduleHook.query.data?.data?.products || [];
  const totalPages = moduleHook.query.data?.data?.pagination?.totalPages || 1;
  const categoriesQuery = useQuery({ queryKey: ['product-categories'], queryFn: async () => (await getAllCategories({ limit: 100 })).data });
  const suppliersQuery = useQuery({ queryKey: ['product-suppliers'], queryFn: async () => (await getAllSuppliers({ limit: 100 })).data });
  const taxTypeQuery = useQuery({ queryKey: ['tax-type-latest'], queryFn: async () => (await getLatestTaxType()).data });

  const categories = (categoriesQuery.data?.data?.categories || []).filter((category) => category.is_active !== false);
  const suppliers = (suppliersQuery.data?.data?.suppliers || []).filter((supplier) => supplier.is_active !== false);
  const taxTypes = taxTypeQuery.data?.tax_type ? [taxTypeQuery.data.tax_type] : [];

  const filtered = useMemo(() => products.filter((item) => item.product_name.toLowerCase().includes(searchTerm.toLowerCase())), [products, searchTerm]);

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      category_id: Number(values.category_id),
      supplier_id: Number(values.supplier_id),
      tax_id: Number(values.tax_id),
      cost_price: Number(values.cost_price),
      sale_price: Number(values.sale_price),
      stock: Number(values.stock)
    };

    if (selectedItem) await moduleHook.update.mutateAsync({ id: selectedItem.product_id, data: payload });
    else await moduleHook.create.mutateAsync(payload);
    setIsFormOpen(false);
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 300 }}>Productos</h1>
          <p style={{ color: 'var(--text2)' }}>Gestión de catálogo e inventario activo.</p>
        </div>
        {hasPermission('products', 'can_insert') ? <Button onClick={() => { setSelectedItem(null); setIsFormOpen(true); }}><Plus size={16} /> Nuevo</Button> : null}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 12 }}>
        <SearchBar value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar producto" />
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12 }}>
          <option value="">Todas las categorías</option>
          {categories.map((item) => <option key={item.category_id} value={item.category_id}>{item.category_name}</option>)}
        </select>
      </div>

      <Table
        columns={[
          { key: 'product_name', label: 'Nombre' },
          { key: 'category', label: 'Categoría', render: (row) => row.categories?.category_name || '—' },
          { key: 'supplier', label: 'Proveedor', render: (row) => row.suppliers?.company_name || '—' },
          { key: 'cost', label: 'Precio Costo', render: (row) => formatCurrency(row.cost_price) },
          { key: 'sale', label: 'Precio Venta', render: (row) => formatCurrency(row.sale_price) },
          { key: 'stock', label: 'Stock', render: (row) => row.stock < 5 ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--danger)' }}><AlertTriangle size={14} />{row.stock}</span> : row.stock },
          { key: 'tax', label: 'Impuesto', render: (row) => `${row.tax_types?.name || '—'} ${row.tax_types?.percentage || 0}%` },
          { key: 'aisle', label: 'Pasillo', render: (row) => row.aisle_location || '—' },
          { key: 'status', label: 'Estado', render: (row) => <Badge active={row.is_active !== false} /> },
          ...(hasPermission('products', 'can_update') ? [{ key: 'edit', label: 'Editar', render: (row) => <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(row); setIsFormOpen(true); }}><Edit2 size={16} /></Button> }] : [])
        ]}
        data={filtered}
        isLoading={moduleHook.query.isLoading}
        emptyMessage="No hay productos registrados"
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? 'Editar producto' : 'Nuevo producto'} size="lg">
        <ProductForm initialValues={selectedItem} categories={categories} suppliers={suppliers} taxTypes={taxTypes} loading={moduleHook.create.isPending || moduleHook.update.isPending} onSubmit={onSubmit} onCancel={() => setIsFormOpen(false)} />
      </Modal>
    </div>
  );
}