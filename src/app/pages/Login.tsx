import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
      await login(username, password);
      window.location.replace('/inicio');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: '#0a0118',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Fondos decorativos */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '25%', left: '-10%',
          width: '24rem', height: '24rem',
          background: 'rgba(217,70,239,0.15)',
          borderRadius: '50%', filter: 'blur(120px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '25%', right: '-10%',
          width: '24rem', height: '24rem',
          background: 'rgba(124,58,237,0.15)',
          borderRadius: '50%', filter: 'blur(120px)',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: '28rem', position: 'relative', zIndex: 10 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '5rem', height: '5rem',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(24px)',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '1.5rem',
            boxShadow: '0 0 40px rgba(217,70,239,0.4)',
            marginBottom: '1.5rem',
          }}>
            <div style={{
              width: '4rem', height: '4rem',
              background: 'linear-gradient(135deg, #d946ef, #7c3aed)',
              borderRadius: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles style={{ width: '2.5rem', height: '2.5rem', color: 'white' }} />
            </div>
          </div>
          <h1 style={{
            fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.04em',
            background: 'linear-gradient(135deg, #d946ef, #7c3aed)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
          }}>
            Enterprise Solutions
          </h1>
          <p style={{ color: '#94a3b8', fontWeight: 500, fontSize: '1.1rem' }}>
            Sistema de Gestión Empresarial
          </p>
        </div>

        {/* Card del formulario */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '1.5rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          padding: '2rem',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Usuario */}
            <div>
              <label htmlFor="username" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                placeholder="Ingrese su nombre de usuario"
                autoComplete="username"
                disabled={loading}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '1rem',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.target.style.border = '1px solid #d946ef'; e.target.style.boxShadow = '0 0 0 2px rgba(217,70,239,0.2)'; }}
                onBlur={(e) => { e.target.style.border = '1px solid rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '1rem',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.target.style.border = '1px solid #d946ef'; e.target.style.boxShadow = '0 0 0 2px rgba(217,70,239,0.2)'; }}
                onBlur={(e) => { e.target.style.border = '1px solid rgba(255,255,255,0.15)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Error — siempre en el DOM, solo cambia la visibilidad via style */}
            <div
              style={{
                padding: error ? '0.75rem 1rem' : '0',
                maxHeight: error ? '80px' : '0px',
                overflow: 'hidden',
                background: error ? 'rgba(239,68,68,0.1)' : 'transparent',
                border: error ? '1px solid rgba(239,68,68,0.35)' : '1px solid transparent',
                borderRadius: '1rem',
                color: '#f87171',
                fontSize: '0.875rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {error && <span>⛔ {error}</span>}
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem 2rem',
                background: loading ? 'rgba(217,70,239,0.5)' : 'linear-gradient(135deg, #d946ef, #7c3aed)',
                border: 'none',
                borderRadius: '1rem',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: loading ? 'none' : '0 0 30px rgba(217,70,239,0.35)',
              }}
            >
              {loading ? 'Verificando...' : '→ Iniciar Sesión'}
            </button>

          </form>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', marginTop: '2rem' }}>
          © 2026 Enterprise Solutions. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
