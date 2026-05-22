import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  first_name: z.string().min(1, 'El nombre es obligatorio'),
  last_name: z.string().min(1, 'El apellido es obligatorio'),
  email: z.string().email('Correo inválido'),
  id_card: z.string().min(1, 'La cédula es obligatoria'),
  dept_id: z.string().optional().or(z.literal('')),
  salary: z.coerce.number().min(0, 'El salario debe ser mayor o igual a 0')
});

export default function EmployeeForm({ initialValues, departments, onSubmit, loading, onCancel }) {
  const { register, handleSubmit, formState: { errors }, reset, setFocus } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: initialValues?.first_name || '',
      last_name: initialValues?.last_name || '',
      email: initialValues?.email || '',
      id_card: initialValues?.id_card || '',
      dept_id: initialValues?.dept_id ? String(initialValues.dept_id) : '',
      salary: initialValues?.salary || 0
    }
  });

  useEffect(() => {
    reset({
      first_name: initialValues?.first_name || '',
      last_name: initialValues?.last_name || '',
      email: initialValues?.email || '',
      id_card: initialValues?.id_card || '',
      dept_id: initialValues?.dept_id ? String(initialValues.dept_id) : '',
      salary: initialValues?.salary || 0
    });
    setFocus('first_name');
  }, [initialValues, reset, setFocus]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Input label="Primer nombre *" register={register} name="first_name" error={errors.first_name?.message} />
        <Input label="Apellido *" register={register} name="last_name" error={errors.last_name?.message} />
      </div>
      <Input label="Email *" register={register} name="email" error={errors.email?.message} />
      <Input label="Cédula *" register={register} name="id_card" error={errors.id_card?.message} />
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Departamento</span>
        <select {...register('dept_id')} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12, outline: 'none' }}>
          <option value="">Sin departamento</option>
          {departments.map((department) => <option key={department.dept_id} value={department.dept_id}>{department.name}</option>)}
        </select>
      </label>
      <Input label="Salario" type="number" step="0.01" min="0" register={register} name="salary" error={errors.salary?.message} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Guardar</Button>
      </div>
    </form>
  );
}
