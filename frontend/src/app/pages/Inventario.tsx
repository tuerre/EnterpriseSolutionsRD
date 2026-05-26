import { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { AlertTriangle, TrendingDown, TrendingUp, Package, Trash2 } from 'lucide-react';
import { useDataStore, Producto } from '../contexts/DataStoreContext';
import { toast } from 'sonner';

export function Inventario() {
  const { productos, setProductos, addNotification, addLog, categorias, setCategorias, addCategoria } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [ajusteCantidad, setAjusteCantidad] = useState(0);
  const [activeTab, setActiveTab] = useState<'stock' | 'categorias'>('stock');
  const [newCategoria, setNewCategoria] = useState('');
  
  const handleAddCategoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoria.trim()) return;
    if (categorias.includes(newCategoria.trim())) {
      toast.error('La categoría ya existe');
      return;
    }
    addCategoria(newCategoria.trim());
    setNewCategoria('');
    toast.success('Categoría añadida');
  };

  const inventario = productos;

  const statsInventario = [
    { title: 'Total Productos', value: inventario.length, icon: Package, color: 'blue' },
    { title: 'Stock Bajo', value: inventario.filter(i => i.stock <= i.minimo && i.stock > 0).length, icon: TrendingDown, color: 'yellow' },
    { title: 'Stock Crítico', value: inventario.filter(i => i.stock === 0).length, icon: AlertTriangle, color: 'red' },
    { title: 'Stock Normal', value: inventario.filter(i => i.stock > i.minimo).length, icon: TrendingUp, color: 'green' },
  ];

  const getEstadoProducto = (producto: Producto) => {
    if (producto.stock === 0) return 'critico';
    if (producto.stock <= producto.minimo) return 'bajo';
    return 'normal';
  };

  const getEstadoBadge = (estado: string) => {
    const badges = {
      normal: 'bg-green-500/10 text-green-500',
      bajo: 'bg-yellow-500/10 text-yellow-500',
      critico: 'bg-red-500/10 text-red-500'
    };
    return badges[estado as keyof typeof badges] || badges.normal;
  };

  const getEstadoTexto = (estado: string) => {
    const textos = {
      normal: 'Normal',
      bajo: 'Stock Bajo',
      critico: 'Stock Crítico'
    };
    return textos[estado as keyof typeof textos] || 'Desconocido';
  };

  const handleOpenModal = (productId?: string) => {
    setSelectedProductId(productId || '');
    setAjusteCantidad(0);
    setIsModalOpen(true);
  };

  const handleSaveAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error('Seleccione un producto');
      return;
    }
    
    const prod = productos.find(p => p.id === selectedProductId);
    setProductos(productos.map(p => {
      if (p.id === selectedProductId) {
        const newStock = Math.max(0, p.stock + ajusteCantidad);
        return { ...p, stock: newStock };
      }
      return p;
    }));
    
    addNotification('Ajuste de Stock', `Se ajustó el stock de ${prod?.nombre}. Cambio: ${ajusteCantidad > 0 ? '+' : ''}${ajusteCantidad}`, 'info');
    addLog('Ajuste de Stock', `${prod?.nombre}: ${ajusteCantidad > 0 ? '+' : ''}${ajusteCantidad} unidades`);
    toast.success('Stock actualizado exitosamente');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventario</h1>
          <p className="text-[#94a3b8] mt-1">Control y gestión de stock en tiempo real</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          Ajustar Stock
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10">
        <button 
          onClick={() => setActiveTab('stock')}
          className={`pb-4 px-2 text-sm font-bold transition-all relative ${
            activeTab === 'stock' ? 'text-[#10b981]' : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          Estado de Stock
          {activeTab === 'stock' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('categorias')}
          className={`pb-4 px-2 text-sm font-bold transition-all relative ${
            activeTab === 'categorias' ? 'text-[#10b981]' : 'text-[#94a3b8] hover:text-white'
          }`}
        >
          Gestión de Categorías
          {activeTab === 'categorias' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
          )}
        </button>
      </div>

      {activeTab === 'stock' ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsInventario.map((stat, index) => {
              const Icon = stat.icon;
              const colorClasses = {
                blue: 'bg-blue-500/10 text-blue-500',
                yellow: 'bg-yellow-500/10 text-yellow-500',
                red: 'bg-red-500/10 text-red-500',
                green: 'bg-green-500/10 text-green-500'
              };
              return (
                <Card key={index}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#94a3b8] mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`${colorClasses[stat.color as keyof typeof colorClasses]} p-3 rounded-xl`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Tabla de inventario */}
          <Card title="Estado del Inventario">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#94a3b8]">Producto</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-[#94a3b8]">Categoría</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-[#94a3b8]">Stock Actual</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-[#94a3b8]">Mínimo</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-[#94a3b8]">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-[#94a3b8]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {inventario.map((item) => {
                    const estadoReal = getEstadoProducto(item);
                    return (
                      <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                              {item.imagen ? (
                                <img src={item.imagen} alt={item.nombre} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-4 h-4 text-[#94a3b8]" />
                              )}
                            </div>
                            <p className="text-sm font-medium text-white">{item.nombre}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-1 bg-white/5 rounded-lg text-[#94a3b8]">
                            {item.categoria}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <p className="text-sm font-bold text-white">{item.stock}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <p className="text-sm text-[#94a3b8]">{item.minimo}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-lg ${getEstadoBadge(estadoReal)}`}>
                            {getEstadoTexto(estadoReal)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="secondary" size="sm" onClick={() => handleOpenModal(item.id)}>
                            Ajustar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {inventario.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-[#94a3b8]">
                        No hay productos registrados en el inventario.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          <Card title="Nueva Categoría" className="lg:col-span-1">
            <form onSubmit={handleAddCategoria} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                  value={newCategoria}
                  onChange={(e) => setNewCategoria(e.target.value)}
                  placeholder="Ej: Periféricos"
                />
              </div>
              <Button variant="primary" className="w-full">Agregar Categoría</Button>
            </form>
          </Card>
          
          <Card title="Categorías Existentes" className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categorias.map(cat => (
                <div key={cat} className="p-4 glass glass-hover border border-white/10 rounded-xl flex items-center justify-between group transition-all duration-300">
                  <span className="text-white font-medium">{cat}</span>
                  <Button 
                    variant="danger"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 px-2.5 py-1.5"
                    onClick={() => setCategorias(categorias.filter(c => c !== cat))}
                    title="Eliminar categoría"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {categorias.length === 0 && (
                <p className="col-span-full text-center py-8 text-[#94a3b8]">No hay categorías registradas.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Modal Ajustar Stock */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajustar Stock"
      >
        <form onSubmit={handleSaveAjuste} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1">Producto</label>
            <select
              required
              className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option className="bg-[#0f172a] text-white" value="" disabled>Seleccione un producto</option>
              {productos.map(p => (
                <option className="bg-[#0f172a] text-white" key={p.id} value={p.id}>
                  {p.nombre} (Stock actual: {p.stock})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1">Cantidad a Ajustar</label>
            <p className="text-xs text-[#94a3b8] mb-2">Números positivos suman, negativos restan.</p>
            <input
              type="number"
              required
              className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
              value={ajusteCantidad}
              onChange={(e) => setAjusteCantidad(parseInt(e.target.value) || 0)}
            />
          </div>
          {selectedProductId && (
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-sm font-medium text-white">
                Stock Resultante: <span className="text-[#10b981] font-bold">
                  {(productos.find(p => p.id === selectedProductId)?.stock || 0) + ajusteCantidad}
                </span>
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar Ajuste
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
