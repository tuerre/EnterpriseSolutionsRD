import { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Plus, Tag, Trash2, Edit } from 'lucide-react';
import { useDataStore } from '../contexts/DataStoreContext';
import { toast } from 'sonner';

export function Categorias() {
  const { categorias, setCategorias, addCategoria, addLog, addNotification } = useDataStore();
  const [newCategoria, setNewCategoria] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoria.trim()) return;
    if (categorias.includes(newCategoria.trim())) {
      toast.error('La categoría ya existe');
      return;
    }
    addCategoria(newCategoria.trim());
    addLog('Gestión de Categorías', `Nueva categoría añadida: ${newCategoria}`);
    addNotification('Categoría Añadida', `Se ha creado la categoría: ${newCategoria}`, 'success');
    setNewCategoria('');
    toast.success('Categoría añadida');
  };

  const handleDelete = (cat: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${cat}"?`)) {
      setCategorias(categorias.filter(c => c !== cat));
      addLog('Gestión de Categorías', `Categoría eliminada: ${cat}`);
      toast.success('Categoría eliminada');
    }
  };

  const startEdit = (index: number, value: string) => {
    setEditingIndex(index);
    setEditValue(value);
  };

  const handleSaveEdit = () => {
    if (!editValue.trim() || editingIndex === null) return;
    const updated = [...categorias];
    updated[editingIndex] = editValue.trim();
    setCategorias(updated);
    setEditingIndex(null);
    toast.success('Categoría actualizada');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorías</h1>
          <p className="text-[#94a3b8] mt-1">Administra las clasificaciones de tus productos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario Agregar */}
        <Card title="Nueva Categoría" className="lg:col-span-1">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Nombre de la Categoría</label>
              <input
                type="text"
                placeholder="Ej: Periféricos"
                className="w-full px-3 py-2 border border-white/10 bg-white/5 text-white placeholder:text-[#94a3b8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                value={newCategoria}
                onChange={(e) => setNewCategoria(e.target.value)}
              />
            </div>
            <Button variant="primary" className="w-full" icon={<Plus className="w-5 h-5" />}>
              Agregar Categoría
            </Button>
          </form>
        </Card>

        {/* Lista de Categorías */}
        <Card title="Categorías Existentes" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categorias.length === 0 ? (
              <p className="text-[#94a3b8] text-center col-span-2 py-8">No hay categorías registradas</p>
            ) : (
              categorias.map((cat, index) => (
                <div key={index} className="flex items-center justify-between p-4 glass glass-hover border border-white/10 rounded-xl transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center">
                      <Tag className="w-4 h-4 text-[#10b981]" />
                    </div>
                    {editingIndex === index ? (
                      <input
                        type="text"
                        className="bg-transparent border-b border-[#10b981] text-white focus:outline-none"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSaveEdit}
                        autoFocus
                      />
                    ) : (
                      <span className="text-white font-medium">{cat}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEdit(index, cat)}
                      className="p-1.5 text-[#94a3b8] hover:text-[#10b981] transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <Button 
                      variant="danger"
                      size="sm"
                      className="px-2.5 py-1.5"
                      onClick={() => handleDelete(cat)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
