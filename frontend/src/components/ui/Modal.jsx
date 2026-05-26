import { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

const sizes = { sm: 420, md: 600, lg: 860 };

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    if (isOpen) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 200ms ease'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%',
          maxWidth: sizes[size] || sizes.md,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: 32,
          animation: 'scaleIn 200ms ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: 'var(--text)' }}>{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar modal" style={{ padding: 6 }}>
            <X size={16} />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
