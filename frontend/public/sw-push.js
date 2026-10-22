/* FSWG admin Web Push service worker — Phase 2 desktop alerts */
self.addEventListener("push", (event) => {
  let data = { title: "FSWG Admin", body: "New alert", url: "/admin/approvals", tag: "fswg-admin-alert" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    try {
      data.body = event.data ? event.data.text() : data.body;
    } catch {
      /* ignore */
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "FSWG Admin", {
      body: data.body || "New admin alert",
      tag: data.tag || "fswg-admin-alert",
      data: { url: data.url || "/admin/approvals" },
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = (event.notification.data && event.notification.data.url) || "/admin/approvals";
  const origin = self.location.origin;
  const target = path.startsWith("http") ? path : origin + (path.startsWith("/") ? path : "/" + path);

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.startsWith(origin) && "focus" in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
