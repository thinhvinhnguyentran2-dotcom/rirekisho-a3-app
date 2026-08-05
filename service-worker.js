const CACHE_NAME = 'rirekisho-a3-v2.8.6';
const ASSETS = [
  './',
  './index.html',
  './styles.css?v=2.8.6',
  './app.js?v=2.8.6',
  './i18n.js?v=2.8.6',
  './manifest.json',
  './privacy.html',
  './terms.html',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

const OPTIONAL_ASSETS = [
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        await cache.addAll(ASSETS);
        await Promise.allSettled(OPTIONAL_ASSETS.map(asset => cache.add(asset)));
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    if (!OPTIONAL_ASSETS.includes(event.request.url)) return;
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      }))
    );
    return;
  }

  // Network first: GitHub/localhost更新後に古いJSやCSSを表示し続けない。
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        throw new Error('Offline asset not found');
      })
  );
});
