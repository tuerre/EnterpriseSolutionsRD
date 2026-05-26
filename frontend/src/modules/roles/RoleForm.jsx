import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Input from '../../components/ui/Input';

const schema = z.object({
  role_name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional().or(z.literal('')),
  is_active: z.boolean().optional()
});

export default function RoleForm({ initialValues, onSubmit, loading, onCancel, showStatusField = false }) {
  const [isDeactivateConfirmOpen, setIsDeactivateConfirmOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setFocus, watch, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role_name: initialValues?.role_name || '', description: initialValues?.description || '', is_active: initialValues?.is_active ?? true }
  });
  const isActive = watch('is_active');

  useEffect(() => {
    reset({ role_name: initialValues?.role_name || '', description: initialValues?.description || '', is_active: initialValues?.is_active ?? true });
    setIsDeactivateConfirmOpen(false);
    setFocus('role_name');
  }, [initialValues, reset, setFocus]);

  const handleStatusChange = (event) => {
    const nextValue = event.target.checked;

    if (initialValues?.is_active !== false && nextValue === false) {
      setIsDeactivateConfirmOpen(true);
      return;
    }

    setValue('is_active', nextValue, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const handleDeactivateConfirm = () => {
    setValue('is_active', false, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    setIsDeactivateConfirmOpen(false);
  };

  const handleDeactivateCancel = () => {
    setIsDeactivateConfirmOpen(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 16 }}>
      <Input label="Nombre del rol *" register={register} name="role_name" error={errors.role_name?.message} />
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Descripción</span>
        <textarea {...register('description')} rows={4} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12, outline: 'none', resize: 'vertical' }} />
      </label>
      {showStatusField ? (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={isActive !== false} onChange={handleStatusChange} />
          <span style={{ color: 'var(--text2)', fontSize: 13 }}>Activo</span>
        </label>
      ) : (
        <p style={{ margin: 0, color: 'var(--text2)', fontSize: 13 }}>El rol se creará como activo.</p>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Guardar</Button>
      </div>

      <ConfirmDialog
        isOpen={isDeactivateConfirmOpen}
        onClose={handleDeactivateCancel}
        onConfirm={handleDeactivateConfirm}
        title="Desactivar rol"
        message="¿Estás seguro que deseas desactivar este rol?"
        confirmLabel="Desactivar"
        isLoading={loading}
      />
    </form>
  );
}
