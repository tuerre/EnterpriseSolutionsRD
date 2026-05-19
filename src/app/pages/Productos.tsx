import { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Search, Plus, Edit, Trash2, Package, TrendingDown, AlertTriangle, TrendingUp, LayoutGrid, List } from 'lucide-react';
import { useDataStore, Producto } from '../contexts/DataStoreContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function Productos() {
  const { productos, setProductos, categorias, addCategoria, setCategorias, addNotification } = useDataStore();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'catalogo' | 'categorias' | 'analisis'>('catalogo');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

  const [formData, setFormData] = useState<Omit<Producto, 'id'>>({
    nombre: '',
    categoria: '',
    precio: 0,
    precioCompra: 0,
    markup: 0,
    stock: 0,
    sku: '',
    minimo: 5,
    maximo: 50,
    estado: 'normal',
    imagen: ''
  });

  // Estadísticas fusionadas de Inventario
  const statsInventario = useMemo(() => [
    { title: 'Total Productos', value: productos.length, icon: Package, color: 'blue' },
    { title: 'Stock Bajo', value: productos.filter(i => i.stock <= i.minimo && i.stock > 0).length, icon: TrendingDown, color: 'yellow' },
    { title: 'Stock Crítico', value: productos.filter(i => i.stock === 0).length, icon: AlertTriangle, color: 'red' },
    { title: 'Stock Normal', value: productos.filter(i => i.stock > i.minimo).length, icon: TrendingUp, color: 'green' },
  ], [productos]);

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          producto.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || producto.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (producto?: Producto) => {
    if (producto) {
      setEditingProducto(producto);
      setFormData({
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio: producto.precio,
        precioCompra: producto.precioCompra || 0,
        markup: producto.markup || 0,
        stock: producto.stock,
        sku: producto.sku,
        minimo: producto.minimo,
        maximo: producto.maximo,
        estado: producto.estado,
        imagen: producto.imagen || ''
      });
    } else {
      setEditingProducto(null);
      setFormData({
        nombre: '', categoria: '', precio: 0, precioCompra: 0, markup: 0, stock: 0, sku: '', minimo: 5, maximo: 50, estado: 'normal', imagen: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProducto(null);
  };

  const handleMarkupChange = (markup: number) => {
    const salePrice = formData.precioCompra * (1 + markup / 100);
    setFormData(prev => ({ ...prev, markup, precio: Number(salePrice.toFixed(2)) }));
  };

  const handlePriceCompraChange = (precioCompra: number) => {
    const salePrice = precioCompra * (1 + formData.markup / 100);
    setFormData(prev => ({ ...prev, precioCompra, precio: Number(salePrice.toFixed(2)) }));
  };

  const handleSave = (keepOpen: boolean = false) => {
    if (!formData.nombre || !formData.sku || !formData.categoria) {
      toast.error('Complete los campos obligatorios');
      return;
    }

    if (editingProducto) {
      setProductos(productos.map(p => p.id === editingProducto.id ? { ...p, ...formData } : p));
      toast.success('Producto actualizado');
      addNotification('Producto Actualizado', `Se han modificado los datos de "${formData.nombre}"`, 'info');
      handleCloseModal();
    } else {
      const newProducto = { ...formData, id: Date.now().toString() };
      setProductos([...productos, newProducto]);
      toast.success('Producto añadido');
      addNotification('Nuevo Producto', `Se ha añadido "${formData.nombre}" al catálogo`, 'info');
      
      if (keepOpen) {
        // Mantener campos útiles (categoría) pero limpiar otros
        setFormData(prev => ({
          ...prev,
          nombre: '',
          sku: '',
          precio: 0,
          precioCompra: 0,
          markup: 0,
          stock: 0,
          imagen: ''
        }));
      } else {
        handleCloseModal();
      }
    }
  };

  const handleDelete = (id: string) => {
    const p = productos.find(prod => prod.id === id);
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      setProductos(productos.filter(p => p.id !== id));
      toast.success('Producto eliminado');
      addNotification('Producto Eliminado', `El producto "${p?.nombre}" ha sido borrado del catálogo`, 'warning');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black gradient-text mb-2 tracking-tight">Productos</h1>
          <p className="text-[#94a3b8] font-medium">
            Gestión unificada de catálogo, categorías y stock
          </p>
        </div>
        {hasPermission('productos.crear') && (
          <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={() => handleOpenModal()}>
            Nuevo Producto
          </Button>
        )}
      </div>

      {/* Tabs Fusionados */}
      <div className="flex gap-6 border-b border-white/10 mb-6">
        {[
          { id: 'catalogo', label: 'Catálogo', icon: List },
          { id: 'categorias', label: 'Categorías', icon: LayoutGrid },
          { id: 'analisis', label: 'Análisis de Stock', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 px-2 text-sm font-bold transition-all relative ${
                isActive ? 'text-[#d946ef]' : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d946ef] shadow-[0_0_10px_rgba(217,70,239,0.5)]"></div>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'catalogo' && (
        <>
          <Card hover={false}>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef]"
                />
              </div>
              <select
                className="px-4 py-2 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#d946ef]"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="" className="bg-[#0f172a]">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat} className="bg-[#0f172a]">{cat}</option>
                ))}
              </select>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProductos.map((producto) => (
              <Card key={producto.id} className="group overflow-hidden">
                <div className="space-y-4">
                  <div className="aspect-square bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden relative">
                    {producto.imagen ? (
                      <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <Package className="w-16 h-16 text-gray-600" />
                    )}
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                      <p className="text-[10px] font-bold text-white">{producto.sku}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-white mb-1 line-clamp-1">{producto.nombre}</h3>
                    <p className="text-xs text-[#94a3b8] mb-3">{producto.categoria}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-[#94a3b8]">Precio Venta</p>
                        <p className="text-xl font-black text-emerald-400">${producto.precio}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#94a3b8]">Stock</p>
                        <p className={`text-lg font-bold ${producto.stock <= producto.minimo ? 'text-red-400' : 'text-white'}`}>
                          {producto.stock}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-white/5 pt-4">
                      {hasPermission('productos.editar') && (
                        <Button variant="glass" size="sm" icon={<Edit className="w-4 h-4" />} onClick={() => handleOpenModal(producto)}>
                          Editar
                        </Button>
                      )}
                      {hasPermission('productos.eliminar') && (
                        <Button variant="danger" size="sm" onClick={() => handleDelete(producto.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'categorias' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 duration-500">
          <Card title="Nueva Categoría" className="h-fit">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre de la categoría..."
                id="new-cat-input"
                className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef]"
              />
              <Button 
                variant="primary" 
                className="w-full"
                disabled={!hasPermission('productos.crear')}
                onClick={() => {
                  const input = document.getElementById('new-cat-input') as HTMLInputElement;
                  if (input.value) {
                    addCategoria(input.value);
                    input.value = '';
                    toast.success('Categoría creada');
                  }
                }}
              >
                Agregar Categoría
              </Button>
            </div>
          </Card>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categorias.map(cat => (
              <Card key={cat} className="group">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{cat}</span>
                  {hasPermission('productos.eliminar') && (
                    <Button 
                      variant="danger" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setCategorias(categorias.filter(c => c !== cat))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analisis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 duration-500">
          {statsInventario.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'from-blue-500 to-indigo-600 shadow-blue-500/20',
              yellow: 'from-yellow-500 to-orange-600 shadow-yellow-500/20',
              red: 'from-red-500 to-rose-600 shadow-red-500/20',
              green: 'from-emerald-500 to-green-600 shadow-emerald-500/20'
            };
            return (
              <Card key={index} className="relative overflow-hidden">
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm font-bold text-[#94a3b8] mb-1">{stat.title}</p>
                    <p className="text-4xl font-black text-white">{stat.value}</p>
                  </div>
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} shadow-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
              </Card>
            );
          })}
          <div className="col-span-full mt-6">
            <Card title="Productos Críticos (Sin Stock)">
              <div className="space-y-4">
                {productos.filter(p => p.stock === 0).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 glass border border-red-500/20 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      </div>
                      <p className="font-bold text-white">{p.nombre}</p>
                    </div>
                    <Button variant="glass" size="sm" onClick={() => handleOpenModal(p)}>Editar Stock</Button>
                  </div>
                ))}
                {productos.filter(p => p.stock === 0).length === 0 && (
                  <p className="text-center py-4 text-[#94a3b8]">No hay productos críticos</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar Refactorizado */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-[#94a3b8] mb-1">Nombre del Producto</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-white/10 bg-white/5 text-white rounded-xl focus:ring-2 focus:ring-[#d946ef] outline-none"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Teclado Mecánico RGB"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#94a3b8] mb-1">SKU</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-white/10 bg-white/5 text-white rounded-xl focus:ring-2 focus:ring-[#d946ef] outline-none"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="PROD-001"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#94a3b8] mb-1">Categoría</label>
              <select
                className="w-full px-4 py-2 border border-white/10 bg-white/5 text-white rounded-xl focus:ring-2 focus:ring-[#d946ef] outline-none"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              >
                <option value="">Seleccionar...</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat} className="bg-[#0f172a]">{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="col-span-2 grid grid-cols-3 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] mb-1">Precio Compra ($)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-white/10 bg-black/20 text-white rounded-lg outline-none"
                  value={formData.precioCompra}
                  onChange={(e) => handlePriceCompraChange(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] mb-1">Markup (%)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-white/10 bg-black/20 text-white rounded-lg outline-none"
                  value={formData.markup}
                  onChange={(e) => handleMarkupChange(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#94a3b8] mb-1">Precio Venta ($)</label>
                <div className="w-full px-3 py-2 bg-[#d946ef]/20 text-[#d946ef] font-black rounded-lg border border-[#d946ef]/30 flex items-center">
                  {formData.precio}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#94a3b8] mb-1">Stock Actual</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-white/10 bg-white/5 text-white rounded-xl focus:ring-2 focus:ring-[#d946ef] outline-none"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#94a3b8] mb-1">Stock Mínimo</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-white/10 bg-white/5 text-white rounded-xl focus:ring-2 focus:ring-[#d946ef] outline-none"
                value={formData.minimo}
                onChange={(e) => setFormData({ ...formData, minimo: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <div className="flex gap-3">
              <Button variant="primary" className="flex-1" onClick={() => handleSave(false)}>
                {editingProducto ? 'Actualizar y Salir' : 'Guardar y Salir'}
              </Button>
              {!editingProducto && (
                <Button variant="glass" className="flex-1" onClick={() => handleSave(true)}>
                  Guardar y Continuar
                </Button>
              )}
            </div>
            <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
