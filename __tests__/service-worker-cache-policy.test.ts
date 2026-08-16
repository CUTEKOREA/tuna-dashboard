import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

type WorkerEvent = {
  request?: Request;
  respondWith?: (response: Promise<Response> | Response) => void;
  waitUntil: (work: Promise<unknown>) => void;
};

function loadServiceWorker() {
  const source = readFileSync(join(process.cwd(), 'public/sw.js'), 'utf8');
  const handlers = new Map<string, (event: WorkerEvent) => void>();
  const cachedUrls: string[] = [];
  const deletedCaches: string[] = [];
  const cache = {
    addAll: vi.fn(async () => undefined),
    put: vi.fn(async (request: Request) => {
      cachedUrls.push(request.url);
    }),
    delete: vi.fn(async () => true),
  };
  const caches = {
    open: vi.fn(async () => cache),
    keys: vi.fn(async () => [
      'static-v1-2026-05-22',
      'runtime-v1-2026-05-22',
      'api-v1-2026-05-22',
    ]),
    delete: vi.fn(async (name: string) => {
      deletedCaches.push(name);
      return true;
    }),
    match: vi.fn(async () => undefined),
  };
  const fetchMock = vi.fn(async () => new Response('{}', {
    status: 200,
    headers: { 'Cache-Control': 'public, max-age=60' },
  }));
  const selfMock = {
    location: { origin: 'https://dashboard.example' },
    clients: { claim: vi.fn(async () => undefined) },
    skipWaiting: vi.fn(async () => undefined),
    addEventListener: (type: string, handler: (event: WorkerEvent) => void) => {
      handlers.set(type, handler);
    },
  };

  runInNewContext(source, {
    self: selfMock,
    caches,
    fetch: fetchMock,
    URL,
    Request,
    Response,
    Promise,
  });

  async function dispatchFetch(pathname: string, mode: RequestMode = 'cors') {
    const waits: Promise<unknown>[] = [];
    let responsePromise: Promise<Response> | undefined;
    let dispatching = true;
    handlers.get('fetch')?.({
      request: {
        method: 'GET',
        mode,
        url: `https://dashboard.example${pathname}`,
      } as Request,
      respondWith: (response) => {
        responsePromise = Promise.resolve(response);
      },
      waitUntil: (work) => {
        if (!dispatching) throw new Error('waitUntil must be called during event dispatch');
        waits.push(Promise.resolve(work));
      },
    });
    dispatching = false;
    expect(responsePromise).toBeDefined();
    const response = await responsePromise;
    expect(response).toBeInstanceOf(Response);
    await Promise.all(waits);
    await Promise.resolve();
    await Promise.resolve();
  }

  async function dispatchActivate() {
    const waits: Promise<unknown>[] = [];
    handlers.get('activate')?.({
      waitUntil: (work) => waits.push(Promise.resolve(work)),
    });
    await Promise.all(waits);
  }

  return { cachedUrls, deletedCaches, dispatchActivate, dispatchFetch, fetchMock };
}

describe('service worker API cache policy', () => {
  it.each(['/api/operation-access', '/api/atuna-prices', '/api/mail/status'])(
    '%s는 네트워크 응답만 사용하고 캐시에 저장하지 않는다',
    async (pathname) => {
      const worker = loadServiceWorker();

      await worker.dispatchFetch(pathname);

      expect(worker.fetchMock).toHaveBeenCalledOnce();
      expect(worker.cachedUrls).toEqual([]);
    },
  );

  it('보호된 JSON과 HTML 화면도 캐시하지 않는다', async () => {
    const worker = loadServiceWorker();

    await worker.dispatchFetch('/data/unloading-db.json');
    await worker.dispatchFetch('/unloading', 'navigate');

    expect(worker.fetchMock).toHaveBeenCalledTimes(2);
    expect(worker.cachedUrls).toEqual([]);
  });

  it('새 서비스워커 활성화 시 과거 API 캐시 버전을 삭제한다', async () => {
    const worker = loadServiceWorker();

    await worker.dispatchActivate();

    expect(worker.deletedCaches).toContain('api-v1-2026-05-22');
    expect(worker.deletedCaches).toContain('runtime-v1-2026-05-22');
  });

  it('실행용 정적 자산만 새 정적 캐시에 저장한다', async () => {
    const worker = loadServiceWorker();

    await worker.dispatchFetch('/_next/static/chunks/app.js');

    expect(worker.fetchMock).toHaveBeenCalledOnce();
    expect(worker.cachedUrls).toEqual([]);
  });
});
