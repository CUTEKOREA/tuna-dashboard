import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ReeferMovement from '@/components/ReeferMovement';

describe('ReeferMovement', () => {
  it('renders the latest TTA week 33 period and reconciled Bangkok total', () => {
    const html = renderToStaticMarkup(createElement(ReeferMovement));

    expect(html).toContain('33주차 주간 보고');
    expect(html).toContain('2026-08-14 ~ 08-20');
    expect(html).toContain('6척 · 공장 배분 22,890.273 MT');
    expect(html).toContain('HIKARI 1');
    expect(html).toContain('2,929');
    expect(html).toContain('33B');
    expect(html).toContain('SEA STAR V');
    expect(html).toContain('3,951.273');
    expect(html).toContain('PACIFIC JOURNEY');
    expect(html).toContain('2,240');
    expect(html).toContain('SEIN VENUS');
    expect(html).toContain('790');
    expect(html).toContain('2,136.8');
  });
});
