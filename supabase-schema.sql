-- ========================================
-- SHOPPING LIST PRO - SUPABASE SCHEMA
-- ========================================

-- Crear tabla de categorías
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#6B7280',
    icon VARCHAR(50) DEFAULT '🛒',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar categorías predeterminadas
INSERT INTO categories (name, color, icon) VALUES
('Frutas y Verduras', '#10B981', '🥬'),
('Carnes y Pescados', '#EF4444', '🥩'),
('Lácteos', '#3B82F6', '🥛'),
('Panadería', '#F59E0B', '🍞'),
('Limpieza', '#8B5CF6', '🧽'),
('Bebidas', '#06B6D4', '🥤'),
('Snacks', '#F97316', '🍿'),
('Congelados', '#6366F1', '🧊'),
('Otros', '#6B7280', '📦');

-- Crear tabla de supermercados
CREATE TABLE supermarkets (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url TEXT,
    color VARCHAR(7) DEFAULT '#6366F1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar supermercados de ejemplo
INSERT INTO supermarkets (name, logo_url, color) VALUES
('Mercadona', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Mercadona_logo.svg/1200px-Mercadona_logo.svg.png', '#FF6B35'),
('Carrefour', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Carrefour_logo.svg/1200px-Carrefour_logo.svg.png', '#0066CC'),
('Lidl', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Lidl_logo.svg/1200px-Lidl_logo.svg.png', '#FFD100'),
('Dia', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Dia_logo.svg/1200px-Dia_logo.svg.png', '#E30613'),
('Alcampo', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Alcampo.svg/1200px-Alcampo.svg.png', '#00A651');

-- Crear tabla de productos
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    supermarket_id BIGINT REFERENCES supermarkets(id) ON DELETE SET NULL,
    estimated_price DECIMAL(10,2),
    unit VARCHAR(20) DEFAULT 'unidad',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de alternativas de productos
CREATE TABLE product_alternatives (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    alternative_product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, alternative_product_id)
);

-- Crear tabla de listas de compra (usa auth.users de Supabase)
CREATE TABLE shopping_lists (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    total_budget DECIMAL(10,2),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Crear tabla de elementos de la lista
CREATE TABLE list_items (
    id BIGSERIAL PRIMARY KEY,
    shopping_list_id BIGINT REFERENCES shopping_lists(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
    custom_product_name VARCHAR(200),
    quantity INTEGER DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'unidad',
    estimated_price DECIMAL(10,2),
    actual_price DECIMAL(10,2),
    is_purchased BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    purchased_at TIMESTAMP WITH TIME ZONE
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_list_items_shopping_list_id ON list_items(shopping_list_id);
CREATE INDEX idx_list_items_product_id ON list_items(product_id);
CREATE INDEX idx_shopping_lists_user_id ON shopping_lists(user_id);
CREATE INDEX idx_products_supermarket_id ON products(supermarket_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_shopping_lists_created_at ON shopping_lists(created_at);
CREATE INDEX idx_list_items_is_purchased ON list_items(is_purchased);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS en las tablas que necesitan protección por usuario
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_items ENABLE ROW LEVEL SECURITY;

-- Políticas para shopping_lists (solo el dueño puede ver/editar sus listas)
CREATE POLICY "Users can view own shopping lists" 
ON shopping_lists FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own shopping lists" 
ON shopping_lists FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own shopping lists" 
ON shopping_lists FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own shopping lists" 
ON shopping_lists FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para list_items (solo el dueño de la lista puede ver/editar items)
CREATE POLICY "Users can view own list items" 
ON list_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM shopping_lists 
    WHERE shopping_lists.id = list_items.shopping_list_id 
    AND shopping_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own list items" 
ON list_items FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shopping_lists 
    WHERE shopping_lists.id = list_items.shopping_list_id 
    AND shopping_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own list items" 
ON list_items FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM shopping_lists 
    WHERE shopping_lists.id = list_items.shopping_list_id 
    AND shopping_lists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own list items" 
ON list_items FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM shopping_lists 
    WHERE shopping_lists.id = list_items.shopping_list_id 
    AND shopping_lists.user_id = auth.uid()
  )
);

-- Las tablas de categorías, productos y supermercados son públicas (solo lectura para usuarios normales)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE supermarkets ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_alternatives ENABLE ROW LEVEL SECURITY;

-- Políticas para datos públicos (todos pueden leer)
CREATE POLICY "Categories are publicly readable" 
ON categories FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Products are publicly readable" 
ON products FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Supermarkets are publicly readable" 
ON supermarkets FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Product alternatives are publicly readable" 
ON product_alternatives FOR SELECT 
TO authenticated 
USING (true);

-- ========================================
-- FUNCIONES HELPER
-- ========================================

-- Función para obtener productos con información completa
CREATE OR REPLACE FUNCTION get_products_with_details()
RETURNS TABLE (
    id BIGINT,
    name VARCHAR(200),
    category_id BIGINT,
    category_name VARCHAR(100),
    category_color VARCHAR(7),
    category_icon VARCHAR(50),
    supermarket_id BIGINT,
    supermarket_name VARCHAR(100),
    supermarket_color VARCHAR(7),
    estimated_price DECIMAL(10,2),
    unit VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        p.id,
        p.name,
        p.category_id,
        c.name as category_name,
        c.color as category_color,
        c.icon as category_icon,
        p.supermarket_id,
        s.name as supermarket_name,
        s.color as supermarket_color,
        p.estimated_price,
        p.unit,
        p.created_at
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN supermarkets s ON p.supermarket_id = s.id
    ORDER BY p.created_at DESC;
$$;

-- ========================================
-- DATOS DE EJEMPLO
-- ========================================

-- Insertar algunos productos de ejemplo
INSERT INTO products (name, category_id, supermarket_id, estimated_price, unit) VALUES
('Manzanas Golden', 1, 1, 2.50, 'kg'),
('Pollo Entero', 2, 1, 4.99, 'kg'),
('Leche Entera', 3, 2, 1.20, 'litro'),
('Pan Integral', 4, 1, 1.80, 'unidad'),
('Detergente Líquido', 5, 3, 3.99, 'botella'),
('Coca Cola', 6, 2, 2.10, 'botella 2L'),
('Patatas Fritas', 7, 4, 1.50, 'bolsa'),
('Pizza Congelada', 8, 5, 3.20, 'unidad');

-- Insertar algunas alternativas de productos
INSERT INTO product_alternatives (product_id, alternative_product_id) VALUES
(1, 8), -- Manzanas ↔ Pizza (ejemplo)
(2, 3), -- Pollo ↔ Leche (ejemplo)
(4, 5), -- Pan ↔ Detergente (ejemplo)
(1, 2), -- Manzanas ↔ Pollo (más alternativas para mejor testing)
(3, 6), -- Leche ↔ Coca Cola (productos similares)
(7, 8); -- Patatas ↔ Pizza (snacks/comida rápida)

-- ========================================
-- NUEVAS TABLAS PARA GRUPOS DE ALTERNATIVAS
-- ========================================

-- Tabla de grupos de alternativas
CREATE TABLE IF NOT EXISTS alternative_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de relación productos -> grupos
CREATE TABLE IF NOT EXISTS product_alternative_groups (
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  group_id INTEGER REFERENCES alternative_groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (product_id, group_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_product_alternative_groups_product_id ON product_alternative_groups(product_id);
CREATE INDEX IF NOT EXISTS idx_product_alternative_groups_group_id ON product_alternative_groups(group_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en alternative_groups
DROP TRIGGER IF EXISTS update_alternative_groups_updated_at ON alternative_groups;
CREATE TRIGGER update_alternative_groups_updated_at
    BEFORE UPDATE ON alternative_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- CONFIGURACIÓN FINAL
-- ========================================

-- Crear usuario demo para testing (se hará desde la app)
-- El usuario demo se creará desde el frontend con Supabase Auth 