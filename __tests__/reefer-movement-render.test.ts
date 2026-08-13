import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ReeferMovement from '@/components/ReeferMovement';

describe('ReeferMovement', () => {
  it('renders the latest TTA week 32 period and reconciled Bangkok total', () => {
    const html = renderToStaticMarkup(createElement(ReeferMovement));

    expect(html).toContain('32주차 주간 보고');
    expect(html).toContain('2026-08-07 ~ 08-13');
    expect(html).toContain('6척 · 공장 배분 24,834.299 MT');
    expect(html).toContain('SEA STAR V');
    expect(html).toContain('3,951.273');
    expect(html).toContain('PACIFIC JOURNEY');
    expect(html).toContain('2,240');
    expect(html).toContain('SEIN VENUS');
    expect(html).toContain('910.026');
    expect(html).toContain('2,136.8');
  });
});
