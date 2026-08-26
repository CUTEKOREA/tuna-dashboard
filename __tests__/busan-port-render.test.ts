import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import BusanPortDashboard from '@/components/BusanPortDashboard';
import { getBusanPortData } from '@/lib/data/busan-port';

describe('부산 입출항 대시보드 렌더 스모크', () => {
  const html = renderToStaticMarkup(createElement(BusanPortDashboard));
  const data = getBusanPortData();

  it('히어로와 4개 위젯이 크래시 없이 렌더된다', () => {
    expect(html).toContain('부산 입출항선 동향');
    expect(html).toContain('이번 주 변화');
    expect(html).toContain('월별 입출항 추이');
    expect(html).toContain('업종별 평균 체류일');
    expect(html).toContain('입출항 타임라인');
  });

  it('기준일과 정직 텔레메트리(SYNCED)가 표기된다 (L-09)', () => {
    expect(html).toContain(data.asof);
    expect(html).not.toMatch(/status[^>]*LIVE/);
  });

  it('타임라인에 최신 연도 어기 행이 전부 렌더된다', () => {
    for (const run of data.timeline.slice(0, 5)) {
      expect(html).toContain(run.ship);
    }
    expect(html).toContain(`어기 ${data.timeline.length}건`);
  });

  it('선장 실명 계열 문자열이 화면에 없다 (개인정보 최소화)', () => {
    expect(html).not.toContain('prev_capt');
    expect(html).not.toContain('선장명');
  });

  it('앰대시가 화면 출력에 없다 (2026-08-26 사용자 지시)', () => {
    expect(html).not.toContain('\u2014');
  });
});
