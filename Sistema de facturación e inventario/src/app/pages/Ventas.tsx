import { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Plus, ShoppingCart, Eye, X } from 'lucide-react';
import { useDataStore, Venta } from '../contexts/DataStoreContext';
import { toast } from 'sonner';

export function Ventas() {
  const { ventas, setVentas, clientes, productos, setProductos, addNotification, addLog } = useDataStore();
  
  const [isNewVentaOpen, setIsNewVentaOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [cart, setCart] = useState<{ productId: string; cantidad: number }[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');
  const [cantidadToAdd, setCantidadToAdd] = useState(1);
  
  const [viewVenta, setViewVenta] = useState<Venta | null>(null);

  const hoy = new Date().toISOString().split('T')[0];
  const ventasHoy = ventas.filter(v => v.fecha.startsWith(hoy));
  const totalHoy = ventasHoy.reduce((acc, v) => acc + v.total, 0);

  const handleOpenNewVenta = () => {
    setSelectedCliente('');
    setCart([]);
    setSelectedProductToAdd('');
    setCantidadToAdd(1);
    setIsNewVentaOpen(true);
  };

  const handleAddToCart = () => {
    if (!selectedProductToAdd || cantidadToAdd <= 0) return;
    const prod = productos.find(p => p.id === selectedProductToAdd);
    if (!prod) return;
    
    if (prod.stock < cantidadToAdd) {
      toast.error(`Stock insuficiente para ${prod.nombre}. Stock actual: ${prod.stock}`);
      return;
    }

    const existingItem = cart.find(item => item.productId === selectedProductToAdd);
    if (existingItem) {
      if (prod.stock < existingItem.cantidad + cantidadToAdd) {
        toast.error(`Stock insuficiente. Solo quedan ${prod.stock - existingItem.cantidad} disponibles adicionales.`);
        return;
      }
      setCart(cart.map(item => item.productId === selectedProductToAdd ? { ...item, cantidad: item.cantidad + cantidadToAdd } : item));
    } else {
      setCart([...cart, { productId: selectedProductToAdd, cantidad: cantidadToAdd }]);
    }
    
    setSelectedProductToAdd('');
    setCantidadToAdd(1);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const totalCart = cart.reduce((acc, item) => {
    const p = productos.find(prod => prod.id === item.productId);
    return acc + (p ? p.precio * item.cantidad : 0);
  }, 0);

  const handleCompleteSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCliente || cart.length === 0) {
      toast.error('Debe seleccionar un cliente y agregar al menos un producto');
      return;
    }

    const clienteObj = clientes.find(c => c.id === selectedCliente);
    
    const newVenta: Venta = {
      id: `F-${Math.floor(1000 + Math.random() * 9000)}`,
      cliente: clienteObj ? clienteObj.nombre : 'Cliente Desconocido',
      items: cart.reduce((acc, item) => acc + item.cantidad, 0),
      total: totalCart,
      fecha: new Date().toISOString().slice(0, 16).replace('T', ' '),
      estado: 'Completada'
    };

    // Deduct stock
    const updatedProductos = productos.map(p => {
      const inCart = cart.find(item => item.productId === p.id);
      if (inCart) {
        return { ...p, stock: p.stock - inCart.cantidad };
      }
      return p;
    });

    setProductos(updatedProductos);
    setVentas([newVenta, ...ventas]);
    addNotification('Venta Completada', `Se ha generado la factura ${newVenta.id} por $${newVenta.total.toFixed(2)}`, 'success');
    addLog('Nueva Venta', `Factura ${newVenta.id} - Total: $${newVenta.total.toFixed(2)}`);
    toast.success('Venta registrada exitosamente');
    setIsNewVentaOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Ventas</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Registro y gestión de ventas
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={handleOpenNewVenta}>
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* Resumen de ventas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">Ventas Hoy</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">{ventasHoy.length}</p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">Total Hoy</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">${totalHoy.toFixed(2)}</p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-sm text-[var(--color-text-secondary)] mb-1">Total Histórico</p>
            <p className="text-2xl font-bold text-[var(--color-text-primary)]">${ventas.reduce((a, b) => a + b.total, 0).toFixed(2)}</p>
          </div>
        </Card>
      </div>

      {/* Historial de ventas */}
      <Card title="Historial de Ventas">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94a3b8]">Factura</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94a3b8]">Cliente</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-[#94a3b8]">Items</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[#94a3b8]">Total</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-[#94a3b8]">Fecha</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-[#94a3b8]">Estado</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-[#94a3b8]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <p className="text-sm font-semibold text-blue-600">{venta.id}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-white">{venta.cliente}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <p className="text-sm text-[#94a3b8]">{venta.items}</p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="text-sm font-semibold text-white">${venta.total.toFixed(2)}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-[#94a3b8]">{venta.fecha}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      venta.estado === 'Completada'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {venta.estado}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" size="sm" icon={<Eye className="w-4 h-4" />} onClick={() => setViewVenta(venta)}>
                        Ver
                      </Button>
                      {venta.estado !== 'Anulada' && (
                        <Button variant="danger" size="sm" onClick={() => {
                          if(window.confirm('¿Desea anular esta venta?')) {
                            setVentas(ventas.map(v => v.id === venta.id ? {...v, estado: 'Anulada'} : v));
                            addNotification('Venta Anulada', `La factura ${venta.id} ha sido anulada`, 'warning');
                            addLog('Anulación de Venta', `Factura ${venta.id} marcada como anulada`);
                            toast.success('Venta anulada');
                          }
                        }}>
                          Anular
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ventas.length === 0 && (
            <div className="text-center py-8 text-[#94a3b8]">
              No hay ventas registradas.
            </div>
          )}
        </div>
      </Card>

      {/* Modal Nueva Venta */}
      <Modal
        isOpen={isNewVentaOpen}
        onClose={() => setIsNewVentaOpen(false)}
        title="Registrar Nueva Venta"
        size="lg"
      >
        <form onSubmit={handleCompleteSale} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1">Cliente</label>
            <select
              required
              className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(e.target.value)}
            >
              <option className="bg-[#0f172a] text-white" value="" disabled>Seleccione un cliente</option>
              {clientes.map(c => (
                <option className="bg-[#0f172a] text-white" key={c.id} value={c.id}>{c.nombre} ({c.estado})</option>
              ))}
            </select>
          </div>

          <div className="bg-white/5 p-5 rounded-xl border border-white/10">
            <h4 className="font-semibold text-white mb-3">Agregar Productos</h4>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs text-[#94a3b8] mb-1">Producto</label>
                <select
                  className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
                  value={selectedProductToAdd}
                  onChange={(e) => setSelectedProductToAdd(e.target.value)}
                >
                  <option className="bg-[#0f172a] text-white" value="" disabled>Seleccione un producto</option>
                  {productos.filter(p => p.stock > 0).map(p => (
                    <option className="bg-[#0f172a] text-white" key={p.id} value={p.id}>{p.nombre} - ${p.precio} (Stock: {p.stock})</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <label className="block text-xs text-[#94a3b8] mb-1">Cant.</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
                  value={cantidadToAdd}
                  onChange={(e) => setCantidadToAdd(parseInt(e.target.value) || 1)}
                />
              </div>
              <Button type="button" variant="secondary" onClick={handleAddToCart}>
                Agregar
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Carrito</h4>
            {cart.length === 0 ? (
              <p className="text-sm text-[#94a3b8] text-center py-4 bg-white/5 border border-white/10 border-dashed rounded-xl">El carrito está vacío</p>
            ) : (
              <div className="space-y-2">
                {cart.map((item, idx) => {
                  const p = productos.find(prod => prod.id === item.productId);
                  return (
                    <div key={idx} className="flex justify-between items-center p-3 border border-white/10 rounded-xl bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {p?.imagen ? (
                            <img src={p.imagen} alt={p?.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-[#94a3b8]" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{p?.nombre}</p>
                          <p className="text-xs text-[#94a3b8]">{item.cantidad} x ${p?.precio.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-bold text-white">${(item.cantidad * (p?.precio || 0)).toFixed(2)}</p>
                        <button type="button" onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                  <p className="font-bold">Total a Cobrar:</p>
                  <p className="text-xl font-bold text-blue-600">${totalCart.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsNewVentaOpen(false)} type="button">
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={cart.length === 0}>
              Completar Venta
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Ver Venta */}
      <Modal
        isOpen={viewVenta !== null}
        onClose={() => setViewVenta(null)}
        title={`Detalle de Venta ${viewVenta?.id}`}
      >
        {viewVenta && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[#94a3b8]">Cliente</p>
              <p className="font-medium">{viewVenta.cliente}</p>
            </div>
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-[#94a3b8]">Fecha</p>
                <p className="font-medium">{viewVenta.fecha}</p>
              </div>
              <div>
                <p className="text-sm text-[#94a3b8]">Estado</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  viewVenta.estado === 'Completada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {viewVenta.estado}
                </span>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <p className="font-bold text-lg">Total Pagado</p>
                <p className="text-2xl font-bold text-blue-600">${viewVenta.total.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="secondary" onClick={() => setViewVenta(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}







