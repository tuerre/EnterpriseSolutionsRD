import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300 }}>Página no encontrada</h1>
        <p style={{ color: 'var(--text2)', margin: '12px 0 24px' }}>La ruta solicitada no existe o fue movida.</p>
        <Link to="/dashboard">
          <Button variant="secondary">Ir al Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
