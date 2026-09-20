import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import HeroMarketCommand from '@/components/HeroMarketCommand';
import { HomeTab as BangkokHomeTab } from '@/components/bangkok/tabs/HomeTab';
import type { AtunaPriceRow } from '@/lib/data/atuna-price-summary';
import {
  skjPriceContext,
  skjPriceHighMark,
  skjPriceHighMarkLabel,
} from '@/lib/data/skj-price-context';

const rows = JSON.parse(
  readFileSync(join(process.cwd(), 'data/atuna_prices.json'), 'utf8'),
) as AtunaPriceRow[];

describe('SKJ 방콕 어가 맥락', () => {
  it('「몇 년 만의 수준인가」를 계열에서 파생한다', () => {
    const mark = skjPriceHighMark(rows)!;

    // 2026-09-15 $2,200 이상이었던 직전 고시는 2017-10-26 $2,275 다
    expect(mark).toMatchObject({ price: 2_200, date: '2026-09-15' });
    expect(mark.previous).toEqual({ date: '2017-10-26', price: 2_275 });
    expect(mark.monthsSince).toBe(107);
    expect(skjPriceHighMarkLabel(mark)).toBe('$2,200 — 2017.10 이후 처음(8년 11개월 만)');
  });

  it('계열이 비거나 최고가를 경신하면 문장이 달라진다', () => {
    expect(skjPriceHighMark([])).toBeNull();
    expect(skjPriceHighMarkLabel(null)).toBeNull();

    const climbing: AtunaPriceRow[] = [
      { date: '2026-01-01', skj_bkk: 1_000 },
      { date: '2026-02-01', skj_bkk: 1_200 },
    ] as unknown as AtunaPriceRow[];
    const mark = skjPriceHighMark(climbing)!;
    expect(mark.previous).toBeNull();
    expect(skjPriceHighMarkLabel(mark)).toBe('$1,200 — 계열 사상 최고');
  });

  it('업계 전제를 출처와 함께 싣고 사람 이름은 남기지 않는다', () => {
    expect(skjPriceContext.source.map((s) => s.reportDate)).toEqual(['2026-09-16', '2026-09-21']);
    for (const source of skjPriceContext.source) expect(source.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(skjPriceContext.premise.map((p) => p.label)).toContain('엘니뇨 전제');
    // 화면의 계절 기준선은 9→12월 하락인데 업계는 2027년 2월까지 강세를 전제로 산다
    expect(skjPriceContext.premise.find((p) => p.label === '엘니뇨 전제')!.detail).toContain('2027년 2월');
    expect(skjPriceContext.premise.find((p) => p.label === '캐너리 대응')!.detail).toContain('20~40%');
    expect(skjPriceContext.supplyNotes.length).toBeGreaterThanOrEqual(3);

    const text = JSON.stringify(skjPriceContext);
    expect(text).not.toMatch(/[가-힣]{2,3}\s*(과장|부장|차장|대리|사장|회장|이사|주임)/);
    expect(text).not.toContain('@');
  });

  it('시세 카드가 맥락 한 줄과 업계 전제를 렌더한다', () => {
    const markup = renderToStaticMarkup(React.createElement(HeroMarketCommand, { rows }));

    expect(markup).toContain('2017.10 이후 처음');
    expect(markup).toContain('엘니뇨 전제');
    expect(markup).toContain('2027년 2월');
    // 출처를 밝히지 않으면 화면이 «누가 그렇게 보는지» 를 말하지 못한다
    expect(markup).toContain('방콕 출장보고');
  });

  it('차트용으로 자른 창이 아니라 전 계열에서 「몇 년 만」을 잰다', () => {
    // 시장 화면 차트는 2022년 이후만 그린다 - 그 창으로 재면 2017년 고점이 사라져 «사상 최고» 가 된다
    const since2022 = rows.filter((row) => row.date >= '2022-01-01');
    expect(skjPriceHighMarkLabel(skjPriceHighMark(since2022))).toBe('$2,200 — 계열 사상 최고');
    const markup = renderToStaticMarkup(
      React.createElement(HeroMarketCommand, { rows: since2022, historyRows: rows }),
    );
    expect(markup).toContain('2017.10 이후 처음');
    expect(markup).not.toContain('사상 최고');
  });

  it('방콕 계절 기준선 캡션이 반대 전제를 함께 말한다', () => {
    const markup = renderToStaticMarkup(React.createElement(BangkokHomeTab));

    // 기준선은 9→12월 하락, 업계는 2027년 2월까지 강세 - 한쪽만 보이면 기준선이 전망으로 읽힌다
    expect(markup).toContain('예측치가 아니라 과거 계절 패턴');
    expect(markup).toContain('업계 전제는 반대다');
    expect(markup).toContain('2027년 2월');
  });
});
