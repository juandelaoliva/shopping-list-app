-- ========================================
-- CONFIGURAR POLÍTICAS RLS BÁSICAS - VERSIÓN SEGURA
-- Elimina políticas existentes antes de recrearlas
-- ========================================

-- 🧹 LIMPIAR POLÍTICAS EXISTENTES PARA CATEGORÍAS
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;

-- 🔓 POLÍTICAS PARA CATEGORÍAS (públicamente leíbles, usuarios autenticados pueden modificar)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Política de lectura para todos los usuarios (anon + authenticated)
CREATE POLICY "Categories are publicly readable" 
ON categories FOR SELECT 
TO authenticated, anon
USING (true);

-- Política de escritura para usuarios autenticados
CREATE POLICY "Authenticated users can insert categories" 
ON categories FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories" 
ON categories FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories" 
ON categories FOR DELETE 
TO authenticated 
USING (true);

-- 🧹 LIMPIAR POLÍTICAS EXISTENTES PARA SUPERMERCADOS
DROP POLICY IF EXISTS "Supermarkets are publicly readable" ON supermarkets;
DROP POLICY IF EXISTS "Authenticated users can insert supermarkets" ON supermarkets;
DROP POLICY IF EXISTS "Authenticated users can update supermarkets" ON supermarkets;
DROP POLICY IF EXISTS "Authenticated users can delete supermarkets" ON supermarkets;

-- 🏪 POLÍTICAS PARA SUPERMERCADOS
ALTER TABLE supermarkets ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Supermarkets are publicly readable" 
ON supermarkets FOR SELECT 
TO authenticated, anon
USING (true);

-- Escritura para usuarios autenticados
CREATE POLICY "Authenticated users can insert supermarkets" 
ON supermarkets FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update supermarkets" 
ON supermarkets FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete supermarkets" 
ON supermarkets FOR DELETE 
TO authenticated 
USING (true);

-- 🧹 LIMPIAR POLÍTICAS EXISTENTES PARA PRODUCTOS
DROP POLICY IF EXISTS "Products are publicly readable" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

-- 🛍️ POLÍTICAS PARA PRODUCTOS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Products are publicly readable" 
ON products FOR SELECT 
TO authenticated, anon
USING (true);

-- Escritura para usuarios autenticados
CREATE POLICY "Authenticated users can insert products" 
ON products FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update products" 
ON products FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products" 
ON products FOR DELETE 
TO authenticated 
USING (true);

-- 🧹 LIMPIAR POLÍTICAS EXISTENTES PARA ALTERNATIVAS DE PRODUCTOS
DROP POLICY IF EXISTS "Product alternatives are publicly readable" ON product_alternatives;
DROP POLICY IF EXISTS "Authenticated users can insert product alternatives" ON product_alternatives;
DROP POLICY IF EXISTS "Authenticated users can update product alternatives" ON product_alternatives;
DROP POLICY IF EXISTS "Authenticated users can delete product alternatives" ON product_alternatives;

-- 🔄 POLÍTICAS PARA ALTERNATIVAS DE PRODUCTOS
ALTER TABLE product_alternatives ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Product alternatives are publicly readable" 
ON product_alternatives FOR SELECT 
TO authenticated, anon
USING (true);

-- Escritura para usuarios autenticados
CREATE POLICY "Authenticated users can insert product alternatives" 
ON product_alternatives FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update product alternatives" 
ON product_alternatives FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete product alternatives" 
ON product_alternatives FOR DELETE 
TO authenticated 
USING (true);

-- 🧹 LIMPIAR POLÍTICAS EXISTENTES PARA LISTAS DE COMPRAS
DROP POLICY IF EXISTS "Users can view own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can create own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can update own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can delete own shopping lists" ON shopping_lists;

-- 📝 POLÍTICAS PARA LISTAS DE COMPRAS (específicas por usuario)
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

