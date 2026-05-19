import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Download, Calendar, TrendingUp, DollarSign } from 'lucide-react';
import { useDataStore } from '../contexts/DataStoreContext';
import { toast } from 'sonner';
import { useState } from 'react';

export function Reportes() {
  const { ventas } = useDataStore();
  const [dateFrom, setDateFrom] = useState('2026-05-01');
  const [dateTo, setDateTo] = useState('2026-05-31');

  // Filtrar ventas por fecha (simple string comparison works for YYYY-MM-DD if formatted properly, but here we just show all for demo or use simple filter)
  const ventasFiltradas = ventas.filter(v => {
    const vDate = v.fecha.split(' ')[0];
    return vDate >= dateFrom && vDate <= dateTo;
  });

  const totalVentas = ventasFiltradas.reduce((sum, v) => sum + v.total, 0);
  const totalTransacciones = ventasFiltradas.length;
  const ticketPromedio = totalTransacciones > 0 ? totalVentas / totalTransacciones : 0;

  const handleExport = () => {
    if (ventasFiltradas.length === 0) {
      toast.error('No hay datos para exportar en este período');
      return;
    }
    
    // Crear CSV
    const headers = ['ID', 'Cliente', 'Items', 'Total', 'Fecha', 'Estado'];
    const rows = ventasFiltradas.map(v => [v.id, v.cliente, v.items, v.total, v.fecha, v.estado]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n' 
      + rows.map(e => e.join(',')).join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_ventas_${dateFrom}_${dateTo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Reporte exportado exitosamente');
  };

  const handleApplyFilter = () => {
    toast.success('Filtros aplicados');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Reportes</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Análisis y estadísticas del negocio
          </p>
        </div>
        <Button variant="primary" icon={<Download className="w-5 h-5" />} onClick={handleExport}>
          Exportar Reportes
        </Button>
      </div>

      {/* Filtros de fecha */}
      <Card>
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Desde</label>
              <input
                type="date"
                className="px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1">Hasta</label>
              <input
                type="date"
                className="px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d946ef] focus:border-transparent"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <Button variant="secondary" className="mt-5" onClick={handleApplyFilter}>
              Aplicar
            </Button>
          </div>
        </div>
      </Card>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#94a3b8] mb-1">Ventas Totales (Período)</p>
              <p className="text-3xl font-bold text-blue-600">${totalVentas.toFixed(2)}</p>
            </div>
            <div className="bg-blue-100 text-blue-600 p-4 rounded-lg">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#94a3b8] mb-1">Transacciones (Período)</p>
              <p className="text-3xl font-bold text-purple-600">{totalTransacciones}</p>
            </div>
            <div className="bg-purple-100 text-purple-600 p-4 rounded-lg">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#94a3b8] mb-1">Ticket Promedio</p>
              <p className="text-3xl font-bold text-green-600">${ticketPromedio.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 text-green-600 p-4 rounded-lg">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top ventas del periodo */}
        <Card title="Últimas Ventas" description={`Período: ${dateFrom} - ${dateTo}`}>
          <div className="space-y-4">
            {ventasFiltradas.slice(0, 5).map((venta, index) => (
              <div key={index} className="flex items-center justify-between p-4 glass glass-hover border border-white/10 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#d946ef] to-[#7c3aed] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg shadow-[#d946ef]/20">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{venta.cliente}</p>
                    <p className="text-xs text-[#94a3b8]">{venta.fecha}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold text-green-600">
                  ${venta.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))}
            {ventasFiltradas.length === 0 && (
              <p className="text-sm text-[#94a3b8] text-center py-4">No hay ventas en este período</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}







