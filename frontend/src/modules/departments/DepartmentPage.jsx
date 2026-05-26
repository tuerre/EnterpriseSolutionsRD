import { useMemo, useState } from 'react';
import { Edit2, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useDepartments } from './useDepartments';
import DepartmentForm from './DepartmentForm';

export default function DepartmentPage() {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const moduleHook = useDepartments({ search: searchTerm, page, limit: 10 });
  const departments = moduleHook.query.data?.data || [];
  const totalPages = moduleHook.query.data?.data?.pagination?.totalPages || 1;
  const filtered = useMemo(() => departments.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())), [departments, searchTerm]);

  const onSubmit = async (values) => {
    if (selectedItem) await moduleHook.update.mutateAsync({ id: selectedItem.dept_id, data: values });
    else await moduleHook.create.mutateAsync(values);
    setIsFormOpen(false);
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 300 }}>Departamentos</h1>
          <p style={{ color: 'var(--text2)' }}>Administración de departamentos y su estado.</p>
        </div>
        {hasPermission('departments', 'can_insert') ? <Button onClick={() => { setSelectedItem(null); setIsFormOpen(true); }}><Plus size={16} /> Nuevo</Button> : null}
      </div>

      <SearchBar value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar departamento" />

      <Table
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'description', label: 'Descripción' },
          { key: 'status', label: 'Estado', render: (row) => <Badge active={row.is_active !== false} /> },
          ...(hasPermission('departments', 'can_update') ? [{ key: 'edit', label: 'Editar', render: (row) => <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(row); setIsFormOpen(true); }}><Edit2 size={16} /></Button> }] : []),
          ...(hasPermission('departments', 'can_update') || hasPermission('departments', 'can_delete') ? [{ key: 'status_action', label: 'Acción', render: (row) => row.is_active === false ? (hasPermission('departments', 'can_update') ? <Button variant="secondary" size="sm" onClick={async () => moduleHook.reactivate.mutateAsync(row.dept_id)}><RotateCcw size={16} /> Activar</Button> : null) : (hasPermission('departments', 'can_delete') ? <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row)}><Trash2 size={16} /></Button> : null) }] : [])
        ]}
        data={filtered}
        isLoading={moduleHook.query.isLoading}
        emptyMessage="No hay departamentos registrados"
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? 'Editar departamento' : 'Nuevo departamento'}>
        <DepartmentForm initialValues={selectedItem} loading={moduleHook.create.isPending || moduleHook.update.isPending} onSubmit={onSubmit} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { await moduleHook.remove.mutateAsync(deleteTarget.dept_id); setDeleteTarget(null); }}
        title="Desactivar departamento"
        message={`Vas a desactivar ${deleteTarget?.name || 'este departamento'}.`}
        confirmLabel="Desactivar"
        isLoading={moduleHook.remove.isPending}
      />
    </div>
  );
}
