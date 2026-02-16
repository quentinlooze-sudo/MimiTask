/* ==============================================
   MimiTask — Service Worker
   Cache-first assets, network-first données
   ============================================== */

const CACHE_NAME = 'mimitask-v9';

const STATIC_ASSETS = [
  './',
  './index.html',
  './css/variables.css',
  './css/reset.css',
  './css/base.css',
  './css/components.css',
  './css/onboarding.css',
  './css/tasks.css',
  './css/task-accordion.css',
  './css/dashboard.css',
  './css/rewards.css',
  './css/settings.css',
  './css/delegation.css',
  './css/mascot-customizer.css',
  './css/notifications.css',
  './css/polish.css',
  './js/app.js',
  './js/store.js',
  './js/store-firestore.js',
  './js/auth.js',
  './js/utils.js',
  './js/tasks.js',
  './js/task-renderer.js',
  './js/dashboard.js',
  './js/points.js',
  './js/rewards.js',
  './js/onboarding.js',
  './js/delegation.js',
  './js/mascot.js',
  './js/mascot-customizer.js',
  './js/sync.js',
  './js/sync-indicator.js',
  './js/notifications.js',
  './data/default-tasks.json',
  './data/default-rewards.json',
  './data/mascot-phrases.json',
  './data/ux-copy.json',
  './assets/mascot/mimi-excited.svg',
  './assets/mascot/mimi-happy.svg',
  './assets/mascot/mimi-neutral.svg',
  './assets/mascot/mimi-worried.svg',
  './assets/mascot/mimi-sad.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './manifest.json'
];

/* Pré-cache des assets statiques à l'installation */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* Nettoyage des anciens caches à l'activation */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Stratégie de fetch */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Google Fonts : stale-while-revalidate
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          const fetched = fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          }).catch(() => cached);
          return cached || fetched;
        })
      )
    );
    return;
  }

  // Assets locaux : cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Fallback offline minimal
      if (event.request.destination === 'document') {
        return new Response(
          '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MimiTask — Hors ligne</title><style>body{font-family:Nunito,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#FAFAFA;color:#1A1A1A;text-align:center}h1{font-size:1.5rem}p{color:#6B7280}</style></head><body><div><h1>Hors ligne</h1><p>MimiTask n\'est pas disponible pour le moment. Vérifiez votre connexion.</p></div></body></html>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      }
    })
  );
});
