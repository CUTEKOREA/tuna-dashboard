import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ReeferMovement from '@/components/ReeferMovement';

describe('ReeferMovement', () => {
  it('renders the latest TTA week 35 period and reconciled Bangkok total', () => {
    const html = renderToStaticMarkup(createElement(ReeferMovement));

    expect(html).toContain('35주차 주간 보고');
    expect(html).toContain('2026-08-28 ~ 09-03');
    expect(html).toContain('6척 · 공장 배분 21,176.679 MT');
    expect(html).toContain('PATSORN');
    expect(html).toContain('2,324.679');
    expect(html).toContain('1,000.646');
    expect(html).toContain('SAMUTSAKORN');
    // 35주차 신규 접안 3척
    expect(html).toContain('ZHONG YU MARINE');
    expect(html).toContain('1,396');
    expect(html).toContain('FONG KUO NO.818');
    expect(html).toContain('SEITA MARU');
    expect(html).toContain('PACIFIC JOURNEY');
    expect(html).toContain('2,240');
    // 34주차에만 있던 선박은 더 이상 화면에 없다
    expect(html).not.toContain('HIKARI 1');
    expect(html).not.toContain('SEA STAR V');
    expect(html).toContain('SEIN VENUS');
    expect(html).toContain('947');
    expect(html).toContain('925');
  });
});
