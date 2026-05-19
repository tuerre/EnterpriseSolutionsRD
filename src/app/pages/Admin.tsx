import { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Plus, Shield, User as UserIcon, Lock, Trash2, Edit, Check, X, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useDataStore } from '../contexts/DataStoreContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

type Permission = 'leer' | 'crear' | 'editar' | 'eliminar';

interface Role {
  id: string;
  nombre: string;
  permisos: {
    [modulo: string]: Permission[];
  };
}

interface Usuario {
  id: string;
  username: string;
  email: string;
  password?: string;
  rolId: string;
  estado: 'Activo' | 'Bloqueado';
}

export function Admin() {
  const { 
    addLog, 
    systemUsers: usuarios, 
    setSystemUsers: setUsuarios, 
    systemRoles: roles, 
    setSystemRoles: setRoles,
    addNotification
  } = useDataStore();

  const { user: currentUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifyingRoleCode, setIsVerifyingRoleCode] = useState(false);
  const [roleVerificationCode, setRoleVerificationCode] = useState('');
  
  // Seguridad para borrado
  const [deletionTarget, setDeletionTarget] = useState<{ id: string, type: 'usuario' | 'rol' } | null>(null);
  const [isVerifyingDelete, setIsVerifyingDelete] = useState(false);
  const [deleteCode, setDeleteCode] = useState('');

  const [activeTab, setActiveTab] = useState<'usuarios' | 'roles'>('usuarios');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [userFormData, setUserFormData] = useState<Omit<Usuario, 'id'>>({
    username: '',
    email: '',
    password: '',
    rolId: '2',
    estado: 'Activo'
  });

  const [roleFormData, setRoleFormData] = useState<Omit<Role, 'id'>>({
    nombre: '',
    permisos: {
      productos: [],
      ventas: [],
      clientes: [],
      informes: [],
      admin: [],
      empleados: []
    }
  });

  const modules = ['productos', 'ventas', 'clientes', 'informes', 'empleados', 'admin'];
  const permissions: Permission[] = ['leer', 'crear', 'editar', 'eliminar'];

  const togglePermission = (modulo: string, perm: Permission) => {
    const current = roleFormData.permisos[modulo] || [];
    const updated = current.includes(perm)
      ? current.filter(p => p !== perm)
      : [...current, perm];
    
    setRoleFormData({
      ...roleFormData,
      permisos: { ...roleFormData.permisos, [modulo]: updated }
    });
  };

  const handleSaveUser = () => {
    if (!userFormData.email.toLowerCase().endsWith('@empresa.com')) {
      toast.error('El correo debe ser corporativo (@empresa.com)');
      return;
    }

    if (editingUser) {
      setUsuarios(usuarios.map(u => u.id === editingUser.id ? { ...u, ...userFormData } : u));
      toast.success('Usuario actualizado');
      addNotification('Usuario Modificado', `Se han actualizado los datos de ${userFormData.username}`, 'info');
    } else {
      setUsuarios([...usuarios, { ...userFormData, id: Date.now().toString() }]);
      toast.success('Usuario creado');
      addNotification('Nuevo Usuario', `Se ha creado el usuario ${userFormData.username}`, 'success');
    }
    setIsUserModalOpen(false);
  };

  const handleSaveRole = () => {
    if (!isVerifyingRoleCode) {
      setIsVerifyingRoleCode(true);
      return;
    }
    if (roleVerificationCode !== '1128') {
      toast.error('Código de seguridad incorrecto');
      setRoleVerificationCode('');
      return;
    }
    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...roleFormData } : r));
      toast.success('Rol actualizado');
      addNotification('Rol Modificado', `Se han actualizado los permisos del rol ${roleFormData.nombre}`, 'info');
    } else {
      setRoles([...roles, { ...roleFormData, id: Date.now().toString() }]);
      toast.success('Rol creado');
      addNotification('Nuevo Rol', `Se ha creado el rol ${roleFormData.nombre}`, 'success');
    }
    setIsVerifyingRoleCode(false);
    setRoleVerificationCode('');
    setIsRoleModalOpen(false);
  };

  const confirmDelete = () => {
    if (deleteCode !== '1128') {
      toast.error('Código de seguridad incorrecto');
      return;
    }

    if (deletionTarget?.type === 'usuario') {
      const u = usuarios.find(user => user.id === deletionTarget.id);
      setUsuarios(usuarios.filter(u => u.id !== deletionTarget.id));
      toast.success('Usuario eliminado');
      addNotification('Usuario Eliminado', `El usuario ${u?.username} ha sido removido del sistema`, 'warning');
      addLog('Eliminar Usuario', `ID: ${deletionTarget.id}`);
    } else if (deletionTarget?.type === 'rol') {
      const r = roles.find(role => role.id === deletionTarget.id);
      setRoles(roles.filter(r => r.id !== deletionTarget.id));
      toast.success('Rol eliminado');
      addNotification('Rol Eliminado', `El rol ${r?.nombre} ha sido removido del sistema`, 'warning');
      addLog('Eliminar Rol', `ID: ${deletionTarget.id}`);
    }

    setIsVerifyingDelete(false);
    setDeleteCode('');
    setDeletionTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black gradient-text mb-2 tracking-tight">Administración</h1>
          <p className="text-[#94a3b8] font-medium">Control de acceso y gestión de usuarios</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant={activeTab === 'usuarios' ? 'primary' : 'glass'} 
            onClick={() => setActiveTab('usuarios')}
            icon={<UserIcon className="w-4 h-4" />}
          >
            Usuarios
          </Button>
          <Button 
            variant={activeTab === 'roles' ? 'primary' : 'glass'} 
            onClick={() => setActiveTab('roles')}
            icon={<Shield className="w-4 h-4" />}
          >
            Roles y Permisos
          </Button>
        </div>
      </div>

      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => {
                setEditingUser(null);
                setUserFormData({ username: '', email: '', password: '', rolId: '2', estado: 'Activo' });
                setShowPassword(false);
                setIsVerifyingCode(false);
                setVerificationCode('');
                setIsUserModalOpen(true);
              }}>
                Nuevo Usuario
              </Button>
          </div>
          <Card title="Lista de Usuarios">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-[#94a3b8] text-xs uppercase font-black">
                    <th className="text-left py-4 px-4">Usuario</th>
                    <th className="text-left py-4 px-4">Email</th>
                    <th className="text-left py-4 px-4">Rol</th>
                    <th className="text-center py-4 px-4">Estado</th>
                    <th className="text-right py-4 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                            {u.username[0].toUpperCase()}
                          </div>
                          <span className="text-white font-bold">{u.username}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#94a3b8] text-sm">{u.email}</td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white">
                          {roles.find(r => r.id === u.rolId)?.nombre || 'Desconocido'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                          u.estado === 'Activo' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {u.estado}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2">
                           <Button variant="glass" size="sm" onClick={() => {
                            setEditingUser(u);
                            setUserFormData({ ...u });
                            setShowPassword(false);
                            setIsVerifyingCode(false);
                            setVerificationCode('');
                            setIsUserModalOpen(true);
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => {
                            setDeletionTarget({ id: u.id, type: 'usuario' });
                            setIsVerifyingDelete(true);
                            setDeleteCode('');
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button variant="primary" icon={<ShieldCheck className="w-4 h-4" />} onClick={() => {
              setEditingRole(null);
              setRoleFormData({ nombre: '', permisos: {} });
              setIsVerifyingRoleCode(false);
              setRoleVerificationCode('');
              setIsRoleModalOpen(true);
            }}>
              Crear Nuevo Rol
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map(rol => (
              <Card key={rol.id} title={rol.nombre} action={
                <div className="flex gap-2">
                   <Button variant="glass" size="sm" onClick={() => {
                    setEditingRole(rol);
                    setRoleFormData({ ...rol });
                    setIsVerifyingRoleCode(false);
                    setRoleVerificationCode('');
                    setIsRoleModalOpen(true);
                  }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => {
                    setDeletionTarget({ id: rol.id, type: 'rol' });
                    setIsVerifyingDelete(true);
                    setDeleteCode('');
                  }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              }>
                <div className="space-y-3">
                  {Object.entries(rol.permisos).map(([mod, perms]) => (
                    <div key={mod} className="flex items-center justify-between p-2 glass border border-white/5 rounded-xl">
                      <span className="text-xs font-black text-white uppercase">{mod}</span>
                      <div className="flex gap-1">
                        {perms.map(p => (
                          <span key={p} className="px-1.5 py-0.5 bg-[#d946ef]/10 text-[#d946ef] rounded text-[9px] font-bold uppercase">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Modales */}
      <Modal
        isOpen={isVerifyingDelete}
        onClose={() => setIsVerifyingDelete(false)}
        title="Confirmar Eliminación"
      >
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white">¿Estás seguro?</h3>
            <p className="text-[#94a3b8] text-sm">
              Esta acción eliminará de forma permanente el {deletionTarget?.type} seleccionado.
            </p>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-red-400 uppercase tracking-widest">Ingrese Código de Seguridad</label>
            <input 
              type="password" 
              autoFocus
              placeholder="••••"
              className="w-full px-4 py-3 bg-red-500/5 border border-red-500/20 text-red-500 text-center text-2xl font-black rounded-xl outline-none focus:ring-2 focus:ring-red-500 placeholder:text-red-500/20"
              value={deleteCode}
              onChange={(e) => setDeleteCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && confirmDelete()}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={confirmDelete}>Eliminar Definitivamente</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setIsVerifyingDelete(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isUserModalOpen} 
        onClose={() => {
          setIsUserModalOpen(false);
          setShowPassword(false);
          setIsVerifyingCode(false);
          setVerificationCode('');
        }} 
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#94a3b8] uppercase">Username</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#d946ef]"
              value={userFormData.username}
              onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#94a3b8] uppercase">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#d946ef]"
              value={userFormData.email}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#94a3b8] uppercase">Rol</label>
              <select 
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl outline-none"
                value={userFormData.rolId}
                onChange={(e) => setUserFormData({ ...userFormData, rolId: e.target.value })}
              >
                {roles.map(r => <option key={r.id} value={r.id} className="bg-[#0f172a]">{r.nombre}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#94a3b8] uppercase">Estado</label>
              <select 
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl outline-none"
                value={userFormData.estado}
                onChange={(e) => setUserFormData({ ...userFormData, estado: e.target.value as any })}
              >
                <option value="Activo" className="bg-[#0f172a]">Activo</option>
                <option value="Bloqueado" className="bg-[#0f172a]">Bloqueado</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#94a3b8] uppercase">
              {isVerifyingCode ? 'Ingrese Código de Seguridad' : 'Contraseña'}
            </label>
            <div className="relative group">
              {isVerifyingCode ? (
                <div className="flex gap-2 animate-fadeIn">
                  <input 
                    type="password" 
                    autoFocus
                    placeholder="Escriba el código..."
                    className="flex-1 px-4 py-2 bg-[#d946ef]/10 border border-[#d946ef]/30 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#d946ef] placeholder:text-[#d946ef]/50"
                    value={verificationCode}
                    onChange={(e) => {
                      const val = e.target.value;
                      setVerificationCode(val);
                      if (val === "1128") {
                        setShowPassword(true);
                        setIsVerifyingCode(false);
                        setVerificationCode('');
                        toast.success("Acceso concedido");
                      }
                    }}
                  />
                  <Button variant="glass" size="sm" onClick={() => {
                    setIsVerifyingCode(false);
                    setVerificationCode('');
                  }}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#d946ef] pr-12"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${showPassword ? 'text-[#d946ef]' : 'text-[#94a3b8] hover:text-white'}`}
                    onClick={() => {
                      if (currentUser?.rol !== 'ADMIN') {
                        toast.error("Solo los administradores pueden ver contraseñas");
                        return;
                      }
                      if (showPassword) {
                        setShowPassword(false);
                      } else {
                        setIsVerifyingCode(true);
                      }
                    }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="primary" className="flex-1" onClick={handleSaveUser}>Guardar</Button>
            <Button variant="secondary" onClick={() => {
              setIsUserModalOpen(false);
              setShowPassword(false);
              setIsVerifyingCode(false);
              setVerificationCode('');
            }}>Cancelar</Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        title={editingRole ? 'Editar Rol' : 'Nuevo Rol'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#94a3b8] uppercase">Nombre del Rol</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-2 focus:ring-[#d946ef]"
              value={roleFormData.nombre}
              onChange={(e) => setRoleFormData({ ...roleFormData, nombre: e.target.value })}
              placeholder="Ej: Supervisor de Ventas"
            />
          </div>
          <div className="space-y-4">
            <label className="text-xs font-bold text-[#94a3b8] uppercase">Permisos Granulares</label>
            <div className="grid grid-cols-1 gap-4">
              {modules.map(mod => (
                <div key={mod} className="p-4 glass border border-white/10 rounded-2xl flex items-center justify-between">
                  <span className="font-black text-white uppercase text-sm">{mod}</span>
                  <div className="flex gap-2">
                    {permissions.map(p => {
                      const isActive = roleFormData.permisos[mod]?.includes(p);
                      return (
                        <button
                          key={p}
                          onClick={() => togglePermission(mod, p)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${
                            isActive 
                              ? 'bg-[#d946ef] border-[#d946ef] text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]' 
                              : 'bg-white/5 border-white/10 text-[#94a3b8] hover:border-white/20'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {isVerifyingRoleCode && (
            <div className="space-y-1 animate-fadeIn">
              <label className="text-[10px] font-black text-[#d946ef] uppercase tracking-widest">Ingrese Código de Seguridad</label>
              <input 
                type="password" 
                autoFocus
                placeholder="••••"
                className="w-full px-4 py-3 bg-[#d946ef]/10 border border-[#d946ef]/30 text-white text-center text-2xl font-black rounded-xl outline-none focus:ring-2 focus:ring-[#d946ef] placeholder:text-[#d946ef]/50"
                value={roleVerificationCode}
                onChange={(e) => setRoleVerificationCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveRole()}
              />
            </div>
          )}
          <div className="pt-4 flex gap-3">
            <Button variant="primary" className="flex-1" onClick={handleSaveRole}>
              {isVerifyingRoleCode ? 'Confirmar Código' : 'Guardar Rol'}
            </Button>
            <Button variant="secondary" onClick={() => {
              setIsRoleModalOpen(false);
              setIsVerifyingRoleCode(false);
              setRoleVerificationCode('');
            }}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
