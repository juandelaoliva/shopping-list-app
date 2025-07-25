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

**Shopping List Pro** es una aplicación web moderna y completa diseñada para simplificar la gestión de listas de compras. Construida con una arquitectura robusta de frontend y backend, ofrece una experiencia de usuario fluida e intuitiva.

#### ✨ Características Principales

- **Gestión de Listas Múltiples**: Crea, edita y elimina múltiples listas de compras.
- **Autenticación de Usuarios**: Sistema de registro e inicio de sesión seguro. Cada usuario solo tiene acceso a sus propias listas.
- **Seguimiento del Presupuesto**: Asigna un presupuesto a tus listas y visualiza el gasto estimado en tiempo real.
- **Catálogo de Productos**: Administra un catálogo de productos predefinidos con precios y categorías para agilizar la creación de listas.
- **Categorías Personalizables**: Organiza los productos con categorías codificadas por colores e iconos.
- **Estado de la Compra**: Marca los artículos como comprados y observa cómo la lista se completa automáticamente.
- **Diseño Mobile-First**: Una interfaz de usuario pulida y profesional optimizada para dispositivos móviles.

#### 🏗️ Arquitectura

La aplicación sigue una arquitectura cliente-servidor desacoplada:

- **Backend**: Una API RESTful construida con **Node.js** y **Express**. Se encarga de toda la lógica de negocio, la interacción con la base de datos y la seguridad, utilizando **JWT (JSON Web Tokens)** para la gestión de sesiones y **bcrypt** para el almacenamiento seguro de contraseñas.
- **Frontend**: Una Aplicación de Página Única (SPA) construida con **React** y **TypeScript**. Proporciona una interfaz de usuario interactiva y dinámica.
- **Base de Datos**: **PostgreSQL** se utiliza para la persistencia de datos, almacenando listas, productos, categorías y artículos.
- **Contenerización**: **Docker** y **Docker Compose** se utilizan para encapsular y orquestar los servicios de frontend, backend y base de datos, asegurando un entorno de desarrollo y despliegue consistente.

---

### Detalles Técnicos (Bajo Nivel)

#### 🛠️ Stack Tecnológico

- **Backend**: Node.js, Express, PostgreSQL (con `pg`), Helmet (seguridad), CORS, Express Rate Limit, bcrypt, jsonwebtoken.
- **Frontend**: React, TypeScript, Tailwind CSS.
- **Entorno**: Docker, Docker Compose.

#### 🚀 Cómo Empezar

1.  **Clonar el repositorio**:
```bash
    git clone <URL_DEL_REPOSITORIO>
cd showcaseAntonio
```

2.  **Configurar variables de entorno**:
    El backend requiere una URL de conexión a la base de datos. Por defecto, `docker-compose.yml` la configura. No se necesita un archivo `.env` para empezar con Docker.

3.  **Levantar los servicios con Docker Compose**:
    Este comando construirá las imágenes de Docker para el frontend y el backend, iniciará los contenedores y la base de datos.
```bash
docker-compose up --build
```

4.  **Acceder a la aplicación**:
    -   **Frontend**: `http://localhost:3000`
    -   **Backend API**: `http://localhost:5001`

5.  **Iniciar sesión con el usuario de demostración**:
    La aplicación se inicializa con un usuario de prueba para que puedas empezar a explorar inmediatamente.
    -   **Email**: `demo@example.com`
    -   **Contraseña**: `password123`

6.  **Instalar dependencias localmente (alternativa sin Docker)**:
    -   **Backend**: `cd backend && npm install`
    -   **Frontend**: `cd frontend && npm install`

#### 🔐 Seguridad: Almacenamiento de Contraseñas

La seguridad es una prioridad. En esta aplicación, **las contraseñas nunca se guardan en texto plano**. Utilizamos un método robusto y estándar de la industria llamado **hashing de contraseñas** a través de la librería `bcrypt`.

**¿Cómo funciona?**
1.  Cuando un usuario se registra, su contraseña no se guarda directamente. En su lugar, se pasa por un algoritmo matemático complejo (`bcrypt`) que la convierte en una cadena de caracteres única y de longitud fija llamada "hash".
2.  Este proceso es **unidireccional**: es computacionalmente inviable revertir el hash para obtener la contraseña original.
3.  Cuando el usuario inicia sesión, la contraseña que introduce se vuelve a "hashear" y el resultado se compara con el hash que está guardado en la base de datos. Si ambos hashes coinciden, el acceso es concedido.

