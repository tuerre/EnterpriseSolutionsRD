import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { createPurchase } from '../../api/purchases.api';
import { getAllSuppliers } from '../../api/suppliers.api';
import { getAllProducts } from '../../api/products.api';

export default function PurchaseForm({ onCreated }) {
  const suppliersQuery = useQuery({ queryKey: ['purchase-suppliers'], queryFn: async () => (await getAllSuppliers({ limit: 100 })).data });
  const productsQuery = useQuery({ queryKey: ['purchase-products'], queryFn: async () => (await getAllProducts({ limit: 100 })).data });
  const suppliers = suppliersQuery.data?.data?.suppliers || [];
  const products = productsQuery.data?.data?.products || [];
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1, unit_price: '' }]);

  const total = useMemo(() => items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unit_price) || 0), 0), [items]);

  const updateItem = (index, key, value) => {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  };

  const chooseProduct = (index, productId) => {
    const selected = products.find((product) => String(product.product_id) === String(productId));
    updateItem(index, 'product_id', productId);
    updateItem(index, 'unit_price', selected?.cost_price || '');
  };

  const submit = async (event) => {
    event.preventDefault();

    try {
      await createPurchase({
        supplier_id: Number(supplierId),
        items: items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          unit_price: item.unit_price === '' ? undefined : Number(item.unit_price)
        }))
      });
      toast.success('Compra registrada exitosamente');
      onCreated?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo registrar la compra');
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 20 }}>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Proveedor *</span>
        <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12 }}>
          <option value="">Selecciona</option>
          {suppliers.map((supplier) => <option key={supplier.supplier_id} value={supplier.supplier_id}>{supplier.company_name}</option>)}
        </select>
      </label>

      {items.map((item, index) => (
        <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Producto</span>
            <select value={item.product_id} onChange={(event) => chooseProduct(index, event.target.value)} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12 }}>
              <option value="">Selecciona</option>
              {products.map((product) => <option key={product.product_id} value={product.product_id}>{product.product_name}</option>)}
            </select>
          </label>
          <Input label="Cantidad" type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} />
          <Input label="Precio unitario" type="number" step="0.01" min="0" value={item.unit_price} onChange={(event) => updateItem(index, 'unit_price', event.target.value)} />
          <Button type="button" variant="ghost" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Eliminar</Button>
        </div>
      ))}

      <Button type="button" variant="secondary" onClick={() => setItems((current) => [...current, { product_id: '', quantity: 1, unit_price: '' }])}>Agregar producto</Button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300 }}>Total: {new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(total)}</div>
        <Button type="submit">Registrar compra</Button>
      </div>
    </form>
  );
}