-- Solo el usuario propietario puede ver sus listas
CREATE POLICY "Users can view own shopping lists" 
ON shopping_lists FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Solo el usuario puede crear listas para sí mismo
CREATE POLICY "Users can create own shopping lists" 
ON shopping_lists FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Solo el usuario puede actualizar sus propias listas
CREATE POLICY "Users can update own shopping lists" 
ON shopping_lists FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Solo el usuario puede eliminar sus propias listas
CREATE POLICY "Users can delete own shopping lists" 
ON shopping_lists FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 🧹 LIMPIAR POLÍTICAS EXISTENTES PARA ELEMENTOS DE LISTA
DROP POLICY IF EXISTS "Users can view own list items" ON list_items;
DROP POLICY IF EXISTS "Users can create items in own lists" ON list_items;
DROP POLICY IF EXISTS "Users can update own list items" ON list_items;
DROP POLICY IF EXISTS "Users can delete own list items" ON list_items;

-- 🛒 POLÍTICAS PARA ELEMENTOS DE LISTA (específicas por usuario a través de la lista)
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;

-- El usuario puede ver elementos de sus propias listas
CREATE POLICY "Users can view own list items" 
ON list_items FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shopping_lists 
    WHERE shopping_lists.id = list_items.shopping_list_id 
    AND shopping_lists.user_id = auth.uid()
  )
);

-- El usuario puede crear elementos en sus propias listas
CREATE POLICY "Users can create items in own lists" 
ON list_items FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shopping_lists 
    WHERE shopping_lists.id = list_items.shopping_list_id 
    AND shopping_lists.user_id = auth.uid()
  )
);

-- El usuario puede actualizar elementos de sus propias listas
CREATE POLICY "Users can update own list items" 
ON list_items FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM shopping_lists 
    WHERE shopping_lists.id = list_items.shopping_list_id 
    AND shopping_lists.user_id = auth.uid()
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shopping_lists 
    WHERE shopping_lists.id = list_items.shopping_list_id 
    AND shopping_lists.user_id = auth.uid()
  )
);

-- El usuario puede eliminar elementos de sus propias listas
CREATE POLICY "Users can delete own list items" 
ON list_items FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM shopping_lists 
    WHERE shopping_lists.id = list_items.shopping_list_id 
    AND shopping_lists.user_id = auth.uid()
  )
);

-- ========================================
-- CREAR DATOS DE PRUEBA BÁSICOS
-- ========================================

-- Insertar categorías de ejemplo (solo si no existen)
INSERT INTO categories (name, color, icon) VALUES 
('Lácteos', '#4CAF50', '🥛'),
('Carnes', '#F44336', '🥩'),
('Verduras', '#8BC34A', '🥬'),
('Frutas', '#FF9800', '🍎'),
('Cereales', '#795548', '🌾')
ON CONFLICT (name) DO NOTHING;

-- Insertar supermercados de ejemplo (solo si no existen)
INSERT INTO supermarkets (name, color) VALUES 
('Mercadona', '#00AA00'),
('Carrefour', '#0066CC'),
('DIA', '#FF6600'),
('Lidl', '#FFD700'),
('Alcampo', '#CC0000')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- VERIFICAR QUE TODO ESTÁ CONFIGURADO
-- ========================================

-- Mostrar políticas creadas
DO $$
BEGIN
    RAISE NOTICE '✅ Políticas RLS configuradas correctamente para todas las tablas';
    RAISE NOTICE '📋 Categorías: % políticas', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'categories');
    RAISE NOTICE '🏪 Supermercados: % políticas', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'supermarkets');
    RAISE NOTICE '🛍️ Productos: % políticas', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'products');
    RAISE NOTICE '🔄 Alternativas: % políticas', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'product_alternatives');
    RAISE NOTICE '📝 Listas: % políticas', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'shopping_lists');
    RAISE NOTICE '🛒 Elementos: % políticas', (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'list_items');
END $$; 