Esto garantiza que, incluso en el hipotético caso de un acceso no autorizado a la base de datos, las contraseñas de los usuarios permanecerían seguras y protegidas.

#### 🗃️ Esquema de la Base de Datos (PostgreSQL)

La base de datos consta de cinco tablas principales:

1.  `users`: Almacena las credenciales seguras de los usuarios.
    -   `id`: SERIAL PRIMARY KEY
    -   `email`: VARCHAR(255)
    -   `password_hash`: VARCHAR(255) (El hash de la contraseña, no la contraseña)

2.  `categories`: Almacena las categorías de los productos.
    -   `id`: SERIAL PRIMARY KEY
    -   `name`: VARCHAR(100)
    -   `color`: VARCHAR(7)
    -   `icon`: VARCHAR(50)

3.  `products`: Catálogo de productos reutilizables.
    -   `id`: SERIAL PRIMARY KEY
    -   `name`: VARCHAR(200)
    -   `category_id`: INTEGER (FK a `categories.id`)
    -   `estimated_price`: DECIMAL(10,2)
    -   `unit`: VARCHAR(20)

4.  `shopping_lists`: Las listas de compra, vinculadas a un usuario.
    -   `id`: SERIAL PRIMARY KEY
    -   `user_id`: INTEGER (FK a `users.id`)
    -   `name`: VARCHAR(200)
    -   `description`: TEXT
    -   `total_budget`: DECIMAL(10,2)
    -   `is_completed`: BOOLEAN
    -   `completed_at`: TIMESTAMP

5.  `list_items`: Los artículos dentro de cada lista.
    -   `id`: SERIAL PRIMARY KEY
    -   `shopping_list_id`: INTEGER (FK a `shopping_lists.id`)
    -   `product_id`: INTEGER (FK a `products.id`, opcional)
    -   `custom_product_name`: VARCHAR(200) (si no se usa un producto del catálogo)
    -   `quantity`: INTEGER
    -   `unit`: VARCHAR(20)
    -   `estimated_price`: DECIMAL(10,2)
    -   `is_purchased`: BOOLEAN

#### 🌐 API Endpoints del Backend

La API base se encuentra en `/api`.

**Autenticación**
- `POST /auth/register`: Registra un nuevo usuario.
- `POST /auth/login`: Inicia sesión y devuelve un token JWT.

**Categorías**
- `GET /categories`: Obtiene todas las categorías.

**Productos**
- `GET /products`: Obtiene todos los productos. Admite queries `?category_id=` y `?search=`.
- `GET /products/:id`: Obtiene un producto específico.
- `POST /products`: Crea un nuevo producto.
- `PUT /products/:id`: Actualiza un producto.
- `DELETE /products/:id`: Elimina un producto.

**Listas de Compra**
- `GET /shopping-lists`: Obtiene todas las listas con datos agregados.
- `GET /shopping-lists/:id`: Obtiene una lista específica con todos sus artículos.
- `POST /shopping-lists`: Crea una nueva lista.
- `PUT /shopping-lists/:id`: Actualiza una lista.
- `DELETE /shopping-lists/:id`: Elimina una lista.

**Artículos de la Lista**
- `POST /shopping-lists/:listId/items`: Añade un artículo a una lista.
- `PUT /shopping-lists/:listId/items/:itemId`: Actualiza un artículo de una lista.
- `DELETE /shopping-lists/:listId/items/:itemId`: Elimina un artículo de una lista.

#### ⚛️ Arquitectura del Frontend (Estructura Recomendada)

Actualmente, todo el código reside en `frontend/src/index.tsx`. La siguiente es una descripción de sus componentes lógicos, como si estuvieran modularizados, que es la práctica estándar recomendada.

-   **`pages/`**:
    -   `HomePage.tsx`: Muestra las listas activas y completadas.
    -   `ListPage.tsx`: Muestra los detalles y artículos de una lista seleccionada.
    -   `ProductsPage.tsx`: Muestra el catálogo de productos para su gestión.

