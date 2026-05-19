import { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Plus, Shield, Key, Settings, AlertTriangle, Trash2 } from 'lucide-react';
import { useDataStore } from '../contexts/DataStoreContext';
import { toast } from 'sonner';

type Usuario = {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  ultimoAcceso: string;
  estado: string;
};

export function Admin() {
  const { addNotification, logs, addLog } = useDataStore();
  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const saved = localStorage.getItem('system_usuarios');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', nombre: 'Pedro Ramírez', email: 'pedro@serd.com', rol: 'ADMIN', ultimoAcceso: '2026-05-08 15:30', estado: 'Activo' },
      { id: '2', nombre: 'Roberto García', email: 'roberto@serd.com', rol: 'VENDEDOR', ultimoAcceso: '2026-05-08 14:20', estado: 'Activo' },
      { id: '3', nombre: 'Laura Sánchez', email: 'laura@serd.com', rol: 'BODEGUERO', ultimoAcceso: '2026-05-08 13:45', estado: 'Activo' },
      { id: '4', nombre: 'Sofia López', email: 'sofia@serd.com', rol: 'READONLY', ultimoAcceso: '2026-05-07 18:00', estado: 'Bloqueado' },
    ];
  });

  useEffect(() => {
    localStorage.setItem('system_usuarios', JSON.stringify(usuarios));
  }, [usuarios]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);

  const [formData, setFormData] = useState<Omit<Usuario, 'id' | 'ultimoAcceso'>>({
    nombre: '',
    email: '',
    rol: 'VENDEDOR',
    estado: 'Activo'
  });

  const [activeConfigModal, setActiveConfigModal] = useState<string | null>(null);

  const getRolColor = (rol: string) => {
    const colors = {
      ADMIN: 'bg-red-100 text-red-700',
      VENDEDOR: 'bg-blue-100 text-blue-700',
      BODEGUERO: 'bg-purple-100 text-purple-700',
      READONLY: 'bg-gray-100 text-[#94a3b8]'
    };
    return colors[rol as keyof typeof colors] || colors.READONLY;
  };

  const rolesStats = [
    { rol: 'Administradores', count: usuarios.filter(u => u.rol === 'ADMIN').length, color: 'red', icon: Shield },
    { rol: 'Vendedores', count: usuarios.filter(u => u.rol === 'VENDEDOR').length, color: 'blue', icon: Key },
    { rol: 'Bodegueros', count: usuarios.filter(u => u.rol === 'BODEGUERO').length, color: 'purple', icon: Settings },
    { rol: 'Solo Lectura', count: usuarios.filter(u => u.rol === 'READONLY').length, color: 'gray', icon: Shield },
  ];

  const handleOpenModal = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        estado: usuario.estado
      });
    } else {
      setEditingUsuario(null);
      setFormData({
        nombre: '', email: '', rol: 'VENDEDOR', estado: 'Activo'
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUsuario) {
      setUsuarios(usuarios.map(u => u.id === editingUsuario.id ? { ...u, ...formData } : u));
      toast.success('Usuario actualizado exitosamente');
    } else {
      const newUsuario = {
        ...formData,
        id: Date.now().toString(),
        ultimoAcceso: 'Nunca'
      };
      setUsuarios([...usuarios, newUsuario]);
      toast.success('Usuario creado exitosamente');
    }
    setIsModalOpen(false);
  };

  const handleToggleEstado = (id: string, currentState: string) => {
    setUsuarios(usuarios.map(u => {
      if (u.id === id) {
        return { ...u, estado: currentState === 'Activo' ? 'Bloqueado' : 'Activo' };
      }
      return u;
    }));
    const user = usuarios.find(u => u.id === id);
    addNotification('Estado de Usuario', `El usuario ${user?.nombre} ha sido ${currentState === 'Activo' ? 'Bloqueado' : 'Desbloqueado'}`, currentState === 'Activo' ? 'error' : 'success');
    addLog('Gestión de Usuarios', `${currentState === 'Activo' ? 'Bloqueo' : 'Desbloqueo'} de usuario: ${user?.nombre}`);
    toast.success(currentState === 'Activo' ? 'Usuario bloqueado' : 'Usuario desbloqueado');
  };

  const handleDeleteUsuario = (id: string) => {
    const user = usuarios.find(u => u.id === id);
    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario ${user?.nombre}? Esta acción no se puede deshacer.`)) {
      setUsuarios(usuarios.filter(u => u.id !== id));
      addNotification('Usuario Eliminado', `El usuario ${user?.nombre} ha sido eliminado del sistema`, 'error');
      addLog('Gestión de Usuarios', `Usuario eliminado: ${user?.nombre} (${user?.email})`);
      toast.success('Usuario eliminado correctamente');
    }
  };

  const handleConfigClick = (modulo: string) => {
    setActiveConfigModal(modulo);
  };

  const [configStates, setConfigStates] = useState({
    twoFactor: false,
    forcePass: false,
    stockAlerts: true,
    dailyReport: false
  });

  const renderConfigModalContent = () => {
    switch (activeConfigModal) {
      case 'Seguridad':
        return (
          <div className="space-y-4">
            <p className="text-sm text-[#94a3b8]">Configura las políticas de seguridad para el acceso al sistema.</p>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 glass glass-hover transition-all">
              <span className="text-white font-medium">Autenticación de Dos Factores (2FA)</span>
              <Button 
                variant={configStates.twoFactor ? "primary" : "secondary"} 
                size="sm"
                onClick={() => {
                  setConfigStates(prev => ({ ...prev, twoFactor: !prev.twoFactor }));
                  addNotification('Seguridad', `2FA ${!configStates.twoFactor ? 'Habilitado' : 'Deshabilitado'}`, 'info');
                }}
              >
                {configStates.twoFactor ? "Habilitado" : "Habilitar"}
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 glass glass-hover transition-all">
              <span className="text-white font-medium">Forzar cambio de contraseña cada 90 días</span>
              <Button 
                variant={configStates.forcePass ? "primary" : "secondary"} 
                size="sm"
                onClick={() => {
                  setConfigStates(prev => ({ ...prev, forcePass: !prev.forcePass }));
                  addNotification('Seguridad', `Cambio de contraseña ${!configStates.forcePass ? 'Activado' : 'Desactivado'}`, 'info');
                }}
              >
                {configStates.forcePass ? "Activado" : "Activar"}
              </Button>
            </div>
          </div>
        );
      case 'Auditoría':
        return (
          <div className="space-y-4">
            <p className="text-sm text-[#94a3b8]">Registros recientes de actividad en el sistema.</p>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm glass max-h-60 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-center py-4 text-[#94a3b8]">No hay registros de auditoría aún.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="flex justify-between text-[#94a3b8] mb-3 pb-2 border-b border-white/5 last:border-0 last:mb-0">
                    <div>
                      <span className="text-white font-medium block">{log.action}</span>
                      <span className="text-xs opacity-70">{log.details}</span>
                    </div>
                    <span className="text-[10px] opacity-70 uppercase font-bold shrink-0">{log.time}</span>
                  </div>
                ))
              )}
            </div>
            <Button variant="primary" className="w-full" onClick={() => {
              addNotification('Auditoría', 'Logs exportados correctamente', 'success');
              addLog('Auditoría', 'Exportación de logs completa');
              toast.success('Logs exportados');
            }}>
              Exportar Logs Completos
            </Button>
          </div>
        );
      case 'Respaldos':
        return (
          <div className="space-y-4">
            <p className="text-sm text-[#94a3b8]">Gestiona las copias de seguridad de la base de datos.</p>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 glass">
              <div>
                <span className="text-white block font-medium">Último Respaldo</span>
                <span className="text-xs text-[#94a3b8]">Ayer a las 23:59 (1.2 MB)</span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => {
                addNotification('Respaldos', 'Descargando copia de seguridad...', 'info');
                toast.info('Descargando backup');
              }}>
                Descargar
              </Button>
            </div>
            <Button variant="primary" className="w-full" onClick={() => {
              addNotification('Respaldos', 'Copia de seguridad creada con éxito', 'success');
              toast.success('Backup creado');
            }}>
              Crear Respaldo Ahora
            </Button>
          </div>
        );
      case 'Notificaciones':
        return (
          <div className="space-y-4">
            <p className="text-sm text-[#94a3b8]">Configura qué eventos generan alertas en el sistema.</p>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 glass glass-hover transition-all">
              <span className="text-white font-medium">Alertas de Stock Bajo</span>
              <Button 
                variant={configStates.stockAlerts ? "primary" : "secondary"} 
                size="sm"
                onClick={() => {
                  setConfigStates(prev => ({ ...prev, stockAlerts: !prev.stockAlerts }));
                  addNotification('Configuración', `Alertas de stock ${!configStates.stockAlerts ? 'Activadas' : 'Desactivadas'}`, 'info');
                }}
              >
                {configStates.stockAlerts ? "Activado" : "Desactivado"}
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 glass glass-hover transition-all">
              <span className="text-white font-medium">Resumen Diario de Ventas por Email</span>
              <Button 
                variant={configStates.dailyReport ? "primary" : "secondary"} 
                size="sm"
                onClick={() => {
                  setConfigStates(prev => ({ ...prev, dailyReport: !prev.dailyReport }));
                  addNotification('Configuración', `Resumen diario ${!configStates.dailyReport ? 'Activado' : 'Desactivado'}`, 'info');
                }}
              >
                {configStates.dailyReport ? "Activado" : "Desactivado"}
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Administración</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Gestión de usuarios y permisos del sistema
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={() => handleOpenModal()}>
          Nuevo Usuario
        </Button>
      </div>

      {/* Stats de roles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {rolesStats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            red: 'bg-red-100 text-red-600',
            blue: 'bg-blue-100 text-blue-600',
            purple: 'bg-purple-100 text-purple-600',
            gray: 'bg-gray-100 text-[#94a3b8]'
          };
          return (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#94a3b8] mb-1">{stat.rol}</p>
                  <p className="text-2xl font-bold text-white">{stat.count}</p>
                </div>
                <div className={`${colorClasses[stat.color as keyof typeof colorClasses]} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tabla de usuarios */}
      <Card title="Usuarios del Sistema">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94a3b8]">Usuario</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94a3b8]">Email</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-[#94a3b8]">Rol</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94a3b8]">Último Acceso</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-[#94a3b8]">Estado</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[#94a3b8]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div translate="no" className="notranslate w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {usuario.nombre.split(' ').map(n => n[0]).join('\u200B')}
                      </div>
                      <p className="text-sm font-medium text-white">{usuario.nombre}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-[#94a3b8]">{usuario.email}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRolColor(usuario.rol)}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-[#94a3b8]">{usuario.ultimoAcceso}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      usuario.estado === 'Activo'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleOpenModal(usuario)}>
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleToggleEstado(usuario.id, usuario.estado)}
                      >
                        {usuario.estado === 'Activo' ? 'Bloquear' : 'Desbloquear'}
                      </Button>
                      <Button 
                        variant="danger"
                        size="sm"
                        className="px-2.5 py-1.5"
                        onClick={() => handleDeleteUsuario(usuario.id)}
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {usuarios.length === 0 && (
            <div className="text-center py-8 text-[#94a3b8]">
              No hay usuarios registrados.
            </div>
          )}
        </div>
      </Card>

      {/* Configuración del sistema */}
      <Card title="Configuración del Sistema">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 glass glass-hover border border-white/10 rounded-xl">
            <h4 className="font-semibold text-white mb-2">Seguridad</h4>
            <p className="text-sm text-[#94a3b8] mb-4">
              Configuración de políticas de seguridad y autenticación
            </p>
            <Button variant="secondary" size="sm" onClick={() => handleConfigClick('Seguridad')}>
              Configurar
            </Button>
          </div>
          <div className="p-5 glass glass-hover border border-white/10 rounded-xl">
            <h4 className="font-semibold text-white mb-2">Auditoría</h4>
            <p className="text-sm text-[#94a3b8] mb-4">
              Logs y registros de acceso al sistema
            </p>
            <Button variant="secondary" size="sm" onClick={() => handleConfigClick('Auditoría')}>
              Ver Logs
            </Button>
          </div>
          <div className="p-5 glass glass-hover border border-white/10 rounded-xl">
            <h4 className="font-semibold text-white mb-2">Respaldos</h4>
            <p className="text-sm text-[#94a3b8] mb-4">
              Gestión de backups automáticos de la base de datos
            </p>
            <Button variant="secondary" size="sm" onClick={() => handleConfigClick('Respaldos')}>
              Gestionar
            </Button>
          </div>
          <div className="p-5 glass glass-hover border border-white/10 rounded-xl">
            <h4 className="font-semibold text-white mb-2">Notificaciones</h4>
            <p className="text-sm text-[#94a3b8] mb-4">
              Configurar alertas y notificaciones del sistema
            </p>
            <Button variant="secondary" size="sm" onClick={() => handleConfigClick('Notificaciones')}>
              Configurar
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal Usuario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <form onSubmit={handleSaveUsuario} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Rol</label>
              <select
                className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              >
                <option className="bg-[#0f172a] text-white" value="ADMIN">Administrador</option>
                <option className="bg-[#0f172a] text-white" value="VENDEDOR">Vendedor</option>
                <option className="bg-[#0f172a] text-white" value="BODEGUERO">Bodeguero</option>
                <option className="bg-[#0f172a] text-white" value="READONLY">Solo Lectura</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Estado</label>
              <select
                className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              >
                <option className="bg-[#0f172a] text-white" value="Activo">Activo</option>
                <option className="bg-[#0f172a] text-white" value="Bloqueado">Bloqueado</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Usuario
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!activeConfigModal}
        onClose={() => setActiveConfigModal(null)}
        title={`Configuración de ${activeConfigModal}`}
        size="md"
        footer={
          <Button variant="primary" onClick={() => {
            toast.success(`Configuración de ${activeConfigModal} guardada`);
            setActiveConfigModal(null);
          }}>
            Guardar Configuración
          </Button>
        }
      >
        {renderConfigModalContent()}
      </Modal>
    </div>
  );
}







