import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import HeroMarketCommand from '../components/HeroMarketCommand';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { AtunaPriceRow } from '../lib/data/atuna-price-summary';
import { skjAtunaMonthContext as c } from '../lib/data/skj-price-context';

const rows = JSON.parse(readFileSync(join(process.cwd(), 'data/atuna_prices.json'), 'utf8')) as AtunaPriceRow[];

/* 시장 동향 상단 「가다랑어 방콕」 해설은 Atuna 최근 한 달(2026-09-07~10-05) 기사만 근거로 쓴다.
 * 문장마다 근거 기사 날짜가 있어야 하고, 그 날짜의 원문 파일 해시가 출처에 남아야 한다. */
describe('가다랑어 방콕 해설 - Atuna 한 달 기사 기반', () => {
  it('출처는 Atuna 원문 날짜와 해시이고 기간 안에 있다', () => {
    expect(c.period).toEqual({ from: '2026-09-07', to: '2026-10-05' });
    expect(c.sources.length).toBeGreaterThanOrEqual(8);
    for (const s of c.sources) {
      expect(s.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(s.date >= c.period.from && s.date <= c.period.to).toBe(true);
    }
  });

  it('문장마다 근거 날짜가 있고 출처 목록에 있는 날짜다', () => {
    const dates = new Set(c.sources.map((s) => s.date));
    const items = [...c.premise, ...c.supplyNotes];
    for (const item of items) {
      expect(item.sources.length, item.text ?? item.detail).toBeGreaterThan(0);
      for (const d of item.sources) expect(dates.has(d), `${d}`).toBe(true);
    }
    expect(c.premise).toHaveLength(4);
    expect(c.supplyNotes).toHaveLength(3);
  });

  it('원문 수치를 옮긴다 - 방콕 고시 흐름, 연초 대비 53%, 역대 고점 $2,350', () => {
    const p = c.premise.find((x) => x.label === '가격 흐름')!.detail;
    for (const s of ['$2,100', '$2,200', '$2,300', '53%', '$2,350']) expect(p).toContain(s);
  });

  it('영문 단위 잔존·em dash·사람 이름 없음', () => {
    const text = JSON.stringify([c.premise, c.supplyNotes]);
    expect(text).not.toMatch(/per ton|percent/i);
    expect(text).not.toContain('—');
  });

  it('시장 동향 상단이 이 해설을 그리고 출장보고 전제를 더는 쓰지 않는다', () => {
    const markup = renderToStaticMarkup(React.createElement(HeroMarketCommand, { rows }));
    expect(markup).toContain('Atuna 기사');
    expect(markup).not.toContain('방콕 출장보고');
  });
});
