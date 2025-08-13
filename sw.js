// Service Worker for caching
const CACHE_NAME = 'ai-hub-v1';
const STATIC_CACHE = [
  '/',
  '/css/critical.css',
  '/css/style.min.css',
  '/css/aihub.v8.patch.css',
  '/js/app.min.js',
  '/js/aihub.v8.enhance.js',
  '/assets/hero.webp',
  '/assets/lovescape.webp',
  '/assets/replika.webp',
  '/assets/crushon.webp',
  '/assets/janitorai.webp'
];

// Install SW
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate SW
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy: Cache First for assets, Network First for HTML
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Assets - Cache First
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return fetchResponse;
        });
      })
    );
    return;
  }
  
  // HTML - Network First with fallback
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request).then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });
        return response;
      }).catch(() => {
        return caches.match(request);
      })
    );
  }
});