import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { MODULE_ROUTES } from '../../modules/moduleRegistry';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { user, hasPermission, logout } = useAuth();
  const roleName = user?.role?.role_name || user?.role_name || 'Sin rol';
  const employeeName = user?.employee ? `${user.employee.first_name} ${user.employee.last_name}` : user?.username || 'Usuario';

  const content = (
    <>
      <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, letterSpacing: '0.05em', color: 'var(--text)', whiteSpace: 'nowrap' }}>
            Enterprise Solutions RD
          </div>
        </div>
      </div>

      <nav style={{ padding: '16px 12px', display: 'grid', gap: 6, flex: 1, overflowY: 'auto' }}>
        {MODULE_ROUTES.filter((item) => item.visible || item.name === 'dashboard' || hasPermission(item.name, 'can_read')).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onCloseMobile}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 3,
              borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
              background: isActive ? 'var(--surface2)' : 'transparent',
              color: 'var(--text)',
              transition: '200ms ease',
              minHeight: 44
            })}
          >
            <item.icon size={18} />
            <span style={{ fontSize: 13, fontWeight: 400 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text)', fontFamily: 'Cormorant Garamond, serif', fontSize: 18 }}>
            {(user?.username || 'U').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, color: 'var(--text)' }}>{employeeName}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{roleName}</div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} title="Cerrar sesión" style={{ justifyContent: 'flex-start', width: '100%', color: 'var(--danger)' }}>
          <LogOut size={16} />
          <span>Cerrar sesión</span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      <aside
        style={{
          width: collapsed ? 64 : 248,
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 30,
          transition: 'transform 200ms ease'
        }}
      >
        {content}
      </aside>

      {mobileOpen ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.7)' }} onMouseDown={onCloseMobile}>
          <aside
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              width: 248,
              height: '100vh',
              background: 'var(--surface)',
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              transform: 'translateX(0)'
            }}
          >
            {content}
          </aside>
        </div>
      ) : null}

    </>
  );
}
