// Any byte change to this file (or index.html/manifest.json below) makes the
// browser detect a diff and install a new worker, which self-activates and
// drives the update banner in index.html.
const CACHE_VERSION = 'bogen-score-v1';
const PRECACHE_URL = 'index.html';
const PRECACHE_ASSETS = [
  PRECACHE_URL,
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-512-maskable.png',
  'icons/apple-touch-icon.png',
];

// Activate a new version immediately instead of sitting in "waiting" for a
// postMessage handshake — that round-trip is unreliable on iOS Safari
// (backgrounded workers get killed before the message arrives), which left
// the update banner stuck forever. The page detects the takeover itself via
// the controllerchange event instead.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for navigations so a foregrounded/reopened app always tries
// to fetch the latest index.html; falls back to cache when offline.
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(PRECACHE_URL, copy));
        return response;
      })
      .catch(() => caches.match(PRECACHE_URL))
  );
});
