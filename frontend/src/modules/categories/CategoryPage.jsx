import { useMemo, useState } from 'react';
import { Edit2, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import ErrorState from '../../components/ui/ErrorState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useCategories } from './useCategories';
import CategoryForm from './CategoryForm';

export default function CategoryPage() {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const moduleHook = useCategories({ search: searchTerm, page, limit: 10 });
  const categories = moduleHook.query.data?.data?.categories || [];
  const totalPages = moduleHook.query.data?.data?.pagination?.totalPages || 1;

  const filtered = useMemo(() => categories.filter((item) => item.category_name.toLowerCase().includes(searchTerm.toLowerCase())), [categories, searchTerm]);

  const openCreate = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const onSubmit = async (values) => {
    if (selectedItem) {
      await moduleHook.update.mutateAsync({ id: selectedItem.category_id, data: values });
    } else {
      await moduleHook.create.mutateAsync(values);
    }
    setIsFormOpen(false);
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 300 }}>Categorías</h1>
          <p style={{ color: 'var(--text2)' }}>Gestión de categorías activas del sistema.</p>
        </div>
        {hasPermission('categories', 'can_insert') ? (
          <Button onClick={openCreate}><Plus size={16} /> Nuevo</Button>
        ) : null}
      </div>

      <SearchBar value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar categoría" />

      <Table
        columns={[
          { key: 'category_name', label: 'Nombre' },
          { key: 'status', label: 'Estado', render: (row) => <Badge active={row.is_active !== false} /> },
          ...(hasPermission('categories', 'can_update') ? [{ key: 'actions', label: 'Acciones', render: (row) => <Button variant="ghost" size="sm" onClick={() => openEdit(row)}><Edit2 size={16} /></Button> }] : [])
        ]}
        data={filtered}
        isLoading={moduleHook.query.isLoading}
        emptyMessage="No hay categorías registradas"
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? 'Editar categoría' : 'Nueva categoría'}>
        <CategoryForm initialValues={selectedItem} loading={moduleHook.create.isPending || moduleHook.update.isPending} onSubmit={onSubmit} onCancel={() => setIsFormOpen(false)} />
      </Modal>
    </div>
  );
}
