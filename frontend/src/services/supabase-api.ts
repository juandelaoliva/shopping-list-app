import { supabase } from '../lib/supabase'
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
} from '../types'

// ========================================
// AUTH SERVICES
// ========================================

export const authService = {
  // Login con email/password
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // Register nuevo usuario
  register: async (email: string, password: string, displayName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0]
        }
      }
    })
    
    if (error) throw error
    return data
  },

  // Logout
  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get usuario actual
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Get session actual
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}

// ========================================
// CATEGORIES SERVICES
// ========================================

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  }
}

// ========================================
// SUPERMARKETS SERVICES
// ========================================

export const supermarketService = {
  getAll: async (): Promise<Supermarket[]> => {
    const { data, error } = await supabase
      .from('supermarkets')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  },

  getById: async (id: number): Promise<Supermarket> => {
    const { data, error } = await supabase
      .from('supermarkets')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  create: async (supermarket: Omit<Supermarket, 'id' | 'created_at'>): Promise<Supermarket> => {
    const { data, error } = await supabase
      .from('supermarkets')
      .insert([supermarket])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  update: async (id: number, supermarket: Partial<Supermarket>): Promise<Supermarket> => {
    const { data, error } = await supabase
      .from('supermarkets')
      .update(supermarket)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('supermarkets')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// ========================================
// PRODUCTS SERVICES
// ========================================

export const productService = {
  getAll: async (categoryId?: number, search?: string): Promise<Product[]> => {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        supermarket:supermarkets(*)
      `)
      .order('created_at', { ascending: false })
    
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    // Transformar datos para mantener compatibilidad
    return (data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      category_id: item.category_id,
      category_name: item.category?.name,
      category_color: item.category?.color,
      category_icon: item.category?.icon,
      supermarket_id: item.supermarket_id,
      supermarket_name: item.supermarket?.name,
      supermarket_color: item.supermarket?.color,
      estimated_price: item.estimated_price,
      unit: item.unit,
      created_at: item.created_at
    }))
  },

  getById: async (id: number): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        supermarket:supermarkets(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      category_id: data.category_id,
      category_name: data.category?.name,
      category_color: data.category?.color,
      category_icon: data.category?.icon,
      supermarket_id: data.supermarket_id,
      supermarket_name: data.supermarket?.name,
      supermarket_color: data.supermarket?.color,
      estimated_price: data.estimated_price,
      unit: data.unit,
      created_at: data.created_at
    }
  },

  create: async (product: CreateProductRequest): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select(`
        *,
        category:categories(*),
        supermarket:supermarkets(*)
      `)
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      category_id: data.category_id,
      category_name: data.category?.name,
      category_color: data.category?.color,
      category_icon: data.category?.icon,
      supermarket_id: data.supermarket_id,
      supermarket_name: data.supermarket?.name,
      supermarket_color: data.supermarket?.color,
      estimated_price: data.estimated_price,
      unit: data.unit,
      created_at: data.created_at
    }
  },

  update: async (id: number, product: Partial<CreateProductRequest>): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select(`
        *,
        category:categories(*),
        supermarket:supermarkets(*)
      `)
      .single()
    
    if (error) throw error
    
    return {
      id: data.id,
      name: data.name,
      category_id: data.category_id,
      category_name: data.category?.name,
      category_color: data.category?.color,
      category_icon: data.category?.icon,
      supermarket_id: data.supermarket_id,
      supermarket_name: data.supermarket?.name,
      supermarket_color: data.supermarket?.color,
      estimated_price: data.estimated_price,
      unit: data.unit,
      created_at: data.created_at
    }
  },

  delete: async (id: number): Promise<void> => {
    // Primero eliminar alternativas
    await supabase
      .from('product_alternatives')
      .delete()
      .or(`product_id.eq.${id},alternative_product_id.eq.${id}`)
    
    // Luego eliminar el producto
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  getAlternatives: async (id: number): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('product_alternatives')
      .select(`
        alternative_product:products!alternative_product_id(
          *,
          category:categories(*),
          supermarket:supermarkets(*)
        )
      `)
      .eq('product_id', id)
    
    if (error) throw error
    
    return (data || []).map((item: any) => {
      const product = item.alternative_product as any
      return {
        id: product.id,
        name: product.name,
        category_id: product.category_id,
        category_name: product.category?.name,
        category_color: product.category?.color,
        category_icon: product.category?.icon,
        supermarket_id: product.supermarket_id,
        supermarket_name: product.supermarket?.name,
        supermarket_color: product.supermarket?.color,
        estimated_price: product.estimated_price,
        unit: product.unit,
        created_at: product.created_at
      }
    })
  },

  addAlternative: async (productId: number, alternativeId: number): Promise<void> => {
    const { error } = await supabase
      .from('product_alternatives')
      .insert([{ product_id: productId, alternative_product_id: alternativeId }])
    
    if (error) throw error
  },

  removeAlternative: async (productId: number, alternativeId: number): Promise<void> => {
    const { error } = await supabase
      .from('product_alternatives')
      .delete()
      .eq('product_id', productId)
      .eq('alternative_product_id', alternativeId)
    
    if (error) throw error
  }
}

// ========================================
// SHOPPING LISTS SERVICES
// ========================================

export const shoppingListService = {
  getAll: async (): Promise<ShoppingList[]> => {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        list_items(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Calcular estadísticas
    return (data || []).map((list: any) => ({
      ...list,
      total_items: list.list_items?.length || 0,
      purchased_items: list.list_items?.filter((item: any) => item.is_purchased).length || 0,
      total_estimated: list.list_items?.reduce((sum: number, item: any) => 
        sum + (item.estimated_price * item.quantity || 0), 0) || 0
    }))
  },

  getById: async (id: number): Promise<ShoppingList> => {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        list_items(
          *,
          product:products(
            *,
            category:categories(*),
            supermarket:supermarkets(*)
          )
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    // Transformar items para compatibilidad
    const transformedItems = (data.list_items || []).map((item: any) => ({
      ...item,
      category_name: item.product?.category?.name,
      category_color: item.product?.category?.color,
      category_icon: item.product?.category?.icon,
      supermarket_name: item.product?.supermarket?.name,
      supermarket_color: item.product?.supermarket?.color,
    }))
    
    return {
      ...data,
      list_items: transformedItems,
      total_items: transformedItems.length,
      purchased_items: transformedItems.filter((item: any) => item.is_purchased).length,
      total_estimated: transformedItems.reduce((sum: number, item: any) => 
        sum + (item.estimated_price * item.quantity || 0), 0)
    }
  },

  create: async (list: CreateShoppingListRequest): Promise<ShoppingList> => {
    const user = await authService.getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    const { data, error } = await supabase
      .from('shopping_lists')
      .insert([{ ...list, user_id: user.id }])
      .select()
      .single()
    
    if (error) throw error
    return { ...data, total_items: 0, purchased_items: 0, total_estimated: 0 }
  },

  update: async (id: number, list: UpdateShoppingListRequest): Promise<ShoppingList> => {
    const { data, error } = await supabase
      .from('shopping_lists')
      .update(list)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Servicios de elementos de lista
  addItem: async (listId: number, item: CreateListItemRequest): Promise<ListItem> => {
    const { data, error } = await supabase
      .from('list_items')
      .insert([{ ...item, shopping_list_id: listId }])
      .select(`
        *,
        product:products(
          *,
          category:categories(*),
          supermarket:supermarkets(*)
        )
      `)
      .single()
    
    if (error) throw error
    
    return {
      ...data,
      category_name: data.product?.category?.name,
      category_color: data.product?.category?.color,
      category_icon: data.product?.category?.icon,
      supermarket_name: data.product?.supermarket?.name,
      supermarket_color: data.product?.supermarket?.color,
    }
  },

  updateItem: async (listId: number, itemId: number, item: UpdateListItemRequest): Promise<ListItem> => {
    const { data, error } = await supabase
      .from('list_items')
      .update(item)
      .eq('id', itemId)
      .eq('shopping_list_id', listId)
      .select(`
        *,
        product:products(
          *,
          category:categories(*),
          supermarket:supermarkets(*)
        )
      `)
      .single()
    
    if (error) throw error
    
    return {
      ...data,
      category_name: data.product?.category?.name,
      category_color: data.product?.category?.color,
      category_icon: data.product?.category?.icon,
      supermarket_name: data.product?.supermarket?.name,
      supermarket_color: data.product?.supermarket?.color,
    }
  },

  deleteItem: async (listId: number, itemId: number): Promise<void> => {
    const { error } = await supabase
      .from('list_items')
      .delete()
      .eq('id', itemId)
      .eq('shopping_list_id', listId)
    
    if (error) throw error
  }
} 