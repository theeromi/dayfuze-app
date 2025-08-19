// DayFuse Service Worker for Push Notifications

const CACHE_NAME = 'dayfuse-v1';
const urlsToCache = [
  '/',
  '/icon-192x192.svg',
  '/icon-72x72.svg'
];

// Install service worker and cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate service worker
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

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  
  console.log('Notification clicked:', { action, tag: notification.tag });
  
  if (action === 'complete') {
    // Handle task completion
    console.log('Mark task as complete:', notification.data);
  } else if (action === 'snooze') {
    // Handle snooze action
    console.log('Snooze task:', notification.data);
  } else {
    // Default click - open the app
    clients.openWindow('/');
  }
  
  notification.close();
});

// Handle push events (for future use with Firebase Cloud Messaging)
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.svg',
    badge: '/icon-72x72.svg',
    data: data.data || {},
    actions: [
      {
        action: 'complete',
        title: 'Mark Complete'
      },
      {
        action: 'snooze',
        title: 'Snooze 10min'
      }
    ],
    requireInteraction: true,
    tag: data.tag || 'default'
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'DayFuse', options)
  );
});