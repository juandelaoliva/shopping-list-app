const CACHE_NAME = 'shopping-list-pro-v1';
const API_CACHE_NAME = 'shopping-list-api-v1';

// Recursos estáticos que siempre queremos en cache
const STATIC_RESOURCES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon.svg'
];

// URLs de API que queremos cachear
const API_ENDPOINTS = [
  '/api/shopping-lists',
  '/api/products', 
  '/api/categories',
  '/api/supermarkets'
];

// Instalar service worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .catch(err => {
        console.log('❌ Service Worker: Error caching static resources', err);
      })
  );
  
  // Activa inmediatamente
  self.skipWaiting();
});

// Activar service worker
self.addEventListener('activate', event => {
  console.log('✅ Service Worker: Activated');
  
  event.waitUntil(
    // Limpiar caches antiguos
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Toma control inmediatamente
  self.clients.claim();
});

// Interceptar requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // Estrategia para API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Estrategia para recursos estáticos
  event.respondWith(handleStaticRequest(request));
});

// Manejar requests de API
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Intentar fetch primero (Network First)
    const response = await fetch(request);
    
    // Si es exitoso y es GET, cachear
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('🌐 Service Worker: Network failed, trying cache for', url.pathname);
    
    // Si falla la red, intentar cache (solo para GET)
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('📦 Service Worker: Serving from cache', url.pathname);
        return cachedResponse;
      }
    }
    
    // Si no hay cache, devolver error offline
    return new Response(
      JSON.stringify({ 
        error: 'Sin conexión', 
        message: 'Esta funcionalidad requiere conexión a internet' 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Manejar requests estáticos
async function handleStaticRequest(request) {
  // Cache First para recursos estáticos
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    // Cachear si es exitoso
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Si es la página principal y no hay cache, devolver página offline básica
    if (request.mode === 'navigate') {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Shopping List Pro - Sin conexión</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui; text-align: center; padding: 2rem; }
            .offline { color: #ef4444; }
          </style>
        </head>
        <body>
          <h1>🛒 Shopping List Pro</h1>
          <p class="offline">📶 Sin conexión a internet</p>
          <p>Por favor, verifica tu conexión e intenta nuevamente.</p>
          <button onclick="location.reload()">🔄 Reintentar</button>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    throw error;
  }
}

// Escuchar mensajes del cliente
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🚀 Service Worker: Loaded successfully!'); 