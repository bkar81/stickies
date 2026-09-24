// Stickies Service Worker
// Version: v1.0.1
// Handles offline caching and detects new Stickies HTML versions.

const CACHE_NAME = "stickies-cache-v1.0.1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png"
];

// ============================================================
// INSTALL
// ============================================================

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ============================================================
// ACTIVATE
// ============================================================

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

// ============================================================
// UPDATE BUTTON SUPPORT
// ============================================================

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ============================================================
// FETCH
// ============================================================

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Do NOT intercept Google services.
  if (
    url.hostname.endsWith("googleapis.com") ||
    url.hostname.endsWith("google.com")
  ) {
    return;
  }

  // Only handle GET requests.
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {

        // ----------------------------------------------------
        // STICKIES APP SHELL
        //
        // Network first -> update cache -> return fresh HTML.
        // If offline, use the cached HTML.
        //
        // This means index.html can change without changing
        // CACHE_NAME/version numbers.
        // ----------------------------------------------------

        const isAppShell =
          url.pathname.endsWith("/index.html") ||
          url.pathname.endsWith("/") ||
          url.pathname.endsWith("/stickies");

        if (isAppShell) {
          return fetch(event.request)
            .then((networkResponse) => {
              if (
                networkResponse &&
                networkResponse.status === 200
              ) {
                const responseClone = networkResponse.clone();

                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseClone);
                  });
              }

              return networkResponse;
            })
            .catch(() => cachedResponse);
        }

        // ----------------------------------------------------
        // OTHER STICKIES RESOURCES
        // ----------------------------------------------------

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            if (
              networkResponse &&
              networkResponse.status === 200
            ) {
              const responseClone = networkResponse.clone();

              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseClone);
                });
            }

            return networkResponse;
          });
      })
  );
});
