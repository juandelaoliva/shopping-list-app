const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// JWT Secret (Debería estar en variables de entorno en producción)
// NOTA PARA PRODUCCIÓN: Utilizar una clave secreta fuerte y gestionarla a través de variables de entorno, no hardcodeada.
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-that-should-be-in-env-file';

// Configurar trust proxy para Docker
app.set('trust proxy', 1);

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware de seguridad
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting ajustado para desarrollo
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // límite más alto para desarrollo
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Middleware para agregar pool a req
app.use((req, res, next) => {
  req.db = pool;
  next();
});

// Función SIMPLIFICADA para auto-completar listas
const checkAndUpdateListCompletion = async (listId) => {
  console.log(`🔄 INICIANDO auto-completion para lista ${listId}`);
  
  try {
    // 1. Obtener conteo de items
    const statsQuery = `
      SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN is_purchased = true THEN 1 END) as purchased_items
      FROM list_items 
      WHERE shopping_list_id = $1
    `;
    
    const stats = await pool.query(statsQuery, [listId]);
    const { total_items, purchased_items } = stats.rows[0];
    
    console.log(`📊 Lista ${listId}: ${purchased_items}/${total_items} items comprados`);
    
    // 2. Lógica simple: Lista completa = tiene items Y todos comprados
    const shouldBeCompleted = parseInt(total_items) > 0 && parseInt(total_items) === parseInt(purchased_items);
    
    console.log(`✅ ¿Debe completarse? ${shouldBeCompleted} (items: ${total_items}, comprados: ${purchased_items})`);
    
    // 3. Actualizar estado si es necesario
    if (shouldBeCompleted) {
      const updateResult = await pool.query(
        'UPDATE shopping_lists SET is_completed = true, completed_at = CURRENT_TIMESTAMP WHERE id = $1 AND is_completed = false',
        [listId]
      );
      
      if (updateResult.rowCount > 0) {
        console.log(`🎉 Lista ${listId} AUTO-COMPLETADA exitosamente`);
      } else {
        console.log(`ℹ️  Lista ${listId} ya estaba completada`);
      }
    } else {
      // Reactivar si hay items sin comprar
      const updateResult = await pool.query(
        'UPDATE shopping_lists SET is_completed = false, completed_at = NULL WHERE id = $1 AND is_completed = true',
        [listId]
      );
      
      if (updateResult.rowCount > 0) {
        console.log(`🔄 Lista ${listId} AUTO-REACTIVADA (items sin comprar)`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Error en auto-completion lista ${listId}:`, error);
  }
};

// RUTAS DE AUTENTICACIÓN

// Registrar un nuevo usuario
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, passwordConfirmation } = req.body;

    if (!username || !email || !password || !passwordConfirmation) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    if (password !== passwordConfirmation) {
      return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    // Verificar si el email o username ya existen
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userExists.rows.length > 0) {
      const existing = userExists.rows[0];
      if (existing.email === email) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }
      if (existing.username === username) {
        return res.status(409).json({ error: 'El nombre de usuario ya está en uso' });
      }
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Guardar usuario en la base de datos
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, password_hash]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Iniciar sesión
app.post('/api/auth/login', async (req, res) => {
  try {
    const { loginIdentifier, password } = req.body;
    console.log(`[AUTH DEBUG] 🕵️  Intento de login para: ${loginIdentifier}`);

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: 'El identificador de login y la contraseña son requeridos' });
    }

    // Buscar al usuario por email o username
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $1', [loginIdentifier]);
    if (userResult.rows.length === 0) {
      console.log(`[AUTH DEBUG] ❌ Usuario no encontrado: ${loginIdentifier}`);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = userResult.rows[0];
    console.log(`[AUTH DEBUG] ✅ Usuario encontrado: ${JSON.stringify({id: user.id, username: user.username, email: user.email})}`);

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`[AUTH DEBUG] 🔑 ¿La contraseña coincide?: ${isMatch}`);

    if (!isMatch) {
      console.log(`[AUTH DEBUG] ❌ Contraseña incorrecta para: ${loginIdentifier}`);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log(`[AUTH DEBUG] 🎉 Login exitoso para: ${loginIdentifier}`);
    // Crear el token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '1d' } // El token expira en 1 día
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// MIDDLEWARE DE AUTENTICACIÓN
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

  if (token == null) {
    return res.sendStatus(401); // No hay token
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Token no válido o expirado
    }
    req.user = user; // Adjuntar datos del usuario a la petición
    next();
  });
};


// ENDPOINT DE PRUEBA PARA LOGS
app.get('/api/test-logs', (req, res) => {
  console.log('🔥🔥🔥 ENDPOINT DE PRUEBA EJECUTADO 🔥🔥🔥');
  res.json({ message: 'Test logs working', timestamp: new Date() });
});

// Rutas de Supermercados (NUEVO)
app.get('/api/supermarkets', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM supermarkets ORDER BY name');
    
    // Asegurar que todos los supermercados tengan un color por defecto
    const supermarketsWithColor = result.rows.map(supermarket => ({
      ...supermarket,
      color: supermarket.color || '#6366F1'
    }));
    
    res.json(supermarketsWithColor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/supermarkets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM supermarkets WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supermercado no encontrado' });
    }
    
    // Asegurar que el supermercado tenga un color por defecto
    const supermarket = {
      ...result.rows[0],
      color: result.rows[0].color || '#6366F1'
    };
    
    res.json(supermarket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/supermarkets', authenticateToken, async (req, res) => {
  try {
    const { name, logo_url, color } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const result = await pool.query(
      'INSERT INTO supermarkets (name, logo_url, color) VALUES ($1, $2, $3) RETURNING *',
      [name, logo_url, color || '#6366F1']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    // Manejar error de unicidad
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un supermercado con ese nombre' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/supermarkets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo_url, color } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const result = await pool.query(
      'UPDATE supermarkets SET name = $1, logo_url = $2, color = $3 WHERE id = $4 RETURNING *',
      [name, logo_url, color || '#6366F1', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supermercado no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un supermercado con ese nombre' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/supermarkets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM supermarkets WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Supermercado no encontrado' });
    }
    res.status(204).send(); // No Content
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Rutas de Categorías
app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTAS DE PRODUCTOS
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const { category_id, search } = req.query;
    
    // 1. Obtener todos los productos filtrados
    let productsQuery = `
      SELECT 
        p.id, p.name, p.estimated_price, p.unit, p.created_at,
        s.id as supermarket_id, s.name as supermarket_name, s.color as supermarket_color,
        c.id as category_id, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM products p
      LEFT JOIN supermarkets s ON p.supermarket_id = s.id
      LEFT JOIN categories c ON p.category_id = c.id
    `;
    const params = [];
    
    let whereClauses = [];
    if (category_id) {
      params.push(category_id);
      whereClauses.push(`c.id = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`p.name ILIKE $${params.length}`);
    }

    if (whereClauses.length > 0) {
      productsQuery += ' WHERE ' + whereClauses.join(' AND ');
    }
    
    productsQuery += ' ORDER BY p.name';

    const productsResult = await pool.query(productsQuery, params);
    const products = productsResult.rows;

    // 2. Obtener todas las relaciones de alternativas
    const alternativesResult = await pool.query('SELECT product_a_id, product_b_id FROM product_alternatives');
    const alternativesMap = new Map();
    alternativesResult.rows.forEach(({ product_a_id, product_b_id }) => {
      if (!alternativesMap.has(product_a_id)) alternativesMap.set(product_a_id, []);
      if (!alternativesMap.has(product_b_id)) alternativesMap.set(product_b_id, []);
      alternativesMap.get(product_a_id).push(product_b_id);
      alternativesMap.get(product_b_id).push(product_a_id);
    });

    res.json({
      products: products,
      alternatives: Object.fromEntries(alternativesMap) // Convertir mapa a objeto para JSON
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        p.*, 
        c.name as category_name, c.color as category_color, c.icon as category_icon,
        s.name as supermarket_name, s.color as supermarket_color
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN supermarkets s ON p.supermarket_id = s.id
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Asegurar que el supermercado tenga un color por defecto si está presente
    const product = {
      ...result.rows[0],
      supermarket_color: result.rows[0].supermarket_color || (result.rows[0].supermarket_name ? '#6366F1' : null)
    };
    
    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const { name, supermarket_id, category_id, estimated_price, unit } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const result = await pool.query(
      `INSERT INTO products (name, supermarket_id, category_id, estimated_price, unit) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, supermarket_id || null, category_id || null, estimated_price, unit]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, supermarket_id, category_id, estimated_price, unit } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    const result = await pool.query(
      `UPDATE products SET name = $1, supermarket_id = $2, category_id = $3, estimated_price = $4, unit = $5
       WHERE id = $6 RETURNING *`,
      [name, supermarket_id || null, category_id || null, estimated_price, unit, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Eliminar primero las relaciones de alternativas
    await pool.query('DELETE FROM product_alternatives WHERE product_a_id = $1 OR product_b_id = $1', [id]);
    
    // Actualizar list_items para remover la referencia al producto (poner product_id en NULL)
    // Los items de lista mantendrán el nombre en custom_product_name
    await pool.query('UPDATE list_items SET product_id = NULL WHERE product_id = $1', [id]);
    
    // Luego eliminar el producto
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.status(204).send(); // No Content
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Nuevas rutas para gestionar alternativas
app.get('/api/products/:id/alternatives', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT p.*, s.name as supermarket_name, s.color as supermarket_color
      FROM products p
      LEFT JOIN supermarkets s ON p.supermarket_id = s.id
      WHERE p.id IN (
        SELECT product_b_id FROM product_alternatives WHERE product_a_id = $1
        UNION
        SELECT product_a_id FROM product_alternatives WHERE product_b_id = $1
      )
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/products/:id/alternatives', authenticateToken, async (req, res) => {
  try {
    const { id: productAId } = req.params;
    const { alternative_id: productBId } = req.body;
    
    // Para evitar duplicados y conflictos, insertamos la pareja siempre en el mismo orden (ID menor, ID mayor)
    const [a, b] = [Math.min(productAId, productBId), Math.max(productAId, productBId)];

    if (a === b) {
      return res.status(400).json({ error: 'Un producto no puede ser alternativa de sí mismo' });
    }

    const result = await pool.query(
      'INSERT INTO product_alternatives (product_a_id, product_b_id) VALUES ($1, $2) RETURNING *',
      [a, b]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // Error de clave primaria duplicada
      return res.status(409).json({ error: 'Estos productos ya están vinculados como alternativas' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/products/:id/alternatives/:alternative_id', authenticateToken, async (req, res) => {
  try {
    const { id: productAId, alternative_id: productBId } = req.params;
    const [a, b] = [Math.min(productAId, productBId), Math.max(productAId, productBId)];

    await pool.query(
      'DELETE FROM product_alternatives WHERE product_a_id = $1 AND product_b_id = $2',
      [a, b]
    );
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Rutas de Listas de Compra
app.get('/api/shopping-lists', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query(`
      SELECT sl.*, 
             COUNT(li.id) as total_items,
             COUNT(CASE WHEN li.is_purchased = true THEN 1 END) as purchased_items,
             COALESCE(SUM(li.estimated_price * li.quantity), 0) as estimated_total
      FROM shopping_lists sl
      LEFT JOIN list_items li ON sl.id = li.shopping_list_id
      WHERE sl.user_id = $1
      GROUP BY sl.id
      ORDER BY sl.created_at DESC
    `, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener listas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/shopping-lists/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Obtener la lista, asegurándose que pertenece al usuario
    const listResult = await pool.query('SELECT * FROM shopping_lists WHERE id = $1 AND user_id = $2', [id, userId]);
    
    if (listResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lista no encontrada o no tienes permiso' });
    }

    // Obtener los elementos de la lista
    const itemsResult = await pool.query(`
      SELECT li.*, 
             COALESCE(p.name, li.custom_product_name) as product_name,
             s.name as supermarket_name, s.color as supermarket_color,
             c.name as category_name,
             c.color as category_color,
             c.icon as category_icon
      FROM list_items li
      LEFT JOIN products p ON li.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN supermarkets s ON p.supermarket_id = s.id
      WHERE li.shopping_list_id = $1
      ORDER BY li.is_purchased, c.name, li.created_at
    `, [id]);

    res.json({
      ...listResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Error al obtener lista:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.post('/api/shopping-lists', authenticateToken, async (req, res) => {
  try {
    const { name, description, total_budget } = req.body;
    const userId = req.user.userId;
    
    if (!name) {
      return res.status(400).json({ error: 'El nombre de la lista es requerido' });
    }

    const result = await pool.query(
      'INSERT INTO shopping_lists (name, description, total_budget, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, total_budget, userId]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear lista:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/shopping-lists/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { name, description, total_budget, is_completed } = req.body;
    
    const result = await pool.query(
      `UPDATE shopping_lists 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           total_budget = COALESCE($3, total_budget),
           is_completed = COALESCE($4, is_completed),
           completed_at = CASE WHEN $4 = true THEN CURRENT_TIMESTAMP ELSE completed_at END
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [name, description, total_budget, is_completed, id, userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lista no encontrada o no tienes permiso' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar lista:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/shopping-lists/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const result = await pool.query('DELETE FROM shopping_lists WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lista no encontrada o no tienes permiso' });
    }
    
    res.json({ message: 'Lista eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar lista:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// RUTAS DE ELEMENTOS DE LISTA
app.post('/api/shopping-lists/:listId/items', authenticateToken, async (req, res) => {
  try {
    // Primero, verificar que la lista pertenece al usuario
    const { listId } = req.params;
    const userId = req.user.userId;
    const listCheck = await pool.query('SELECT id FROM shopping_lists WHERE id = $1 AND user_id = $2', [listId, userId]);
    if (listCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Lista no encontrada o no tienes permiso para añadir items' });
    }

    const { product_id, custom_product_name, quantity, unit, estimated_price, notes } = req.body;
    
    if (!product_id && !custom_product_name) {
      return res.status(400).json({ error: 'Se requiere un producto o nombre personalizado' });
    }

    let finalEstimatedPrice = estimated_price;
    let finalUnit = unit || 'unidad';

    // Si se está añadiendo un producto del catálogo y no se especifica precio, usar el del producto
    console.log('DEBUG: product_id:', product_id, 'estimated_price:', estimated_price, 'type:', typeof estimated_price);
    if (product_id && (estimated_price === null || estimated_price === undefined)) {
      console.log('DEBUG: Buscando precio del producto...');
      const productResult = await pool.query('SELECT estimated_price, unit FROM products WHERE id = $1', [product_id]);
      console.log('DEBUG: Product found:', productResult.rows);
      if (productResult.rows.length > 0) {
        finalEstimatedPrice = productResult.rows[0].estimated_price;
        finalUnit = unit || productResult.rows[0].unit || 'unidad';
        console.log('DEBUG: Set finalEstimatedPrice to:', finalEstimatedPrice);
      }
    }

    const result = await pool.query(
      `INSERT INTO list_items 
       (shopping_list_id, product_id, custom_product_name, quantity, unit, estimated_price, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [listId, product_id, custom_product_name, quantity || 1, finalUnit, finalEstimatedPrice, notes]
    );
    
    // Verificar estado de completado después de añadir item
    await checkAndUpdateListCompletion(listId);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al agregar elemento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar elemento de lista
app.put('/api/shopping-lists/:listId/items/:itemId', authenticateToken, async (req, res) => {
  try {
    // Verificar que la lista pertenece al usuario antes de actualizar el item
    const { listId, itemId } = req.params;
    const userId = req.user.userId;
    const listCheck = await pool.query('SELECT id FROM shopping_lists WHERE id = $1 AND user_id = $2', [listId, userId]);
    if (listCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Lista no encontrada o no tienes permiso para modificar items' });
    }

    const { quantity, unit, estimated_price, actual_price, is_purchased, notes } = req.body;
    
    const result = await pool.query(
      `UPDATE list_items 
       SET quantity = COALESCE($1, quantity),
           unit = COALESCE($2, unit),
           estimated_price = COALESCE($3, estimated_price),
           actual_price = COALESCE($4, actual_price),
           is_purchased = COALESCE($5, is_purchased),
           notes = COALESCE($6, notes),
           purchased_at = CASE WHEN $5 = true THEN CURRENT_TIMESTAMP ELSE purchased_at END
       WHERE id = $7 AND shopping_list_id = $8
       RETURNING *`,
      [quantity, unit, estimated_price, actual_price, is_purchased, notes, itemId, listId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }

    // AUTO-COMPLETION: Verificar y actualizar estado de lista
    try {
      await checkAndUpdateListCompletion(listId);
      result.rows[0]._autoCompletionStatus = 'success';
    } catch (autoError) {
      result.rows[0]._autoCompletionStatus = 'error: ' + autoError.message;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar elemento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.delete('/api/shopping-lists/:listId/items/:itemId', authenticateToken, async (req, res) => {
  try {
    // Verificar que la lista pertenece al usuario antes de eliminar el item
    const { listId, itemId } = req.params;
    const userId = req.user.userId;
    const listCheck = await pool.query('SELECT id FROM shopping_lists WHERE id = $1 AND user_id = $2', [listId, userId]);
    if (listCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Lista no encontrada o no tienes permiso para eliminar items' });
    }
    
    const result = await pool.query(
      'DELETE FROM list_items WHERE id = $1 AND shopping_list_id = $2 RETURNING *',
      [itemId, listId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Elemento no encontrado' });
    }
    
    // Verificar estado de completado después de eliminar item
    await checkAndUpdateListCompletion(listId);
    
    res.json({ message: 'Elemento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar elemento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// Manejo de errores 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo global de errores
app.use((error, req, res, next) => {
  console.error('Error no controlado:', error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Función para sembrar la base de datos con datos de demostración
const seedDatabase = async () => {
  try {
    // Comprobar si el usuario demo ya existe
    const userCheck = await pool.query("SELECT * FROM users WHERE email = 'demo@example.com'");

    if (userCheck.rows.length === 0) {
      console.log('🌱 Sembrando datos de demostración...');
      
      // 1. Crear usuario demo
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);
      const userResult = await pool.query(
        "INSERT INTO users (username, email, password_hash) VALUES ('demo', 'demo@example.com', $1) RETURNING id",
        [passwordHash]
      );
      const userId = userResult.rows[0].id;

      // 2. Crear una lista de compra para el usuario demo
      const listResult = await pool.query(
        "INSERT INTO shopping_lists (name, description, total_budget, user_id) VALUES ('Compra Semanal', 'Lista de compras para la semana', 100.00, $1) RETURNING id",
        [userId]
      );
      const listId = listResult.rows[0].id;

      // 3. Crear productos de ejemplo si no existen
      const products = [
        { name: 'Manzanas', category_id: 1, price: 2.50, unit: 'kg' },
        { name: 'Leche', category_id: 3, price: 1.20, unit: 'litro' },
        { name: 'Pan de molde', category_id: 4, price: 1.80, unit: 'unidad' },
        { name: 'Pollo entero', category_id: 2, price: 8.50, unit: 'kg' }
      ];
      const productIds = [];

      for (const p of products) {
        let product = await pool.query('SELECT id FROM products WHERE name = $1', [p.name]);
        if (product.rows.length === 0) {
          product = await pool.query(
            'INSERT INTO products (name, category_id, estimated_price, unit) VALUES ($1, $2, $3, $4) RETURNING id',
            [p.name, p.category_id, p.price, p.unit]
          );
        }
        productIds.push(product.rows[0].id);
      }

      // 4. Añadir items a la lista
      await pool.query(
        "INSERT INTO list_items (shopping_list_id, product_id, quantity) VALUES ($1, $2, 2), ($1, $3, 1), ($1, $4, 1)",
        [listId, productIds[0], productIds[1], productIds[2]]
      );

      console.log('✅ Datos de demostración sembrados exitosamente.');
    } else {
      console.log('ℹ️  La base de datos ya contiene datos de demostración, no se necesita sembrar.');
    }
  } catch (error) {
    console.error('❌ Error al sembrar la base de datos:', error);
  }
};


// Iniciar servidor y sembrar base de datos
const startServer = async () => {
  await seedDatabase();
  app.listen(port, () => {
    console.log(`🚀 Servidor backend ejecutándose en puerto ${port}`);
  });
};

startServer();

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🔄 Cerrando servidor...');
  pool.end();
});

process.on('SIGINT', () => {
  console.log('🔄 Cerrando servidor...');
  pool.end();
  process.exit(0);
});