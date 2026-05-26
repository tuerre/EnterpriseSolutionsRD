import { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Search, Plus, Edit, Trash2, Package } from 'lucide-react';
import { useDataStore, Producto } from '../contexts/DataStoreContext';
import { toast } from 'sonner';

export function Productos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const { productos, setProductos, categorias } = useDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

  const [formData, setFormData] = useState<Omit<Producto, 'id'>>({
    nombre: '',
    categoria: '',
    precio: 0,
    stock: 0,
    sku: '',
    minimo: 5,
    maximo: 50,
    estado: 'normal',
    imagen: ''
  });

  const filteredProductos = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          producto.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || producto.categoria.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (producto?: Producto) => {
    if (producto) {
      setEditingProducto(producto);
      setFormData({
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio: producto.precio,
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
        nombre: '', categoria: '', precio: 0, stock: 0, sku: '', minimo: 5, maximo: 50, estado: 'normal', imagen: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProducto(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProducto) {
      setProductos(productos.map(p => p.id === editingProducto.id ? { ...p, ...formData } : p));
      toast.success('Producto actualizado exitosamente');
    } else {
      const newProducto = { ...formData, id: Date.now().toString() };
      setProductos([...productos, newProducto]);
      toast.success('Producto creado exitosamente');
    }
    handleCloseModal();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imagen: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      setProductos(productos.filter(p => p.id !== id));
      toast.success('Producto eliminado exitosamente');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Productos</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Catálogo y gestión de productos
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={() => handleOpenModal()}>
          Nuevo Producto
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent focus:border-transparent"
            />
          </div>
          <select
              className="px-4 py-2 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]"
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

      {/* Grid de productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProductos.map((producto) => (
          <Card key={producto.id} className="hover:shadow-md transition-shadow">
            <div className="space-y-4">
              {/* Imagen del producto */}
              <div className="aspect-square bg-white/5 border border-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                {producto.imagen ? (
                  <img src={producto.imagen} alt={producto.nombre} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-16 h-16 text-gray-400" />
                )}
              </div>

              {/* Información */}
              <div>
                <p className="text-xs text-[#94a3b8] mb-1">{producto.sku}</p>
                <h3 className="font-semibold text-white mb-1">{producto.nombre}</h3>
                <p className="text-sm text-[#94a3b8] mb-2">{producto.categoria}</p>

                <div className="flex items-center justify-between mb-3">
                  <p className="text-xl font-bold text-blue-600">${producto.precio}</p>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    producto.stock > 20
                      ? 'bg-green-100 text-green-700'
                      : producto.stock > 10
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    Stock: {producto.stock}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end gap-2">
                  <Button variant="secondary" size="sm" icon={<Edit className="w-4 h-4" />} onClick={() => handleOpenModal(producto)}>
                    Editar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(producto.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filteredProductos.length === 0 && (
          <div className="col-span-full text-center py-8 text-[#94a3b8]">
            No se encontraron productos.
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Nombre</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">SKU</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Categoría</label>
              <select
                required
                className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              >
                <option value="" className="bg-[#0f172a]">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat} className="bg-[#0f172a]">{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Precio</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Stock Inicial</label>
              <input
                type="number"
                required
                className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Foto del Producto</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                  {formData.imagen ? (
                    <img src={formData.imagen} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-10 h-10 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="product-image"
                  />
                  <label
                    htmlFor="product-image"
                    className="inline-flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {formData.imagen ? 'Cambiar Foto' : 'Subir Foto'}
                  </label>
                  {formData.imagen && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imagen: '' })}
                      className="ml-2 text-sm text-red-400 hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  )}
                  <p className="text-xs text-[#94a3b8] mt-2">Formatos permitidos: JPG, PNG. Máx 2MB.</p>
                </div>
              </div>
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







