import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { createSale } from '../../api/sales.api';
import { getAllProducts } from '../../api/products.api';
import { useAuth } from '../../hooks/useAuth';

export default function SaleForm({ onCreated }) {
  const { user } = useAuth();
  const productsQuery = useQuery({ queryKey: ['sale-products'], queryFn: async () => (await getAllProducts({ limit: 100 })).data });
  const products = productsQuery.data?.data?.products || [];
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);

  const summary = useMemo(() => items.reduce((accumulator, item) => {
    const product = products.find((entry) => String(entry.product_id) === String(item.product_id));
    const quantity = Number(item.quantity) || 0;
    const salePrice = Number(product?.sale_price) || 0;
    const taxRate = Number(product?.tax_types?.percentage) || 0;
    const lineSubtotal = quantity * salePrice;
    const lineTax = lineSubtotal * (taxRate / 100);

    return {
      subtotal: accumulator.subtotal + lineSubtotal,
      taxes: accumulator.taxes + lineTax,
      total: accumulator.total + lineSubtotal + lineTax
    };
  }, { subtotal: 0, taxes: 0, total: 0 }), [items, products]);

  const currencyFormatter = useMemo(() => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }), []);

  const updateItem = (index, key, value) => {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
  };

  const submit = async (event) => {
    event.preventDefault();

    try {
      await createSale({
        payment_method: paymentMethod,
        items: items.map((item) => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) }))
      });
      toast.success('Venta registrada exitosamente');
      onCreated?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'No se pudo registrar la venta');
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Método de pago</span>
        <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12 }}>
          <option>Efectivo</option>
          <option>Tarjeta de Crédito</option>
          <option>Tarjeta de Débito</option>
          <option>Transferencia</option>
        </select>
      </div>

      <div style={{ display: 'grid', gap: 12, maxHeight: 360, overflowY: 'auto', paddingRight: 8 }}>
        {items.map((item, index) => (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Producto</span>
              <select value={item.product_id} onChange={(event) => updateItem(index, 'product_id', event.target.value)} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12 }}>
                <option value="">Selecciona</option>
                {products.map((product) => <option key={product.product_id} value={product.product_id}>{product.product_name}</option>)}
              </select>
            </label>
            <Input label="Cantidad" type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} />
            <Button type="button" variant="ghost" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Eliminar</Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={() => setItems((current) => [...current, { product_id: '', quantity: 1 }])}>Agregar producto</Button>

      <div style={{ display: 'grid', gap: 12, padding: 16, border: '1px solid var(--border)', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Subtotal estimado</span>
            <strong style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 300 }}>{currencyFormatter.format(summary.subtotal)}</strong>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Impuestos estimados</span>
            <strong style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 300 }}>{currencyFormatter.format(summary.taxes)}</strong>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Total estimado</span>
            <strong style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 300 }}>{currencyFormatter.format(summary.total)}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ color: 'var(--text2)', fontSize: 12 }}>Los impuestos estimados se calculan según el porcentaje asociado a cada producto.</div>
          <Button type="submit">Registrar venta</Button>
        </div>
      </div>

      <div style={{ color: 'var(--text2)', fontSize: 12 }}>Usuario actual: {user?.username}</div>
    </form>
  );
}
