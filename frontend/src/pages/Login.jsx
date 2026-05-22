import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const schema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  password: z.string().min(1, 'La contraseña es obligatoria')
});

export default function Login() {
  const navigate = useNavigate();
  const { login, user, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!isLoading && user) navigate('/dashboard', { replace: true });
  }, [isLoading, user, navigate]);

  const onSubmit = async (values) => {
    try {
      await login(values.username, values.password);
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.message || error.message || 'No se pudo iniciar sesión');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', background: 'var(--bg)' }}>
      <div style={{ display: 'grid', placeItems: 'center', background: 'var(--surface2)', padding: 48 }}>
        <div style={{ textAlign: 'center', maxWidth: 520 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 56, fontWeight: 300, lineHeight: 1.05 }}>Enterprise Solutions RD</div>
          <p style={{ marginTop: 16, color: 'var(--text2)', letterSpacing: '0.04em' }}>Sistema de Gestión Empresarial</p>
        </div>
      </div>
      <div style={{ position: 'relative', display: 'grid', placeItems: 'center', padding: 32 }}>
        <Button variant="ghost" size="sm" onClick={toggleTheme} style={{ position: 'absolute', top: 24, right: 24 }}>
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </Button>
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%', maxWidth: 440, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: 32 }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 300, marginBottom: 24 }}>Iniciar Sesión</h1>
          <div style={{ display: 'grid', gap: 20 }}>
            <Input label="Usuario *" placeholder="Ingresa tu usuario" register={register} name="username" error={errors.username?.message} autoComplete="username" />
            <label style={{ display: 'block', width: '100%' }}>
              <span style={{ display: 'block', marginBottom: 6, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>Contraseña *</span>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  {...register('password')}
                  autoComplete="current-password"
                  style={{ width: '100%', background: 'transparent', color: 'var(--text)', border: 'none', borderBottom: '1px solid var(--border)', padding: '10px 36px 10px 0', outline: 'none' }}
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)} style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password?.message ? <span style={{ display: 'block', marginTop: 6, fontSize: 12, color: 'var(--danger)' }}>{errors.password.message}</span> : null}
            </label>
            <Button type="submit" loading={isSubmitting}>Ingresar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SunIcon() { return <span>☀</span>; }
function MoonIcon() { return <span>☾</span>; }
