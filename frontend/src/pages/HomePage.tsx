import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import Header from '../components/Layout/Header';
import ShoppingListCard from '../components/ShoppingList/ShoppingListCard';
import { ShoppingList, CreateShoppingListRequest } from '../types';
import { shoppingListService } from '../services/api';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [filteredLists, setFilteredLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompleted, setFilterCompleted] = useState<'all' | 'active' | 'completed'>('all');
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListForm, setNewListForm] = useState<CreateShoppingListRequest>({
    name: '',
    description: '',
    total_budget: undefined,
  });

  useEffect(() => {
    loadLists();
  }, []);

  useEffect(() => {
    filterLists();
  }, [lists, searchTerm, filterCompleted]);

  const loadLists = async () => {
    try {
      setLoading(true);
      const data = await shoppingListService.getAll();
      setLists(data);
    } catch (err) {
      setError('Error al cargar las listas de compra');
      console.error('Error loading lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterLists = () => {
    let filtered = [...lists];

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(list =>
        list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (list.description && list.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por estado
    if (filterCompleted === 'active') {
      filtered = filtered.filter(list => !list.is_completed);
    } else if (filterCompleted === 'completed') {
      filtered = filtered.filter(list => list.is_completed);
    }

    setFilteredLists(filtered);
  };

  const handleCreateList = async () => {
    if (!newListForm.name.trim()) {
      alert('El nombre de la lista es requerido');
      return;
    }

    try {
      const newList = await shoppingListService.create(newListForm);
      setLists([newList, ...lists]);
      setShowNewListModal(false);
      setNewListForm({ name: '', description: '', total_budget: undefined });
      navigate(`/list/${newList.id}`);
    } catch (err) {
      alert('Error al crear la lista');
      console.error('Error creating list:', err);
    }
  };

  const handleDeleteList = async (list: ShoppingList) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${list.name}"?`)) {
      return;
    }

    try {
      await shoppingListService.delete(list.id);
      setLists(lists.filter(l => l.id !== list.id));
    } catch (err) {
      alert('Error al eliminar la lista');
      console.error('Error deleting list:', err);
    }
  };

  const handleListClick = (list: ShoppingList) => {
    console.log('Clicking on list:', list.id);
    console.log('Navigating to:', `/list/${list.id}`);
    navigate(`/list/${list.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onNewList={() => setShowNewListModal(true)} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando listas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onNewList={() => setShowNewListModal(true)} />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={loadLists} className="btn btn-primary">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNewList={() => setShowNewListModal(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado de la página */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Listas de Compra</h1>
          <p className="text-gray-600">
            Gestiona tus listas de compra de forma sencilla y eficiente
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar listas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterCompleted}
              onChange={(e) => setFilterCompleted(e.target.value as any)}
              className="input w-auto"
            >
              <option value="all">Todas</option>
              <option value="active">Activas</option>
              <option value="completed">Completadas</option>
            </select>
          </div>
        </div>

        {/* Lista de tarjetas */}
        {filteredLists.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterCompleted !== 'all' ? 'No hay listas que coincidan' : 'No tienes listas aún'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterCompleted !== 'all' 
                  ? 'Prueba cambiando los filtros de búsqueda'
                  : 'Crea tu primera lista de compra para empezar'
                }
              </p>
              {(!searchTerm && filterCompleted === 'all') && (
                <button
                  onClick={() => setShowNewListModal(true)}
                  className="btn btn-primary btn-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Primera Lista
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLists.map((list) => (
              <ShoppingListCard
                key={list.id}
                list={list}
                onClick={handleListClick}
                onDelete={handleDeleteList}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal para nueva lista */}
      {showNewListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="card-header">
              <h2 className="card-title">Nueva Lista de Compra</h2>
              <p className="card-description">
                Crea una nueva lista para organizar tu próxima compra
              </p>
            </div>
            
            <div className="card-content space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la lista *
                </label>
                <input
                  type="text"
                  value={newListForm.name}
                  onChange={(e) => setNewListForm({ ...newListForm, name: e.target.value })}
                  className="input"
                  placeholder="Ej: Compra semanal"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  value={newListForm.description}
                  onChange={(e) => setNewListForm({ ...newListForm, description: e.target.value })}
                  className="input resize-none"
                  rows={3}
                  placeholder="Descripción de la lista..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Presupuesto (€, opcional)
                </label>
                <input
                  type="number"
                  value={newListForm.total_budget || ''}
                  onChange={(e) => setNewListForm({ 
                    ...newListForm, 
                    total_budget: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                  className="input"
                  placeholder="100.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="card-footer justify-end space-x-3">
              <button
                onClick={() => setShowNewListModal(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateList}
                className="btn btn-primary"
                disabled={!newListForm.name.trim()}
              >
                Crear Lista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage; 