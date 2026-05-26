import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, Package, ShoppingCart } from 'lucide-react';
import { useDataStore } from '../../contexts/DataStoreContext';
import { useNavigate } from 'react-router-dom';

// Helper function to highlight matching text
const highlightText = (text: string, query: string) => {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? 
      <span key={index} className="bg-gradient-to-r from-[#10b981] to-[#34d399] text-white font-bold px-1 rounded">{part}</span> 
      : part
  );
};

export function Navbar() {
  const { clientes, productos, ventas, notifications, setNotifications } = useDataStore();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const query = searchQuery.toLowerCase().trim();
  
  const matchedClientes = query ? clientes.filter(c => c.nombre.toLowerCase().includes(query)).slice(0, 3) : [];
  const matchedProductos = query ? productos.filter(p => p.nombre.toLowerCase().includes(query)).slice(0, 3) : [];
  const matchedVentas = query ? ventas.filter(v => v.id.toLowerCase().includes(query) || v.cliente.toLowerCase().includes(query)).slice(0, 3) : [];

  const hasResults = matchedClientes.length > 0 || matchedProductos.length > 0 || matchedVentas.length > 0;

  const handleNavigate = (path: string) => {
    navigate(path);
    setShowDropdown(false);
    setSearchQuery('');
  };

  return (
    <header className="h-20 glass border-b border-white/10 px-8 flex items-center justify-between backdrop-blur-2xl relative z-50">
      {/* Barra de búsqueda */}
      <div className="flex-1 max-w-2xl relative" ref={dropdownRef}>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] group-focus-within:text-[#10b981] transition-colors duration-300" />
          <input
            type="text"
            placeholder="Buscar clientes, productos, facturas..."
            className="w-full pl-12 pr-4 py-3.5 glass rounded-2xl text-white placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all duration-300"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
        </div>

        {/* Dropdown de resultados */}
        {showDropdown && query && (
          <div className="absolute top-full left-0 w-full mt-2 rounded-2xl border border-white/20 shadow-2xl overflow-hidden max-h-96 overflow-y-auto z-50 bg-slate-950/80 backdrop-blur-2xl">
            {!hasResults ? (
              <div className="p-4 text-center text-[#cbd5e1] text-sm font-medium">
                No se encontraron resultados para "{query}"
              </div>
            ) : (
              <div className="py-2">
                {matchedClientes.length > 0 && (
                  <div className="mb-2">
                    <p className="px-4 py-1 text-xs font-bold text-[#10b981] uppercase tracking-wider drop-shadow-lg">Clientes</p>
                    {matchedClientes.map(cliente => (
                      <div 
                        key={cliente.id} 
                        onClick={() => handleNavigate('/clientes')}
                        className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <User className="w-4 h-4 text-[#cbd5e1]" />
                        <div>
                          <p className="text-sm text-white font-semibold drop-shadow-md">{highlightText(cliente.nombre, query)}</p>
                          <p className="text-xs text-[#cbd5e1]">{cliente.email} • {cliente.telefono}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {matchedProductos.length > 0 && (
                  <div className="mb-2">
                    <p className="px-4 py-1 text-xs font-bold text-[#34d399] uppercase tracking-wider drop-shadow-lg">Productos</p>
                    {matchedProductos.map(producto => (
                      <div 
                        key={producto.id} 
                        onClick={() => handleNavigate('/productos')}
                        className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <Package className="w-4 h-4 text-[#cbd5e1]" />
                        <div className="flex-1">
                          <p className="text-sm text-white font-semibold drop-shadow-md">{highlightText(producto.nombre, query)}</p>
                          <p className="text-xs text-[#cbd5e1]">{producto.categoria}</p>
                        </div>
                        <p className="text-sm font-bold text-emerald-300">${producto.precio.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}

                {matchedVentas.length > 0 && (
                  <div>
                    <p className="px-4 py-1 text-xs font-bold text-[#6ee7b7] uppercase tracking-wider drop-shadow-lg">Ventas</p>
                    {matchedVentas.map(venta => (
                      <div 
                        key={venta.id} 
                        onClick={() => handleNavigate('/ventas')}
                        className="px-4 py-2 hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4 text-[#cbd5e1]" />
                        <div className="flex-1">
                          <p className="text-sm text-white font-semibold drop-shadow-md">{highlightText(venta.id, query)} - {highlightText(venta.cliente, query)}</p>
                          <p className="text-xs text-[#cbd5e1]">{venta.fecha}</p>
                        </div>
                        <p className="text-sm font-bold text-emerald-300">${venta.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="flex items-center gap-6 ml-8">
        {/* Notificaciones */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) markAllAsRead();
            }}
            className="relative p-3 rounded-xl glass glass-hover group transition-all duration-300"
          >
            <Bell className="w-5 h-5 text-[#94a3b8] group-hover:text-[#10b981] transition-colors duration-300" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-br from-[#10b981] to-[#34d399] rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 rounded-2xl border border-white/20 overflow-hidden z-50 bg-slate-950/80 backdrop-blur-2xl shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-white font-bold drop-shadow-md">Notificaciones</h3>
                <button 
                  onClick={clearNotifications}
                  className="text-xs text-[#cbd5e1] hover:text-[#10b981] transition-colors font-medium"
                >
                  Limpiar todo
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-[#cbd5e1] text-sm font-medium">
                    No tienes notificaciones
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className={`p-4 border-b border-white/5 hover:bg-white/10 transition-colors cursor-default ${!notif.read ? 'bg-white/5' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                          notif.type === 'success' ? 'bg-emerald-500' :
                          notif.type === 'warning' ? 'bg-yellow-500' :
                          notif.type === 'error' ? 'bg-red-500' : 'bg-[#10b981]'
                        }`} />
                        <div>
                          <p className="text-sm text-white font-semibold mb-0.5 drop-shadow-md">{notif.title}</p>
                          <p className="text-xs text-[#cbd5e1] leading-relaxed mb-1">{notif.message}</p>
                          <p className="text-[10px] text-[#cbd5e1] opacity-50 uppercase font-bold">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fecha actual */}
        <div className="glass rounded-2xl px-5 py-2.5 border border-white/10">
          <p className="text-sm font-semibold text-white">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </p>
          <p className="text-xs text-[#94a3b8] font-medium">
            {new Date().toLocaleDateString('es-ES', { year: 'numeric' })}
          </p>
        </div>
      </div>
    </header>
  );
}
