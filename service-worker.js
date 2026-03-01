// Service Worker for Vineet Kishore Portfolio
// Enables offline functionality and caching

const CACHE_NAME = 'vineet-portfolio-v1.1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/core/css/style.css',
  '/core/css/mobile-design.css',
  '/core/css/blog.css',
  '/core/js/app.js',
  '/core/js/portfolio-enhancements.js',
  '/core/js/blog-post.js',
  '/core/js/blog.js',
  '/core/js/latest-articles.js',
  '/core/js/terminal-enhanced.js',
  '/articles/blog.html',
  '/articles/blog-post.html',
  '/Vineet Kishore Resume.pdf'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => {
        console.error('[SW] Cache failed:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip analytics and external resources
  if (request.url.includes('analytics') ||
    request.url.includes('google') ||
    request.url.includes('cdnjs') ||
    request.url.includes('fonts')) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          // Update cache in background
          fetch(request)
            .then((fetchResponse) => {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, fetchResponse.clone());
              });
            })
            .catch(() => { });

          return response;
        }

        // Otherwise fetch from network
        return fetch(request)
          .then((fetchResponse) => {
            // Don't cache non-successful responses
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Clone and cache the response
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });

            return fetchResponse;
          })
          .catch(() => {
            // Return offline fallback for HTML requests
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html').then((response) => {
                return response || caches.match('/index.html');
              });
            }
          });
      })
  );
});

// Background sync for form submissions (if you add a contact form later)
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form') {
    event.waitUntil(
      // Retry sending form data
      console.log('[SW] Background sync triggered')
    );
  }
});

// Push notifications (if you want to add them later)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/core/assets/icon-192x192.png',
    badge: '/core/assets/icon-72x72.png',
    vibrate: [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification('Vineet Kishore', options)
  );
});
