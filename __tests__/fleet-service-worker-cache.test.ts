import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('fleet private API service-worker boundary', () => {
  it('handles fleet API requests network-only before the general API cache branch', () => {
    const source = readFileSync(join(process.cwd(), 'public/sw.js'), 'utf8');
    const protectedStart = source.indexOf("url.pathname.startsWith('/api/fleet/')");
    const generalApiStart = source.indexOf("url.pathname.startsWith('/api/')");

    expect(protectedStart).toBeGreaterThan(0);
    expect(protectedStart).toBeLessThan(generalApiStart);

    const protectedBlock = source.slice(protectedStart, generalApiStart);
    expect(protectedBlock).toContain('event.respondWith(fetch(request))');
    expect(protectedBlock).toContain('return;');
    expect(protectedBlock).not.toContain('caches.open');
    expect(protectedBlock).not.toContain('caches.match');
    expect(protectedBlock).not.toContain('cache.put');
    expect(source).toMatch(/const VERSION = 'v2-[^']+'/);
  });
});
