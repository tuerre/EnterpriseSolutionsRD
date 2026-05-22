import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  role_name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional().or(z.literal('')),
  is_active: z.boolean().optional()
});

export default function RoleForm({ initialValues, onSubmit, loading, onCancel }) {
  const { register, handleSubmit, formState: { errors }, reset, setFocus } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role_name: initialValues?.role_name || '', description: initialValues?.description || '', is_active: initialValues?.is_active ?? true }
  });

  useEffect(() => {
    reset({ role_name: initialValues?.role_name || '', description: initialValues?.description || '', is_active: initialValues?.is_active ?? true });
    setFocus('role_name');
  }, [initialValues, reset, setFocus]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 16 }}>
      <Input label="Nombre del rol *" register={register} name="role_name" error={errors.role_name?.message} />
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Descripción</span>
        <textarea {...register('description')} rows={4} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12, outline: 'none', resize: 'vertical' }} />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" {...register('is_active')} defaultChecked />
        <span style={{ color: 'var(--text2)', fontSize: 13 }}>Activo</span>
      </label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Guardar</Button>
      </div>
    </form>
  );
}
