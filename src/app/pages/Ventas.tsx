import { useState, useMemo } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Plus, ShoppingCart, Eye, X, Search, FileText, Download, Printer, User, CreditCard, Package } from 'lucide-react';
import { useDataStore, Venta, Producto, Cliente } from '../contexts/DataStoreContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export function Ventas() {
  const context = useDataStore();
  const { hasPermission } = useAuth();
  
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClienteId, setSelectedClienteId] = useState('');
  const [cart, setCart] = useState<{ product: Producto; cantidad: number }[]>([]);
  const [viewVenta, setViewVenta] = useState<Venta | null>(null);

  if (!context) return <div className="p-8 text-white">Cargando datos...</div>;
  const { ventas, setVentas, clientes = [], productos = [], setProductos, addNotification, addLog } = context;

  // Filtros de productos para el catálogo
  const filteredProducts = useMemo(() => {
    return (productos || []).filter(p => 
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [productos, searchTerm]);

  // Cálculos en tiempo real
  const totals = useMemo(() => {
    const subtotal = (cart || []).reduce((acc, item) => acc + (item.product.precio * item.cantidad), 0);
    const taxes = subtotal * 0.18; // 18% impuesto ej.
    const total = subtotal + taxes;
    return { subtotal, taxes, total };
  }, [cart]);

  const handleAddToCart = (product: Producto) => {
    const existing = cart.find(item => item.product.id === product.id);
    const currentQty = existing ? existing.cantidad : 0;

    if (product.stock <= currentQty) {
      toast.error('Sin stock suficiente');
      return;
    }

    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item));
    } else {
      setCart([...cart, { product, cantidad: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    const product = (productos || []).find(p => p.id === productId);
    if (!product) return;
    
    if (qty > product.stock) {
      toast.error('Supera el stock disponible');
      return;
    }
    
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item => item.product.id === productId ? { ...item, cantidad: qty } : item));
  };

  const handleCompleteSale = () => {
    if (!selectedClienteId || cart.length === 0) {
      toast.error('Seleccione un cliente y añada productos');
      return;
    }

    const now = new Date();
    const fechaISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const cliente = clientes.find(c => c.id === selectedClienteId);

    const newVenta: Venta = {
      id: `FAC-${Math.floor(100000 + Math.random() * 900000)}`,
      cliente: cliente?.nombre || 'Cliente',
      items: cart.reduce((acc, item) => acc + item.cantidad, 0),
      total: totals.total,
      fecha: fechaISO,
      estado: 'Completada'
    };

    const updatedProducts = productos.map(p => {
      const itemInCart = cart.find(c => c.product.id === p.id);
      if (itemInCart) {
        return { ...p, stock: p.stock - itemInCart.cantidad };
      }
      return p;
    });

    setProductos(updatedProducts);
    setVentas([newVenta, ...ventas]);
    addNotification('Venta Exitosa', `Factura ${newVenta.id} generada por $${newVenta.total.toFixed(2)}`, 'success');
    
    toast.success('Venta registrada y factura generada');
    setIsCreating(false);
    setCart([]);
    setSelectedClienteId('');
  };

  const generatePDF = (venta: Venta) => {
    toast.info(`Preparando factura ${venta.id} para impresión...`);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {isCreating ? (
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-4xl font-black text-white gradient-text">Nueva Venta</h1>
              <p className="text-[#94a3b8] font-medium">Terminal de Punto de Venta</p>
            </div>
            <Button variant="secondary" onClick={() => setIsCreating(false)}>
              <X className="w-5 h-5 mr-2" /> Cancelar Venta
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <Card hover={false}>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar producto por nombre o SKU..."
                    className="w-full pl-10 pr-4 py-3 border border-white/10 bg-white/5 text-white rounded-xl focus:ring-2 focus:ring-[#d946ef] outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredProducts.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => handleAddToCart(p)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                        p.stock > 0 ? 'glass glass-hover border-white/10' : 'opacity-50 grayscale border-red-500/20 bg-red-500/5'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                          {p.imagen ? <img src={p.imagen} className="w-full h-full object-cover rounded-xl" /> : <Package className="w-6 h-6 text-[#94a3b8]" />}
                        </div>
                        <p className="text-sm font-black text-emerald-400">${p.precio}</p>
                      </div>
                      <h3 className="font-bold text-white text-sm line-clamp-1">{p.nombre}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-[10px] text-[#94a3b8]">{p.sku}</p>
                        <p className={`text-[10px] font-bold ${p.stock <= p.minimo ? 'text-red-400' : 'text-[#94a3b8]'}`}>
                          Stock: {p.stock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <Card hover={false}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#94a3b8] mb-2 uppercase tracking-widest">Vincular Cliente</label>
                    <select
                      className="w-full px-4 py-3 border border-white/10 bg-white/5 text-white rounded-xl focus:ring-2 focus:ring-[#d946ef] outline-none"
                      value={selectedClienteId}
                      onChange={(e) => setSelectedClienteId(e.target.value)}
                    >
                      <option value="" className="bg-[#0f172a]">Seleccione Cliente...</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.id} className="bg-[#0f172a]">{c.nombre} ({c.email})</option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4">
                    <label className="block text-xs font-bold text-[#94a3b8] mb-4 uppercase tracking-widest">Resumen de Carrito</label>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-[#94a3b8] opacity-50">
                          <ShoppingCart className="w-12 h-12 mb-3" />
                          <p className="text-sm font-medium">El carrito está vacío</p>
                        </div>
                      ) : (
                        cart.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 glass border border-white/10 rounded-2xl">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                              {item.product.imagen ? <img src={item.product.imagen} className="w-full h-full object-cover rounded-lg" /> : <Package className="w-5 h-5 text-white/40" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white truncate">{item.product.nombre}</p>
                              <p className="text-[10px] text-[#94a3b8]">${item.product.precio.toFixed(2)} c/u</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQuantity(item.product.id, item.cantidad - 1)} className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 text-white">-</button>
                              <span className="text-xs font-bold text-white w-4 text-center">{item.cantidad}</span>
                              <button onClick={() => updateQuantity(item.product.id, item.cantidad + 1)} className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 text-white">+</button>
                            </div>
                            <p className="text-xs font-black text-white w-16 text-right">${(item.product.precio * item.cantidad).toFixed(2)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/10 mt-6">
                    <div className="flex justify-between text-xs text-[#94a3b8]">
                      <span>Subtotal:</span>
                      <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[#94a3b8]">
                      <span>Impuestos (18%):</span>
                      <span>${totals.taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-white/10">
                      <span>TOTAL:</span>
                      <span className="text-[#d946ef]">${totals.total.toFixed(2)}</span>
                    </div>
                    <Button 
                      variant="primary" 
                      className="w-full py-4 mt-4 text-sm font-black tracking-widest uppercase"
                      onClick={handleCompleteSale}
                      disabled={cart.length === 0 || !selectedClienteId}
                    >
                      Confirmar Venta
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black gradient-text mb-2 tracking-tight">Ventas</h1>
              <p className="text-[#94a3b8] font-medium">Historial y gestión de facturación</p>
            </div>
            {hasPermission('ventas.crear') && (
              <Button variant="primary" icon={<Plus className="w-5 h-5" />} onClick={() => setIsCreating(true)}>
                Nueva Venta
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-[#94a3b8] font-bold">Total Facturas</p>
                  <p className="text-3xl font-black text-white">{ventas.length}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-[#94a3b8] font-bold">Recaudación</p>
                  <p className="text-3xl font-black text-white">${ventas.reduce((a, b) => a + b.total, 0).toLocaleString('es-DO')}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#d946ef]/20 text-[#d946ef]">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-[#94a3b8] font-bold">Ticket Promedio</p>
                  <p className="text-3xl font-black text-white">${ventas.length > 0 ? (ventas.reduce((a, b) => a + b.total, 0) / ventas.length).toFixed(2) : 0}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card title="Últimas Facturas">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-sm font-bold text-white">ID Factura</th>
                    <th className="text-left py-4 px-4 text-sm font-bold text-white">Cliente</th>
                    <th className="text-left py-4 px-4 text-sm font-bold text-white">Fecha</th>
                    <th className="text-right py-4 px-4 text-sm font-bold text-white">Total</th>
                    <th className="text-center py-4 px-4 text-sm font-bold text-white">Estado</th>
                    <th className="text-right py-4 px-4 text-sm font-bold text-white">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas.map((venta) => (
                    <tr key={venta.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="py-4 px-4 font-black text-[#d946ef]">{venta.id}</td>
                      <td className="py-4 px-4 text-white font-medium">{venta.cliente}</td>
                      <td className="py-4 px-4 text-[#94a3b8]">{venta.fecha}</td>
                      <td className="py-4 px-4 text-right font-black text-emerald-400">${venta.total.toFixed(2)}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${
                          venta.estado === 'Completada' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {venta.estado}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="glass" size="sm" onClick={() => generatePDF(venta)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="glass" size="sm" onClick={() => setViewVenta(venta)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      <Modal
        isOpen={!!viewVenta}
        onClose={() => setViewVenta(null)}
        title="Detalle de Factura"
      >
        {viewVenta && (
          <div className="space-y-6 print-content">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
              <div>
                <h2 className="text-2xl font-black text-white">{viewVenta.id}</h2>
                <p className="text-[#94a3b8] text-sm">{viewVenta.fecha}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[#94a3b8] uppercase">Estado</p>
                <p className="text-emerald-400 font-black">{viewVenta.estado}</p>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-xs font-bold text-[#94a3b8] uppercase mb-1">Cliente</p>
              <p className="text-lg font-bold text-white">{viewVenta.cliente}</p>
            </div>
            <div className="flex justify-between items-center bg-[#d946ef]/10 p-6 rounded-2xl border border-[#d946ef]/20">
              <span className="text-white font-bold">Total a Pagar</span>
              <span className="text-3xl font-black text-[#d946ef]">${viewVenta.total.toFixed(2)}</span>
            </div>
            <div className="flex gap-3 no-print">
              <Button variant="primary" className="flex-1" onClick={() => generatePDF(viewVenta)}>
                <Printer className="w-5 h-5 mr-2" /> Imprimir
              </Button>
              <Button variant="secondary" onClick={() => setViewVenta(null)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
