import { useMemo, useState } from 'react';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import { formatDateTime } from '../../utils/formatters';
import { useMovements } from './useMovements';

export default function MovementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const moduleHook = useMovements();
  const movements = moduleHook.query.data?.movements || [];
  const filtered = useMemo(() => movements.filter((item) => `${item.modules?.name || ''} ${item.users?.username || ''} ${item.action_type || ''}`.toLowerCase().includes(searchTerm.toLowerCase())), [movements, searchTerm]);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 300 }}>Movimientos del Sistema</h1>
        <p style={{ color: 'var(--text2)' }}>Historial de movimientos de inventario.</p>
      </div>

      <SearchBar value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar módulo, usuario o acción" />

      <Table
        columns={[
          { key: 'created_at', label: 'Fecha/Hora', render: (row) => formatDateTime(row.created_at) },
          { key: 'module', label: 'Módulo', render: (row) => row.modules?.name || '—' },
          { key: 'user', label: 'Usuario', render: (row) => row.users?.username || '—' },
          { key: 'action_type', label: 'Tipo de Acción' },
          { key: 'reference_id', label: 'Referencia ID' },
          { key: 'amount', label: 'Monto', render: (row) => row.amount ? new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(Number(row.amount)) : '—' },
          { key: 'notes', label: 'Notas', render: (row) => row.notes || '—' }
        ]}
        data={filtered}
        isLoading={moduleHook.query.isLoading}
        emptyMessage="No hay movimientos de inventario"
      />

      <Pagination page={1} totalPages={1} onPageChange={() => undefined} />
    </div>
  );
}
