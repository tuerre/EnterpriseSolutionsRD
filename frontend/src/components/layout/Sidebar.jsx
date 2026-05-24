import { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, LogOut, Settings2 } from 'lucide-react';
import { MODULE_ROUTES } from '../../modules/moduleRegistry';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { hasPermission, logout } = useAuth();
  const [administrativeOpen, setAdministrativeOpen] = useState(true);

  const adminItems = useMemo(() => MODULE_ROUTES.filter((item) => item.sidebarGroup === 'Funciones Administrativas' && (item.visible || hasPermission(item.name, 'can_read'))), [hasPermission]);
  const mainItems = useMemo(() => MODULE_ROUTES.filter((item) => item.name !== 'dashboard' && item.name !== 'departments' && item.name !== 'employees' && item.name !== 'suppliers' && item.name !== 'system_movements' && (item.visible || hasPermission(item.name, 'can_read'))), [hasPermission]);

  const renderNavLink = (item, extraStyle = {}) => (
    <NavLink
      key={item.path}
      to={item.path}
      onClick={onCloseMobile}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: '12px 14px',
        borderRadius: 3,
        borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        background: isActive ? 'var(--surface2)' : 'transparent',
        color: 'var(--text)',
        transition: '200ms ease',
        minHeight: 44,
        boxSizing: 'border-box',
        ...extraStyle
      })}
    >
      <item.icon size={18} />
      <span style={{ fontSize: 13, fontWeight: 400 }}>{item.label}</span>
    </NavLink>
  );

  const content = (
    <>
      <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, letterSpacing: '0.05em', color: 'var(--text)', whiteSpace: 'nowrap' }}>
            Enterprise Solutions RD
          </div>
        </div>
      </div>

      <nav style={{ padding: '16px 12px', display: 'grid', gap: 8, flex: 1, overflowY: 'auto' }}>
        {MODULE_ROUTES.find((item) => item.name === 'dashboard') ? renderNavLink(MODULE_ROUTES.find((item) => item.name === 'dashboard')) : null}
        {mainItems.map((item) => renderNavLink(item))}

        {adminItems.length > 0 ? (
          <div style={{ display: 'grid', gap: 6, marginTop: 6 }}>
            <button
              type="button"
              onClick={() => setAdministrativeOpen((value) => !value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                width: '100%',
                padding: '12px 14px',
                border: '1px solid var(--border)',
                borderRadius: 3,
                background: 'var(--surface2)',
                color: 'var(--text)',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Settings2 size={18} />
                <span style={{ fontSize: 13, fontWeight: 400 }}>Funciones Administrativas</span>
              </span>
              <ChevronDown size={16} style={{ transform: administrativeOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }} />
            </button>

            {administrativeOpen ? (
              <div style={{ display: 'grid', gap: 6 }}>
                {adminItems.map((item) => renderNavLink(item))}
              </div>
            ) : null}
          </div>
        ) : null}
      </nav>

      <div style={{ padding: 16, borderTop: '1px solid var(--border)' }}>
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
          width: 248,
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
