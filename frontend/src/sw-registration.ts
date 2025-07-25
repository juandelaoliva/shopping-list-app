// Service Worker Registration for PWA
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

type Config = {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
};

export function register(config?: Config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL((window as any).PUBLIC_URL || '', window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `/sw.js`;

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('🚀 PWA: App is being served cache-first by a service worker');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl: string, config?: Config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('✅ PWA: Service worker registered successfully');
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log('🔄 PWA: New content available; please refresh');
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
              
              // Mostrar notificación de actualización
              showUpdateNotification();
            } else {
              console.log('📦 PWA: Content is cached for offline use');
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
              
              // Mostrar notificación de que está listo offline
              showOfflineReadyNotification();
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('❌ PWA: Service worker registration failed:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: Config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('🌐 PWA: No internet connection found. App is running in offline mode');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Funciones para mostrar notificaciones de estado PWA
function showUpdateNotification() {
  // Crear notificación discreta de actualización disponible
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed; 
      top: 20px; 
      right: 20px; 
      background: #6366f1; 
      color: white; 
      padding: 12px 16px; 
      border-radius: 8px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui;
      font-size: 14px;
    ">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>🔄</span>
        <span>Nueva versión disponible</span>
        <button onclick="window.location.reload()" style="
          background: rgba(255,255,255,0.2); 
          border: none; 
          color: white; 
          padding: 4px 8px; 
          border-radius: 4px; 
          cursor: pointer;
          margin-left: 8px;
        ">
          Actualizar
        </button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: transparent; 
          border: none; 
          color: white; 
          cursor: pointer;
          padding: 4px;
        ">
          ✕
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(notification);
  
  // Auto-remover después de 10 segundos
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 10000);
}

function showOfflineReadyNotification() {
  // Mostrar notificación de que la app está lista para offline
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed; 
      top: 20px; 
      right: 20px; 
      background: #10b981; 
      color: white; 
      padding: 12px 16px; 
      border-radius: 8px; 
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: system-ui;
      font-size: 14px;
    ">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>📱</span>
        <span>¡App lista para usar offline!</span>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: transparent; 
          border: none; 
          color: white; 
          cursor: pointer;
          padding: 4px;
          margin-left: 8px;
        ">
          ✕
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(notification);
  
  // Auto-remover después de 5 segundos
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Detectar cuando la app está offline/online
export function setupNetworkDetection() {
  function updateOnlineStatus() {
    if (navigator.onLine) {
      console.log('🌐 PWA: Back online');
      // Opcional: disparar sync de datos pendientes
    } else {
      console.log('📶 PWA: App is offline');
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Estado inicial
  updateOnlineStatus();
}

// Función para instalar la PWA
export function setupInstallPrompt() {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostrar botón de instalación custom
    showInstallButton();
  });

  function showInstallButton() {
    const installButton = document.createElement('button');
    installButton.innerHTML = '📱 Instalar App';
    installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #6366f1;
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-family: system-ui;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
    `;
    
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('🎉 PWA: User accepted the install prompt');
        }
        deferredPrompt = null;
        installButton.remove();
      }
    });
    
    document.body.appendChild(installButton);
    
    // Auto-remover después de 30 segundos
    setTimeout(() => {
      if (installButton.parentElement) {
        installButton.remove();
      }
    }, 30000);
  }
} 