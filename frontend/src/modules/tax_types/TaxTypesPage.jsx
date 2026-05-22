import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { formatDateTime, formatPercentage } from '../../utils/formatters';
import { useTaxTypes } from './useTaxTypes';
import TaxTypeForm from './TaxTypeForm';

export default function TaxTypesPage() {
  const { hasPermission } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const moduleHook = useTaxTypes();
  const taxType = moduleHook.query.data?.tax_type || null;

  const onSubmit = async (values) => {
    await moduleHook.create.mutateAsync(values);
    setIsFormOpen(false);
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 300 }}>Tipos de Impuesto</h1>
          <p style={{ color: 'var(--text2)' }}>El backend devuelve siempre el último impuesto registrado.</p>
        </div>
        {hasPermission('tax_types', 'can_insert') ? <Button onClick={() => setIsFormOpen(true)}><Plus size={16} /> Actualizar impuesto</Button> : null}
      </div>

      <Table
        columns={[
          { key: 'name', label: 'Nombre', render: (row) => row.name },
          { key: 'percentage', label: 'Porcentaje', render: (row) => formatPercentage(row.percentage) },
          { key: 'updated_at', label: 'Última actualización', render: (row) => formatDateTime(row.updated_at) }
        ]}
        data={taxType ? [taxType] : []}
        isLoading={moduleHook.query.isLoading}
        emptyMessage="No hay tipos de impuesto registrados"
      />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Actualizar impuesto">
        <TaxTypeForm initialValues={taxType} loading={moduleHook.create.isPending} onSubmit={onSubmit} onCancel={() => setIsFormOpen(false)} />
      </Modal>
    </div>
  );
}