// Service Worker for Prime Cuts Butcher House Push Notifications

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { title: "🥩 Prime Cuts Butcher House", body: event.data.text() };
    }
  } else {
    data = { title: "🥩 Prime Cuts Butcher House", body: "You have a new meat order update!" };
  }

  const title = data.title || "🥩 Prime Cuts Butcher House";
  const body = data.body || "You have a new update.";
  const origin = self.location.origin;

  // Fully resolve absolute URLs for icon and badge so mobile Android/iOS notification center loads them reliably
  const icon = data.icon
    ? (data.icon.startsWith("http") ? data.icon : `${origin}${data.icon.startsWith("/") ? "" : "/"}${data.icon}`)
    : `${origin}/icon-192x192.png`;

  const badge = data.badge
    ? (data.badge.startsWith("http") ? data.badge : `${origin}${data.badge.startsWith("/") ? "" : "/"}${data.badge}`)
    : `${origin}/favicon-circle.png`;

  const url = data.url || "/";
  const tag = data.tag || `prime-cuts-${Date.now()}`;

  const notificationOptions = {
    body,
    icon,
    badge,
    data: { url },
    vibrate: [250, 100, 250, 100, 250],
    tag,
    renotify: true,
    requireInteraction: false, // Critical: must be false on mobile so notification stays in device notification center!
    silent: false,
    timestamp: Date.now(),
    actions: [
      { action: "open_app", title: "View Update" }
    ],
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
