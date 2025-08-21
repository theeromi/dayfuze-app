// Enhanced Service Worker for push notifications and anti-blank screen caching
const CACHE_NAME = 'dayfuse-v6-stable';
const FALLBACK_HTML_URL = '/index.html';

// Critical resources that prevent blank screens
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-72x72.svg',
  '/icon-192x192.svg',
  '/icon-512x512.svg'
];

// Runtime cache names
const RUNTIME_CACHE = 'dayfuse-runtime-v6';
const HTML_CACHE = 'dayfuse-html-v6';

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

  // Enhanced HTML document handling with better blank screen prevention
  if (event.request.destination === 'document' || event.request.url.endsWith('/') || event.request.url.includes('.html')) {
    event.respondWith(
      // Race between network and timeout to prevent hanging
      Promise.race([
        fetch(event.request),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 2000)
        )
      ])
        .then(response => {
          // Validate response thoroughly
          if (response && response.ok && response.status < 400) {
            const responseClone = response.clone();
            
            // Cache successful responses
            caches.open(HTML_CACHE).then(cache => {
              cache.put(event.request, responseClone);
            }).catch(err => console.warn('HTML cache failed:', err));
            
            return response;
          }
          throw new Error(`Invalid response: ${response?.status}`);
        })
        .catch((error) => {
          console.log('Network failed, trying cache fallback:', error.message);
          
          // Enhanced fallback strategy
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                console.log('Serving cached HTML:', event.request.url);
                return cachedResponse;
              }
              
              // Try different fallback routes for SPA
              const fallbackUrls = ['/', '/index.html', FALLBACK_HTML_URL];
              return fallbackUrls.reduce((promise, url) => {
                return promise.then(response => {
                  if (response) return response;
                  return caches.match(url);
                });
              }, Promise.resolve(null));
            })
            .then(fallbackResponse => {
              if (fallbackResponse) {
                console.log('Serving fallback HTML for:', event.request.url);
                return fallbackResponse;
              }
              
              // Ultimate fallback with loading state
              console.log('No cache available, serving minimal HTML');
              return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DayFuse - Loading...</title>
  <style>
    body { 
      font-family: system-ui, sans-serif; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      margin: 0;
      background: #f5f5f5;
    }
    .loading { 
      text-align: center; 
      color: #5B7FFF;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #5B7FFF;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading">
    <div class="spinner"></div>
    <h2>DayFuse</h2>
    <p>Loading your productivity app...</p>
    <script>
      // Try to reload after a moment in case network comes back
      setTimeout(() => window.location.reload(), 3000);
    </script>
  </div>
</body>
</html>`, { 
                headers: { 'Content-Type': 'text/html; charset=utf-8' } 
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