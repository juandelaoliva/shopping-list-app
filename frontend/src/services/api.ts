import axios from 'axios';
import {
  Category,
  Product,
  ShoppingList,
  ListItem,
  Supermarket,
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

// Servicios de Supermercados
export const supermarketService = {
  getAll: async (): Promise<Supermarket[]> => {
    const response = await api.get('/supermarkets');
    return response.data;
  },
  create: async (supermarket: { name: string; logo_url?: string }): Promise<Supermarket> => {
    const response = await api.post('/supermarkets', supermarket);
    return response.data;
  },
  update: async (id: number, supermarket: { name: string; logo_url?: string }): Promise<Supermarket> => {
    const response = await api.put(`/supermarkets/${id}`, supermarket);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/supermarkets/${id}`);
  },
};

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

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (product: CreateProductRequest): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
  },

  update: async (id: number, product: Partial<CreateProductRequest>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  getAlternatives: async (id: number): Promise<Product[]> => {
    const response = await api.get(`/products/${id}/alternatives`);
    return response.data;
  },

  addAlternative: async (productId: number, alternativeId: number): Promise<void> => {
    await api.post(`/products/${productId}/alternatives`, { alternative_id: alternativeId });
  },

  removeAlternative: async (productId: number, alternativeId: number): Promise<void> => {
    await api.delete(`/products/${productId}/alternatives/${alternativeId}`);
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