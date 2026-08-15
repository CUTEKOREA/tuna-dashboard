import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import PanofiDashboard, { PANOFI_TABS } from '../components/panofi/PanofiDashboard';
import {
  bep,
  dataQuality,
  fleetTotals,
  h1,
  headline,
  pfc,
  priceSeries,
  weeks,
  trade,
  tradeYear,
  tradeLadderGap,
  actuals,
  vesselFullPnl,
  marginRankShift,
  catchBySpecies,
  monthlySeries,
  liquidity,
  liquidityBridge,
} from '../lib/data/panofi';
import { DASHBOARD_MENU_CONFIGS, SIDEBAR_SECTIONS } from '../lib/dashboard-registry';

const weeklyRaw = JSON.parse(
  readFileSync(join(process.cwd(), 'public/data/panofi/panofi_weekly.json'), 'utf8'),
) as {
  meta: { weekCount: number; rangeStart: string; rangeEnd: string };
  weeks: Array<{ reportDate: string; prices: { pfcTema: number | null } }>;
};

const profileRaw = JSON.parse(
  readFileSync(join(process.cwd(), 'public/data/panofi/panofi_profile.json'), 'utf8'),
) as {
  fleet: { activeCount: number; purseSeiners: Array<{ code: string }> };
  performance: { h1_2026: { productionT: number; netKusd: number } };
};

describe('파노피 데이터 인테이크', () => {
  it('원본 JSON 을 인테이크 모듈로 그대로 통과시킨다', () => {
    expect(headline.weekCount).toBe(weeklyRaw.meta.weekCount);
    expect(headline.rangeStart).toBe(weeklyRaw.meta.rangeStart);
    expect(headline.rangeEnd).toBe(weeklyRaw.meta.rangeEnd);
    expect(weeks).toHaveLength(weeklyRaw.weeks.length);
    expect(priceSeries).toHaveLength(weeklyRaw.weeks.length);
  });

  it('주차가 보고일 오름차순으로 정렬돼 있다', () => {
    const dates = weeks.map((w) => w.reportDate);
    expect([...dates].sort()).toEqual(dates);
  });

  it('선단은 선망 7척이며 매각된 운반선은 가동 대수에서 빠진다', () => {
    expect(fleetTotals.activeCount).toBe(7);
    expect(profileRaw.fleet.purseSeiners).toHaveLength(7);
    expect(profileRaw.fleet.purseSeiners.map((v) => v.code)).not.toContain('VOLTA');
  });

  it('상반기 실적 수치가 원본과 일치한다', () => {
    expect(h1.productionT).toBe(profileRaw.performance.h1_2026.productionT);
    expect(h1.netKusd).toBe(profileRaw.performance.h1_2026.netKusd);
  });
});

describe('PFC 수요독점 판정', () => {
  it('가격 변동 횟수가 주간동향 실측과 일치한다', () => {
    const changes = (key: 'pfcTema') => {
      let count = 0;
      let prev: number | null = null;
      for (const w of weeklyRaw.weeks) {
        const v = w.prices[key];
        if (v !== null && prev !== null && v !== prev) count += 1;
        if (v !== null) prev = v;
      }
      return count;
    };
    expect(pfc.measured.priceChangeCount.PFC).toBe(changes('pfcTema'));
  });

  it('갭이 벌어진 구간의 PFC 물량이 좁은 구간보다 많다 — 수요독점 판별식', () => {
    const wide = pfc.measured.volumeTest.wideGapWeeks.avgPfcDailyT;
    const narrow = pfc.measured.volumeTest.narrowGapWeeks.avgPfcDailyT;
    expect(wide).toBeGreaterThan(narrow);
  });

  it('판정문에 근거 없는 금액 환산을 넣지 않는다', () => {
    // 채널별 판매 물량 비중이 원자료에 없다. 있는 척하면 위젯이 거짓말을 한다.
    expect(pfc.measured.caveat).toContain('물량 비중');
    expect(pfc.sourceGaps.length).toBeGreaterThan(0);
  });
});

