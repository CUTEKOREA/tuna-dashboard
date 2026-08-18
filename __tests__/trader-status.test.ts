import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TraderStatus, { traderFullPeriod } from '@/components/TraderStatus';
import { HUB_ID } from '@/lib/chart-palette';
import {
  BANGKOK_TRADERS,
  TRADER_LABELS,
  aggregateTraderVolumes,
  bangkokTraderMonthly,
} from '@/lib/data/bangkok-weekly';

describe('트레이더별 반입 위젯', () => {
  it('전 기간 누계가 연도별 집계 합과 일치한다', () => {
    const yearly = aggregateTraderVolumes('yearly');
    expect(traderFullPeriod.grandMt).toBe(yearly.reduce((s, y) => s + y.totalMt, 0));
    expect(traderFullPeriod.range).toBe(
      `${bangkokTraderMonthly[0].month}~${bangkokTraderMonthly[bangkokTraderMonthly.length - 1].month}`,
    );
  });

  it('트레이더 5곳을 모두 카드로 노출한다 (몰디브 포함)', () => {
    const html = renderToStaticMarkup(React.createElement(TraderStatus));
    for (const t of BANGKOK_TRADERS) {
      expect(html).toContain(TRADER_LABELS[t]);
    }
    // 기본 뷰(연도별)의 합계 카드는 전 기간 누계와 같아야 한다
    expect(html).toContain(traderFullPeriod.grandMt.toLocaleString());
  });

  it('트레이더 색이 선단 DB 정체성 겹에서 온다', () => {
    const source = readFileSync(join(process.cwd(), 'components/TraderStatus.tsx'), 'utf8');
    expect(source).toContain('HUB_ID.bkk');
    expect(source).toContain('HUB_ID.mnt');
    expect(source).not.toContain('#509ee3');
    expect(Object.values(HUB_ID)).toContain('#3b82f6');
  });

  it('2026 누계와 기존 2026-08-05 검산값의 차이를 감춘 채 두지 않는다', () => {
    const html = renderToStaticMarkup(React.createElement(TraderStatus));
    expect(html).toContain(traderFullPeriod.total2026.toLocaleString());
    expect(html).toContain(Math.abs(traderFullPeriod.diff2026).toLocaleString());
  });
});
