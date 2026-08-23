// Bump this on every deploy so the browser detects a byte diff and installs
// a new worker. That new-worker install is what drives the update banner in
// index.html — nothing else about this file needs to change.
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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_ASSETS))
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

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
