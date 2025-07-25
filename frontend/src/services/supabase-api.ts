import { supabase } from '../lib/supabase'
import {
  Category, Product, ShoppingList, ListItem, Supermarket,
  CreateShoppingListRequest, UpdateShoppingListRequest,
  CreateListItemRequest, UpdateListItemRequest, CreateProductRequest, User
} from '../types'

// ========================================
// SERVICIO DE AUTENTICACIÓN
// ========================================
export const authService = {
  // Registro de usuario con displayName opcional
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

  // Inicio de sesión
  login: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  // Cerrar sesión
  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Obtener usuario actual
  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    return {
      id: user.id,
      email: user.email || '',
      displayName: user.user_metadata?.display_name || user.email?.split('@')[0]
    }
  },

  // Obtener sesión actual
  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}

// ========================================
// SERVICIO DE CATEGORÍAS
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
// SERVICIO DE SUPERMERCADOS
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
// SERVICIO DE PRODUCTOS
// ========================================
export const productService = {
  getAll: async (categoryId?: number, search?: string): Promise<Product[]> => {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, color, icon),
        supermarket:supermarkets(id, name, color)
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

    // Transformar datos para compatibilidad con el frontend
    return (data || []).map((item: any) => ({
      ...item,
      category_name: item.category?.name,
      category_color: item.category?.color,
      category_icon: item.category?.icon,
      supermarket_name: item.supermarket?.name,
      supermarket_color: item.supermarket?.color
    }))
  },

  getById: async (id: number): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, color, icon),
        supermarket:supermarkets(id, name, color)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    // Transformar datos para compatibilidad con el frontend
    return {
      ...data,
      category_name: data.category?.name,
      category_color: data.category?.color,
      category_icon: data.category?.icon,
      supermarket_name: data.supermarket?.name,
      supermarket_color: data.supermarket?.color
    }
  },

  create: async (product: CreateProductRequest): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select(`
        *,
        category:categories(id, name, color, icon),
        supermarket:supermarkets(id, name, color)
      `)
      .single()

    if (error) throw error

    // Transformar datos para compatibilidad con el frontend
    return {
      ...data,
      category_name: data.category?.name,
      category_color: data.category?.color,
      category_icon: data.category?.icon,
      supermarket_name: data.supermarket?.name,
      supermarket_color: data.supermarket?.color
    }
  },

  update: async (id: number, product: Partial<CreateProductRequest>): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select(`
        *,
        category:categories(id, name, color, icon),
        supermarket:supermarkets(id, name, color)
      `)
      .single()

    if (error) throw error

    // Transformar datos para compatibilidad con el frontend
    return {
      ...data,
      category_name: data.category?.name,
      category_color: data.category?.color,
      category_icon: data.category?.icon,
      supermarket_name: data.supermarket?.name,
      supermarket_color: data.supermarket?.color
    }
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Alternativas de productos
  getAlternatives: async (id: number): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('product_alternatives')
      .select(`
        alternative_product:products(
          *,
          category:categories(id, name, color, icon),
          supermarket:supermarkets(id, name, color)
        )
      `)
      .eq('product_id', id)

    if (error) throw error

    // Transformar datos para compatibilidad con el frontend
    return (data || []).map((item: any) => ({
      ...item.alternative_product,
      category_name: item.alternative_product?.category?.name,
      category_color: item.alternative_product?.category?.color,
      category_icon: item.alternative_product?.category?.icon,
      supermarket_name: item.alternative_product?.supermarket?.name,
      supermarket_color: item.alternative_product?.supermarket?.color
    }))
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
// SERVICIO DE LISTAS DE COMPRAS
// ========================================
export const shoppingListService = {
  getAll: async (): Promise<ShoppingList[]> => {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        list_items:list_items(
          *,
          product:products(
            *,
            category:categories(name, color, icon),
            supermarket:supermarkets(name, color)
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Transformar datos para compatibilidad con el frontend
    return (data || []).map((list: any) => ({
      ...list,
      items: list.list_items || [],
      total_items: list.list_items?.length || 0,
      purchased_items: list.list_items?.filter((item: any) => item.is_purchased).length || 0,
      estimated_total: list.list_items?.reduce((sum: number, item: any) => 
        sum + (item.estimated_price || 0) * (item.quantity || 1), 0
      ) || 0
    }))
  },

  getById: async (id: number): Promise<ShoppingList> => {
    const { data, error } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        list_items:list_items(
          *,
          product:products(
            *,
            category:categories(name, color, icon),
            supermarket:supermarkets(name, color)
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    // Transformar datos para compatibilidad con el frontend
    return {
      ...data,
      items: data.list_items || [],
      total_items: data.list_items?.length || 0,
      purchased_items: data.list_items?.filter((item: any) => item.is_purchased).length || 0,
      estimated_total: data.list_items?.reduce((sum: number, item: any) => 
        sum + (item.estimated_price || 0) * (item.quantity || 1), 0
      ) || 0
    }
  },

  create: async (list: CreateShoppingListRequest): Promise<ShoppingList> => {
    // Obtener el usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from('shopping_lists')
      .insert([{ ...list, user_id: user.id }])
      .select()
      .single()

    if (error) throw error

    return {
      ...data,
      items: [],
      total_items: 0,
      purchased_items: 0,
      estimated_total: 0
    }
  },

  update: async (id: number, list: UpdateShoppingListRequest): Promise<ShoppingList> => {
    const { data, error } = await supabase
      .from('shopping_lists')
      .update(list)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      ...data,
      items: [],
      total_items: 0,
      purchased_items: 0,
      estimated_total: 0
    }
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Elementos de lista
  addItem: async (listId: number, item: CreateListItemRequest): Promise<ListItem> => {
    const { data, error } = await supabase
      .from('list_items')
      .insert([{ ...item, shopping_list_id: listId }])
      .select(`
        *,
        product:products(
          *,
          category:categories(name, color, icon),
          supermarket:supermarkets(name, color)
        )
      `)
      .single()

    if (error) throw error
    return data
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
          category:categories(name, color, icon),
          supermarket:supermarkets(name, color)
        )
      `)
      .single()

    if (error) throw error
    return data
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