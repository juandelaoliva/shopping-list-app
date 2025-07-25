-- Crear tabla de categorías
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#6B7280',
    icon VARCHAR(50) DEFAULT '🛒',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    logo_url TEXT,
    color VARCHAR(7) DEFAULT '#6366F1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar supermercados de ejemplo
INSERT INTO supermarkets (name, logo_url, color) VALUES
('Mercadona', 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Mercadona_logo.svg/1200px-Mercadona_logo.svg.png', '#FF6B35'),
('Carrefour', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Carrefour_logo.svg/1200px-Carrefour_logo.svg.png', '#0066CC'),
('Lidl', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Lidl_logo.svg/1200px-Lidl_logo.svg.png', '#FFD100'),
('Dia', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Dia_logo.svg/1200px-Dia_logo.svg.png', '#E30613'),
('Alcampo', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Alcampo.svg/1200px-Alcampo.svg.png', '#00A651');

-- Asegurar que todos los supermercados tengan un color por defecto
UPDATE supermarkets SET color = '#6366F1' WHERE color IS NULL OR color = '';

-- Crear tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de productos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, -- La categoría vuelve aquí y es opcional
    supermarket_id INTEGER REFERENCES supermarkets(id) ON DELETE SET NULL, -- Ahora es opcional
    estimated_price DECIMAL(10,2),
    unit VARCHAR(20) DEFAULT 'unidad',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de alternativas de productos (relación muchos a muchos)
CREATE TABLE product_alternatives (
    product_a_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    product_b_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (product_a_id, product_b_id),
    CONSTRAINT check_different_products CHECK (product_a_id <> product_b_id)
);

-- Crear tabla de listas de compra
CREATE TABLE shopping_lists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    total_budget DECIMAL(10,2),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Crear tabla de elementos de la lista
CREATE TABLE list_items (
    id SERIAL PRIMARY KEY,
    shopping_list_id INTEGER REFERENCES shopping_lists(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    custom_product_name VARCHAR(200),
    quantity INTEGER DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'unidad',
    estimated_price DECIMAL(10,2),
    actual_price DECIMAL(10,2),
    is_purchased BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    purchased_at TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX idx_list_items_shopping_list_id ON list_items(shopping_list_id);
CREATE INDEX idx_list_items_product_id ON list_items(product_id);
CREATE INDEX idx_shopping_lists_user_id ON shopping_lists(user_id); -- Índice para la nueva columna
CREATE INDEX idx_users_username ON users(username); -- Índice para username 
CREATE INDEX idx_products_supermarket_id ON products(supermarket_id);
CREATE INDEX idx_products_category_id ON products(category_id); -- Se re-añade este índice
CREATE INDEX idx_shopping_lists_created_at ON shopping_lists(created_at);
CREATE INDEX idx_list_items_is_purchased ON list_items(is_purchased); 