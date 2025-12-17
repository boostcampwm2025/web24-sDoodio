/* eslint-env serviceworker */
/* global self */
/* eslint-disable no-restricted-globals */

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Push received';
  const options = {
    body: data.body || '',
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      const matchingClient = windowClients.find(
        (client) => client.url === url && 'focus' in client,
      );
      if (matchingClient && 'focus' in matchingClient) return matchingClient.focus();

      if (self.clients.openWindow) return self.clients.openWindow(url);
      return undefined;
    })(),
  );
});
