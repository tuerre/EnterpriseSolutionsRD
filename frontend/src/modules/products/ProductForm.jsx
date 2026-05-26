import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  product_name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  category_id: z.coerce.number().int().positive('Selecciona una categoría'),
  supplier_id: z.coerce.number().int().positive('Selecciona un proveedor'),
  tax_id: z.coerce.number().int().positive('Selecciona un impuesto'),
  cost_price: z.coerce.number().positive('El costo debe ser mayor a 0'),
  sale_price: z.coerce.number().positive('El precio de venta debe ser mayor a 0'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  aisle_location: z.string().min(1, 'El pasillo es obligatorio')
}).refine((values) => values.sale_price > values.cost_price, {
  message: 'El precio de venta debe ser mayor al costo',
  path: ['sale_price']
});

export default function ProductForm({ initialValues, categories, suppliers, taxTypes, onSubmit, loading, onCancel }) {
  const { register, handleSubmit, formState: { errors }, reset, setFocus } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      product_name: initialValues?.product_name || '',
      description: initialValues?.description || '',
      category_id: initialValues?.category_id || '',
      supplier_id: initialValues?.supplier_id || '',
      tax_id: initialValues?.tax_id || '',
      cost_price: initialValues?.cost_price || 0,
      sale_price: initialValues?.sale_price || 0,
      stock: initialValues?.stock || 0,
      aisle_location: initialValues?.aisle_location || ''
    }
  });

  useEffect(() => {
    reset({
      product_name: initialValues?.product_name || '',
      description: initialValues?.description || '',
      category_id: initialValues?.category_id || '',
      supplier_id: initialValues?.supplier_id || '',
      tax_id: initialValues?.tax_id || '',
      cost_price: initialValues?.cost_price || 0,
      sale_price: initialValues?.sale_price || 0,
      stock: initialValues?.stock || 0,
      aisle_location: initialValues?.aisle_location || ''
    });
    setFocus('product_name');
  }, [initialValues, reset, setFocus]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 16 }}>
      <Input label="Nombre *" register={register} name="product_name" error={errors.product_name?.message} />
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Descripción *</span>
        <textarea {...register('description')} rows={4} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12, outline: 'none', resize: 'vertical' }} />
        {errors.description?.message ? <span style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.description.message}</span> : null}
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Categoría *</span>
          <select {...register('category_id')} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12 }}>
            <option value="">Selecciona</option>
            {categories.map((item) => <option key={item.category_id} value={item.category_id}>{item.category_name}</option>)}
          </select>
          {errors.category_id?.message ? <span style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.category_id.message}</span> : null}
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Proveedor *</span>
          <select {...register('supplier_id')} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12 }}>
            <option value="">Selecciona</option>
            {suppliers.map((item) => <option key={item.supplier_id} value={item.supplier_id}>{item.company_name}</option>)}
          </select>
          {errors.supplier_id?.message ? <span style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.supplier_id.message}</span> : null}
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Impuesto *</span>
          <select {...register('tax_id')} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12 }}>
            <option value="">Selecciona</option>
            {taxTypes.map((item) => <option key={item.tax_id} value={item.tax_id}>{item.name} {item.percentage}%</option>)}
          </select>
          {errors.tax_id?.message ? <span style={{ fontSize: 12, color: 'var(--danger)' }}>{errors.tax_id.message}</span> : null}
        </label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <Input label="Costo *" type="number" step="0.01" min="0" register={register} name="cost_price" error={errors.cost_price?.message} />
        <Input label="Venta *" type="number" step="0.01" min="0" register={register} name="sale_price" error={errors.sale_price?.message} />
        <Input label="Stock *" type="number" step="1" min="0" register={register} name="stock" error={errors.stock?.message} />
        <Input label="Pasillo *" register={register} name="aisle_location" error={errors.aisle_location?.message} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Guardar</Button>
      </div>
    </form>
  );
}
