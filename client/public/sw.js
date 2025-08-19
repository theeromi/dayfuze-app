// Service Worker for push notifications and caching
const CACHE_NAME = 'dayfuse-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install service worker and cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Fetch from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
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