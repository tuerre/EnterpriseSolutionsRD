import { Moon, Menu, Sun } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTE_TITLE_MAP } from '../../modules/moduleRegistry';
import Button from '../ui/Button';

export default function Navbar({ onToggleSidebar, onToggleTheme, theme }) {
  const location = useLocation();
  const { user } = useAuth();
  const title = ROUTE_TITLE_MAP[location.pathname] || 'Enterprise Solutions RD';
  const displayName = user?.employee ? `${user.employee.first_name} ${user.employee.last_name}` : user?.username || 'Usuario';

  return (
    <header style={{ height: 56, background: 'var(--surface)', borderBottom: '1px solid var(--border)', marginLeft: 'var(--sidebar-width, 248px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'sticky', top: 0, zIndex: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button variant="ghost" size="sm" onClick={onToggleSidebar} style={{ display: 'none' }} aria-label="Abrir menú">
          <Menu size={16} />
        </Button>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 300, color: 'var(--text)' }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button variant="ghost" size="sm" onClick={onToggleTheme} aria-label="Cambiar tema">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
        <span style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <span style={{ color: 'var(--text2)', fontSize: 13 }}>{displayName}</span>
      </div>
    </header>
  );
}
