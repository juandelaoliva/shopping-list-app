# 🛒 Shopping List Pro

## 📝 Table of Contents

- [🇪🇸 Español](#-español)
  - [Visión General (Alto Nivel)](#visión-general-alto-nivel)
  - [Detalles Técnicos (Bajo Nivel)](#detalles-técnicos-bajo-nivel)
- [🇬🇧 English](#-english)
  - [High-Level Overview](#high-level-overview)
  - [Low-Level Technical Details](#low-level-technical-details)

---

## 🇪🇸 Español

### Visión General (Alto Nivel)

**Shopping List Pro** es una aplicación web moderna y completa diseñada para simplificar la gestión de listas de compras. Construida con una arquitectura robusta de frontend y backend, ofrece una experiencia de usuario fluida e intuitiva con funcionalidades avanzadas de gestión de productos y supermercados.

#### ✨ Características Principales

- **Gestión de Listas Múltiples**: Crea, edita y elimina múltiples listas de compras.
- **Autenticación de Usuarios**: Sistema de registro e inicio de sesión seguro. Cada usuario solo tiene acceso a sus propias listas.
- **Seguimiento del Presupuesto**: Asigna un presupuesto a tus listas y visualiza el gasto estimado en tiempo real.
- **Catálogo de Productos Avanzado**: Administra un catálogo completo de productos con precios, categorías y supermercados.
- **Gestión de Supermercados**: Sistema completo de supermercados con colores personalizables y tags visuales.
- **Página de Detalle de Producto**: Vista completa de cada producto con información detallada y opciones de gestión.
- **Sistema de Productos Alternativos**: Gestiona productos similares y encuentra alternativas fácilmente.
- **Agregar a Lista Inteligente**: Sistema intuitivo para agregar productos a listas existentes o crear nuevas.
- **Categorías Personalizables**: Organiza los productos con categorías codificadas por colores e iconos.
- **Estado de la Compra**: Marca los artículos como comprados y observa cómo la lista se completa automáticamente.
- **Diseño Mobile-First**: Una interfaz de usuario pulida y profesional optimizada para dispositivos móviles.

#### 🏗️ Arquitectura

La aplicación sigue una arquitectura cliente-servidor desacoplada:

- **Backend**: Una API RESTful construida con **Node.js** y **Express**. Se encarga de toda la lógica de negocio, la interacción con la base de datos y la seguridad, utilizando **JWT (JSON Web Tokens)** para la gestión de sesiones y **bcrypt** para el almacenamiento seguro de contraseñas.
- **Frontend**: Una Aplicación de Página Única (SPA) construida con **React** y **TypeScript**. Proporciona una interfaz de usuario interactiva y dinámica con navegación fluida.
- **Base de Datos**: **PostgreSQL** se utiliza para la persistencia de datos, almacenando listas, productos, categorías, supermercados y artículos con integridad referencial completa.
- **Contenerización**: **Docker** y **Docker Compose** se utilizan para encapsular y orquestar los servicios de frontend, backend y base de datos, con configuraciones separadas para desarrollo y producción.

#### 🆕 Nuevas Funcionalidades Destacadas

##### 📱 **Página de Detalle de Producto**
- **Vista completa del producto** con toda la información relevante
- **Información detallada**: categoría (con color), supermercado (con color), precio estimado, unidad, fecha de creación
- **Productos alternativos**: Lista de productos similares con navegación directa
- **Acciones disponibles**: Editar, eliminar, agregar a lista
- **Navegación intuitiva**: Accesible desde el catálogo de productos

##### 🛒 **Sistema "Agregar a Lista" Avanzado**
- **Modal inteligente** que se adapta al contexto:
  - **Con listas existentes**: Muestra todas las listas disponibles (completas o activas)
  - **Sin listas**: Mensaje explicativo con navegación directa para crear una nueva
- **Información completa de listas**: nombre, descripción, número de productos, estado
- **Navegación automática**: Al crear nueva lista, abre automáticamente el modal de creación
- **Agregado inteligente**: Cantidad por defecto y datos del producto pre-cargados

##### ✏️ **Gestión Completa de Productos**
- **Edición in-situ**: Modal de edición completo desde la página de detalle
- **Gestión de alternativas**: Agregar y quitar productos alternativos fácilmente
- **Eliminación segura**: Confirmación y manejo de integridad referencial
- **Validaciones robustas**: Manejo de errores y retroalimentación clara

##### 🏪 **Sistema de Supermercados Mejorado**
- **Colores personalizables**: Cada supermercado puede tener su color distintivo
- **Tags consistentes**: Colores aplicados automáticamente en toda la aplicación
- **Integración visual**: Los colores se muestran en productos, listas y alternativas
- **Manejo robusto**: Sistema de colores por defecto para evitar errores

---

### Detalles Técnicos (Bajo Nivel)

#### 🛠️ Stack Tecnológico

- **Backend**: Node.js, Express, PostgreSQL (con `pg`), Helmet (seguridad), CORS, Express Rate Limit, bcrypt, jsonwebtoken.
- **Frontend**: React, TypeScript, Tailwind CSS, Lucide React (iconos).
- **Entorno**: Docker, Docker Compose (configuraciones para desarrollo y producción).

#### 🚀 Cómo Empezar

##### 🐳 **Desarrollo con Docker (Recomendado)**

1. **Clonar el repositorio**:
```bash
git clone <URL_DEL_REPOSITORIO>
cd showcaseAntonio
```

2. **Configuración de desarrollo**:
```bash
# Usar el entorno de desarrollo optimizado
docker-compose -f docker-compose.dev.yml up --build
```

3. **Configuración de producción**:
```bash
# Para producción usar el compose principal
docker-compose up --build
```

4. **Acceder a la aplicación**:
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5001`

##### 💻 **Desarrollo Local (Alternativa)**

1. **Configurar variables de entorno**:
   El backend requiere una URL de conexión a la base de datos. Por defecto, `docker-compose.yml` la configura.

2. **Instalar dependencias**:
   - **Backend**: `cd backend && npm install`
   - **Frontend**: `cd frontend && npm install`

3. **Iniciar servicios manualmente**:
   ```bash
   # Terminal 1 - Base de datos
   docker run -p 5432:5432 -e POSTGRES_DB=shopping_app -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password postgres:13
   
   # Terminal 2 - Backend
   cd backend && npm start
   
   # Terminal 3 - Frontend  
   cd frontend && npm start
   ```

#### 👤 **Usuario de Demostración**

La aplicación se inicializa con un usuario de prueba para exploración inmediata:
- **Email**: `demo@example.com`
- **Contraseña**: `password123`

#### 🔐 Seguridad: Almacenamiento de Contraseñas

La seguridad es una prioridad. En esta aplicación, **las contraseñas nunca se guardan en texto plano**. Utilizamos un método robusto y estándar de la industria llamado **hashing de contraseñas** a través de la librería `bcrypt`.

**¿Cómo funciona?**
1. Cuando un usuario se registra, su contraseña no se guarda directamente. En su lugar, se pasa por un algoritmo matemático complejo (`bcrypt`) que la convierte en una cadena de caracteres única y de longitud fija llamada "hash".
2. Este proceso es **unidireccional**: es computacionalmente inviable revertir el hash para obtener la contraseña original.
3. Cuando el usuario inicia sesión, la contraseña que introduce se vuelve a "hashear" y el resultado se compara con el hash que está guardado en la base de datos. Si ambos hashes coinciden, el acceso es concedido.

Esto garantiza que, incluso en el hipotético caso de un acceso no autorizado a la base de datos, las contraseñas de los usuarios permanecerían seguras y protegidas.

#### 🗃️ Esquema de la Base de Datos (PostgreSQL)

La base de datos consta de seis tablas principales con integridad referencial completa:

1. `users`: Almacena las credenciales seguras de los usuarios.
   - `id`: SERIAL PRIMARY KEY
   - `email`: VARCHAR(255) UNIQUE
   - `password_hash`: VARCHAR(255) (El hash de la contraseña, no la contraseña)
   - `created_at`: TIMESTAMP

2. `categories`: Almacena las categorías de los productos.
   - `id`: SERIAL PRIMARY KEY
   - `name`: VARCHAR(100)
   - `color`: VARCHAR(7)
   - `icon`: VARCHAR(50)

3. **`supermarkets`**: Almacena información de supermercados *(Nueva funcionalidad)*
   - `id`: SERIAL PRIMARY KEY
   - `name`: VARCHAR(100)
   - `color`: VARCHAR(7) DEFAULT '#6366F1' *(Color personalizable)*
   - `created_at`: TIMESTAMP

4. `products`: Catálogo de productos reutilizables.
   - `id`: SERIAL PRIMARY KEY
   - `name`: VARCHAR(200)
   - `category_id`: INTEGER (FK a `categories.id`)
   - **`supermarket_id`**: INTEGER (FK a `supermarkets.id`) *(Nuevo campo)*
   - `estimated_price`: DECIMAL(10,2)
   - `unit`: VARCHAR(20)
   - `created_at`: TIMESTAMP

5. **`product_alternatives`**: Relaciones entre productos alternativos *(Nueva tabla)*
   - `id`: SERIAL PRIMARY KEY
   - `product_id`: INTEGER (FK a `products.id`)
   - `alternative_product_id`: INTEGER (FK a `products.id`)
   - `created_at`: TIMESTAMP

6. `shopping_lists`: Las listas de compra, vinculadas a un usuario.
   - `id`: SERIAL PRIMARY KEY
   - `user_id`: INTEGER (FK a `users.id`)
   - `name`: VARCHAR(200)
   - `description`: TEXT
   - `total_budget`: DECIMAL(10,2)
   - `is_completed`: BOOLEAN
   - `completed_at`: TIMESTAMP
   - `created_at`: TIMESTAMP

7. `list_items`: Los artículos dentro de cada lista.
   - `id`: SERIAL PRIMARY KEY
   - `shopping_list_id`: INTEGER (FK a `shopping_lists.id`)
   - `product_id`: INTEGER (FK a `products.id`, **NULLABLE para integridad**)
   - `custom_product_name`: VARCHAR(200) (si no se usa un producto del catálogo)
   - `quantity`: INTEGER
   - `unit`: VARCHAR(20)
   - `estimated_price`: DECIMAL(10,2)
   - `is_purchased`: BOOLEAN
   - `created_at`: TIMESTAMP

#### 🌐 API Endpoints del Backend

La API base se encuentra en `/api`.

**Autenticación**
- `POST /auth/register`: Registra un nuevo usuario.
- `POST /auth/login`: Inicia sesión y devuelve un token JWT.

**Categorías**
- `GET /categories`: Obtiene todas las categorías.

**Supermercados** *(Nueva funcionalidad)*
- `GET /supermarkets`: Obtiene todos los supermercados con colores.
- `GET /supermarkets/:id`: Obtiene un supermercado específico.
- `POST /supermarkets`: Crea un nuevo supermercado.
- `PUT /supermarkets/:id`: Actualiza un supermercado (incluyendo color).
- `DELETE /supermarkets/:id`: Elimina un supermercado.

**Productos** *(Funcionalidad ampliada)*
- `GET /products`: Obtiene todos los productos con información de supermercado y colores. Admite queries `?category_id=` y `?search=`.
- **`GET /products/:id`**: Obtiene un producto específico con detalles completos *(Nuevo)*
- `POST /products`: Crea un nuevo producto.
- **`PUT /products/:id`**: Actualiza un producto completo *(Nuevo)*
- **`DELETE /products/:id`**: Elimina un producto con integridad referencial *(Nuevo)*
- **`GET /products/:id/alternatives`**: Obtiene productos alternativos *(Nuevo)*
- **`POST /products/:id/alternatives`**: Agrega un producto alternativo *(Nuevo)*
- **`DELETE /products/:id/alternatives/:altId`**: Quita un producto alternativo *(Nuevo)*

**Listas de Compra**
- `GET /shopping-lists`: Obtiene todas las listas con datos agregados.
- `GET /shopping-lists/:id`: Obtiene una lista específica con todos sus artículos (incluyendo colores de supermercado).
- `POST /shopping-lists`: Crea una nueva lista.
- `PUT /shopping-lists/:id`: Actualiza una lista.
- `DELETE /shopping-lists/:id`: Elimina una lista.

**Artículos de la Lista**
- `POST /shopping-lists/:listId/items`: Añade un artículo a una lista.
- `PUT /shopping-lists/:listId/items/:itemId`: Actualiza un artículo de una lista.
- `DELETE /shopping-lists/:listId/items/:itemId`: Elimina un artículo de una lista.

#### ⚛️ Arquitectura del Frontend

La aplicación ha evolucionado hacia una estructura más modular y organizada:

##### 📁 **Estructura Actual de Archivos**

```
frontend/src/
├── components/
│   ├── ColorPicker.tsx              # Selector de colores y utilidades
│   ├── Layout/
│   │   ├── BottomNavigation.tsx     # Navegación inferior
│   │   └── Icons.ts                 # Iconos centralizados
│   └── ShoppingList/
│       ├── ListItem.tsx             # Componente de item de lista
│       └── ShoppingListCard.tsx     # Tarjeta de lista
├── pages/
│   ├── SupermarketsPage.tsx         # Gestión de supermercados
│   └── ProductDetailScreen.tsx      # Página de detalle de producto *(Nueva)*
├── services/
│   └── api.ts                       # Servicios API centralizados
├── types/
│   └── index.ts                     # Definiciones TypeScript
├── index.tsx                        # Aplicación principal y componentes
└── index.css                        # Estilos globales
```

##### 🎯 **Componentes Principales**

**Páginas:**
- **`ProductDetailScreen.tsx`** *(Nuevo)*: Vista completa de producto con edición, eliminación y agregar a lista
- **`SupermarketsPage.tsx`**: Gestión completa de supermercados con colores
- **`HomeScreen`** (en index.tsx): Dashboard principal con listas
- **`ProductsScreen`** (en index.tsx): Catálogo de productos con navegación a detalle
- **`ListScreen`** (en index.tsx): Vista detallada de una lista específica

**Componentes de UI:**
- **`ColorPicker.tsx`**: Selector de colores reutilizable con utilidades de contraste
- **`BottomNavigation.tsx`**: Navegación principal de la aplicación
- **`ListItem.tsx`**: Componente de item con soporte para colores de supermercado
- **`ShoppingListCard.tsx`**: Tarjeta de lista con información completa

**Modales:** *(Integrados en componentes principales)*
- **`AddToListModal`**: Modal inteligente para agregar productos a listas
- **`EditProductModal`**: Modal completo de edición de productos
- **`CreateListModal`**: Modal de creación de listas
- **`DeleteConfirmModal`**: Confirmaciones de eliminación

##### 🔄 **Sistema de Navegación Avanzado**

```typescript
// Función de navegación extendida
navigate(view: string, listId?: number, productId?: number, openModal?: string)

// Ejemplos de uso:
navigate('home')                           // Ir al home
navigate('product-detail', undefined, 123) // Ver detalle del producto 123  
navigate('home', undefined, undefined, 'newList') // Ir al home y abrir modal de crear lista
```

**Características:**
- **Sistema de eventos customizados** para comunicación entre componentes
- **Navegación automática** con apertura de modales
- **Estado de navegación centralizado** en el componente principal
- **Rutas dinámicas** basadas en estado interno

##### 🎨 **Sistema de Colores Unificado**

```typescript
// Función helper para tags de supermercado consistentes
createSupermarketBadge(name: string, color?: string | null, size: 'xs' | 'sm' = 'sm')

// Función de contraste automático  
getContrastTextColor(backgroundColor: string | null | undefined): string
```

**Aplicación:**
- Tags de supermercado en todos los productos
- Badges de categoría con colores automáticos
- Indicadores visuales consistentes en toda la aplicación
- Manejo robusto de valores null/undefined 

---

## 🇬🇧 English

### High-Level Overview

**Shopping List Pro** is a modern, full-featured web application designed to simplify shopping list management. Built with a robust frontend and backend architecture, it offers a smooth and intuitive user experience with advanced product and supermarket management features.

#### ✨ Key Features

- **Multiple List Management**: Create, edit, and delete multiple shopping lists.
- **User Authentication**: Secure registration and login system. Each user only has access to their own lists.
- **Budget Tracking**: Assign a budget to your lists and see the estimated real-time spending.
- **Advanced Product Catalog**: Manage a comprehensive catalog of products with prices, categories, and supermarkets.
- **Supermarket Management**: Complete supermarket system with customizable colors and visual tags.
- **Product Detail Page**: Complete view of each product with detailed information and management options.
- **Alternative Products System**: Manage similar products and find alternatives easily.
- **Smart Add to List**: Intuitive system to add products to existing lists or create new ones.
- **Customizable Categories**: Organize products with color-coded and icon-based categories.
- **Purchase Status**: Mark items as purchased and watch the list auto-complete.
- **Mobile-First Design**: A polished and professional user interface optimized for mobile devices.

#### 🏗️ Architecture

The application follows a decoupled client-server architecture:

- **Backend**: A RESTful API built with **Node.js** and **Express**. It handles all business logic, database interaction, and security, using **JWT (JSON Web Tokens)** for session management and **bcrypt** for secure password storage.
- **Frontend**: A Single Page Application (SPA) built with **React** and **TypeScript**. It provides an interactive and dynamic user interface with smooth navigation.
- **Database**: **PostgreSQL** is used for data persistence, storing lists, products, categories, supermarkets, and items with complete referential integrity.
- **Containerization**: **Docker** and **Docker Compose** are used to encapsulate and orchestrate the frontend, backend, and database services, with separate configurations for development and production.

#### 🆕 New Featured Functionalities

##### 📱 **Product Detail Page**
- **Complete product view** with all relevant information
- **Detailed information**: category (with color), supermarket (with color), estimated price, unit, creation date
- **Alternative products**: List of similar products with direct navigation
- **Available actions**: Edit, delete, add to list
- **Intuitive navigation**: Accessible from the product catalog

##### 🛒 **Advanced "Add to List" System**
- **Smart modal** that adapts to context:
  - **With existing lists**: Shows all available lists (complete or active)
  - **Without lists**: Explanatory message with direct navigation to create a new one
- **Complete list information**: name, description, number of products, status
- **Automatic navigation**: When creating a new list, automatically opens the creation modal
- **Smart adding**: Default quantity and pre-loaded product data

##### ✏️ **Complete Product Management**
- **In-situ editing**: Complete editing modal from the detail page
- **Alternative management**: Easily add and remove alternative products
- **Safe deletion**: Confirmation and referential integrity handling
- **Robust validations**: Error handling and clear feedback

##### 🏪 **Enhanced Supermarket System**
- **Customizable colors**: Each supermarket can have its distinctive color
- **Consistent tags**: Colors automatically applied throughout the application
- **Visual integration**: Colors shown in products, lists, and alternatives
- **Robust handling**: Default color system to prevent errors

---

### Low-Level Technical Details

#### 🛠️ Tech Stack

- **Backend**: Node.js, Express, PostgreSQL (with `pg`), Helmet (security), CORS, Express Rate Limit, bcrypt, jsonwebtoken.
- **Frontend**: React, TypeScript, Tailwind CSS, Lucide React (icons).
- **Environment**: Docker, Docker Compose (configurations for development and production).

#### 🚀 Getting Started

##### 🐳 **Development with Docker (Recommended)**

1. **Clone the repository**:
```bash
git clone <REPOSITORY_URL>
cd showcaseAntonio
```

2. **Development setup**:
```bash
# Use the optimized development environment
docker-compose -f docker-compose.dev.yml up --build
```

3. **Production setup**:
```bash
# For production use the main compose
docker-compose up --build
```

4. **Access the application**:
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5001`

##### 💻 **Local Development (Alternative)**

1. **Set up environment variables**:
   The backend requires a database connection URL. By default, `docker-compose.yml` handles this.

2. **Install dependencies**:
   - **Backend**: `cd backend && npm install`
   - **Frontend**: `cd frontend && npm install`

3. **Start services manually**:
   ```bash
   # Terminal 1 - Database
   docker run -p 5432:5432 -e POSTGRES_DB=shopping_app -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password postgres:13
   
   # Terminal 2 - Backend
   cd backend && npm start
   
   # Terminal 3 - Frontend  
   cd frontend && npm start
   ```

#### 👤 **Demo User**

The application is seeded with a test user for immediate exploration:
- **Email**: `demo@example.com`
- **Password**: `password123`

#### 🔐 Security: Password Storage

Security is a top priority. In this application, **passwords are never stored in plain text**. We use a robust, industry-standard method called **password hashing** via the `bcrypt` library.

**How does it work?**
1. When a user signs up, their password is not saved directly. Instead, it's passed through a complex mathematical algorithm (`bcrypt`) that converts it into a unique, fixed-length string of characters called a "hash".
2. This process is **one-way**: it is computationally infeasible to reverse the hash to get the original password.
3. When the user logs in, the password they enter is hashed again, and the result is compared to the hash stored in the database. If both hashes match, access is granted.

This ensures that even in the unlikely event of a database breach, users' passwords would remain safe and protected.

#### 🗃️ Database Schema (PostgreSQL)

The database consists of six main tables with complete referential integrity:

1. `users`: Stores secure user credentials.
   - `id`: SERIAL PRIMARY KEY
   - `email`: VARCHAR(255) UNIQUE
   - `password_hash`: VARCHAR(255) (The password hash, not the password itself)
   - `created_at`: TIMESTAMP

2. `categories`: Stores product categories.
   - `id`: SERIAL PRIMARY KEY
   - `name`: VARCHAR(100)
   - `color`: VARCHAR(7)
   - `icon`: VARCHAR(50)

3. **`supermarkets`**: Stores supermarket information *(New functionality)*
   - `id`: SERIAL PRIMARY KEY
   - `name`: VARCHAR(100)
   - `color`: VARCHAR(7) DEFAULT '#6366F1' *(Customizable color)*
   - `created_at`: TIMESTAMP

4. `products`: Catalog of reusable products.
   - `id`: SERIAL PRIMARY KEY
   - `name`: VARCHAR(200)
   - `category_id`: INTEGER (FK to `categories.id`)
   - **`supermarket_id`**: INTEGER (FK to `supermarkets.id`) *(New field)*
   - `estimated_price`: DECIMAL(10,2)
   - `unit`: VARCHAR(20)
   - `created_at`: TIMESTAMP

5. **`product_alternatives`**: Relationships between alternative products *(New table)*
   - `id`: SERIAL PRIMARY KEY
   - `product_id`: INTEGER (FK to `products.id`)
   - `alternative_product_id`: INTEGER (FK to `products.id`)
   - `created_at`: TIMESTAMP

6. `shopping_lists`: The shopping lists, linked to a user.
   - `id`: SERIAL PRIMARY KEY
   - `user_id`: INTEGER (FK to `users.id`)
   - `name`: VARCHAR(200)
   - `description`: TEXT
   - `total_budget`: DECIMAL(10,2)
   - `is_completed`: BOOLEAN
   - `completed_at`: TIMESTAMP
   - `created_at`: TIMESTAMP

7. `list_items`: The items within each list.
   - `id`: SERIAL PRIMARY KEY
   - `shopping_list_id`: INTEGER (FK to `shopping_lists.id`)
   - `product_id`: INTEGER (FK to `products.id`, **NULLABLE for integrity**)
   - `custom_product_name`: VARCHAR(200) (if not using a catalog product)
   - `quantity`: INTEGER
   - `unit`: VARCHAR(20)
   - `estimated_price`: DECIMAL(10,2)
   - `is_purchased`: BOOLEAN
   - `created_at`: TIMESTAMP

#### 🌐 Backend API Endpoints

The base API is located at `/api`.

**Authentication**
- `POST /auth/register`: Registers a new user.
- `POST /auth/login`: Logs in a user and returns a JWT.

**Categories**
- `GET /categories`: Fetches all categories.

**Supermarkets** *(New functionality)*
- `GET /supermarkets`: Fetches all supermarkets with colors.
- `GET /supermarkets/:id`: Fetches a specific supermarket.
- `POST /supermarkets`: Creates a new supermarket.
- `PUT /supermarkets/:id`: Updates a supermarket (including color).
- `DELETE /supermarkets/:id`: Deletes a supermarket.

**Products** *(Expanded functionality)*
- `GET /products`: Fetches all products with supermarket information and colors. Supports `?category_id=` and `?search=` queries.
- **`GET /products/:id`**: Fetches a specific product with complete details *(New)*
- `POST /products`: Creates a new product.
- **`PUT /products/:id`**: Updates a complete product *(New)*
- **`DELETE /products/:id`**: Deletes a product with referential integrity *(New)*
- **`GET /products/:id/alternatives`**: Fetches alternative products *(New)*
- **`POST /products/:id/alternatives`**: Adds an alternative product *(New)*
- **`DELETE /products/:id/alternatives/:altId`**: Removes an alternative product *(New)*

**Shopping Lists**
- `GET /shopping-lists`: Fetches all lists with aggregated data.
- `GET /shopping-lists/:id`: Fetches a specific list with all its items (including supermarket colors).
- `POST /shopping-lists`: Creates a new list.
- `PUT /shopping-lists/:id`: Updates a list.
- `DELETE /shopping-lists/:id`: Deletes a list.

**List Items**
- `POST /shopping-lists/:listId/items`: Adds an item to a list.
- `PUT /shopping-lists/:listId/items/:itemId`: Updates an item in a list.
- `DELETE /shopping-lists/:listId/items/:itemId`: Deletes an item from a list.

#### ⚛️ Frontend Architecture

The application has evolved towards a more modular and organized structure:

##### 📁 **Current File Structure**

```
frontend/src/
├── components/
│   ├── ColorPicker.tsx              # Color picker and utilities
│   ├── Layout/
│   │   ├── BottomNavigation.tsx     # Bottom navigation
│   │   └── Icons.ts                 # Centralized icons
│   └── ShoppingList/
│       ├── ListItem.tsx             # List item component
│       └── ShoppingListCard.tsx     # List card
├── pages/
│   ├── SupermarketsPage.tsx         # Supermarket management
│   └── ProductDetailScreen.tsx      # Product detail page *(New)*
├── services/
│   └── api.ts                       # Centralized API services
├── types/
│   └── index.ts                     # TypeScript definitions
├── index.tsx                        # Main application and components
└── index.css                        # Global styles
```

##### 🎯 **Main Components**

**Pages:**
- **`ProductDetailScreen.tsx`** *(New)*: Complete product view with editing, deletion, and add to list
- **`SupermarketsPage.tsx`**: Complete supermarket management with colors
- **`HomeScreen`** (in index.tsx): Main dashboard with lists
- **`ProductsScreen`** (in index.tsx): Product catalog with navigation to detail
- **`ListScreen`** (in index.tsx): Detailed view of a specific list

**UI Components:**
- **`ColorPicker.tsx`**: Reusable color picker with contrast utilities
- **`BottomNavigation.tsx`**: Main application navigation
- **`ListItem.tsx`**: Item component with supermarket color support
- **`ShoppingListCard.tsx`**: List card with complete information

**Modals:** *(Integrated in main components)*
- **`AddToListModal`**: Smart modal for adding products to lists
- **`EditProductModal`**: Complete product editing modal
- **`CreateListModal`**: List creation modal
- **`DeleteConfirmModal`**: Deletion confirmations

##### 🔄 **Advanced Navigation System**

```typescript
// Extended navigation function
navigate(view: string, listId?: number, productId?: number, openModal?: string)

// Usage examples:
navigate('home')                           // Go to home
navigate('product-detail', undefined, 123) // View product 123 detail  
navigate('home', undefined, undefined, 'newList') // Go to home and open create list modal
```

**Features:**
- **Custom event system** for component communication
- **Automatic navigation** with modal opening
- **Centralized navigation state** in main component
- **Dynamic routes** based on internal state

##### 🎨 **Unified Color System**

```typescript
// Helper function for consistent supermarket tags
createSupermarketBadge(name: string, color?: string | null, size: 'xs' | 'sm' = 'sm')

// Automatic contrast function  
getContrastTextColor(backgroundColor: string | null | undefined): string
```

**Application:**
- Supermarket tags in all products
- Category badges with automatic colors
- Consistent visual indicators throughout the application
- Robust handling of null/undefined values

---

## 🚀 Recent Updates & Improvements

### ✨ **Latest Features Added**

1. **🔧 System Fixes**
   - Fixed `Cannot read properties of undefined (reading 'replace')` error in supermarkets page
   - Added `color` column to `supermarkets` table with proper migration
   - Enhanced `getContrastTextColor` function for robust null/undefined handling

2. **🎨 UI/UX Enhancements**
   - Simplified SupermarketCard design (removed explicit color badge, border color only)
   - Unified supermarket tags with consistent colors across the entire application
   - Improved hover effects and visual feedback

3. **📱 Major New Functionality**
   - **Complete ProductDetailScreen**: New dedicated page for product management
   - **Advanced product editing**: Full modal with alternative product management
   - **Safe product deletion**: Confirmation dialogs with referential integrity
   - **Smart "Add to List" system**: Intelligent modal with auto-navigation

4. **🔌 Backend Improvements**
   - New API routes: `GET/PUT/DELETE /api/products/:id`
   - Enhanced queries with supermarket color information
   - Referential integrity for safe product deletion
   - Alternative products relationship management

5. **🛠️ Technical Enhancements**
   - Automatic navigation system with custom events
   - Updated TypeScript interfaces with new fields
   - Development Docker configurations for optimized workflow
   - Improved error handling and validation

### 📋 **Development Environment**

For contributors and developers:

- **Development mode**: Uses `docker-compose.dev.yml` with hot-reload
- **Production mode**: Uses main `docker-compose.yml` with optimized builds
- **Local development**: Full instructions for non-Docker setup
- **Database migrations**: Handled automatically via init.sql and manual commands

---

## 📄 License

This project is provided as-is for demonstration purposes. Feel free to explore, learn, and adapt the codebase for your own projects. 