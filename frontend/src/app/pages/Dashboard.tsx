import { Card } from '../components/common/Card';
import { Users, Package, ShoppingCart, TrendingUp, AlertCircle, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useDataStore } from '../contexts/DataStoreContext';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { ventas, clientes, productos } = useDataStore();
  const navigate = useNavigate();

  const hoy = new Date().toISOString().split('T')[0];
  const ventasHoy = ventas.filter(v => v.fecha.startsWith(hoy));
  const totalVentasHoy = ventasHoy.reduce((acc, v) => acc + v.total, 0);
  const totalVentasMes = ventas.reduce((acc, v) => acc + v.total, 0);

  const stats = [
    {
      title: 'Ventas del Día',
      value: `$${totalVentasHoy.toFixed(2)}`,
      change: 'Hoy',
      trend: 'up',
      icon: DollarSign,
      color: 'from-emerald-500 to-green-600',
      shadowColor: 'rgba(16, 185, 129, 0.3)'
    },
    {
      title: 'Clientes Activos',
      value: clientes.filter(c => c.estado === 'Activo').length.toString(),
      change: `Total: ${clientes.length}`,
      trend: 'up',
      icon: Users,
      color: 'from-[#10b981] to-[#34d399]',
      shadowColor: 'rgba(16, 185, 129, 0.3)'
    },
    {
      title: 'Productos en Stock',
      value: productos.filter(p => p.stock > 0).length.toString(),
      change: `Total: ${productos.length}`,
      trend: 'up',
      icon: Package,
      color: 'from-[#34d399] to-[#6ee7b7]',
      shadowColor: 'rgba(52, 211, 153, 0.3)'
    },
    {
      title: 'Ventas Históricas',
      value: ventas.length.toString(),
      change: `$${totalVentasMes.toFixed(2)}`,
      trend: 'up',
      icon: ShoppingCart,
      color: 'from-cyan-500 to-blue-600',
      shadowColor: 'rgba(6, 182, 212, 0.3)'
    },
  ];

  const stockAlerts = productos.filter(p => p.stock <= p.minimo).slice(0, 5);
  const recentSales = ventas.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black gradient-text mb-2 tracking-tight">Dashboard</h1>
        <p className="text-[#94a3b8] font-medium">
          Bienvenido al panel de control de Enterprise Solutions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;

          return (
            <Card key={index} className="group cursor-pointer overflow-hidden" hover={true}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-[#94a3b8] font-semibold mb-3">{stat.title}</p>
                  <p className="text-3xl font-black text-white mb-3 tracking-tight">{stat.value}</p>
                  <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    stat.trend === 'up'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    <TrendIcon className="w-3 h-3" />
                    {stat.change}
                  </div>
                </div>
                <div className={`relative p-3.5 rounded-2xl bg-gradient-to-br ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                     style={{ boxShadow: `0 0 30px ${stat.shadowColor}` }}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas de Stock */}
        <Card
          title="Alertas de Inventario"
          description="Productos con stock bajo"
          action={
            <button onClick={() => navigate('/inventario')} className="text-sm text-[#10b981] hover:text-[#34d399] font-bold transition-colors duration-300">
              Ver todo →
            </button>
          }
        >
          <div className="space-y-3">
            {stockAlerts.map((alert, index) => (
              <div key={index} className="group glass glass-hover rounded-2xl p-4 transition-all duration-300 border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white mb-1">{alert.nombre}</p>
                    <p className="text-xs text-[#94a3b8] font-medium">
                      Stock actual: <span className="font-bold text-yellow-400">{alert.stock}</span>
                      {' '}(Mínimo: {alert.minimo})
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]"></div>
                </div>
              </div>
            ))}
            {stockAlerts.length === 0 && (
              <p className="text-sm text-[#94a3b8] text-center py-4">No hay alertas de stock</p>
            )}
          </div>
        </Card>

        {/* Ventas Recientes */}
        <Card
          title="Ventas Recientes"
          description="Últimas transacciones realizadas"
          action={
            <button onClick={() => navigate('/ventas')} className="text-sm text-[#10b981] hover:text-[#34d399] font-bold transition-colors duration-300">
              Ver todas →
            </button>
          }
        >
          <div className="space-y-3">
            {recentSales.map((sale, index) => (
              <div key={index} className="group glass glass-hover rounded-2xl p-4 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5">{sale.id} - {sale.cliente}</p>
                      <p className="text-xs text-[#94a3b8] font-medium">{sale.fecha}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-emerald-400">${sale.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <p className="text-sm text-[#94a3b8] text-center py-4">No hay ventas registradas</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}







