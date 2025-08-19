// Service Worker for push notifications and caching
const CACHE_NAME = 'dayfuse-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-72x72.svg',
  '/icon-192x192.svg',
  '/icon-512x512.svg'
];

// Update state management
let updateWaiting = false;
let updateClients = [];

// Install service worker and cache resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing new version');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        updateWaiting = true;
        // Force immediate activation for PWA updates
        self.skipWaiting();
      })
      .catch(err => {
        console.error('Service Worker: Cache install failed:', err);
        // Don't block installation on cache failures
      })
  );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating new version');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim()
    ]).then(() => {
      console.log('Service Worker: Activation complete');
      
      // Notify clients about available update (don't force immediate refresh)
      return self.clients.matchAll();
    }).then(clients => {
      updateClients = clients;
      
      // Only show update prompt if there are active clients and update is available
      if (clients.length > 0 && updateWaiting) {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATE_AVAILABLE',
            message: 'A new version of DayFuse is available! Update when ready.',
            canUpdate: true
          });
        });
        updateWaiting = false;
      }
    })
  );
});

// Fetch strategy: Network first for HTML, cache first for assets
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For HTML documents, always try network first to avoid white screen
  if (event.request.destination === 'document' || event.request.url.endsWith('/') || event.request.url.includes('.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            // Update cache with fresh content
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          }
          throw new Error('Network response not ok');
        })
        .catch(() => {
          // Fallback to cache only if network fails
          return caches.match(event.request)
            .then(cachedResponse => cachedResponse || caches.match('/'))
            .then(fallbackResponse => {
              if (fallbackResponse) {
                return fallbackResponse;
              }
              // Last resort: return a basic HTML response
              return new Response(`
                <!DOCTYPE html>
                <html>
                  <head><title>DayFuse - Loading...</title></head>
                  <body><div id="root">Loading DayFuse...</div></body>
                </html>
              `, { 
                headers: { 'Content-Type': 'text/html' } 
              });
            });
        })
    );
    return;
  }

  // For other resources, use cache first
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(fetchResponse => {
          if (fetchResponse && fetchResponse.ok) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return fetchResponse;
        });
      })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Task reminder from DayFuse',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'complete',
        title: 'Mark Complete',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'snooze',
        title: 'Snooze 10min',
        icon: '/icons/snooze.png'
      }
    ]
  };

  const promiseChain = self.registration.showNotification(
    'DayFuse Reminder',
    options
  );

  event.waitUntil(promiseChain);
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'complete') {
    // Handle task completion
    event.waitUntil(
      clients.openWindow('/dashboard?action=complete&task=' + event.notification.data.taskId)
    );
  } else if (event.action === 'snooze') {
    // Handle snooze
    event.waitUntil(
      clients.openWindow('/dashboard?action=snooze&task=' + event.notification.data.taskId)
    );
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Handle messages from main thread
self.addEventListener('message', event => {
  console.log('Service Worker: Received message', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // Client requested immediate update
    console.log('Service Worker: Applying immediate update');
    self.skipWaiting();
    
    // Notify all clients that update is being applied
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'SW_UPDATING',
          message: 'Applying update...'
        });
      });
    });
  }
  
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // Client is checking for updates
    event.ports[0].postMessage({
      hasUpdate: updateWaiting,
      cacheVersion: CACHE_NAME
    });
  }
});