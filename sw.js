const CACHE_NAME = 'quran-app-v9';
const BASE = self.location.pathname.replace(/\/sw\.js$/, '/');

// Install - skipWaiting to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate - clean ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - NETWORK FIRST for everything (always get fresh content)
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Network first: try network, fall back to cache if offline
  event.respondWith(
    fetch(event.request)
      .then((fetchResponse) => {
        // Cache the fresh response
        if (fetchResponse.ok) {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return fetchResponse;
      })
      .catch(() => {
        // Offline: serve from cache
        return caches.match(event.request);
      })
  );
});
