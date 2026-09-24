import { describe, expect, it } from 'vitest';

import reeferWeek37 from '@/data/reefer_week37.json';
import { reeferWeeklyReport } from '@/lib/data/reefer-weekly';

const parseMt = (value: string) => Number.parseFloat(value.replaceAll(',', ''));

/* deliveries.OTHER 는 하역처가 아니라 원문 REMARK(부두)다 — 「41/ASIMAR」·「21A」처럼
 * 숫자가 아닌 값이 들어온다. 화면도 이 칸을 「부두」로 렌더하고 합계에서 뺀다. */
const sumDeliveries = (row: (typeof reeferWeeklyReport.rows)[number]) =>
  Object.entries(row.deliveries).reduce((sum, [key, value]) => {
    if (key === 'OTHER' || key === 'SHIP' || value === '') return sum;
    return sum + parseMt(value);
  }, 0);

describe('TTA 2026년 38주차 운반선 이동표', () => {
  it('38주차 원본과 보고기간을 최신 계약으로 고정한다', () => {
    expect(reeferWeeklyReport.source).toEqual({
      file: 'Reefer ship movement for week 38th.xlsx',
      sha256: '238f288180976912ed83618dcb051148dc1057a38db5b23abd1ddfef55274d34',
      week: 38,
      startDate: '2026-09-18',
      endDate: '2026-09-24',
    });
  });

  it('37주차 7척에서 3척이 빠지고 RYOMA 가 붙은 5척이다', () => {
    expect(reeferWeeklyReport.rows.map((row) => row.carrier)).toEqual([
      'SEITA MARU',
      'FONG KUO NO.818',
      'FONG KUO NO.819',
      'SEIN GALAXY',
      'RYOMA',
    ]);
    expect(reeferWeeklyReport.rows.map((row) => row.date)).toEqual([
      '29.08.26',
      '01.09.26',
      '14.09.26',
      '17.09.26',
      '22.09.26',
    ]);
    /* 표는 접안 중인 배만 남긴다 - 하역을 마친 배는 다음 주 표에서 빠진다.
     * 37주차의 SEIN VENUS·ZHONG YU MARINE·SEIN QUEEN 이 그렇게 빠졌다. */
    const previous = new Set(reeferWeek37.map((row) => row.carrier));
    const current = new Set(reeferWeeklyReport.rows.map((row) => row.carrier));
    expect([...previous].filter((name) => !current.has(name)))
      .toEqual(['SEIN VENUS', 'ZHONG YU MARINE', 'SEIN QUEEN']);
    expect([...current].filter((name) => !previous.has(name))).toEqual(['RYOMA']);
  });

  it('신규 RYOMA 의 배분과 원문 기재를 그대로 보존한다', () => {
    /* 9/22 접안분이다 — 방콕 주간보고(9/23) 입항표의 RYOMA 3,490 MT 와 같은 배다.
     * TTA 표의 배분 합(3,290)은 그 값보다 200 MT 적다 - 표가 추적하는 하역처만 담기 때문이다. */
    expect(reeferWeeklyReport.rows.at(-1)).toMatchObject({
      carrier: 'RYOMA',
      date: '22.09.26',
      deliveries: {
        ISA: '930',
        TUG: '212',
        TUM: '1,278',
        UC: '870',
        OTHER: '23',   // 부두 - 하역량이 아니다
      },
    });
  });

  it('선박별 배분과 18,359MT 전체 합계를 독립 검산한다', () => {
    // 원문 TOTAL 열(AI)과 행 합산이 5척 전부 일치한다
    expect(reeferWeeklyReport.rows.map((row) => sumDeliveries(row))).toEqual([
      3_432,
      4_880,
      4_911,
      1_846,
      3_290,
    ]);
    expect(reeferWeeklyReport.rows.reduce((sum, row) => sum + sumDeliveries(row), 0))
      .toBeCloseTo(18_359, 3);
  });

  it('37주차 이력을 보존하고 최신 행은 보고 시점 자료로 표기한다', () => {
    expect(reeferWeek37).toHaveLength(7);
    expect(reeferWeeklyReport.rows.every((row) => row.status === '주간 보고 기록')).toBe(true);
    expect(reeferWeeklyReport.rows.every((row) => row.daysRemaining === null)).toBe(true);
    expect(reeferWeeklyReport.rows.every((row) => row.priority === '이력')).toBe(true);
  });
});