-   **`components/`**:
    -   `ShoppingListCard.tsx`: Tarjeta que representa una lista en la `HomePage`.
    -   `ListItem.tsx`: Componente para un solo artículo en la `ListPage`.
    -   `ProductCard.tsx`: Tarjeta que representa un producto en la `ProductsPage`.
    -   `Layout/`: Componentes de UI como `Header.tsx`, `BottomNavigation.tsx`.
    -   `modals/`: Varios componentes modales para crear y editar listas, productos y artículos.

-   **`services/`**:
    -   `api.ts`: Un módulo que centralizaría todas las llamadas a la API `fetch`, manejando URLs, headers y la lógica de petición/respuesta.

-   **`types/`**:
    -   `index.ts`: Contiene todas las definiciones de interfaces de TypeScript (`List`, `ListItem`, `Product`, etc.).

-   **`App.tsx`**: El componente raíz que maneja la navegación entre las diferentes "páginas" (`HomePage`, `ListPage`, `ProductsPage`) basado en el estado interno.

---

## 🇬🇧 English

### High-Level Overview

**Shopping List Pro** is a modern, full-featured web application designed to simplify shopping list management. Built with a robust frontend and backend architecture, it offers a smooth and intuitive user experience.

#### ✨ Key Features

- **Multiple List Management**: Create, edit, and delete multiple shopping lists.
- **User Authentication**: Secure registration and login system. Each user only has access to their own lists.
- **Budget Tracking**: Assign a budget to your lists and see the estimated real-time spending.
- **Product Catalog**: Manage a catalog of predefined products with prices and categories to speed up list creation.
- **Customizable Categories**: Organize products with color-coded and icon-based categories.
- **Purchase Status**: Mark items as purchased and watch the list auto-complete.
- **Mobile-First Design**: A polished and professional user interface optimized for mobile devices.

#### 🏗️ Architecture

The application follows a decoupled client-server architecture:

- **Backend**: A RESTful API built with **Node.js** and **Express**. It handles all business logic, database interaction, and security, using **JWT (JSON Web Tokens)** for session management and **bcrypt** for secure password storage.
- **Frontend**: A Single Page Application (SPA) built with **React** and **TypeScript**. It provides an interactive and dynamic user interface.
- **Database**: **PostgreSQL** is used for data persistence, storing lists, products, categories, and items.
- **Containerization**: **Docker** and **Docker Compose** are used to encapsulate and orchestrate the frontend, backend, and database services, ensuring a consistent development and deployment environment.

---

### Low-Level Technical Details

#### 🛠️ Tech Stack

- **Backend**: Node.js, Express, PostgreSQL (with `pg`), Helmet (security), CORS, Express Rate Limit, bcrypt, jsonwebtoken.
- **Frontend**: React, TypeScript, Tailwind CSS.
- **Environment**: Docker, Docker Compose.

#### 🚀 Getting Started

1.  **Clone the repository**:
    ```bash
    git clone <REPOSITORY_URL>
    cd showcaseAntonio
    ```

2.  **Set up environment variables**:
    The backend requires a database connection URL. By default, `docker-compose.yml` handles this. No `.env` file is needed to get started with Docker.

3.  **Launch services with Docker Compose**:
    This command will build the Docker images for the frontend and backend, and start the containers and the database.
    ```bash
    docker-compose up --build
    ```

4.  **Access the application**:
    -   **Frontend**: `http://localhost:3000`
    -   **Backend API**: `http://localhost:5001`

5.  **Log in with the demo user**:
    The application is seeded with a test user so you can start exploring right away.
    -   **Email**: `demo@example.com`
    -   **Password**: `password123`

6.  **Install dependencies locally (non-Docker alternative)**:
    -   **Backend**: `cd backend && npm install`
    -   **Frontend**: `cd frontend && npm install`

#### 🔐 Security: Password Storage

Security is a top priority. In this application, **passwords are never stored in plain text**. We use a robust, industry-standard method called **password hashing** via the `bcrypt` library.

**How does it work?**
1.  When a user signs up, their password is not saved directly. Instead, it's passed through a complex mathematical algorithm (`bcrypt`) that converts it into a unique, fixed-length string of characters called a "hash".
2.  This process is **one-way**: it is computationally infeasible to reverse the hash to get the original password.
3.  When the user logs in, the password they enter is hashed again, and the result is compared to the hash stored in the database. If both hashes match, access is granted.

