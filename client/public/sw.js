// Service Worker for push notifications and caching
const CACHE_NAME = 'dayfuse-v2';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-72x72.svg',
  '/icon-192x192.svg',
  '/icon-512x512.svg'
];

// Install service worker and cache resources
self.addEventListener('install', event => {
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.warn('Cache install failed:', err))
  );
});

// Activate and clean up old caches
self.addEventListener('activate', event => {
  // Claim all clients immediately
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Notify all clients about the update
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SW_UPDATED',
        message: 'DayFuse has been updated! Refresh to get the latest features.'
      });
    });
  });
});

// Fetch strategy: Network first, then cache
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Only cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cache, return offline page or error
            return new Response(
              JSON.stringify({ error: 'Offline - please check your connection' }),
              { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
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