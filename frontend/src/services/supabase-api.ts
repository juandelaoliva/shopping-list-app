import { supabase } from '../lib/supabase'
import {
  Category, Product, ShoppingList, ListItem, Supermarket,
  CreateShoppingListRequest, UpdateShoppingListRequest,
  CreateListItemRequest, UpdateListItemRequest, CreateProductRequest, User, AlternativeGroup
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
    console.log('🔍 Loading all products with filters:', { categoryId, search });
    
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

    if (error) {
      console.error('❌ Supabase error loading products:', error);
      console.error('Error details:', { code: error.code, message: error.message, details: error.details });
      throw error;
    }

    console.log('✅ Products loaded successfully:', data?.length || 0, 'products');

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

  // Test method to check basic connectivity
  testConnection: async (): Promise<{ success: boolean; message: string; count?: number }> => {
    try {
      console.log('🧪 Testing Supabase connection...');
      
      const { data, error, count } = await supabase
        .from('products')
        .select('id', { count: 'exact' })
        .limit(1)

      if (error) {
        console.error('❌ Connection test failed:', error);
        return { success: false, message: `Connection failed: ${error.message}` };
      }

      console.log('✅ Connection test successful');
      return { 
        success: true, 
        message: `Connected successfully. Database has ${count || 0} products.`,
        count: count || 0
      };
    } catch (err) {
      console.error('❌ Connection test error:', err);
      return { success: false, message: `Unexpected error: ${err}` };
    }
  },

  getById: async (id: number): Promise<Product> => {
    console.log('🔍 Loading product with ID:', id);
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, color, icon),
        supermarket:supermarkets(id, name, color)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('❌ Supabase error loading product:', error);
      console.error('Error details:', { code: error.code, message: error.message, details: error.details });
      throw error;
    }

    if (!data) {
      console.error('❌ No product data returned for ID:', id);
      throw new Error(`Product with ID ${id} not found`);
    }

    console.log('✅ Product loaded successfully:', data);

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
    try {
      // Método 1: Intentar con la relación de clave foránea
      const { data, error } = await supabase
        .from('product_alternatives')
        .select(`
          alternative_product:products!alternative_product_id(
            *,
            category:categories(id, name, color, icon),
            supermarket:supermarkets(id, name, color)
          )
        `)
        .eq('product_id', id)

      if (!error && data) {
        // Transformar datos para compatibilidad con el frontend
        return (data || []).map((item: any) => ({
          ...item.alternative_product,
          category_name: item.alternative_product?.category?.name,
          category_color: item.alternative_product?.category?.color,
          category_icon: item.alternative_product?.category?.icon,
          supermarket_name: item.alternative_product?.supermarket?.name,
          supermarket_color: item.alternative_product?.supermarket?.color
        }))
      }
    } catch (error) {
      console.warn('Foreign key method failed, trying fallback method:', error)
    }

    try {
      // Método 2: Fallback - obtener IDs alternativos y luego cargar productos
      const { data: alternativeIds, error: idsError } = await supabase
        .from('product_alternatives')
        .select('alternative_product_id')
        .eq('product_id', id)

      if (idsError) throw idsError

      if (!alternativeIds || alternativeIds.length === 0) {
        return []
      }

      // Cargar productos alternativos usando los IDs
      const ids = alternativeIds.map((alt: { alternative_product_id: number }) => alt.alternative_product_id)
      const { data: alternatives, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, color, icon),
          supermarket:supermarkets(id, name, color)
        `)
        .in('id', ids)

      if (productsError) throw productsError

      // Transformar datos para compatibilidad con el frontend
      return (alternatives || []).map((item: any) => ({
        ...item,
        category_name: item.category?.name,
        category_color: item.category?.color,
        category_icon: item.category?.icon,
        supermarket_name: item.supermarket?.name,
        supermarket_color: item.supermarket?.color
      }))
    } catch (fallbackError) {
      console.error('Both methods failed for loading alternatives:', fallbackError)
      return [] // Retornar array vacío en lugar de lanzar error
    }
  },

  addAlternative: async (productId: number, alternativeId: number): Promise<void> => {
    console.log(`🔗 Adding alternative: ${productId} ↔ ${alternativeId}`);

    // NUEVA LÓGICA: Usar grupos inteligentes
    await alternativeGroupService.connectProducts(productId, alternativeId);

    // COMPATIBILIDAD: Mantener tabla antigua por ahora (para rollback)
    try {
      const { error } = await supabase
        .from('product_alternatives')
        .upsert([
          { product_id: productId, alternative_product_id: alternativeId },
          { product_id: alternativeId, alternative_product_id: productId }  // Bidireccional
        ], { 
          onConflict: 'product_id,alternative_product_id',
          ignoreDuplicates: true
        });

      if (error) {
        console.warn('Error updating legacy table:', error);
        // No lanzar error - la tabla nueva es la fuente de verdad
      }
    } catch (legacyError) {
      console.warn('Legacy table update failed:', legacyError);
    }
    
    console.log(`✅ Alternative added successfully via groups`);
  },

  removeAlternative: async (productId: number, alternativeId: number): Promise<void> => {
    console.log(`🔌 Removing alternative: ${productId} ↔ ${alternativeId}`);

    // NUEVA LÓGICA: Verificar si están en el mismo grupo y desconectar si es necesario
    const [group1, group2] = await Promise.all([
      alternativeGroupService.getProductGroup(productId),
      alternativeGroupService.getProductGroup(alternativeId)
    ]);

    if (group1 && group1 === group2) {
      // Están en el mismo grupo - necesitamos dividir el grupo
      console.log(`🔄 Products are in same group ${group1}, splitting group`);
      
      // Estrategia simple: remover uno de los productos del grupo
      // Si el grupo queda con ≤1 producto, se eliminará automáticamente
      await alternativeGroupService.disconnectProduct(alternativeId);
      
      // Si el producto removido estaba conectado a otros, crear un nuevo grupo solo para él
      // Por ahora, simplificaremos y solo lo removemos
    }

    // COMPATIBILIDAD: Mantener tabla antigua actualizada
    try {
      const { error: error1 } = await supabase
        .from('product_alternatives')
        .delete()
        .eq('product_id', productId)
        .eq('alternative_product_id', alternativeId);

      const { error: error2 } = await supabase
        .from('product_alternatives')
        .delete()
        .eq('product_id', alternativeId)
        .eq('alternative_product_id', productId);

      if (error1 || error2) {
        console.warn('Error updating legacy table:', error1 || error2);
      }
    } catch (legacyError) {
      console.warn('Legacy table update failed:', legacyError);
    }
    
    console.log(`✅ Alternative removed successfully via groups`);
  },

  // Cargar mapa completo de alternativas para la lógica de clusters
  getAllAlternativesMap: async (): Promise<Record<string, number[]>> => {
    try {
      console.log('🔍 Loading alternatives map using new groups system...');
      
      // NUEVA LÓGICA: Usar grupos como fuente principal
      const { data: groupRelations, error: groupError } = await supabase
        .from('product_alternative_groups')
        .select('product_id, group_id');

      if (!groupError && groupRelations && groupRelations.length > 0) {
        // Construir mapa usando grupos
        const alternativesMap: Record<string, number[]> = {};
        const groupProducts: Record<number, number[]> = {};

        // Agrupar productos por grupo
        groupRelations.forEach(({ product_id, group_id }: { product_id: number; group_id: number }) => {
          if (!groupProducts[group_id]) {
            groupProducts[group_id] = [];
          }
          groupProducts[group_id].push(product_id);
        });

        // Para cada grupo, conectar todos los productos entre sí
        Object.values(groupProducts).forEach(productIds => {
          if (productIds.length > 1) {
            productIds.forEach(productId => {
              alternativesMap[productId] = productIds.filter(id => id !== productId);
            });
          }
        });

        const productsWithAlternatives = Object.keys(alternativesMap).length;
        console.log(`✅ Groups alternatives map loaded: ${productsWithAlternatives} products have alternatives`);
        
        if (productsWithAlternatives > 0) {
          return alternativesMap;
        }
      }

      // FALLBACK: Usar tabla antigua si no hay datos en grupos
      console.log('⚠️ No group data found, falling back to legacy table...');
      
      const { data: alternatives, error } = await supabase
        .from('product_alternatives')
        .select('product_id, alternative_product_id');

      if (error) {
        console.warn('Failed to load legacy alternatives map:', error);
        return {};
      }

      // Construir el mapa de alternativas bidireccional (lógica anterior)
      const alternativesMap: Record<string, number[]> = {};
      
      (alternatives || []).forEach(({ product_id, alternative_product_id }: { product_id: number; alternative_product_id: number }) => {
        // Añadir relación A -> B
        if (!alternativesMap[product_id]) {
          alternativesMap[product_id] = [];
        }
        alternativesMap[product_id].push(alternative_product_id);
        
        // Añadir relación B -> A (bidireccional)
        if (!alternativesMap[alternative_product_id]) {
          alternativesMap[alternative_product_id] = [];
        }
        alternativesMap[alternative_product_id].push(product_id);
      });

      const legacyCount = Object.keys(alternativesMap).length;
      console.log(`✅ Legacy alternatives map loaded: ${legacyCount} products have alternatives`);
      return alternativesMap;
      
    } catch (error) {
      console.error('Error loading alternatives map:', error);
      return {};
    }
  }
}

// ========================================
// SERVICIO DE LISTAS DE COMPRAS
// ========================================

// Helper function para transformar items nested a estructura plana
const transformListItem = (item: any): ListItem => {
  // Extraer nombre: primero del producto, luego custom_product_name como fallback
  const productName = item.product?.name || item.custom_product_name || 'Producto sin nombre';
  
  const transformed = {
    ...item,
    product_name: productName,
    category_name: item.product?.category?.name,
    category_color: item.product?.category?.color,
    category_icon: item.product?.category?.icon,
    supermarket_name: item.product?.supermarket?.name,
    supermarket_color: item.product?.supermarket?.color
  };
  
  return transformed;
};

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
      items: (list.list_items || []).map(transformListItem),
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
      items: (data.list_items || []).map(transformListItem),
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

    // Transformar datos nested a estructura plana para el frontend
    return transformListItem(data)
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
    return transformListItem(data)
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

// ========================================
// NUEVOS SERVICIOS PARA GRUPOS DE ALTERNATIVAS
// ========================================

export const alternativeGroupService = {
  // Obtener todos los grupos
  getAll: async (): Promise<AlternativeGroup[]> => {
    const { data, error } = await supabase
      .from('alternative_groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Obtener grupo por ID
  getById: async (id: number): Promise<AlternativeGroup> => {
    const { data, error } = await supabase
      .from('alternative_groups')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Crear nuevo grupo
  create: async (name?: string, description?: string): Promise<AlternativeGroup> => {
    const { data, error } = await supabase
      .from('alternative_groups')
      .insert([{ name, description }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualizar grupo
  update: async (id: number, name?: string, description?: string): Promise<AlternativeGroup> => {
    const { data, error } = await supabase
      .from('alternative_groups')
      .update({ name, description })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Eliminar grupo
  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('alternative_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Obtener productos de un grupo
  getProducts: async (groupId: number): Promise<Product[]> => {
    const { data, error } = await supabase
      .from('product_alternative_groups')
      .select(`
        product:products(
          *,
          category:categories(id, name, color, icon),
          supermarket:supermarkets(id, name, color)
        )
      `)
      .eq('group_id', groupId);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      ...item.product,
      category_name: item.product?.category?.name,
      category_color: item.product?.category?.color,
      category_icon: item.product?.category?.icon,
      supermarket_name: item.product?.supermarket?.name,
      supermarket_color: item.product?.supermarket?.color
    }));
  },

  // Agregar producto a grupo
  addProduct: async (groupId: number, productId: number): Promise<void> => {
    const { error } = await supabase
      .from('product_alternative_groups')
      .insert([{ group_id: groupId, product_id: productId }]);

    if (error) throw error;
  },

  // Remover producto de grupo
  removeProduct: async (groupId: number, productId: number): Promise<void> => {
    const { error } = await supabase
      .from('product_alternative_groups')
      .delete()
      .eq('group_id', groupId)
      .eq('product_id', productId);

    if (error) throw error;
  },

  // Obtener número de productos en un grupo
  getProductCount: async (groupId: number): Promise<number> => {
    const { count, error } = await supabase
      .from('product_alternative_groups')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);

    if (error) throw error;
    return count || 0;
  },

  // LÓGICA INTELIGENTE DE GRUPOS
  
  // Obtener grupo de un producto (si tiene)
  getProductGroup: async (productId: number): Promise<number | null> => {
    const { data, error } = await supabase
      .from('product_alternative_groups')
      .select('group_id')
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data?.group_id || null;
  },

  // Conectar dos productos creando o usando grupos existentes
  connectProducts: async (productId1: number, productId2: number): Promise<void> => {
    console.log(`🔗 Connecting products ${productId1} ↔ ${productId2}`);

    // Obtener grupos existentes de ambos productos
    const [group1, group2] = await Promise.all([
      alternativeGroupService.getProductGroup(productId1),
      alternativeGroupService.getProductGroup(productId2)
    ]);

    console.log(`📊 Product ${productId1} group: ${group1}, Product ${productId2} group: ${group2}`);

    if (group1 && group2) {
      // Ambos tienen grupo - unir grupos
      if (group1 !== group2) {
        console.log(`🔄 Merging groups ${group1} and ${group2}`);
        await alternativeGroupService.mergeGroups(group1, group2);
      } else {
        console.log(`✅ Products already in same group ${group1}`);
      }
    } else if (group1) {
      // Solo productId1 tiene grupo - agregar productId2
      console.log(`➕ Adding product ${productId2} to existing group ${group1}`);
      await alternativeGroupService.addProduct(group1, productId2);
    } else if (group2) {
      // Solo productId2 tiene grupo - agregar productId1
      console.log(`➕ Adding product ${productId1} to existing group ${group2}`);
      await alternativeGroupService.addProduct(group2, productId1);
    } else {
      // Ninguno tiene grupo - crear nuevo grupo
      console.log(`🆕 Creating new group for products ${productId1} and ${productId2}`);
      const newGroup = await alternativeGroupService.create(
        `Grupo de alternativas`, 
        `Grupo creado automáticamente`
      );
      await Promise.all([
        alternativeGroupService.addProduct(newGroup.id, productId1),
        alternativeGroupService.addProduct(newGroup.id, productId2)
      ]);
    }

    console.log(`✅ Products ${productId1} and ${productId2} connected successfully`);
  },

  // Desconectar producto de su grupo (con limpieza automática)
  disconnectProduct: async (productId: number): Promise<void> => {
    console.log(`🔌 Disconnecting product ${productId}`);

    const groupId = await alternativeGroupService.getProductGroup(productId);
    if (!groupId) {
      console.log(`⚠️ Product ${productId} has no group`);
      return;
    }

    // Remover producto del grupo
    await alternativeGroupService.removeProduct(groupId, productId);
    console.log(`➖ Removed product ${productId} from group ${groupId}`);

    // Verificar si el grupo queda con solo 1 producto
    const remainingCount = await alternativeGroupService.getProductCount(groupId);
    console.log(`📊 Group ${groupId} now has ${remainingCount} products`);

    if (remainingCount <= 1) {
      console.log(`🗑️ Deleting group ${groupId} (only ${remainingCount} products left)`);
      await alternativeGroupService.delete(groupId);
    }
  },

  // Unir dos grupos
  mergeGroups: async (groupId1: number, groupId2: number): Promise<void> => {
    console.log(`🔄 Merging group ${groupId2} into group ${groupId1}`);

    // Obtener productos del grupo2
    const products2 = await alternativeGroupService.getProducts(groupId2);
    
    // Mover todos los productos del grupo2 al grupo1
    for (const product of products2) {
      await alternativeGroupService.removeProduct(groupId2, product.id);
      await alternativeGroupService.addProduct(groupId1, product.id);
    }

    // Eliminar grupo2 vacío
    await alternativeGroupService.delete(groupId2);
    console.log(`✅ Merged groups successfully, deleted empty group ${groupId2}`);
  },

  // MIGRACIÓN AUTOMÁTICA DESDE TABLA ANTIGUA
  
  // Migrar relaciones existentes a grupos
  migrateFromLegacyTable: async (): Promise<void> => {
    console.log('🔄 Starting migration from legacy product_alternatives table...');

    try {
      // Verificar si ya hay datos en la tabla de grupos
      const { data: existingGroups } = await supabase
        .from('product_alternative_groups')
        .select('product_id', { count: 'exact', head: true });

      if (existingGroups && existingGroups.length > 0) {
        console.log('⚠️ Groups table already has data, skipping migration');
        return;
      }

      // Obtener todas las relaciones de la tabla antigua
      const { data: legacyRelations, error } = await supabase
        .from('product_alternatives')
        .select('product_id, alternative_product_id');

      if (error) {
        console.error('Error reading legacy table:', error);
        return;
      }

      if (!legacyRelations || legacyRelations.length === 0) {
        console.log('📋 No legacy relations found, migration complete');
        return;
      }

      console.log(`📊 Found ${legacyRelations.length} legacy relations to migrate`);

      // Construir grupos usando algoritmo de connected components
      const visited = new Set<number>();
      const productConnections: Record<number, number[]> = {};

      // Construir grafo de conexiones
      legacyRelations.forEach(({ product_id, alternative_product_id }: { product_id: number; alternative_product_id: number }) => {
        if (!productConnections[product_id]) {
          productConnections[product_id] = [];
        }
        if (!productConnections[alternative_product_id]) {
          productConnections[alternative_product_id] = [];
        }
        productConnections[product_id].push(alternative_product_id);
        productConnections[alternative_product_id].push(product_id);
      });

      // Encontrar componentes conectados (grupos)
      const groups: number[][] = [];
      
      const dfs = (productId: number, currentGroup: number[]) => {
        if (visited.has(productId)) return;
        visited.add(productId);
        currentGroup.push(productId);
        
        (productConnections[productId] || []).forEach(connectedId => {
          dfs(connectedId, currentGroup);
        });
      };

      Object.keys(productConnections).forEach(productIdStr => {
        const productId = parseInt(productIdStr);
        if (!visited.has(productId)) {
          const group: number[] = [];
          dfs(productId, group);
          if (group.length > 1) {
            groups.push(group);
          }
        }
      });

      console.log(`🎯 Identified ${groups.length} groups from legacy data`);

      // Crear grupos en la nueva tabla
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        console.log(`🆕 Creating group ${i + 1}/${groups.length} with ${group.length} products`);
        
        const newGroup = await alternativeGroupService.create(
          `Grupo de alternativas ${i + 1}`,
          `Migrado automáticamente desde tabla legacy`
        );

        // Agregar todos los productos al grupo
        for (const productId of group) {
          await alternativeGroupService.addProduct(newGroup.id, productId);
        }
      }

      console.log(`✅ Migration completed: ${groups.length} groups created with ${legacyRelations.length} total relations`);

    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }
}; 