// Enhanced Service Worker for push notifications and anti-blank screen caching
const CACHE_NAME = 'dayfuse-v7-offline-notifications';
const FALLBACK_HTML_URL = '/index.html';

// IndexedDB for offline notifications
let db = null;
const DB_NAME = 'DayFuseNotifications';
const DB_VERSION = 1;
const STORE_NAME = 'notifications';

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

// Initialize IndexedDB for offline notifications
async function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('taskId', 'taskId', { unique: false });
        store.createIndex('dueTime', 'dueTime', { unique: false });
        store.createIndex('scheduled', 'scheduled', { unique: false });
      }
    };
  });
}

// Check and schedule pending notifications from IndexedDB
async function schedulePendingNotifications() {
  if (!db) await initDB();
  
  try {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('scheduled');
    const request = index.getAll(IDBKeyRange.only(false)); // Get unscheduled notifications
    
    request.onsuccess = () => {
      const notifications = request.result.filter(n => 
        !n.completed && n.dueTime > Date.now()
      );
      
      notifications.forEach(async (notification) => {
        const delay = notification.dueTime - Date.now();
        if (delay > 0) {
          setTimeout(() => {
            showStoredNotification(notification);
          }, delay);
          
          // Mark as scheduled
          const updateTransaction = db.transaction([STORE_NAME], 'readwrite');
          const updateStore = updateTransaction.objectStore(STORE_NAME);
          notification.scheduled = true;
          updateStore.put(notification);
        }
      });
    };
  } catch (error) {
    console.error('Error scheduling pending notifications:', error);
  }
}

// Show notification from stored data
function showStoredNotification(notification) {
  const options = {
    body: notification.body || 'Task reminder',
    icon: '/icon-192x192.svg',
    badge: '/icon-72x72.svg',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      taskId: notification.taskId,
      url: `/tasks?task=${notification.taskId}`,
      dateOfArrival: Date.now()
    },
    actions: [
      {
        action: 'complete',
        title: '✓ Complete',
        icon: '/icon-72x72.svg'
      },
      {
        action: 'snooze',
        title: '⏰ Snooze 10min',
        icon: '/icon-72x72.svg'
      },
      {
        action: 'view',
        title: '👁 View',
        icon: '/icon-72x72.svg'
      }
    ],
    requireInteraction: true,
    silent: false,
    renotify: true,
    tag: `task-${notification.taskId}`
  };
  
  self.registration.showNotification(notification.title, options);
}

