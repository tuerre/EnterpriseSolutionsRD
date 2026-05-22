import { AlertCircle } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ message, onRetry }) {
  return (
    <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, textAlign: 'center', padding: 24 }}>
      <AlertCircle size={48} color="var(--danger)" />
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--text2)' }}>{message}</div>
      {onRetry ? <Button variant="secondary" onClick={onRetry}>Reintentar</Button> : null}
    </div>
  );
}
