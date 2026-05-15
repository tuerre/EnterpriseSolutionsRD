import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/common/Button';
import { LogIn, Lock, Mail, Sparkles, Shield } from 'lucide-react';

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0118] relative overflow-hidden">
      {/* Gradientes de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-[#d946ef]/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-[#7c3aed]/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#8b5cf6]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo y título */}
        <div className="text-center mb-10 animate-[fadeIn_0.6s_ease-in-out]">
          <div className="inline-flex items-center justify-center w-20 h-20 glass rounded-3xl shadow-[0_0_40px_rgba(217,70,239,0.4)] mb-6 border-2 border-white/20">
            <div className="w-16 h-16 bg-gradient-to-br from-[#d946ef] to-[#7c3aed] rounded-2xl flex items-center justify-center animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-black gradient-text mb-3 tracking-tight">
            Enterprise Solutions
          </h1>
          <p className="text-[#94a3b8] font-medium text-lg">Sistema de Gestión Empresarial</p>
        </div>

        {/* Formulario de login */}
        <div className="glass rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden backdrop-blur-2xl animate-[fadeIn_0.8s_ease-in-out]">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-bold text-white">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] group-focus-within:text-[#d946ef] transition-colors duration-300" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@empresa.com"
                    className="w-full pl-12 pr-4 py-3.5 glass rounded-2xl text-white placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-bold text-white">
                  Contraseña
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] group-focus-within:text-[#d946ef] transition-colors duration-300" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 glass rounded-2xl text-white placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="glass rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm font-medium animate-[fadeIn_0.3s_ease-in-out]">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {error}
                  </div>
                </div>
              )}

              {/* Submit button */}
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="lg"
                icon={<LogIn className="w-5 h-5" />}
                loading={loading}
              >
                Iniciar Sesión
              </Button>
            </form>
          </div>

          {/* Demo credentials */}
          <div className="px-8 pb-8">
            <div className="glass rounded-2xl p-5 border border-[#7c3aed]/30 bg-[#7c3aed]/5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d946ef] to-[#7c3aed] flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white mb-2">Acceso de Prueba</p>
                  <p className="text-xs text-[#94a3b8] font-medium mb-1">
                    <span className="text-[#d946ef]">Email:</span> cualquier@email.com
                  </p>
                  <p className="text-xs text-[#94a3b8] font-medium">
                    <span className="text-[#d946ef]">Contraseña:</span> cualquier texto
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 animate-[fadeIn_1s_ease-in-out]">
          <p className="text-[#94a3b8] text-sm font-medium">
            © 2026 Enterprise Solutions. Powered by Innovation.
          </p>
        </div>
      </div>
    </div>
  );
}







