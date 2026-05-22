import { ShieldOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function AccessDenied() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 560, width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: 40, textAlign: 'center' }}>
        <div style={{ display: 'grid', placeItems: 'center', marginBottom: 20 }}>
          <ShieldOff size={64} color="var(--text3)" />
        </div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, fontWeight: 300, marginBottom: 12 }}>Acceso Restringido</h1>
        <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginBottom: 24 }}>No tienes permisos suficientes para ver esta sección. Si consideras que esto es un error, solicita acceso al administrador del sistema.</p>
        <Link to="/dashboard">
          <Button variant="secondary">Volver al Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
