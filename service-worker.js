// Stickies Service Worker
// Version: v1.0.2
// Handles offline caching and detects new Stickies HTML versions.

// All apps share one GitHub Pages origin (and one Cache Storage),
// so every cache this app owns starts with this prefix.
const CACHE_PREFIX = "stickies-cache-";
const CACHE_NAME = CACHE_PREFIX + "v1.0.2";

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
          // Only delete OLD caches that belong to Stickies.
          // Never touch caches of the other apps on this origin.
          .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME)
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
// HELPERS
// ============================================================

// Look up a request ONLY in Stickies' own cache.
// (caches.match() would search every cache on the shared origin.)
function ownCacheMatch(request) {
  return caches.open(CACHE_NAME)
    .then((cache) => cache.match(request, { ignoreSearch: true }));
}

// Always resolve with a real Response (never undefined), so the
// page can never go blank when the network fails.
function offlineFallback(cachedResponse, isShell) {
  if (cachedResponse) {
    return cachedResponse;
  }

  const failure = () => new Response(
    "Offline and nothing cached yet. Please reload.",
    { status: 503, headers: { "Content-Type": "text/plain" } }
  );

  if (!isShell) {
    return failure();
  }

  return ownCacheMatch("./index.html")
    .then((shell) => shell || failure());
}

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
    ownCacheMatch(event.request)
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
            .catch(() => offlineFallback(cachedResponse, true));
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
          })
          .catch(() => offlineFallback(null, false));
      })
  );
});
