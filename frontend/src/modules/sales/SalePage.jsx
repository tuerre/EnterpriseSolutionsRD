import { useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useSales } from './useSales';
import SaleForm from './SaleForm';

const detailCardStyle = {
  border: '1px solid var(--border)',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.02)',
  padding: 16
};

export default function SalePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const moduleHook = useSales();
  const sales = moduleHook.query.data?.data || [];
  const filtered = useMemo(() => sales.filter((item) => `${item.invoice_number} ${item.users?.username || ''}`.toLowerCase().includes(searchTerm.toLowerCase())), [sales, searchTerm]);
  const selectedItems = selectedSale?.sale_details || [];
  const paymentMethod = selectedSale?.payment_method || '—';
  const invoiceDate = formatDateTime(selectedSale?.sale_date || selectedSale?.created_at);

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

      <Modal isOpen={Boolean(selectedSale)} onClose={() => setSelectedSale(null)} title={selectedSale ? `Detalle de ${selectedSale.invoice_number}` : 'Detalle de venta'} size="lg">
        {selectedSale ? (
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
              <div style={detailCardStyle}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Factura</div>
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 600 }}>{selectedSale.invoice_number}</div>
              </div>
              <div style={detailCardStyle}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Usuario</div>
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 600 }}>{selectedSale.users?.username || '—'}</div>
              </div>
              <div style={detailCardStyle}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Fecha</div>
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 600 }}>{invoiceDate}</div>
              </div>
              <div style={detailCardStyle}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Pago</div>
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 600 }}>{paymentMethod}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
              <div style={detailCardStyle}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Subtotal</div>
                <div style={{ marginTop: 8, fontSize: 24, fontFamily: 'Cormorant Garamond, serif', fontWeight: 300 }}>{formatCurrency(selectedSale.subtotal)}</div>
              </div>
              <div style={detailCardStyle}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Impuestos</div>
                <div style={{ marginTop: 8, fontSize: 24, fontFamily: 'Cormorant Garamond, serif', fontWeight: 300 }}>{formatCurrency(selectedSale.taxes)}</div>
              </div>
              <div style={{ ...detailCardStyle, borderColor: 'rgba(255,255,255,0.14)' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Total final</div>
                <div style={{ marginTop: 8, fontSize: 24, fontFamily: 'Cormorant Garamond, serif', fontWeight: 300 }}>{formatCurrency(selectedSale.total_final)}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Productos vendidos</h3>
                <div style={{ color: 'var(--text2)', fontSize: 12 }}>{selectedItems.length} ítems</div>
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Producto</th>
                      <th style={{ padding: '12px 16px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Cantidad</th>
                      <th style={{ padding: '12px 16px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Precio unitario</th>
                      <th style={{ padding: '12px 16px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.length > 0 ? selectedItems.map((item, index) => (
                      <tr key={`${item.detail_id || item.product_id || index}`} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600 }}>{item.products?.product_name || 'Producto'}</div>
                          <div style={{ color: 'var(--text2)', fontSize: 12 }}>ID {item.product_id}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>{item.quantity}</td>
                        <td style={{ padding: '14px 16px' }}>{formatCurrency(item.unit_price)}</td>
                        <td style={{ padding: '14px 16px' }}>{formatCurrency(Number(item.unit_price || 0) * Number(item.quantity || 0))}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--text2)' }}>No hay detalles disponibles para esta venta.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" type="button" onClick={() => setSelectedSale(null)}>Cerrar</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
