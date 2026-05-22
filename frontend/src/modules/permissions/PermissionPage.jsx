import { useEffect, useMemo, useState } from 'react';
import { usePermissions } from './usePermissions';

const actions = [
  { key: 'can_read', label: 'L' },
  { key: 'can_insert', label: 'I' },
  { key: 'can_update', label: 'U' },
  { key: 'can_delete', label: 'D' }
];

export default function PermissionPage() {
  const [roleId, setRoleId] = useState('');
  const { rolesQuery, modulesQuery, permissionsQuery, save } = usePermissions(roleId);

  const roles = rolesQuery.data?.roles || [];
  const modules = modulesQuery.data?.data || [];
  const permissions = permissionsQuery.data?.permissions || [];

  useEffect(() => {
    if (!roleId && roles.length > 0) {
      setRoleId(String(roles[0].role_id));
    }
  }, [roles, roleId]);

  const matrix = useMemo(() => modules.map((module) => {
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

  const updateCell = async (moduleRow, field) => {
    const nextPermissions = matrix.map((item) => item.module_id === moduleRow.module_id ? { ...item, [field]: !item[field] } : item).map(({ module_id, can_read, can_insert, can_update, can_delete }) => ({ module_id, can_read, can_insert, can_update, can_delete }));
    await save.mutateAsync({ id: roleId, permissions: nextPermissions });
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 300 }}>Permisos</h1>
        <p style={{ color: 'var(--text2)' }}>Matriz de permisos por rol y módulo.</p>
      </div>

      <label style={{ display: 'grid', gap: 6, maxWidth: 360 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Rol</span>
        <select value={roleId} onChange={(event) => setRoleId(event.target.value)} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12 }}>
          {roles.map((role) => <option key={role.role_id} value={role.role_id}>{role.role_name}</option>)}
        </select>
      </label>

      <div style={{ overflowX: 'auto', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: 12, textAlign: 'left', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>Módulo</th>
              {actions.map((action) => <th key={action.key} style={{ padding: 12, textAlign: 'center', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text2)', borderBottom: '1px solid var(--border)' }}>{action.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {matrix.map((moduleRow) => (
              <tr key={moduleRow.module_id}>
                <td style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
                  <div>{moduleRow.name}</div>
                  <div style={{ color: 'var(--text2)', fontSize: 12 }}>{moduleRow.description}</div>
                </td>
                {actions.map((action) => (
                  <td key={action.key} style={{ padding: 12, borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
                    <input type="checkbox" checked={Boolean(moduleRow[action.key])} onChange={() => updateCell(moduleRow, action.key)} disabled={save.isPending} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
