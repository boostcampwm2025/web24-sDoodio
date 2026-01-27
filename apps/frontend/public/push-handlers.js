/* eslint-env serviceworker */
/* global globalThis */

globalThis.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Push received';
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(globalThis.registration.showNotification(title, options));
});

globalThis.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data.url || '/';

  event.waitUntil(
    (async () => {
      const windowClients = await globalThis.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      const matchingClient = windowClients.find(
        (client) => client.url === url && 'focus' in client,
      );
      if (matchingClient && 'focus' in matchingClient) return matchingClient.focus();

      if (globalThis.clients.openWindow) return globalThis.clients.openWindow(url);
      return undefined;
    })(),
  );
});
