const VERSION = 'v4-2026-08-16-owner-auth';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 운영 수치가 포함될 수 있는 실행 청크까지 인증 경계 뒤에 있으므로 저장하지 않는다.
  event.respondWith(fetch(request));
});
