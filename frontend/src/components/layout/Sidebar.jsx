import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, LogOut, Settings2 } from 'lucide-react';
import { MODULE_ROUTES } from '../../modules/moduleRegistry';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const { hasPermission, logout } = useAuth();
  const [administrativeOpen, setAdministrativeOpen] = useState(true);

  const rowHeight = 44;
  const rowGap = 8;
  const adminItems = MODULE_ROUTES.filter((item) => item.sidebarGroup === 'Funciones Administrativas');
  const mainItems = MODULE_ROUTES.filter((item) => item.name !== 'dashboard' && !item.sidebarGroup);
  const dashboardItem = MODULE_ROUTES.find((item) => item.name === 'dashboard');

  const canViewItem = (item) => item.visible || hasPermission(item.name, 'can_read');
  const visibleItems = (items) => items.filter((item) => canViewItem(item));
  const hiddenSpaceHeight = [mainItems, adminItems].reduce((total, items) => {
    const hiddenCount = items.length - visibleItems(items).length;
    return total + hiddenCount;
  }, 0) * (rowHeight + rowGap);

  const baseLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: '12px 14px',
    borderRadius: 3,
    borderLeft: '2px solid transparent',
    background: 'transparent',
    color: 'var(--text)',
    transition: '200ms ease',
    minHeight: 44,
    boxSizing: 'border-box'
  };

  const renderNavLink = (item, extraStyle = {}) => (
    <NavLink
      key={item.path}
      to={item.path}
      onClick={onCloseMobile}
      style={({ isActive }) => ({
        ...baseLinkStyle,
        borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        background: isActive ? 'var(--surface2)' : 'transparent',
        ...extraStyle
      })}
    >
      <item.icon size={18} />
      <span style={{ fontSize: 13, fontWeight: 400 }}>{item.label}</span>
    </NavLink>
  );

  const renderNavGroup = (items) => visibleItems(items).map((item) => renderNavLink(item));

  const content = (
    <>
      <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, letterSpacing: '0.05em', color: 'var(--text)', whiteSpace: 'nowrap' }}>
            Enterprise Solutions RD
          </div>
        </div>
      </div>

      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: rowGap, flex: 1, overflowY: 'auto' }}>
        {dashboardItem ? renderNavLink(dashboardItem) : null}
        {renderNavGroup(mainItems)}

        {adminItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: rowGap, marginTop: 6 }}>
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
                boxSizing: 'border-box',
                minHeight: rowHeight,
                flex: '0 0 auto'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Settings2 size={18} />
                <span style={{ fontSize: 13, fontWeight: 400 }}>Funciones Administrativas</span>
              </span>
              <ChevronDown size={16} style={{ transform: administrativeOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }} />
            </button>

            <div style={{ display: administrativeOpen ? 'flex' : 'none', flexDirection: 'column', gap: rowGap }}>
              {renderNavGroup(adminItems)}
            </div>
          </div>
        ) : null}

        {hiddenSpaceHeight > 0 ? <div aria-hidden="true" style={{ height: hiddenSpaceHeight }} /> : null}
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
