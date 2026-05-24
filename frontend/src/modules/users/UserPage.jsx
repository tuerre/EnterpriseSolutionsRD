import { useEffect, useMemo, useState } from 'react';
import { Edit2, Plus, RotateCcw, ShieldCheck, ShieldOff, Users, UserCog } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { useRoles } from '../roles/useRoles';
import RoleForm from '../roles/RoleForm';
import { usePermissions } from '../permissions/usePermissions';
import { useUsers } from './useUsers';
import UserForm from './UserForm';

const permissionLabels = [
  { key: 'can_read', label: 'Leer' },
  { key: 'can_insert', label: 'Crear' },
  { key: 'can_update', label: 'Editar' },
  { key: 'can_delete', label: 'Eliminar' }
];

export default function UserPage() {
  const { user, hasPermission } = useAuth();
  const roleHook = useRoles();
  const userHook = useUsers();
  const [roleSearch, setRoleSearch] = useState('');
  const [permissionRoleId, setPermissionRoleId] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);

  const roles = roleHook.query.data?.roles || [];
  const filteredRoles = useMemo(() => roles.filter((item) => `${item.role_name} ${item.description || ''}`.toLowerCase().includes(roleSearch.toLowerCase())), [roles, roleSearch]);
  const permissionsHook = usePermissions(permissionRoleId);
  const modules = permissionsHook.modulesQuery.data?.data || [];
  const permissions = permissionsHook.permissionsQuery.data?.permissions || [];
  const employees = (userHook.employeesQuery.data?.data || []).filter((employee) => employee.is_active !== false);
  const activeRoles = roles.filter((role) => role.is_active !== false);

  useEffect(() => {
    if (!permissionRoleId && activeRoles.length > 0) {
      setPermissionRoleId(String(activeRoles[0].role_id));
    }
  }, [activeRoles, permissionRoleId]);

  const rolePermissionsMatrix = useMemo(() => modules.map((module) => {
    const permission = permissions.find((item) => item.module_id === module.module_id || item.modules?.module_id === module.module_id);

    return {
      module_id: module.module_id,
      name: module.name,
      description: module.description,
      can_read: Boolean(permission?.can_read),
      can_insert: Boolean(permission?.can_insert),
      can_update: Boolean(permission?.can_update),
      can_delete: Boolean(permission?.can_delete)
    };
  }), [modules, permissions]);

  const submitRole = async (values) => {
    const payload = {
      role_name: values.role_name,
      description: values.description,
      is_active: values.is_active
    };

    if (selectedRole) {
      await roleHook.update.mutateAsync({ id: selectedRole.role_id, data: payload });
    } else {
      await roleHook.create.mutateAsync(payload);
    }

    setIsRoleFormOpen(false);
    setSelectedRole(null);
  };

  const submitUser = async (values) => {
    await userHook.create.mutateAsync({
      username: values.username,
      password: values.password,
      employee_id: values.employee_id ? Number(values.employee_id) : undefined,
      role_id: Number(values.role_id)
    });
    setIsUserFormOpen(false);
  };

  const updatePermissionCell = async (moduleRow, field) => {
    const nextPermissions = rolePermissionsMatrix
      .map((item) => item.module_id === moduleRow.module_id ? { ...item, [field]: !item[field] } : item)
      .map(({ module_id, can_read, can_insert, can_update, can_delete }) => ({ module_id, can_read, can_insert, can_update, can_delete }));

    await permissionsHook.save.mutateAsync({ id: permissionRoleId, permissions: nextPermissions });
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 300 }}>Configuración de usuarios</h1>
        <p style={{ color: 'var(--text2)' }}>Roles, permisos y usuarios en una sola pantalla.</p>
      </div>

      <section style={{ display: 'grid', gap: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 300 }}>Usuarios</h2>
            <p style={{ color: 'var(--text2)' }}>Crea usuarios y cambia su estado por ID.</p>
          </div>
          {hasPermission('users', 'can_insert') ? <Button onClick={() => setIsUserFormOpen(true)}><Users size={16} /> Nuevo usuario</Button> : null}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
          <Input label="User ID" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)} placeholder="ID del usuario" />
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Rol</span>
            <select value={selectedRoleId} onChange={(event) => setSelectedRoleId(event.target.value)} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12 }}>
              <option value="">Selecciona</option>
              {activeRoles.map((role) => <option key={role.role_id} value={role.role_id}>{role.role_name}</option>)}
            </select>
          </label>
          <div style={{ display: 'flex', alignItems: 'end', gap: 12, flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => selectedUserId && selectedRoleId && userHook.updateRole.mutate({ userId: selectedUserId, role_id: Number(selectedRoleId) })}>
              <UserCog size={16} /> Asignar rol
            </Button>
            <Button variant="danger" onClick={() => selectedUserId && userHook.disable.mutate(Number(selectedUserId))}>
              <ShieldOff size={16} /> Desactivar
            </Button>
            <Button variant="secondary" onClick={() => selectedUserId && userHook.enable.mutate(Number(selectedUserId))}>
              <ShieldCheck size={16} /> Activar
            </Button>
          </div>
        </div>

        <div style={{ color: 'var(--text2)', lineHeight: 1.7 }}>
          El backend no expone un listado completo de usuarios. Esta sección permite crear cuentas nuevas, asignarles rol y activar o desactivar una cuenta por ID cuando ya conoces el identificador.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Badge active={Boolean(user)}>{user?.username || 'Sin sesión'}</Badge>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 300 }}>Roles</h2>
            <p style={{ color: 'var(--text2)' }}>Crea, edita y activa o desactiva roles.</p>
          </div>
          {hasPermission('users', 'can_insert') ? <Button onClick={() => { setSelectedRole(null); setIsRoleFormOpen(true); }}><Plus size={16} /> Nuevo rol</Button> : null}
        </div>

        <SearchBar value={roleSearch} onChange={(event) => setRoleSearch(event.target.value)} placeholder="Buscar rol" />

        <Table
          columns={[
            { key: 'role_name', label: 'Rol' },
            { key: 'description', label: 'Descripción' },
            { key: 'users_count', label: 'Usuarios', render: (row) => row.users_count ?? 0 },
            { key: 'permissions_count', label: 'Permisos', render: (row) => row.permissions_count ?? 0 },
            { key: 'status', label: 'Estado', render: (row) => <Badge active={row.is_active !== false} /> },
            ...(hasPermission('users', 'can_update') ? [{ key: 'edit', label: 'Editar', render: (row) => <Button variant="ghost" size="sm" onClick={() => { setSelectedRole(row); setIsRoleFormOpen(true); }}><Edit2 size={16} /></Button> }] : []),
            ...(hasPermission('users', 'can_update') ? [{ key: 'toggle', label: 'Acción', render: (row) => row.is_active === false ? <Button variant="secondary" size="sm" onClick={async () => roleHook.update.mutateAsync({ id: row.role_id, data: { is_active: true } })}><RotateCcw size={16} /> Activar</Button> : <Button variant="danger" size="sm" onClick={async () => roleHook.update.mutateAsync({ id: row.role_id, data: { is_active: false } })}><ShieldOff size={16} /> Desactivar</Button> }] : [])
          ]}
          data={filteredRoles}
          isLoading={roleHook.query.isLoading}
          emptyMessage="No hay roles registrados"
        />
      </section>

      <section style={{ display: 'grid', gap: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 300 }}>Permisos</h2>
            <p style={{ color: 'var(--text2)' }}>Matriz de permisos por rol y módulo.</p>
          </div>
          <label style={{ display: 'grid', gap: 6, width: 320, maxWidth: '100%' }}>
            <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Rol</span>
            <select value={permissionRoleId} onChange={(event) => setPermissionRoleId(event.target.value)} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12 }}>
              {activeRoles.map((role) => <option key={role.role_id} value={role.role_id}>{role.role_name}</option>)}
            </select>
          </label>
        </div>

        <div style={{ overflowX: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>Módulo</th>
                {permissionLabels.map((action) => <th key={action.key} style={{ padding: 12, textAlign: 'center', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>{action.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rolePermissionsMatrix.map((moduleRow) => (
                <tr key={moduleRow.module_id}>
                  <td style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
                    <div>{moduleRow.name}</div>
                    <div style={{ color: 'var(--text2)', fontSize: 12 }}>{moduleRow.description}</div>
                  </td>
                  {permissionLabels.map((action) => (
                    <td key={action.key} style={{ padding: 12, borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                      <input type="checkbox" checked={Boolean(moduleRow[action.key])} onChange={() => updatePermissionCell(moduleRow, action.key)} disabled={permissionsHook.save.isPending} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={isRoleFormOpen} onClose={() => setIsRoleFormOpen(false)} title={selectedRole ? 'Editar rol' : 'Nuevo rol'} size="lg">
        <RoleForm
          initialValues={selectedRole}
          loading={roleHook.create.isPending || roleHook.update.isPending}
          onSubmit={submitRole}
          onCancel={() => setIsRoleFormOpen(false)}
        />
      </Modal>

      <Modal isOpen={isUserFormOpen} onClose={() => setIsUserFormOpen(false)} title="Nuevo usuario" size="lg">
        <UserForm roles={activeRoles} employees={employees} loading={userHook.create.isPending} onSubmit={submitUser} onCancel={() => setIsUserFormOpen(false)} />
      </Modal>
    </div>
  );
}
