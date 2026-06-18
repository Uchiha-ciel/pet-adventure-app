// sw.js — Service Worker (offline-first)
const CACHE = 'pet-adventure-v1';
const ASSETS = [
  '/',
  'index.html',
  'css/style.css',
  'js/db.js',
  'js/pet.js',
  'js/stats.js',
  'js/budget.js',
  'js/adventure.js',
  'js/app.js',
  'data/categories.json',
  'data/pets.json',
  'data/themes.json',
  'manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => cached || new Response('Offline', { status: 503 }))
    )
  );
});
