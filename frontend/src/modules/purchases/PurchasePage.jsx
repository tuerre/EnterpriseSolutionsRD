import { useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { usePurchases } from './usePurchases';
import PurchaseForm from './PurchaseForm';

export default function PurchasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const moduleHook = usePurchases();
  const purchases = moduleHook.query.data?.data || [];

  const filtered = useMemo(() => purchases.filter((item) => `${item.purchase_id} ${item.suppliers?.company_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase())), [purchases, searchTerm]);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 300 }}>Compras</h1>
          <p style={{ color: 'var(--text2)' }}>Historial maestro-detalle de compras.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>Nueva compra</Button>
      </div>

      <SearchBar value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar compra o proveedor" />

      <Table
        columns={[
          { key: 'purchase_id', label: 'ID' },
          { key: 'supplier', label: 'Proveedor', render: (row) => row.suppliers?.company_name || '—' },
          { key: 'date', label: 'Fecha', render: (row) => formatDateTime(row.purchase_date) },
          { key: 'total', label: 'Total', render: (row) => formatCurrency(row.total_amount) },
          { key: 'actions', label: 'Acciones', render: (row) => <Button variant="ghost" size="sm" onClick={() => setSelectedPurchase(row)}>Ver detalle</Button> }
        ]}
        data={filtered}
        isLoading={moduleHook.query.isLoading}
        emptyMessage="No hay compras registradas"
      />

      <Pagination page={1} totalPages={1} onPageChange={() => undefined} />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Nueva compra" size="lg">
        <PurchaseForm onCreated={() => setIsFormOpen(false)} />
      </Modal>

      <Modal isOpen={Boolean(selectedPurchase)} onClose={() => setSelectedPurchase(null)} title="Detalle de compra" size="lg">
        {selectedPurchase ? <pre style={{ whiteSpace: 'pre-wrap', color: 'var(--text2)', margin: 0 }}>{JSON.stringify(selectedPurchase, null, 2)}</pre> : null}
      </Modal>
    </div>
  );
}
