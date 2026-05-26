import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

export default function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
      <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))}>
        <ChevronLeft size={16} />
      </Button>
      <span style={{ color: 'var(--text2)', fontSize: 13 }}>Página {page} de {Math.max(totalPages, 1)}</span>
      <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))}>
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
