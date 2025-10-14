// Service Worker for Rabbit Holes PWA
const CACHE_NAME = 'rabbit-holes-v2';
const OFFLINE_URL = '/offline';

// Files to cache immediately
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/search',
  '/about',
  '/archive',
  '/tags',
  '/src/styles/globals.css',
  '/src/styles/components.css',
  '/src/styles/utilities.css',
  '/favicon.svg'
];

// Install event - precache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Precaching essential resources');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Skip API calls (let them go to network)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/functions/')) {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              // Serve from cache
              console.log('Serving from cache:', request.url);
              return cachedResponse;
            }
            
            // Not in cache, fetch from network
            return fetch(request)
              .then((networkResponse) => {
                // Cache successful responses
                if (networkResponse.status === 200) {
                  console.log('Caching new resource:', request.url);
                  cache.put(request, networkResponse.clone());
                }
                return networkResponse;
              })
              .catch(() => {
                // Network failed, try to serve offline page for navigation requests
                if (request.mode === 'navigate') {
                  return cache.match(OFFLINE_URL);
                }
                
                // For other requests, return a generic offline response
                return new Response(
                  JSON.stringify({
                    error: 'Offline',
                    message: 'You are currently offline'
                  }),
                  {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                      'Content-Type': 'application/json'
                    })
                  }
                );
              });
          });
      })
  );
});

// Background sync for future enhancement
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Could sync draft posts, comments, etc.
  }
});

// Push notifications for future enhancement
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log('Push notification received:', data);
    
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      data: data.url,
      actions: [
        {
          action: 'open',
          title: 'Read Post'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

// Share target handling (for sharing to the PWA)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHARE_TARGET') {
    // Handle shared content
    console.log('Share target received:', event.data);
  }
});