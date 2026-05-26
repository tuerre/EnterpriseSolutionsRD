import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  percentage: z.coerce.number().min(0.01, 'El porcentaje debe ser mayor a 0').max(100, 'No puede exceder 100')
});

export default function TaxTypeForm({ initialValues, onSubmit, loading, onCancel }) {
  const { register, handleSubmit, formState: { errors }, reset, setFocus } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { percentage: initialValues?.percentage || '' }
  });

  useEffect(() => {
    reset({ percentage: initialValues?.percentage || '' });
    setFocus('percentage');
  }, [initialValues, reset, setFocus]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 16 }}>
      <Input label="Porcentaje *" type="number" step="0.01" min="0" register={register} name="percentage" error={errors.percentage?.message} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Guardar</Button>
      </div>
    </form>
  );
}
