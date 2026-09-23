// Stickies - service worker
// Precaches the app shell so it works fully offline after the first visit.
// A newly published service worker waits until the user explicitly chooses
// "Update" from the Stickies update notification.

const CACHE_VERSION = 'stickies-cache-v1.0.0';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './privacy.html',
  './pwa-192x192.png',
  './pwa-512x512.png',
  './pwa-maskable-512x512.png',
  './apple-touch-icon.png',
  './favicon.png'
];


// ------------------------------------------------------------
// INSTALL
// ------------------------------------------------------------
// IMPORTANT:
// Do NOT call self.skipWaiting() here.
//
// This allows the new service worker to remain in the "waiting"
// state. Stickies/index.html can detect that waiting worker and
// show:
//
//   New version available
//   Later | Update
//
// Only after the user chooses Update do we receive SKIP_WAITING.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
  );
});


// ------------------------------------------------------------
// ACTIVATE
// ------------------------------------------------------------
// Remove caches belonging to older Stickies versions and then
// take control of the application.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});


// ------------------------------------------------------------
// UPDATE CONTROL
// ------------------------------------------------------------
// index.html sends this message ONLY when the user clicks
// "Update" in the update notification.
self.addEventListener('message', (event) => {
  if (
    event.data &&
    event.data.type === 'SKIP_WAITING'
  ) {
    self.skipWaiting();
  }
});


// ------------------------------------------------------------
// FETCH
// ------------------------------------------------------------
// Preserve the original Stickies behavior:
//
// - Same-origin app files can be cached for offline use.
// - Cross-origin requests are never intercepted.
// - Google Drive / Google Identity / Google API requests
//   therefore continue directly to the network.
// ------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Never intercept cross-origin requests.
  // This is important for Google Drive and Google Identity/API calls.
  if (!isSameOrigin) {
    return;
  }

  event.respondWith(
    caches.match(req)
      .then((cached) => {

        // Existing cached app-shell/resource.
        if (cached) {
          return cached;
        }

        // Not cached yet — get it from the network and cache it.
        return fetch(req)
          .then((res) => {

            if (!res || res.status !== 200) {
              return res;
            }

            const resClone = res.clone();

            caches.open(CACHE_VERSION)
              .then((cache) => {
                cache.put(req, resClone);
              });

            return res;
          })
          .catch(() => {
            // If the requested page cannot be fetched while offline,
            // fall back to the main Stickies application.
            return caches.match('./index.html');
          });
      })
  );
});