import React, { useState, useEffect, useMemo } from 'react';
import { supermarketService } from '../services/api';
import { Supermarket } from '../types';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import BottomNavigation from '../components/Layout/BottomNavigation';
import { Icons } from '../components/Layout/Icons';
import ColorPicker from '../components/ColorPicker';


interface SupermarketsPageProps {
  onNavigate: (view: string) => void;
}

// Nuevo componente para la tarjeta de supermercado
const SupermarketCard: React.FC<{ supermarket: Supermarket; onEdit: () => void; onDelete: () => void; }> = ({ supermarket, onEdit, onDelete }) => {
  // Proveer un color por defecto si no existe
  const cardColor = supermarket.color || '#6366F1';
  
  return (
    <div 
      className="card relative group transition-all duration-200 hover:scale-[1.02]"
      style={{
        borderLeft: `4px solid ${cardColor}`,
        boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1), 0 0 0 1px ${cardColor}15`
      }}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 z-10">
        <button onClick={onEdit} className="p-1 bg-white rounded-full shadow-md hover:bg-slate-50 transition-colors" title="Editar">
          <Edit className="w-3 h-3 text-slate-600" />
        </button>
        <button onClick={onDelete} className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors" title="Eliminar">
          <Trash2 className="w-3 h-3 text-red-600" />
        </button>
      </div>
      <div className="card-content text-center">
        <img src={supermarket.logo_url || 'https://via.placeholder.com/150'} alt={supermarket.name} className="w-24 h-16 object-contain mx-auto mb-4" />
        <h3 className="font-medium text-slate-900 text-sm leading-tight mb-2">{supermarket.name}</h3>
      </div>
    </div>
  );
};

const SupermarketsPage: React.FC<SupermarketsPageProps> = ({ onNavigate }) => {
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSupermarket, setEditingSupermarket] = useState<Supermarket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSupermarkets();
  }, []);

  const filteredSupermarkets = useMemo(() => 
    supermarkets.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [supermarkets, searchTerm]
  );

  const loadSupermarkets = async () => {
    try {
      setLoading(true);
      const data = await supermarketService.getAll();
      setSupermarkets(data);
    } catch (err) {
      setError('Error al cargar los supermercados');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supermarket: Supermarket) => {
    setEditingSupermarket(supermarket);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este supermercado?')) {
      try {
        await supermarketService.delete(id);
        loadSupermarkets();
      } catch (err) {
        alert('Error al eliminar el supermercado');
      }
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setEditingSupermarket(null);
    loadSupermarkets();
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="btn-icon btn-sm btn-ghost" onClick={() => onNavigate('home')}>
              {Icons.back}
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Supermercados</h1>
              <p className="text-xs text-slate-500">{supermarkets.length} supermercados</p>
            </div>
          </div>
          <button onClick={() => { setEditingSupermarket(null); setShowModal(true); }} className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4 mr-1" />
            Añadir
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mobile-content">
        <div className="mb-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <input
              type="text"
              placeholder="Buscar supermercado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-12"
            />
          </div>
        </div>
        
        {loading && <p>Cargando...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {!loading && filteredSupermarkets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No se encontraron supermercados. ¡Añade uno nuevo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSupermarkets.map(s => (
              <SupermarketCard 
                key={s.id} 
                supermarket={s} 
                onEdit={() => handleEdit(s)}
                onDelete={() => handleDelete(s.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation currentScreen="supermarkets" onNavigate={onNavigate} />

      {showModal && (
        <SupermarketModal
          supermarket={editingSupermarket}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

interface SupermarketModalProps {
  supermarket: Supermarket | null;
  onClose: () => void;
  onSave: () => void;
}

const SupermarketModal: React.FC<SupermarketModalProps> = ({ supermarket, onClose, onSave }) => {
  const [name, setName] = useState(supermarket?.name || '');
  const [logoUrl, setLogoUrl] = useState(supermarket?.logo_url || '');
  const [color, setColor] = useState(supermarket?.color || '#6366F1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { name, logo_url: logoUrl, color };
      if (supermarket) {
        await supermarketService.update(supermarket.id, payload);
      } else {
        await supermarketService.create(payload);
      }
      onSave();
    } catch (err: any) {
      alert(`Error al guardar: ${err.response?.data?.error || 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {supermarket ? 'Editar' : 'Nuevo'} Supermercado
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL del Logo (Opcional)</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <ColorPicker
                selectedColor={color}
                onColorChange={setColor}
                label="Color del supermercado"
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupermarketsPage; 