self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isCardSubmit = event.request.method === "POST" && url.pathname.endsWith("/card-submit");
  if (!isCardSubmit) return;

  event.respondWith(fetch(new URL("destination.html", self.registration.scope), { cache: "no-store" }));
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => client.postMessage({ type: "autofill-test-submit" }));
    })
  );
});
