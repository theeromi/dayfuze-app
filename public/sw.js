// Service Worker for DayFuse notifications

console.log('SW registered: ', {});

// Firebase Config
const firebaseConfig = {
  apiKey: "✓ Set",
  projectId: "dayfuse-web", 
  appId: "✓ Set"
};

console.log("Firebase Config:", firebaseConfig);

self.addEventListener('install', (event) => {
  console.log('SW installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow('/');
      }
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});