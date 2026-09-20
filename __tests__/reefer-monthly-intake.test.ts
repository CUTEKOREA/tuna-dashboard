import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ReeferMonthlyIntakeChart } from '@/components/LogisticsDashboard';
import { reeferMonthlyIntake, recentReeferMonths } from '@/lib/data/reefer-monthly-intake';

describe('운반선 주간표 → 월별 방콕 반입량', () => {
  it('선박·일자 중복을 한 번만 세고 배분처 아닌 열은 뺀다', () => {
    const byMonth = Object.fromEntries(reeferMonthlyIntake.months.map((row) => [row.month, row]));

    /* 같은 배가 여러 주차에 반복 보고된다 - 중복을 세면 9월이 두 배 가까이 부푼다.
     * 아래 값은 보유 주차(19·22·24·26·27·29~37)에서 나온 하한이다. */
    expect(byMonth['2026-07'].mt).toBeCloseTo(20_434, 0);
    expect(byMonth['2026-08'].mt).toBeCloseTo(24_696, 0);
    expect(byMonth['2026-09'].mt).toBeCloseTo(19_564, 0);
    expect(byMonth['2026-09'].vessels).toBe(5);
    // 5~6월은 주차를 더 갖고 있어 두 배 이상이다 - 감소 방향이 자료 밖 사정이 아니라는 근거
    expect(byMonth['2026-05'].mt).toBeGreaterThan(50_000);
    expect(byMonth['2026-06'].mt).toBeGreaterThan(50_000);

    // 월은 오름차순이고 'YYYY-MM' 이다
    const months = reeferMonthlyIntake.months.map((row) => row.month);
    expect([...months].sort()).toEqual(months);
    for (const month of months) expect(month).toMatch(/^20\d{2}-\d{2}$/);
  });

  it('보유 주차가 띄엄띄엄이라는 사실을 계약이 들고 있다', () => {
    expect(reeferMonthlyIntake.weeksHeld).toEqual([19, 22, 24, 26, 27, 29, 30, 31, 32, 33, 34, 35, 36, 37]);
    expect(recentReeferMonths(3).map((row) => row.month)).toEqual(['2026-07', '2026-08', '2026-09']);
  });

  it('제3자 추정을 맞추지 않고 나란히 싣는다', () => {
    const estimate = reeferMonthlyIntake.thirdPartyEstimate;

    expect(estimate.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(estimate.months.map((row) => row.mt)).toEqual([15_000, 30_000, 20_000]);
    expect(estimate.months.at(-1)!.qualifier).toBe('미만');
    // 우리 집계가 추정보다 낮은 달이 있어도 값을 끌어 맞추지 않는다
    const ours = Object.fromEntries(reeferMonthlyIntake.months.map((row) => [row.month, row.mt]));
    expect(ours['2026-08']).toBeLessThan(30_000);
    expect(ours['2026-09']).toBeLessThan(20_000);
  });

  it('물류 화면이 월별 반입 카드를 렌더한다', () => {
    // 대시보드 본체는 첫 렌더가 로딩 스켈레톤이라 카드 본문을 직접 그린다
    const markup = renderToStaticMarkup(React.createElement(ReeferMonthlyIntakeChart));

    expect(markup).toContain('19,564');
    expect(markup).toContain('보유 주차');
    expect(markup).toContain('스페인 선사 자체 추산');
    // 추산은 우리 값과 나란히 보인다 - 9월은 «미만» 이라는 단서까지
    expect(markup).toContain('추산 20,000미만');

    const source = readFileSync(join(process.cwd(), 'components/LogisticsDashboard.tsx'), 'utf8');
    expect(source).toContain('title="월별 방콕 반입량"');
    // 카드 문장은 계약에서 파생한다 - 손으로 적으면 다음 주차에 표만 갈린다
    expect(source).not.toMatch(/situation: `\d[\d,]*MT/);
  });
});
