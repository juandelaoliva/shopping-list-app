import axios from 'axios';
import {
  Category,
  Product,
  ShoppingList,
  ListItem,
  CreateShoppingListRequest,
  UpdateShoppingListRequest,
  CreateListItemRequest,
  UpdateListItemRequest,
  CreateProductRequest,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Asegúrate de que el backend espera el prefijo "Bearer "
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Servicios de Categorías
export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },
};

// Servicios de Productos
export const productService = {
  getAll: async (params?: { category_id?: number; search?: string }): Promise<Product[]> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  create: async (product: CreateProductRequest): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
  },
};

// Servicios de Listas de Compra
export const shoppingListService = {
  getAll: async (): Promise<ShoppingList[]> => {
    const response = await api.get('/shopping-lists');
    return response.data;
  },

  getById: async (id: number): Promise<ShoppingList> => {
    const response = await api.get(`/shopping-lists/${id}`);
    return response.data;
  },

  create: async (list: CreateShoppingListRequest): Promise<ShoppingList> => {
    const response = await api.post('/shopping-lists', list);
    return response.data;
  },

  update: async (id: number, list: UpdateShoppingListRequest): Promise<ShoppingList> => {
    const response = await api.put(`/shopping-lists/${id}`, list);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/shopping-lists/${id}`);
  },

  // Servicios de elementos de lista
  addItem: async (listId: number, item: CreateListItemRequest): Promise<ListItem> => {
    const response = await api.post(`/shopping-lists/${listId}/items`, item);
    return response.data;
  },

  updateItem: async (listId: number, itemId: number, item: UpdateListItemRequest): Promise<ListItem> => {
    const response = await api.put(`/shopping-lists/${listId}/items/${itemId}`, item);
    return response.data;
  },

  deleteItem: async (listId: number, itemId: number): Promise<void> => {
    await api.delete(`/shopping-lists/${listId}/items/${itemId}`);
  },
};

// Servicio de salud
export const healthService = {
  check: async (): Promise<{ status: string; message: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api; 