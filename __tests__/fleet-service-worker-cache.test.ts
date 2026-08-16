import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('fleet private API service-worker boundary', () => {
  it('모든 동일 출처 요청을 network-only로 처리해 선단 API도 저장하지 않는다', () => {
    const source = readFileSync(join(process.cwd(), 'public/sw.js'), 'utf8');

    expect(source).toContain('event.respondWith(fetch(request))');
    expect(source).not.toContain('caches.open(');
    expect(source).not.toContain('caches.match(');
    expect(source).not.toContain('.put(');
    expect(source).toMatch(/const VERSION = 'v4-[^']+'/);
  });
});
