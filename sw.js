// Service Worker لدايركت
const CACHE = 'direct-v3';
const ASSETS = ['./', './index.html', './logo.png', './manifest.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      return cached || fetch(e.request).then((res) => {
        return caches.open(CACHE).then((c) => {
          if (e.request.url.startsWith('http')) c.put(e.request, res.clone());
          return res;
        });
      }).catch(() => cached);
    })
  );
});

// إشعارات Push (اختياري مع FCM)
self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'دايركت', {
      body: data.body || 'لديك إشعار جديد',
      icon: './logo.png',
      badge: './logo.png',
      data: data.url || './'
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data || './'));
});
