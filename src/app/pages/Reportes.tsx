import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Download, Calendar, TrendingUp, DollarSign, Package, AlertTriangle, FileText, PieChart as PieChartIcon } from 'lucide-react';
import { useDataStore } from '../contexts/DataStoreContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function Reportes() {
  const { ventas, productos } = useDataStore();
  const { hasPermission } = useAuth();
  const [reportType, setReportType] = useState<'economico' | 'ventas' | 'inventario'>('economico');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-12-31');

  if (!hasPermission('informes.leer')) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center border border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-white">Acceso Denegado</h2>
        <p className="text-[#94a3b8] max-w-md">No tienes los permisos necesarios para visualizar los informes económicos del sistema.</p>
      </div>
    );
  }
  
  // Estado para disparar el filtrado real solo al dar clic en el botón
  const [appliedRange, setAppliedRange] = useState({ from: '2026-01-01', to: '2026-12-31' });

  const filteredSales = useMemo(() => {
    return ventas.filter(v => {
      const date = v.fecha.split(' ')[0];
      return date >= appliedRange.from && date <= appliedRange.to;
    });
  }, [ventas, appliedRange]);

  const totalVentas = filteredSales.reduce((acc, v) => acc + v.total, 0);
  const totalTransacciones = filteredSales.length;
  const promedioVenta = totalTransacciones > 0 ? totalVentas / totalTransacciones : 0;

  const chartData = useMemo(() => {
    const data: any[] = [];
    const grouped = filteredSales.reduce((acc: any, v) => {
      const date = v.fecha.split(' ')[0];
      acc[date] = (acc[date] || 0) + v.total;
      return acc;
    }, {});
    
    Object.keys(grouped).sort().forEach(date => {
      data.push({ name: date, total: grouped[date] });
    });
    return data;
  }, [filteredSales]);

  const stockData = useMemo(() => [
    { name: 'Stock Normal', value: productos.filter(p => p.stock > p.minimo).length, color: '#10b981' },
    { name: 'Stock Bajo', value: productos.filter(p => p.stock <= p.minimo && p.stock > 0).length, color: '#f59e0b' },
    { name: 'Sin Stock', value: productos.filter(p => p.stock === 0).length, color: '#ef4444' },
  ], [productos]);

  const handleExportPDF = () => {
    toast.info(`Preparando reporte de ${reportType.toUpperCase()} para exportación...`);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleApplyFilters = () => {
    setAppliedRange({ from: dateFrom, to: dateTo });
    toast.success('Reporte actualizado con el nuevo rango de fechas');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black gradient-text mb-2 tracking-tight">Reportes</h1>
          <p className="text-[#94a3b8] font-medium">Análisis avanzado de rendimiento empresarial</p>
        </div>
        <div className="flex gap-3">
          <Button variant="glass" icon={<Download className="w-5 h-5" />} onClick={handleExportPDF}>
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Configuración de Reporte */}
      <Card hover={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Tipo de Reporte</label>
            <select 
              className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-[#d946ef] outline-none"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
            >
              <option value="economico" className="bg-[#0f172a]">Resumen Económico</option>
              <option value="ventas" className="bg-[#0f172a]">Ventas por Período</option>
              <option value="inventario" className="bg-[#0f172a]">Estado de Inventario</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Rango de Fechas</label>
            <div className="flex gap-2">
              <input 
                type="date" 
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-[#d946ef] outline-none"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <input 
                type="date" 
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-[#d946ef] outline-none"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          <Button variant="primary" className="h-[42px]" onClick={handleApplyFilters}>
            Generar Vista Previa
          </Button>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-blue-500">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#94a3b8]">VENTAS TOTALES</p>
              <p className="text-2xl font-black text-white">${totalVentas.toLocaleString('es-DO')}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-[#d946ef]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#d946ef]/10 text-[#d946ef]">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#94a3b8]">TRANSACCIONES</p>
              <p className="text-2xl font-black text-white">{totalTransacciones}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-emerald-500">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#94a3b8]">PROMEDIO TICKET</p>
              <p className="text-2xl font-black text-white">${promedioVenta.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-yellow-500">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#94a3b8]">STOCK BAJO</p>
              <p className="text-2xl font-black text-white">{productos.filter(p => p.stock <= p.minimo).length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Tendencia de Ventas" description="Ventas diarias en el período seleccionado">
          <div className="h-80 w-full bg-transparent">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    padding: '12px'
                  }}
                  itemStyle={{ color: '#d946ef', fontWeight: '800' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontWeight: '600' }}
                />
                <Bar dataKey="total" fill="url(#colorTotal)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d946ef" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Distribución de Inventario" description="Estado actual de existencias">
          <div className="h-80 w-full flex flex-col items-center bg-transparent">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stockData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {stockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)' 
                  }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 mt-4">
              {stockData.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: s.color }} />
                  <span className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-wider">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
