import React, { useState, useEffect } from 'react';
import { Product, Category, Supermarket, CreateProductRequest, ShoppingList, CreateListItemRequest } from '../types';
import { productService, categoryService, supermarketService, shoppingListService } from '../services/api';
import api from '../services/api';
import { ArrowLeft, Edit, Trash2, Plus, ShoppingCart } from 'lucide-react';
import { Icons } from '../components/Layout/Icons';
import { getContrastTextColor } from '../components/ColorPicker';

interface ProductDetailScreenProps {
  productId: number;
  onNavigate: (view: string, listId?: number, productId?: number, openModal?: string) => void;
}

// Helper function para crear badges de supermercados con el color correcto
const createSupermarketBadge = (name: string, color?: string | null) => {
  const badgeColor = color || '#6366F1';
  const textColor = getContrastTextColor(badgeColor);
  
  return (
    <span 
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
      style={{
        backgroundColor: badgeColor,
        color: textColor
      }}
    >
      {name}
    </span>
  );
};

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ productId, onNavigate }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [alternatives, setAlternatives] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);

  useEffect(() => {
    loadProductData();
    loadCategoriesAndSupermarkets();
    loadShoppingLists();
  }, [productId]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      
      // Cargar producto principal
      const productData = await productService.getById(productId);
      setProduct(productData);
      
      // Cargar alternativas
      const alternativesData = await productService.getAlternatives(productId);
      setAlternatives(alternativesData);
      
    } catch (err) {
      setError('Error al cargar el producto');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesAndSupermarkets = async () => {
    try {
      const [categoriesData, supermarketsData] = await Promise.all([
        categoryService.getAll(),
        supermarketService.getAll()
      ]);
      setCategories(categoriesData);
      setSupermarkets(supermarketsData);
    } catch (err) {
      console.error('Error loading categories and supermarkets:', err);
    }
  };

  const loadShoppingLists = async () => {
    try {
      const lists = await shoppingListService.getAll();
      setShoppingLists(lists);
    } catch (err) {
      console.error('Error loading shopping lists:', err);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    setShowEditModal(false);
    loadProductData(); // Recargar datos después de editar
  };

  const handleDelete = async () => {
    if (!product) return;
    
    try {
      await productService.delete(product.id);
      onNavigate('products', undefined, undefined, undefined);
    } catch (err) {
      alert('Error al eliminar el producto');
    }
  };

  const handleAddToList = () => {
    setShowAddToListModal(true);
  };

  const handleAddToSelectedList = async (listId: number) => {
    if (!product) return;
    
    try {
      const itemData: CreateListItemRequest = {
        product_id: product.id,
        quantity: 1,
        estimated_price: product.estimated_price,
        unit: product.unit
      };
      
      await shoppingListService.addItem(listId, itemData);
      setShowAddToListModal(false);
      
      // Mostrar mensaje de éxito
      alert('Producto agregado a la lista exitosamente');
    } catch (err) {
      console.error('Error adding product to list:', err);
      alert('Error al agregar el producto a la lista');
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="mobile-content flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="app-container">
        <div className="mobile-content flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Error</h2>
            <p className="text-slate-600 mb-4">{error || 'Producto no encontrado'}</p>
            <button 
              onClick={() => onNavigate('products', undefined, undefined, undefined)}
              className="btn btn-primary"
            >
              Volver a Productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="mobile-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              className="btn-icon btn-sm btn-ghost" 
              onClick={() => onNavigate('products', undefined, undefined, undefined)}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900 truncate">
              {product.name}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleEdit}
              className="btn-icon btn-sm btn-secondary"
              title="Editar producto"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-icon btn-sm btn-danger"
              title="Eliminar producto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mobile-content space-y-6">
        {/* Product Info Card */}
        <div className="card">
          <div className="card-content">
            {/* Product Icon and Name */}
            <div className="flex items-start gap-4 mb-6">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  backgroundColor: product.category_color ? `${product.category_color}20` : '#f1f5f9',
                  color: product.category_color || '#64748b'
                }}
              >
                {product.category_icon || Icons.products}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                  {product.name}
                </h2>
                {/* Category Badge */}
                {product.category_name && (
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3"
                    style={{
                      backgroundColor: product.category_color ? `${product.category_color}20` : '#f1f5f9',
                      color: product.category_color || '#64748b'
                    }}
                  >
                    {product.category_icon && <span className="mr-2">{product.category_icon}</span>}
                    {product.category_name}
                  </span>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              {/* Supermarket */}
              {product.supermarket_name && (
                <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                  <span className="text-sm font-medium text-slate-600">Supermercado</span>
                  <div>
                    {createSupermarketBadge(product.supermarket_name, product.supermarket_color)}
                  </div>
                </div>
              )}

              {/* Price */}
              {product.estimated_price && (
                <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                  <span className="text-sm font-medium text-slate-600">Precio estimado</span>
                  <span className="text-lg font-bold text-emerald-600">
                    {Number(product.estimated_price).toFixed(2)}€
                  </span>
                </div>
              )}

              {/* Unit */}
              <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                <span className="text-sm font-medium text-slate-600">Unidad</span>
                <span className="text-sm font-medium text-slate-900 capitalize">
                  {product.unit}
                </span>
              </div>

              {/* Created Date */}
              <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                <span className="text-sm font-medium text-slate-600">Creado</span>
                <span className="text-sm text-slate-500">
                  {new Date(product.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alternatives Section */}
        {alternatives.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-slate-900">
                Productos Alternativos ({alternatives.length})
              </h3>
              <p className="text-sm text-slate-500">
                Productos similares en otros supermercados
              </p>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {alternatives.map((alt) => (
                  <div 
                    key={alt.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => onNavigate('product-detail', undefined, alt.id, undefined)}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{
                        backgroundColor: alt.category_color ? `${alt.category_color}20` : '#f1f5f9',
                        color: alt.category_color || '#64748b'
                      }}
                    >
                      {alt.category_icon || Icons.products}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 mb-1 truncate">
                        {alt.name}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {alt.supermarket_name && 
                          createSupermarketBadge(alt.supermarket_name, alt.supermarket_color)
                        }
                        {alt.estimated_price && (
                          <span className="text-sm font-medium text-emerald-600">
                            {Number(alt.estimated_price).toFixed(2)}€
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-400 transform rotate-180" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button 
            onClick={handleAddToList}
            className="btn btn-primary w-full"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Agregar a Lista
          </button>
        </div>
      </main>

      {/* Edit Product Modal */}
      {showEditModal && product && (
        <EditProductModal 
          product={product}
          allProducts={alternatives}
          categories={categories}
          supermarkets={supermarkets}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Add to List Modal */}
      {showAddToListModal && product && (
        <AddToListModal 
          product={product}
          shoppingLists={shoppingLists}
          onClose={() => setShowAddToListModal(false)}
          onAddToList={handleAddToSelectedList}
          onCreateNewList={() => {
            setShowAddToListModal(false);
            onNavigate('home', undefined, undefined, 'newList');
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 text-center mb-2">
                Eliminar Producto
              </h3>
              <p className="text-sm text-slate-600 text-center mb-6">
                ¿Estás seguro de que quieres eliminar <strong>{product.name}</strong>? 
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
                  className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add to List Modal Component
const AddToListModal = ({ 
  product,
  shoppingLists,
  onClose, 
  onAddToList,
  onCreateNewList
}: { 
  product: Product;
  shoppingLists: ShoppingList[];
  onClose: () => void; 
  onAddToList: (listId: number) => void;
  onCreateNewList: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Agregar a Lista
            </h3>
            <button onClick={onClose} className="btn-icon btn-sm btn-ghost">
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                style={{
                  backgroundColor: product.category_color ? `${product.category_color}20` : '#f1f5f9',
                  color: product.category_color || '#64748b'
                }}
              >
                {product.category_icon || Icons.products}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 mb-1 truncate">
                  {product.name}
                </h4>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  {product.estimated_price && (
                    <span className="font-medium text-emerald-600">
                      {Number(product.estimated_price).toFixed(2)}€
                    </span>
                  )}
                  <span>por {product.unit}</span>
                </div>
              </div>
            </div>
          </div>

          {shoppingLists.length > 0 ? (
            <>
              <p className="text-sm text-slate-600 mb-4">
                Selecciona una lista para agregar este producto:
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                {shoppingLists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => onAddToList(list.id)}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 truncate">
                          {list.name}
                        </h4>
                        {list.description && (
                          <p className="text-sm text-slate-600 truncate">
                            {list.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                          <span>
                            {list.total_items || 0} productos
                          </span>
                          {list.is_completed && (
                            <span className="text-emerald-600 font-medium">
                              ✓ Completada
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-3">
                        <ShoppingCart className="w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                  No tienes listas de compra
                </h4>
                <p className="text-sm text-slate-600 mb-6">
                  Primero necesitas crear una lista para poder agregar productos.
                </p>
              </div>
              <button 
                onClick={onCreateNewList}
                className="btn btn-primary w-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear Nueva Lista
              </button>
            </>
          )}

          {shoppingLists.length > 0 && (
            <div className="border-t pt-4">
              <button 
                onClick={onCreateNewList}
                className="btn btn-secondary w-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear Nueva Lista
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Edit Product Modal Component
const EditProductModal = ({ 
  product,
  allProducts,
  categories,
  supermarkets,
  onClose, 
  onSave 
}: { 
  product: Product;
  allProducts: Product[];
  categories: Category[];
  supermarkets: Supermarket[];
  onClose: () => void; 
  onSave: () => void;
}) => {
  const [name, setName] = useState(product.name);
  const [supermarketId, setSupermarketId] = useState(product.supermarket_id?.toString() || '');
  const [categoryId, setCategoryId] = useState(product.category_id?.toString() || '');
  const [estimatedPrice, setEstimatedPrice] = useState(product.estimated_price?.toString() || '');
  const [unit, setUnit] = useState(product.unit);
  
  const [alternatives, setAlternatives] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAlts, setLoadingAlts] = useState(true);

  useEffect(() => {
    loadAlternatives();
  }, [product.id]);

  const loadAlternatives = async () => {
    try {
      setLoadingAlts(true);
      const alts = await productService.getAlternatives(product.id);
      setAlternatives(alts);
    } catch (error) {
      console.error("Error loading alternatives", error);
    } finally {
      setLoadingAlts(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      const updatedProductData = {
        name: name.trim(),
        supermarket_id: supermarketId ? parseInt(supermarketId) : undefined,
        category_id: categoryId ? parseInt(categoryId) : undefined,
        estimated_price: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
        unit: unit
      };
      await api.put(`/products/${product.id}`, updatedProductData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleAddAlternative = async (altId: number) => {
    try {
      await productService.addAlternative(product.id, altId);
      loadAlternatives();
    } catch (error) {
      console.error("Error adding alternative", error);
    }
  };

  const handleRemoveAlternative = async (altId: number) => {
    try {
      await productService.removeAlternative(product.id, altId);
      loadAlternatives();
    } catch (error) {
      console.error("Error removing alternative", error);
    }
  };
  
  const potentialAlternatives = allProducts.filter(p => 
    p.id !== product.id &&
    !alternatives.some(alt => alt.id === p.id) &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Editar Producto</h2>
            <button onClick={onClose} className="btn-icon btn-sm btn-ghost">
              ✕
            </button>
          </div>
          
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Product Name */}
            <div className="form-group">
              <label className="form-label">Nombre del producto</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Ej: Leche entera"
              />
            </div>

            {/* Supermarket */}
            <div className="form-group">
              <label className="form-label">Supermercado</label>
              <select
                value={supermarketId}
                onChange={(e) => setSupermarketId(e.target.value)}
                className="form-input"
              >
                <option value="">Sin supermercado</option>
                {supermarkets.map((supermarket) => (
                  <option key={supermarket.id} value={supermarket.id}>
                    {supermarket.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="form-input"
              >
                <option value="">Sin categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Precio estimado</label>
                <input
                  type="number"
                  step="0.01"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(e.target.value)}
                  className="form-input"
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Unidad</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="form-input"
                  placeholder="unidad"
                />
              </div>
            </div>

            {/* Alternatives Section */}
            <div className="border-t pt-4">
              <h3 className="text-md font-semibold text-slate-800 mb-3">Productos Alternativos</h3>
              
              {/* Current alternatives */}
              {alternatives.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-600 mb-2">Alternativas actuales:</h4>
                  <div className="space-y-2">
                    {alternatives.map((alt) => (
                      <div key={alt.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-sm">{alt.name}</span>
                        <button
                          onClick={() => handleRemoveAlternative(alt.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add new alternative */}
              <div className="form-group">
                <label className="form-label">Buscar para agregar alternativa</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  placeholder="Buscar productos..."
                />
              </div>

              {/* Potential alternatives */}
              {searchTerm && potentialAlternatives.length > 0 && (
                <div className="space-y-2">
                  {potentialAlternatives.map((alt) => (
                    <div key={alt.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm">{alt.name}</span>
                      <button
                        onClick={() => handleAddAlternative(alt.id)}
                        className="text-indigo-600 hover:text-indigo-700 text-sm"
                      >
                        Agregar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button onClick={onClose} className="btn btn-secondary flex-1">
              Cancelar
            </button>
            <button onClick={handleSave} className="btn btn-primary flex-1">
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailScreen; 