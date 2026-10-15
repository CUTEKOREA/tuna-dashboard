import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import History from '../components/cosmo/tabs/HistoryTab';
import Production from '../components/cosmo/tabs/ProductionTab';
import Quality from '../components/cosmo/tabs/QualityTab';
import { latest, meta, yoy } from '../lib/data/cosmo';

/* 2026-10-15: 「2025 vs 2026 - 같은 1~41주 구간」 표가 2025년 전체(가동 49주)와 2026년(가동 40주)을
 * 단순 주간 평균으로 대고 있었다. 머리글 「2026 (40주)」가 40주차처럼 읽혔고, 표 값(121.1 MT/일)이
 * 바로 아래 문단(124.7 MT/일)과 달랐다. */
describe('코스모 주차 표기', () => {
  it('장기 추이 비교표는 제목과 같은 1~N주 구간을 쓰고 문단과 같은 값을 낸다', () => {
    const markup = renderToStaticMarkup(React.createElement(History));
    expect(yoy.upTo).toBe(latest.week);
    expect(markup).toContain(`2025 (1~${yoy.upTo}주 · 가동 ${yoy.sampleWeeks2025}주)`);
    expect(markup).toContain(`2026 (1~${yoy.upTo}주 · 가동 ${yoy.sampleWeeks2026}주)`);
    expect(markup).not.toMatch(/2026 \(\d+주\)/);
    const daily = (v: number) => `${v.toFixed(1)} MT/일`;
    // 표와 문단이 같은 일처리량을 말한다
    expect(markup.split(daily(yoy.daily2025)).length - 1).toBeGreaterThanOrEqual(2);
    expect(markup.split(daily(yoy.daily2026)).length - 1).toBeGreaterThanOrEqual(2);
  });

  it('생산 탭 가동주 칸은 주차가 아니라 가동 주 수로 읽힌다', () => {
    const markup = renderToStaticMarkup(React.createElement(Production));
    expect(markup).toContain(`가동 ${yoy.sampleWeeks2026}주 / `);
  });

  it('빠진 주차가 없을 때 앞말이 빈 문장을 내지 않는다', () => {
    const markup = renderToStaticMarkup(React.createElement(Quality)).replace(/<[^>]+>/g, '');
    if (meta.missingWeeks.length === 0) {
      expect(markup).toContain('빠진 주차는 없습니다.');
      expect(markup).not.toMatch(/(^|[^\d])주차는 목록에 없습니다/);
      expect(markup).not.toMatch(/(^|[^\d,])주차는 원본이 없어/);
    }
  });
});
