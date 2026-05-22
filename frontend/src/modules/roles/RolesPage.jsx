import { useState } from 'react';
import { Edit2, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import { useRoles } from './useRoles';
import RoleForm from './RoleForm';

export default function RolesPage() {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const moduleHook = useRoles();
  const roles = moduleHook.query.data?.roles || [];
  const filtered = roles.filter((item) => item.role_name.toLowerCase().includes(searchTerm.toLowerCase()));

  const onSubmit = async (values) => {
    if (selectedItem) await moduleHook.update.mutateAsync({ id: selectedItem.role_id, data: values });
    else await moduleHook.create.mutateAsync(values);
    setIsFormOpen(false);
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 300 }}>Roles</h1>
          <p style={{ color: 'var(--text2)' }}>Administración de roles y su estado.</p>
        </div>
        {hasPermission('roles', 'can_insert') ? <Button onClick={() => { setSelectedItem(null); setIsFormOpen(true); }}><Plus size={16} /> Nuevo</Button> : null}
      </div>

      <SearchBar value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar rol" />

      <Table
        columns={[
          { key: 'role_name', label: 'Nombre del Rol' },
          { key: 'description', label: 'Descripción' },
          { key: 'status', label: 'Estado', render: (row) => <Badge active={row.is_active !== false} /> },
          ...(hasPermission('roles', 'can_update') ? [{ key: 'edit', label: 'Editar', render: (row) => <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(row); setIsFormOpen(true); }}><Edit2 size={16} /></Button> }] : [])
        ]}
        data={filtered}
        isLoading={moduleHook.query.isLoading}
        emptyMessage="No hay roles registrados"
      />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? 'Editar rol' : 'Nuevo rol'}>
        <RoleForm initialValues={selectedItem} loading={moduleHook.create.isPending || moduleHook.update.isPending} onSubmit={onSubmit} onCancel={() => setIsFormOpen(false)} />
      </Modal>
    </div>
  );
}