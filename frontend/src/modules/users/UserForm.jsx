import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const schema = z.object({
  username: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirm_password: z.string().min(8, 'Confirma la contraseña'),
  employee_id: z.string().optional().or(z.literal('')),
  role_id: z.coerce.number().int().positive('Selecciona un rol')
}).refine((values) => values.password === values.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password']
});

export default function UserForm({ roles, employees, onSubmit, loading, onCancel }) {
  const defaults = useMemo(() => ({
    username: '',
    password: '',
    confirm_password: '',
    employee_id: '',
    role_id: ''
  }), []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(schema), defaultValues: defaults });

  return (
    <form onSubmit={handleSubmit(async (values) => {
      await onSubmit(values);
      reset(defaults);
    })} style={{ display: 'grid', gap: 16 }}>
      <Input label="Username *" register={register} name="username" error={errors.username?.message} />
      <Input label="Contraseña *" type="password" register={register} name="password" error={errors.password?.message} />
      <Input label="Confirmar contraseña *" type="password" register={register} name="confirm_password" error={errors.confirm_password?.message} />
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Empleado</span>
        <select {...register('employee_id')} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12 }}>
          <option value="">Sin empleado</option>
          {employees.map((employee) => <option key={employee.employee_id} value={employee.employee_id}>{employee.first_name} {employee.last_name}</option>)}
        </select>
      </label>
      <label style={{ display: 'grid', gap: 6 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Rol *</span>
        <select {...register('role_id')} style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', borderRadius: 3, color: 'var(--text)', padding: 12 }}>
          <option value="">Selecciona</option>
          {roles.map((role) => <option key={role.role_id} value={role.role_id}>{role.role_name}</option>)}
        </select>
      </label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" loading={loading}>Guardar</Button>
      </div>
    </form>
  );
}
