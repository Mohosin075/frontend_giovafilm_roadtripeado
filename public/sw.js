// Service Worker for Roadtripeado Desktop Push Notifications
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Handle incoming Web Push (if sent via Web Push protocol)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: event.data.text() };
    }
  }

  const title = data.title || 'Roadtripeado';
  const options = {
    body: data.body || 'You have a new update.',
    icon: data.icon || '/logo.png',
    badge: '/favicon.ico',
    tag: data.tag || 'roadtripeado-notification',
    data: data.data || { url: '/notifications' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click to focus or open the browser tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
