import { useMemo, useState } from 'react';
import { Edit2, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getAllDepartments } from '../../api/departments.api';
import { useEmployees } from './useEmployees';
import EmployeeForm from './EmployeeForm';

export default function EmployeePage() {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const moduleHook = useEmployees({ search: searchTerm, page, limit: 10 });
  const employees = moduleHook.query.data?.data || [];
  const totalPages = moduleHook.query.data?.data?.pagination?.totalPages || 1;
  const departmentQuery = useQuery({ queryKey: ['departments', 'employee-form'], queryFn: async () => (await getAllDepartments({ limit: 100 })).data });
  const departments = (departmentQuery.data?.data || []).filter((department) => department.is_active !== false);
  const filtered = useMemo(() => employees.filter((item) => `${item.first_name} ${item.last_name} ${item.email} ${item.id_card}`.toLowerCase().includes(searchTerm.toLowerCase())), [employees, searchTerm]);

  const onSubmit = async (values) => {
    const payload = { ...values, dept_id: values.dept_id ? Number(values.dept_id) : null, salary: Number(values.salary) };
    if (selectedItem) await moduleHook.update.mutateAsync({ id: selectedItem.employee_id, data: payload });
    else await moduleHook.create.mutateAsync(payload);
    setIsFormOpen(false);
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 300 }}>Empleados</h1>
          <p style={{ color: 'var(--text2)' }}>Administración de empleados activos e inactivos.</p>
        </div>
        {hasPermission('employees', 'can_insert') ? <Button onClick={() => { setSelectedItem(null); setIsFormOpen(true); }}><Plus size={16} /> Nuevo</Button> : null}
      </div>

      <SearchBar value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar nombre, correo o cédula" />

      <Table
        columns={[
          { key: 'full_name', label: 'Nombre Completo', render: (row) => `${row.first_name} ${row.last_name}` },
          { key: 'email', label: 'Email' },
          { key: 'id_card', label: 'Cédula' },
          { key: 'department', label: 'Departamento', render: (row) => row.departments?.name || '—' },
          { key: 'salary', label: 'Salario', render: (row) => formatCurrency(row.salary) },
          { key: 'status', label: 'Estado', render: (row) => <Badge active={row.is_active !== false} /> },
          { key: 'created', label: 'Fecha de creación', render: (row) => formatDate(row.created_at) },
          ...(hasPermission('employees', 'can_update') ? [{ key: 'edit', label: 'Editar', render: (row) => <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(row); setIsFormOpen(true); }}><Edit2 size={16} /></Button> }] : []),
          ...(hasPermission('employees', 'can_update') || hasPermission('employees', 'can_delete') ? [{ key: 'status_action', label: 'Acción', render: (row) => row.is_active === false ? (hasPermission('employees', 'can_update') ? <Button variant="secondary" size="sm" onClick={async () => moduleHook.reactivate.mutateAsync(row.employee_id)}><RotateCcw size={16} /> Activar</Button> : null) : (hasPermission('employees', 'can_delete') ? <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(row)}><Trash2 size={16} /></Button> : null) }] : [])
        ]}
        data={filtered}
        isLoading={moduleHook.query.isLoading}
        emptyMessage="No hay empleados registrados"
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? 'Editar empleado' : 'Nuevo empleado'} size="lg">
        <EmployeeForm initialValues={selectedItem} departments={departments} loading={moduleHook.create.isPending || moduleHook.update.isPending} onSubmit={onSubmit} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => { await moduleHook.remove.mutateAsync(deleteTarget.employee_id); setDeleteTarget(null); }}
        title="Desactivar empleado"
        message={`Vas a desactivar a ${deleteTarget?.first_name || ''} ${deleteTarget?.last_name || ''}.`}
        confirmLabel="Desactivar"
        isLoading={moduleHook.remove.isPending}
      />
    </div>
  );
}
