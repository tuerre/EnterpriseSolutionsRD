import { useMemo, useState } from 'react';
import { Edit2, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import { useSuppliers } from './useSuppliers';
import SupplierForm from './SupplierForm';

export default function SuppliersPage() {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const moduleHook = useSuppliers({ search: searchTerm, page, limit: 10 });
  const suppliers = moduleHook.query.data?.data?.suppliers || [];
  const totalPages = moduleHook.query.data?.data?.pagination?.totalPages || 1;
  const filtered = useMemo(() => suppliers.filter((item) => `${item.company_name} ${item.contact_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())), [suppliers, searchTerm]);

  const onSubmit = async (values) => {
    if (selectedItem) await moduleHook.update.mutateAsync({ id: selectedItem.supplier_id, data: values });
    else await moduleHook.create.mutateAsync(values);
    setIsFormOpen(false);
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 300 }}>Proveedores</h1>
          <p style={{ color: 'var(--text2)' }}>Gestión de proveedores activos.</p>
        </div>
        {hasPermission('suppliers', 'can_insert') ? <Button onClick={() => { setSelectedItem(null); setIsFormOpen(true); }}><Plus size={16} /> Nuevo</Button> : null}
      </div>

      <SearchBar value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar empresa o contacto" />

      <Table
        columns={[
          { key: 'company_name', label: 'Empresa' },
          { key: 'contact_name', label: 'Contacto' },
          { key: 'phone', label: 'Teléfono' },
          { key: 'email', label: 'Email' },
          { key: 'status', label: 'Estado', render: (row) => <Badge active={row.is_active !== false} /> },
          ...(hasPermission('suppliers', 'can_update') ? [{ key: 'edit', label: 'Editar', render: (row) => <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(row); setIsFormOpen(true); }}><Edit2 size={16} /></Button> }] : [])
        ]}
        data={filtered}
        isLoading={moduleHook.query.isLoading}
        emptyMessage="No hay proveedores registrados"
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? 'Editar proveedor' : 'Nuevo proveedor'} size="lg">
        <SupplierForm initialValues={selectedItem} loading={moduleHook.create.isPending || moduleHook.update.isPending} onSubmit={onSubmit} onCancel={() => setIsFormOpen(false)} />
      </Modal>
    </div>
  );
}