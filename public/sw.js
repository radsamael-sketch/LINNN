const CACHE = 'lingo-studio-shell-v3';
const CORE = ['/', '/lingo.html', '/lingo-redesign.css', '/lingo-redesign.js', '/lingo-content-hub.css', '/lingo-content-hub.js', '/manifest.webmanifest', '/icons/icon-192.svg', '/icons/icon-512.svg', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(fetch(req).then(response => { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(req, copy)); return response; }).catch(() => caches.match(req).then(hit => hit || caches.match('/'))));
    return;
  }
  event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(response => { if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(req, copy)); } return response; })));
});
