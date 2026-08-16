const VERSION = 'v2-2026-08-16';
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;
const API_CACHE = `api-${VERSION}`;

const PRECACHE = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

const NEVER_CACHE_API_PATHS = new Set([
  '/api/operation-access',
  '/api/atuna-prices',
]);

function isApiResponseCacheable(response) {
  if (!response.ok) return false;
  const cacheControl = (response.headers.get('cache-control') || '').toLowerCase();
  return !cacheControl.includes('no-store') && !cacheControl.includes('private');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE, API_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache Next.js HMR / RSC payloads in dev
  if (url.pathname.startsWith('/_next/webpack-hmr')) return;
  if (url.search.includes('__nextDevBrowserId')) return;

  // 인증·유료 원장 API는 네트워크 응답만 사용하고 CacheStorage에 남기지 않는다.
  if (NEVER_CACHE_API_PATHS.has(url.pathname)) {
    event.respondWith(fetch(request));
    return;
  }

  // API: 공개 캐시 가능 응답만 network-first + stale fallback을 허용한다.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          let cacheWork;
          if (isApiResponseCacheable(res)) {
            const copy = res.clone();
            cacheWork = caches.open(API_CACHE).then((c) => c.put(request, copy));
          } else {
            cacheWork = caches.open(API_CACHE).then((c) => c.delete(request));
          }
          return cacheWork.catch(() => undefined).then(() => res);
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets (immutable Next.js bundles, icons, images): cache-first
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    /\.(png|jpg|jpeg|svg|gif|webp|woff2?)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached ||
        fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
      )
    );
    return;
  }

  // HTML navigation: network-first, fall back to last cached page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((c) => c || caches.match('/')))
    );
  }
});
