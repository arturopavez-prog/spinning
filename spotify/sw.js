/* Spinning · Spotify: guarda solo la pantalla para abrir sin conexión.
   No intercepta Spotify, Firebase, YouTube ni ningún otro servicio externo. */
const CACHE = 'spinning-spotify-v2';
const CORE = ['./', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('spinning-spotify-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      if (r.ok && !url.search) { const copy = r.clone(); caches.open(CACHE).then(c => c.put('./', copy)).catch(() => {}); }
      return r;
    }).catch(async () => (await caches.match('./')) || Response.error()));
    return;
  }
  if (CORE.some(p => url.pathname.endsWith(p.replace('./', '/')) && p !== './')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
  }
});
