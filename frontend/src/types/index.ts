export interface Supermarket {
  id: number;
  name: string;
  logo_url?: string;
  color: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  estimated_price?: number;
  unit: string;
  created_at: string;
  // Relaciones
  supermarket_id?: number; // Opcional
  category_id?: number; // Opcional
  // Campos de JOINs (enriquecidos por el backend)
  supermarket_name?: string;
  supermarket_color?: string;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
}

export interface ShoppingList {
  id: number;
  name: string;
  description?: string;
  total_budget?: number;
  is_completed: boolean;
  created_at: string;
  completed_at?: string;
  total_items?: number;
  purchased_items?: number;
  estimated_total?: number;
  items?: ListItem[];
}

export interface ListItem {
  id: number;
  shopping_list_id: number;
  product_id: number | null;
  custom_product_name: string | null;
  product_name: string; // Este campo lo construye el backend
  supermarket_name: string | null;
  supermarket_color?: string | null;
  quantity: number;
  unit: string;
  estimated_price: number | null;
  actual_price?: number;
  is_purchased: boolean;
  notes?: string;
  created_at: string;
  purchased_at?: string;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
}

export interface CreateListItemRequest {
  product_id?: number;
  custom_product_name?: string;
  quantity: number;
  unit?: string;
  estimated_price?: number;
  notes?: string;
}

export interface UpdateListItemRequest {
  quantity?: number;
  unit?: string;
  estimated_price?: number;
  actual_price?: number;
  is_purchased?: boolean;
  notes?: string;
}

export interface CreateShoppingListRequest {
  name: string;
  description?: string;
  total_budget?: number;
}

export interface UpdateShoppingListRequest {
  name?: string;
  description?: string;
  total_budget?: number;
  is_completed?: boolean;
}

export interface CreateProductRequest {
  name: string;
  estimated_price?: number;
  unit?: string;
  supermarket_id?: number;
  category_id?: number;
}

export interface ListCardProps {
  list: ShoppingList;
  onTap: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export interface ShoppingItemProps {
  item: ListItem;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ShoppingListSummary {
  totalItems: number;
  purchasedItems: number;
  estimatedTotal: number;
  actualTotal: number;
  progress: number;
}

export interface CategoryStats {
  category_id: number;
  category_name: string;
  category_color: string;
  category_icon: string;
  total_items: number;
  purchased_items: number;
  estimated_total: number;
} 