describe('데이터 품질 표기', () => {
  it('«특이사항 없음» 주차를 결측과 구분한다', () => {
    // 결측으로 뭉개면 화면이 '자료 없음'으로 거짓말한다.
    expect(dataQuality.nominalWeeks).toBeGreaterThan(0);
    expect(dataQuality.missingWeeks).toBe(0);
    expect(dataQuality.nominalWeeks + weeks.filter((w) => w.fleetStatus === 'detailed').length)
      .toBe(weeks.length);
  });

  it('원문 일자 오타 주차를 숨기지 않고 노출한다', () => {
    expect(dataQuality.statedYearMismatch.length).toBeGreaterThan(0);
  });
});

describe('가나 참치 무역 통계', () => {
  it('(연도·흐름·HS·상대국) 조합이 유일하다 — 중복 합산 방지', () => {
    // Comtrade 는 같은 조합을 통관절차·운송수단별로 쪼개 보내고 소계까지 섞는다.
    // 집계 행(customsCode C00 · motCode 0)만 남기지 않으면 수치가 2~3배로 부푼다.
    const keys = trade.rows.map((r) => `${r.year}|${r.flow}|${r.hs}|${r.partnerCode}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('preview 500행 상한에 걸린 조회가 없다 — 조용한 잘림 방지', () => {
    expect(trade.meta.truncatedQueries).toEqual([]);
  });

  it('상대국명이 모두 한글로 매핑돼 있다', () => {
    expect(trade.meta.unmappedPartners).toEqual([]);
    for (const r of trade.rows) expect(r.partner).not.toMatch(/^코드 \d+$/);
  });

  it('총계는 전세계 행만 쓰고 국가별 행을 더하지 않는다', () => {
    const year = tradeYear;
    const world = trade.rows
      .filter((r) => r.year === year && r.flow === '수출' && r.partnerCode === 0)
      .reduce((s, r) => s + (r.valueUsd ?? 0), 0);
    const partners = trade.rows
      .filter((r) => r.year === year && r.flow === '수출' && r.partnerCode !== 0)
      .reduce((s, r) => s + (r.valueUsd ?? 0), 0);
    // 전세계 행이 국가별 합과 같은 자릿수여야 한다. 두 배 이상 벌어지면 축이 섞인 것이다.
    expect(world).toBeGreaterThan(0);
    expect(partners / world).toBeGreaterThan(0.5);
    expect(partners / world).toBeLessThan(2);
  });

  it('가공 단계가 올라갈수록 단가가 오른다 — 밸류 사다리', () => {
    expect(tradeLadderGap).not.toBeNull();
    expect(tradeLadderGap!.cannedUsdPerT).toBeGreaterThan(tradeLadderGap!.rawUsdPerT);
    expect(tradeLadderGap!.multiple).toBeGreaterThan(2);
  });
});

describe('파노피 대시보드 렌더', () => {
  const markup = renderToStaticMarkup(React.createElement(PanofiDashboard));

  it('제목과 9개 탭을 iframe 없이 렌더한다', () => {
    expect(markup).toContain('파노피 조업 대시보드');
    expect(PANOFI_TABS).toHaveLength(9);
    for (const tab of PANOFI_TABS) expect(markup).toContain(tab.label);
    expect(markup).not.toContain('<iframe');
  });

  it('손익분기 어가와 가동 선단을 헤드라인에 노출한다', () => {
    expect(markup).toContain('손익분기 어가');
    expect(markup).toContain('가동 선망선');
    expect(bep.priceUsdPerT).toBe(1473);
  });
});

describe('메뉴 배선', () => {
  it('파노피가 코스모 바로 위에 온다', () => {
    const operation = SIDEBAR_SECTIONS.find((s) => s.section === 'operation');
    const keys = operation?.items.map((i) => i.key) ?? [];
    const panofi = keys.indexOf('panofi');
    const cosmo = keys.indexOf('cosmo');
    expect(panofi).toBeGreaterThanOrEqual(0);
    expect(cosmo).toBe(panofi + 1);
  });

  it('레지스트리에 한글 제목으로 등록된다', () => {
    const entry = DASHBOARD_MENU_CONFIGS.find((m) => m.key === 'panofi');
    expect(entry?.title).toBe('파노피');
    expect(entry?.section).toBe('operation');
  });
});

describe('추정실적 원장 (월별·척별)', () => {
  it('척별 생산량 합이 누계와 맞는다 — 열 매핑이 밀리면 여기서 걸린다', () => {
    // 실제로 한 행 밀려 전 척이 null 로 나온 적이 있다. 합계 대조가 그걸 잡았다.
    const sum = vesselFullPnl.reduce((s, v) => s + (v.productionT ?? 0), 0);
    expect(Math.round(sum)).toBe(Math.round(actuals.byVessel.totals.생산량MT!));
    expect(sum).toBeGreaterThan(0);
  });

  it('척별 세전이익 합이 누계 세전이익과 맞는다', () => {
    const sum = vesselFullPnl.reduce((s, v) => s + (v.세전이익 ?? 0), 0);
    expect(Math.abs(sum - actuals.byVessel.totals.세전이익!)).toBeLessThan(1);
  });

  it('직접마진 순위와 완전손익 순위가 다른 배가 있다', () => {
    // 둘이 항상 같다면 완전손익 표를 따로 둘 이유가 없다.
    expect(marginRankShift.some((r) => (r.shift ?? 0) !== 0)).toBe(true);
  });

  it('어종 구성이 가다랑어 우위이고 비중 합이 100% 부근이다', () => {
    expect(catchBySpecies[0].label).toBe('가다랑어');
    const total = catchBySpecies.reduce((s, c) => s + c.비중, 0);
    expect(total).toBeGreaterThan(99);
    expect(total).toBeLessThan(101);
  });

  it('월별 원장은 6개월치이고 누계와 판매량이 맞는다', () => {
    expect(monthlySeries).toHaveLength(6);
    const sum = monthlySeries.reduce((s, m) => s + (Number(m.판매량) || 0), 0);
    expect(Math.abs(sum - h1.salesT)).toBeLessThan(1);
  });
});

describe('자금유동성 (월간보고 pptx)', () => {
  it('과부족이 현금 + 매출채권 − 매입채무와 일치한다', () => {
    for (const r of liquidity.series) {
      if (r.현금 === null || r.매출채권 === null || r.매입채무 === null) continue;
      expect(r.과부족).toBeCloseTo(r.현금! + r.매출채권! - r.매입채무!, 1);
    }
  });

  it('전략보고 수치와 교차검증된다 — 연초 -799만불, 6월말 -2,082만불', () => {
    // 전략보고는 만불 단위 반올림값을 쓴다. 여기서는 천불 원값을 그대로 두고
    // 만불로 환산했을 때 보고서 값과 0.5만불 이내로 붙는지만 본다
    // (-7,985 는 -798.5만불이라 반올림 방향에 따라 -798/-799 로 갈린다).
    const start = liquidity.series.find((r) => r.asOf === '2026-01-01');
    const end = liquidity.series.find((r) => r.asOf === '2026-06-30');
    expect(start!.과부족).toBe(-7985);
    expect(end!.과부족).toBe(-20815);
    expect(Math.abs(start!.과부족! / 10 - -799)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(end!.과부족! / 10 - -2082)).toBeLessThanOrEqual(0.5);
  });

  it('회수는 성공했는데 매입채무가 더 크게 늘어 과부족이 악화됐다', () => {
    expect(liquidityBridge).not.toBeNull();
    expect(liquidityBridge!.매출채권).toBeLessThan(0); // 채권 감소 = 회수
    expect(liquidityBridge!.매입채무).toBeGreaterThan(0); // 채무 증가
    expect(liquidityBridge!.과부족).toBeLessThan(0); // 그럼에도 과부족 악화
  });

  it('보고 공백 월을 숨기지 않는다', () => {
    expect(liquidity.meta.missingMonths).toContain('3월');
    expect(liquidity.meta.missingMonths).toContain('6월');
    expect(liquidity.meta.knownDiscrepancy).toContain('44,158');
  });
});
