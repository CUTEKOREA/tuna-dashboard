import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ReeferMovement from '@/components/ReeferMovement';

describe('ReeferMovement', () => {
  it('renders the latest TTA week 34 period and reconciled Bangkok total', () => {
    const html = renderToStaticMarkup(createElement(ReeferMovement));

    expect(html).toContain('34주차 주간 보고');
    expect(html).toContain('2026-08-21 ~ 08-27');
    expect(html).toContain('7척 · 공장 배분 25,214.952 MT');
    expect(html).toContain('PATSORN');
    expect(html).toContain('2,324.679');
    expect(html).toContain('1,000.646');
    expect(html).toContain('SAMUTSAKORN');
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