This ensures that even in the unlikely event of a database breach, users' passwords would remain safe and protected.

#### 🗃️ Database Schema (PostgreSQL)

The database consists of five main tables:

1.  `users`: Stores secure user credentials.
    -   `id`: SERIAL PRIMARY KEY
    -   `email`: VARCHAR(255)
    -   `password_hash`: VARCHAR(255) (The password hash, not the password itself)

2.  `categories`: Stores product categories.
    -   `id`: SERIAL PRIMARY KEY
    -   `name`: VARCHAR(100)
    -   `color`: VARCHAR(7)
    -   `icon`: VARCHAR(50)

3.  `products`: Catalog of reusable products.
    -   `id`: SERIAL PRIMARY KEY
    -   `name`: VARCHAR(200)
    -   `category_id`: INTEGER (FK to `categories.id`)
    -   `estimated_price`: DECIMAL(10,2)
    -   `unit`: VARCHAR(20)

4.  `shopping_lists`: The shopping lists, linked to a user.
    -   `id`: SERIAL PRIMARY KEY
    -   `user_id`: INTEGER (FK to `users.id`)
    -   `name`: VARCHAR(200)
    -   `description`: TEXT
    -   `total_budget`: DECIMAL(10,2)
    -   `is_completed`: BOOLEAN
    -   `completed_at`: TIMESTAMP

5.  `list_items`: The items within each list.
    -   `id`: SERIAL PRIMARY KEY
    -   `shopping_list_id`: INTEGER (FK to `shopping_lists.id`)
    -   `product_id`: INTEGER (FK to `products.id`, optional)
    -   `custom_product_name`: VARCHAR(200) (if not using a catalog product)
    -   `quantity`: INTEGER
    -   `unit`: VARCHAR(20)
    -   `estimated_price`: DECIMAL(10,2)
    -   `is_purchased`: BOOLEAN

#### 🌐 Backend API Endpoints

The base API is located at `/api`.

**Authentication**
- `POST /auth/register`: Registers a new user.
- `POST /auth/login`: Logs in a user and returns a JWT.

**Categories**
- `GET /categories`: Fetches all categories.

**Products**
- `GET /products`: Fetches all products. Supports `?category_id=` and `?search=` queries.
- `GET /products/:id`: Fetches a specific product.
- `POST /products`: Creates a new product.
- `PUT /products/:id`: Updates a product.
- `DELETE /products/:id`: Deletes a product.

**Shopping Lists**
- `GET /shopping-lists`: Fetches all lists with aggregated data.
- `GET /shopping-lists/:id`: Fetches a specific list with all its items.
- `POST /shopping-lists`: Creates a new list.
- `PUT /shopping-lists/:id`: Updates a list.
- `DELETE /shopping-lists/:id`: Deletes a list.

**List Items**
- `POST /shopping-lists/:listId/items`: Adds an item to a list.
- `PUT /shopping-lists/:listId/items/:itemId`: Updates an item in a list.
- `DELETE /shopping-lists/:listId/items/:itemId`: Deletes an item from a list.

#### ⚛️ Frontend Architecture (Recommended Structure)

Currently, all the code resides in `frontend/src/index.tsx`. The following is a description of its logical components, as if they were modularized, which is the recommended best practice.

-   **`pages/`**:
    -   `HomePage.tsx`: Displays active and completed lists.
    -   `ListPage.tsx`: Displays the details and items of a selected list.
    -   `ProductsPage.tsx`: Displays the product catalog for management.

-   **`components/`**:
    -   `ShoppingListCard.tsx`: A card representing a list on the `HomePage`.
    -   `ListItem.tsx`: A component for a single item on the `ListPage`.
    -   `ProductCard.tsx`: A card representing a product on the `ProductsPage`.
    -   `Layout/`: UI components like `Header.tsx`, `BottomNavigation.tsx`.
    -   `modals/`: Various modal components for creating and editing lists, products, and items.

-   **`services/`**:
    -   `api.ts`: A module that would centralize all `fetch` API calls, handling URLs, headers, and request/response logic.

-   **`types/`**:
    -   `index.ts`: Contains all TypeScript interface definitions (`List`, `ListItem`, `Product`, etc.).

-   **`App.tsx`**: The root component that handles navigation between the different "pages" (`HomePage`, `ListPage`, `ProductsPage`) based on internal state. 