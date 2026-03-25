const CACHE = 'hisaabai-v5';
const ASSETS = [
  '/hisaabai/',
  '/hisaabai/index.html',
  '/hisaabai/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      fetch(e.request).then(r => {
        const rc = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, rc));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        if (!r || r.status !== 200 || r.type !== 'basic') return r;
        const rc = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, rc));
        return r;
      });
    })
  );
});
