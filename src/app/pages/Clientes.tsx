import { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SearchBar } from '../components/common/SearchBar';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Plus, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { useDataStore, Cliente } from '../contexts/DataStoreContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const { clientes, setClientes, addNotification } = useDataStore();
  const { hasPermission } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [filterEstado, setFilterEstado] = useState<'Todos' | 'Activo' | 'Inactivo'>('Todos');

  const [formData, setFormData] = useState<Omit<Cliente, 'id'>>({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    estado: 'Activo'
  });

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cliente.telefono.includes(searchTerm);
    const matchesFilter = filterEstado === 'Todos' || cliente.estado === filterEstado;
    return matchesSearch && matchesFilter;
  });

  const handleOpenModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      setFormData({
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
        estado: cliente.estado
      });
    } else {
      setEditingCliente(null);
      setFormData({ nombre: '', email: '', telefono: '', direccion: '', estado: 'Activo' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCliente(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de identificador único (Email o Teléfono)
    const isDuplicate = clientes.some(c => 
      (c.email === formData.email || c.telefono === formData.telefono) && 
      (!editingCliente || c.id !== editingCliente.id)
    );

    if (isDuplicate) {
      toast.error('Ya existe un cliente con este email o teléfono');
      return;
    }

    if (editingCliente) {
      setClientes(clientes.map(c => c.id === editingCliente.id ? { ...c, ...formData } : c));
      toast.success('Cliente actualizado exitosamente');
      addNotification('Cliente Actualizado', `Datos de ${formData.nombre} modificados`, 'info');
    } else {
      const newCliente = { ...formData, id: Date.now().toString() };
      setClientes([...clientes, newCliente]);
      toast.success('Cliente creado exitosamente');
      addNotification('Nuevo Cliente', `${formData.nombre} ha sido registrado`, 'success');
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    const c = clientes.find(cli => cli.id === id);
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      setClientes(clientes.filter(c => c.id !== id));
      toast.success('Cliente eliminado exitosamente');
      addNotification('Cliente Eliminado', `El cliente ${c?.nombre} ha sido eliminado`, 'warning');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black gradient-text mb-2 tracking-tight">Clientes</h1>
          <p className="text-[#94a3b8] font-medium">
            Gestión de clientes del sistema
          </p>
        </div>
        {hasPermission('clientes.crear') && (
          <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={() => handleOpenModal()}>
            Nuevo Cliente
          </Button>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <Card hover={false}>
        <div className="flex gap-4">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre o email..."
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <select
              className="px-3 py-2 border border-white/10 bg-white/5 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef]"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value as any)}
            >
              <option className="bg-[#0f172a]" value="Todos">Todos los estados</option>
              <option className="bg-[#0f172a]" value="Activo">Solo Activos</option>
              <option className="bg-[#0f172a]" value="Inactivo">Solo Inactivos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tabla de clientes */}
      <Card title={`Clientes (${filteredClientes.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-sm font-bold text-white">Nombre</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-white">Contacto</th>
                <th className="text-left py-4 px-4 text-sm font-bold text-white">Dirección</th>
                <th className="text-center py-4 px-4 text-sm font-bold text-white">Estado</th>
                <th className="text-right py-4 px-4 text-sm font-bold text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="border-b border-white/5 hover:bg-white/5 transition-all duration-300">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="notranslate w-10 h-10 rounded-xl bg-gradient-to-br from-[#d946ef] to-[#7c3aed] flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(217,70,239,0.3)]">
                        {cliente.nombre.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-sm font-bold text-white">{cliente.nombre}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
                        <Mail className="w-4 h-4" />
                        {cliente.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
                        <Phone className="w-4 h-4" />
                        {cliente.telefono}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
                      <MapPin className="w-4 h-4" />
                      {cliente.direccion}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Badge variant={cliente.estado === 'Activo' ? 'success' : 'default'}>
                      {cliente.estado}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {hasPermission('clientes.editar') && (
                        <Button variant="secondary" size="sm" icon={<Edit className="w-4 h-4" />} onClick={() => handleOpenModal(cliente)}>
                          Editar
                        </Button>
                      )}
                      {hasPermission('clientes.eliminar') && (
                        <Button variant="danger" size="sm" onClick={() => handleDelete(cliente.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredClientes.length === 0 && (
            <div className="text-center py-8 text-[#94a3b8]">
              No se encontraron clientes.
            </div>
          )}
        </div>
      </Card>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1">Nombre</label>
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
          <div>
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
            <label className="block text-sm font-medium text-[#94a3b8] mb-1">Dirección</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            />
          </div>
          <div>
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







