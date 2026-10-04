// Service Worker for Prime Cuts Butcher House Push Notifications

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: "Prime Cuts Butcher House", body: event.data.text() };
  }

  const title = data.title || "Prime Cuts 🥩";
  const body = data.body || "You have a new update.";
  const icon = data.icon || "/icon-192x192.png";
  const badge = data.badge || "/icon-192x192.png";
  const url = data.url || "/";
  const tag = data.tag || `prime-cuts-${Date.now()}`;

  const notificationOptions = {
    body,
    icon,
    badge,
    data: { url },
    vibrate: [200, 100, 200, 100, 200],
    tag,
    renotify: true,
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, notificationOptions)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open, focus it and navigate
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if (client.navigate) {
            return client.navigate(urlToOpen);
          }
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
