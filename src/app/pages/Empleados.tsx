import { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Plus, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import { useDataStore, Empleado } from '../contexts/DataStoreContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function Empleados() {
  const { empleados, setEmpleados, addNotification } = useDataStore();
  const { hasPermission } = useAuth();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);

  const [formData, setFormData] = useState<Omit<Empleado, 'id'>>({
    nombre: '',
    email: '',
    telefono: '',
    departamento: 'Ventas',
    cargo: '',
    estado: 'Activo'
  });

  const getDepartamentos = () => {
    const deps: Record<string, number> = {};
    empleados.forEach(e => {
      if (!deps[e.departamento]) deps[e.departamento] = 0;
      deps[e.departamento]++;
    });
    const colors = ['blue', 'purple', 'green', 'orange', 'red'];
    return Object.keys(deps).map((k, i) => ({
      nombre: k,
      empleados: deps[k],
      color: colors[i % colors.length]
    }));
  };

  const departamentos = getDepartamentos();

  const handleOpenModal = (empleado?: Empleado) => {
    if (empleado) {
      setEditingEmpleado(empleado);
      setFormData({
        nombre: empleado.nombre,
        email: empleado.email,
        telefono: empleado.telefono,
        departamento: empleado.departamento,
        cargo: empleado.cargo,
        estado: empleado.estado
      });
    } else {
      setEditingEmpleado(null);
      setFormData({
        nombre: '', email: '', telefono: '', departamento: 'Ventas', cargo: '', estado: 'Activo'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmpleado(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEmpleado) {
      setEmpleados(empleados.map(emp => emp.id === editingEmpleado.id ? { ...emp, ...formData } : emp));
      toast.success('Empleado actualizado exitosamente');
      addNotification('Empleado Modificado', `${formData.nombre} actualizado`, 'info');
    } else {
      const newEmpleado = { ...formData, id: Date.now().toString() };
      setEmpleados([...empleados, newEmpleado]);
      toast.success('Empleado creado exitosamente');
      addNotification('Nuevo Empleado', `${formData.nombre} añadido al equipo`, 'success');
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    const e = empleados.find(emp => emp.id === id);
    if (window.confirm('¿Está seguro de eliminar este empleado?')) {
      setEmpleados(empleados.filter(e => e.id !== id));
      toast.success('Empleado eliminado exitosamente');
      addNotification('Empleado Eliminado', `${e?.nombre} ha dejado el sistema`, 'warning');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Empleados</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Gestión de personal del sistema
          </p>
        </div>
        {hasPermission('empleados.crear') && (
          <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={() => handleOpenModal()}>
            Nuevo Empleado
          </Button>
        )}
      </div>

      {/* Departamentos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departamentos.map((dept, index) => {
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-700 border-blue-200',
            purple: 'bg-purple-100 text-purple-700 border-purple-200',
            green: 'bg-green-100 text-green-700 border-green-200',
            orange: 'bg-orange-100 text-orange-700 border-orange-200',
            red: 'bg-red-100 text-red-700 border-red-200'
          };
          return (
            <Card key={index}>
              <div className={`p-4 rounded-lg border ${colorClasses[dept.color as keyof typeof colorClasses]}`}>
                <p className="text-sm font-medium mb-1">{dept.nombre}</p>
                <p className="text-2xl font-bold">{dept.empleados}</p>
                <p className="text-xs mt-1 opacity-80">empleados</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tabla de empleados */}
      <Card title={`Empleados (${empleados.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94a3b8]">Nombre</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94a3b8]">Contacto</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94a3b8]">Departamento</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94a3b8]">Cargo</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-[#94a3b8]">Estado</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[#94a3b8]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((empleado) => (
                <tr key={empleado.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div translate="no" className="notranslate w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {empleado.nombre.split(' ').map(n => n[0]).join('\u200B')}
                      </div>
                      <p className="text-sm font-medium text-white">{empleado.nombre}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
                        <Mail className="w-4 h-4" />
                        {empleado.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
                        <Phone className="w-4 h-4" />
                        {empleado.telefono}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-white">{empleado.departamento}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-[#94a3b8]">{empleado.cargo}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      empleado.estado === 'Activo'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-[#94a3b8]'
                    }`}>
                      {empleado.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {hasPermission('empleados.editar') && (
                        <Button variant="secondary" size="sm" onClick={() => handleOpenModal(empleado)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      {hasPermission('empleados.eliminar') && (
                        <Button variant="danger" size="sm" onClick={() => handleDelete(empleado.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {empleados.length === 0 && (
            <div className="text-center py-8 text-[#94a3b8]">
              No se encontraron empleados.
            </div>
          )}
        </div>
      </Card>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Nombre Completo</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Teléfono</label>
              <input
                type="tel"
                required
                className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Departamento</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
                value={formData.departamento}
                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Cargo</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Estado</label>
              <select
                className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
              >
                <option className="bg-[#0f172a] text-white" value="Activo">Activo</option>
                <option className="bg-[#0f172a] text-white" value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={handleCloseModal} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}







