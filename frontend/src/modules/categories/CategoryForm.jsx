import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  category_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres')
});

export default function CategoryForm({ initialValues, onSubmit, loading, onCancel }) {
  const { register, handleSubmit, formState: { errors }, setFocus, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { category_name: initialValues?.category_name || '' }
  });

  useEffect(() => {
    reset({ category_name: initialValues?.category_name || '' });
    setFocus('category_name');
  }, [initialValues, reset, setFocus]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 20 }}>
      <Input label="Nombre *" register={register} name="category_name" error={errors.category_name?.message} placeholder="Nombre de la categoría" autoFocus />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Guardar</Button>
      </div>
    </form>
  );
}
