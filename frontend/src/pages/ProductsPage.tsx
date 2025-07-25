import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import Header from '../components/Layout/Header';
import { Product, CreateProductRequest, Category } from '../types';
import { productService, categoryService } from 'services/api';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState<CreateProductRequest>({
    name: '',
    category_id: undefined,
    estimated_price: undefined,
    unit: 'ud',
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterCategory]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === parseInt(filterCategory, 10));
    }

    setFilteredProducts(filtered);
  };

  const handleCreateProduct = async () => {
    if (!newProductForm.name.trim()) {
      alert('El nombre del producto es requerido');
      return;
    }

    try {
      const newProduct = await productService.create(newProductForm);
      setProducts([newProduct, ...products]);
      setShowNewProductModal(false);
      setNewProductForm({ name: '', category_id: undefined, estimated_price: undefined, unit: 'ud' });
    } catch (err) {
      alert('Error al crear el producto');
      console.error('Error creating product:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Productos</h1>
          <p className="text-gray-600">
            Gestiona tu lista de productos para usarlos en tus listas de compra.
          </p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input w-auto"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={() => setShowNewProductModal(true)}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Producto
          </button>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Estimado</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Editar</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" style={{ backgroundColor: product.category_color, color: '#fff' }}>
                      {product.category_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.estimated_price ? `${product.estimated_price.toFixed(2)}€` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showNewProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="card-header">
              <h2 className="card-title">Nuevo Producto</h2>
            </div>
            <div className="card-content space-y-4">
              <input
                type="text"
                placeholder="Nombre del producto"
                value={newProductForm.name}
                onChange={e => setNewProductForm({ ...newProductForm, name: e.target.value })}
                className="input"
              />
              <select
                value={newProductForm.category_id || ''}
                onChange={e => setNewProductForm({ ...newProductForm, category_id: parseInt(e.target.value, 10) })}
                className="input"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Precio estimado"
                value={newProductForm.estimated_price || ''}
                onChange={e => setNewProductForm({ ...newProductForm, estimated_price: parseFloat(e.target.value) })}
                className="input"
              />
               <input
                type="text"
                placeholder="Unidad (ej: kg, l, ud)"
                value={newProductForm.unit || ''}
                onChange={e => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                className="input"
              />
            </div>
            <div className="card-footer justify-end space-x-3">
              <button onClick={() => setShowNewProductModal(false)} className="btn btn-secondary">Cancelar</button>
              <button onClick={handleCreateProduct} className="btn btn-primary">Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage; 