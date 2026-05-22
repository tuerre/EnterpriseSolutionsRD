import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  company_name: z.string().min(1, 'La empresa es obligatoria'),
  tax_id: z.string().min(1, 'El tax ID es obligatorio'),
  contact_name: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Correo inválido').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal(''))
});

export default function SupplierForm({ initialValues, onSubmit, loading, onCancel }) {
  const { register, handleSubmit, formState: { errors }, reset, setFocus } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      company_name: initialValues?.company_name || '',
      tax_id: initialValues?.tax_id || '',
      contact_name: initialValues?.contact_name || '',
      phone: initialValues?.phone || '',
      email: initialValues?.email || '',
      address: initialValues?.address || ''
    }
  });

  useEffect(() => {
    reset({
      company_name: initialValues?.company_name || '',
      tax_id: initialValues?.tax_id || '',
      contact_name: initialValues?.contact_name || '',
      phone: initialValues?.phone || '',
      email: initialValues?.email || '',
      address: initialValues?.address || ''
    });
    setFocus('company_name');
  }, [initialValues, reset, setFocus]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 16 }}>
      <Input label="Empresa *" register={register} name="company_name" error={errors.company_name?.message} />
      <Input label="Tax ID *" register={register} name="tax_id" error={errors.tax_id?.message} />
      <Input label="Contacto" register={register} name="contact_name" error={errors.contact_name?.message} />
      <Input label="Teléfono" register={register} name="phone" error={errors.phone?.message} />
      <Input label="Email" register={register} name="email" error={errors.email?.message} />
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Dirección</span>
        <textarea {...register('address')} rows={4} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12, outline: 'none', resize: 'vertical' }} />
      </label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Guardar</Button>
      </div>
    </form>
  );
}
