import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// Static snapshot exported by ~/my-project/kamis_ladder/export_static.py.
const html = readFileSync(path.join(__dirname, '..', 'public', 'reports', 'kamis_observatory.html'), 'utf8');

describe('KAMIS observatory static page', () => {
  it('declares its charset so a standalone open does not garble Korean', () => {
    expect(html.slice(0, 200)).toContain('<meta charset="utf-8">');
  });

  it('carries all 18 items and no API credentials', () => {
    const order = JSON.parse(html.match(/"order":(\[[^\]]*\])/)![1]) as string[];
    expect(order).toHaveLength(18);
    expect(html).not.toMatch(/p_cert_key|serviceKey/);
  });
});
