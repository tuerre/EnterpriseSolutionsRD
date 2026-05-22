import { useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useSales } from './useSales';
import SaleForm from './SaleForm';

export default function SalePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const moduleHook = useSales();
  const sales = moduleHook.query.data?.data || [];
  const filtered = useMemo(() => sales.filter((item) => `${item.invoice_number} ${item.users?.username || ''}`.toLowerCase().includes(searchTerm.toLowerCase())), [sales, searchTerm]);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 300 }}>Ventas</h1>
          <p style={{ color: 'var(--text2)' }}>Historial maestro-detalle de ventas.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>Nueva venta</Button>
      </div>

      <SearchBar value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar factura o usuario" />

      <Table
        columns={[
          { key: 'invoice_number', label: 'N° Factura' },
          { key: 'sale_date', label: 'Fecha', render: (row) => formatDateTime(row.sale_date) },
          { key: 'user', label: 'Usuario', render: (row) => row.users?.username || '—' },
          { key: 'subtotal', label: 'Subtotal', render: (row) => formatCurrency(row.subtotal) },
          { key: 'taxes', label: 'Impuestos', render: (row) => formatCurrency(row.taxes) },
          { key: 'total_final', label: 'Total', render: (row) => formatCurrency(row.total_final) },
          { key: 'payment_method', label: 'Método de Pago' },
          { key: 'actions', label: 'Acciones', render: (row) => <Button variant="ghost" size="sm" onClick={() => setSelectedSale(row)}>Ver detalle</Button> }
        ]}
        data={filtered}
        isLoading={moduleHook.query.isLoading}
        emptyMessage="No hay ventas registradas"
      />

      <Pagination page={1} totalPages={1} onPageChange={() => undefined} />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Nueva venta" size="lg">
        <SaleForm onCreated={() => setIsFormOpen(false)} />
      </Modal>

      <Modal isOpen={Boolean(selectedSale)} onClose={() => setSelectedSale(null)} title="Detalle de venta" size="lg">
        {selectedSale ? <pre style={{ whiteSpace: 'pre-wrap', color: 'var(--text2)', margin: 0 }}>{JSON.stringify(selectedSale, null, 2)}</pre> : null}
      </Modal>
    </div>
  );
}
