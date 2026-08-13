import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ReeferMovement from '@/components/ReeferMovement';

describe('ReeferMovement', () => {
  it('renders the latest TTA week 31 period and reconciled Bangkok total', () => {
    const html = renderToStaticMarkup(createElement(ReeferMovement));

    expect(html).toContain('31주차 주간 보고');
    expect(html).toContain('2026-07-31 ~ 08-06');
    expect(html).toContain('4척 · 공장 배분 18,643.026 MT');
    expect(html).toContain('SEIN VENUS');
    expect(html).toContain('910.026');
    expect(html).toContain('2,136.8');
  });
});
