import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import Header from '../components/Layout/Header';
import { ShoppingList, ListItem as ListItemType, Product, CreateListItemRequest } from '../types';
import { shoppingListService, productService } from 'services/api';
import ListItem from '../components/ShoppingList/ListItem';

const ListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadListDetails();
    }
  }, [id]);

  const loadListDetails = async () => {
    try {
      setLoading(true);
      const data = await shoppingListService.getById(parseInt(id!, 10));
      setList(data);
    } catch (err) {
      setError('Error al cargar la lista');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (item: CreateListItemRequest) => {
    if (!id) return;
    try {
      const newItem = await shoppingListService.addItem(parseInt(id, 10), item);
      setList(prevList => prevList ? { ...prevList, items: [...(prevList.items || []), newItem] } : null);
      setShowAddProductModal(false);
    } catch (err) {
      alert('Error al añadir el producto');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!list) return <div>Lista no encontrada</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a mis listas
        </Link>
        
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{list.name}</h1>
          <p className="text-gray-600 mt-2">{list.description}</p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Productos</h2>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Añadir Producto
          </button>
        </div>
        
        <div className="space-y-4">
          {list.items && list.items.map(item => (
            <ListItem key={item.id} item={item} listId={list.id} onUpdate={loadListDetails} />
          ))}
        </div>

        {showAddProductModal && (
          <AddProductModal
            onClose={() => setShowAddProductModal(false)}
            onAddItem={handleAddItem}
          />
        )}
      </main>
    </div>
  );
};

interface AddProductModalProps {
  onClose: () => void;
  onAddItem: (item: CreateListItemRequest) => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ onClose, onAddItem }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [customProductName, setCustomProductName] = useState('');

  useEffect(() => {
    productService.getAll().then(setProducts);
  }, []);

  const filteredProducts = searchTerm
    ? products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : products;

  const handleSubmit = () => {
    if (isCreatingNew && customProductName.trim()) {
      onAddItem({ custom_product_name: customProductName, quantity });
    } else if (!isCreatingNew && selectedProduct) {
      onAddItem({ 
        product_id: selectedProduct.id, 
        quantity,
        estimated_price: selectedProduct.estimated_price || undefined
      });
    }
  };

  const canSubmit = (isCreatingNew && customProductName.trim()) || (!isCreatingNew && selectedProduct);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Añadir Producto a la Lista</h2>
          
          {/* Toggle buttons */}
          <div className="flex mb-4 border rounded-lg p-1 bg-gray-100">
            <button
              onClick={() => setIsCreatingNew(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isCreatingNew 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Buscar Existente
            </button>
            <button
              onClick={() => setIsCreatingNew(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isCreatingNew 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Crear Nuevo
            </button>
          </div>

          <div className="space-y-4">
            {isCreatingNew ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del nuevo producto
                </label>
                <input
                  type="text"
                  placeholder="Ej: Leche"
                  value={customProductName}
                  onChange={e => setCustomProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar producto
                </label>
                <input
                  type="text"
                  placeholder="Buscar producto existente..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {filteredProducts.length > 0 && (
                  <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                    {filteredProducts.map(p => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProduct(p)}
                        className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                          selectedProduct?.id === p.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">{p.name}</div>
                        {p.category_name && (
                          <div className="text-sm text-gray-500">{p.category_name}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {selectedProduct && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium text-blue-900">
                      Producto seleccionado: {selectedProduct.name}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                placeholder="1"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              canSubmit 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListPage; 