// Install service worker and cache resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing new version');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME)
        .then(cache => {
          console.log('Service Worker: Caching app shell');
          return cache.addAll(urlsToCache);
        }),
      initDB().then(() => {
        console.log('Service Worker: IndexedDB initialized');
        return schedulePendingNotifications();
      })
    ])
      .then(() => {
        console.log('Service Worker: Installation complete');
        updateWaiting = true;
        // Force immediate activation for PWA updates
        self.skipWaiting();
      })
      .catch(err => {
        console.error('Service Worker: Installation failed:', err);
        // Don't block installation on failures
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
      // Initialize database and schedule pending notifications
      initDB().then(() => {
        console.log('Service Worker: Database initialized on activation');
        return schedulePendingNotifications();
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

// Enhanced push notification handler for real server-sent push notifications
self.addEventListener('push', event => {
  console.log('Push event received:', event);
  
  let data = {};
  let title = 'DayFuse Reminder';
  let body = 'You have a task reminder';
  
  if (event.data) {
    try {
      data = event.data.json();
      title = data.title || title;
      body = data.body || body;
      console.log('Push notification data:', data);
    } catch (e) {
      console.warn('Failed to parse push data as JSON:', e);
      body = event.data.text() || body;
    }
  }

  const options = {
    body: body,
    icon: data.icon || '/dayfuse-logo-192.png',
    badge: data.badge || '/dayfuse-logo-192.png',
    image: data.image,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      taskId: data.data?.taskId || data.taskId || 'unknown',
      notificationId: data.data?.notificationId,
      dateOfArrival: Date.now(),
      url: data.data?.url || data.url || '/dashboard',
      originalData: data.data || {}
    },
    actions: data.actions || [
      {
        action: 'complete',
        title: '✓ Complete',
        icon: '/dayfuse-logo-192.png'
      },
      {
        action: 'snooze',
        title: '⏰ Snooze 10min',
        icon: '/dayfuse-logo-192.png'
      },
      {
        action: 'view',
        title: '👁 View Task',
        icon: '/dayfuse-logo-192.png'
      }
    ],
    requireInteraction: true, // Android will keep notification until user acts
    silent: false,
    renotify: true,
    tag: data.data?.taskId || data.taskId || 'dayfuse-reminder'
  };

  const promiseChain = self.registration.showNotification(title, options);
  event.waitUntil(promiseChain);
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'complete') {
    // Mark task as completed in offline storage
    event.waitUntil((async () => {
      if (!db) await initDB();
      
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('taskId');
      const request = index.openCursor(IDBKeyRange.only(event.notification.data.taskId));
      
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          const notification = cursor.value;
          notification.completed = true;
          cursor.update(notification);
          cursor.continue();
        }
      };
      
      // Open app with completion action
      return self.clients.openWindow('/dashboard?action=complete&task=' + event.notification.data.taskId);
    })());
  } else if (event.action === 'snooze') {
    // Handle snooze by creating new notification 10 minutes later
    event.waitUntil((async () => {
      if (!db) await initDB();
      
      const newNotification = {
        id: `snooze_${event.notification.data.taskId}_${Date.now()}`,
        taskId: event.notification.data.taskId,
        title: event.notification.title,
        body: event.notification.body + ' (Snoozed)',
        dueTime: Date.now() + (10 * 60 * 1000), // 10 minutes from now
        scheduled: false,
        completed: false,
        createdAt: Date.now()
      };
      
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.put(newNotification);
      
      // Schedule the snoozed notification
      setTimeout(() => {
        showStoredNotification(newNotification);
      }, 10 * 60 * 1000);
      
      return self.clients.openWindow('/dashboard?action=snooze&task=' + event.notification.data.taskId);
    })());
  } else {
    // Default action - open app
    event.waitUntil(
      self.clients.openWindow('/dashboard')
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
  
  // Handle native push notification requests
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, taskId, url } = event.data.payload;
    
    const options = {
      body: body,
      icon: '/icon-192x192.svg',
      badge: '/icon-72x72.svg', 
      vibrate: [200, 100, 200, 100, 200],
      data: {
        taskId: taskId,
        url: url,
        dateOfArrival: Date.now()
      },
      actions: [
        {
          action: 'complete',
          title: '✓ Complete',
          icon: '/icon-72x72.svg'
        },
        {
          action: 'snooze', 
          title: '⏰ Snooze 10min',
          icon: '/icon-72x72.svg'
        },
        {
          action: 'view',
          title: '👁 View',
          icon: '/icon-72x72.svg'
        }
      ],
      requireInteraction: true,
      silent: false,
      renotify: true,
      tag: `task-${taskId}`
    };
    
    self.registration.showNotification(title, options);
  }
  
  // Handle test notification requests from Android devices
  if (event.data && event.data.type === 'SHOW_TEST_NOTIFICATION') {
    const options = {
      body: 'Notifications are working correctly! This test was sent via service worker for better Android compatibility.',
      icon: '/icon-192x192.svg',
      badge: '/icon-72x72.svg',
      vibrate: [200, 100, 200],
      data: {
        testNotification: true,
        dateOfArrival: Date.now()
      },
      requireInteraction: false,
      silent: false,
      tag: 'test-notification'
    };
    
    self.registration.showNotification('DayFuse Test Notification', options);
  }
  
  // Handle offline notification storage
  if (event.data && event.data.type === 'STORE_NOTIFICATION') {
    event.waitUntil((async () => {
      if (!db) await initDB();
      
      const { notification } = event.data;
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      try {
        store.put(notification);
        console.log('Notification stored for offline scheduling:', notification.id);
        
        // Schedule if due time is in the future
        const delay = notification.dueTime - Date.now();
        if (delay > 0) {
          setTimeout(() => {
            showStoredNotification(notification);
          }, delay);
          
          // Mark as scheduled
          notification.scheduled = true;
          store.put(notification);
        }
      } catch (error) {
        console.error('Error storing notification:', error);
      }
    })());
  }
});