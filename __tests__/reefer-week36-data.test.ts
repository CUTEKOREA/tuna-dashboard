import { describe, expect, it } from 'vitest';

import reeferWeek35 from '@/data/reefer_week35.json';
import { reeferWeeklyReport } from '@/lib/data/reefer-weekly';

const parseMt = (value: string) => Number.parseFloat(value.replaceAll(',', ''));

/* deliveries.OTHER 는 하역처가 아니라 원문 REMARK(부두)다 — 「41/ASIMAR」·「11B」처럼
 * 숫자가 아닌 값이 들어온다. 화면도 이 칸을 「부두」로 렌더하고 합계에서 뺀다.
 * 합산할 때 빼지 않으면 숫자 아닌 값에서 NaN 이 나거나(2026-09-10 실측)
 * 「23」 같은 선석 번호가 하역량으로 더해진다. */
const sumDeliveries = (row: (typeof reeferWeeklyReport.rows)[number]) =>
  Object.entries(row.deliveries).reduce((sum, [key, value]) => {
    if (key === 'OTHER' || key === 'SHIP' || value === '') return sum;
    return sum + parseMt(value);
  }, 0);

describe('TTA 2026년 36주차 운반선 이동표', () => {
  it('36주차 원본과 보고기간을 최신 계약으로 고정한다', () => {
    expect(reeferWeeklyReport.source).toEqual({
      file: 'Reefer ship movement for week 36th.xlsx',
      sha256: '9ffeb58f7279df8f2e03e95e197227f4d43b4ab9c8c74a45f1f3062ae9095d5f',
      week: 36,
      startDate: '2026-09-04',
      endDate: '2026-09-10',
    });
  });

  it('35주차에서 2척이 빠지고 1척이 새로 들어온 5척 접안 기록을 보존한다', () => {
    expect(reeferWeeklyReport.rows.map((row) => row.carrier)).toEqual([
      'SEIN VENUS',
      'SEITA MARU',
      'FONG KUO NO.818',
      'ZHONG YU MARINE',
      'SEIN QUEEN',
    ]);
    expect(reeferWeeklyReport.rows.map((row) => row.date)).toEqual([
      '06.08.26',
      '29.08.26',
      '01.09.26',
      '02.09.26',
      '04.09.26',
    ]);
    // 35주차에 있던 PACIFIC JOURNEY·PATSORN 이 빠졌다
    const previous = new Set(reeferWeek35.map((row) => row.carrier));
    const current = new Set(reeferWeeklyReport.rows.map((row) => row.carrier));
    expect([...previous].filter((name) => !current.has(name)).sort())
      .toEqual(['PACIFIC JOURNEY', 'PATSORN']);
    expect([...current].filter((name) => !previous.has(name))).toEqual(['SEIN QUEEN']);
  });

  it('신규 SEIN QUEEN의 배분과 원문 기재를 그대로 보존한다', () => {
    expect(reeferWeeklyReport.rows.at(-1)).toMatchObject({
      carrier: 'SEIN QUEEN',
      date: '04.09.26',
      deliveries: {
        TUM: '892',
        CMC: '545',
        GPZ: '544',
        SPA: '480',
        RMK: '250',
        TUG: '145',
        GB: '46',
        OTHER: '11B',   // 부두 - 하역량이 아니다
      },
    });
  });

  it('선박별 배분과 19,514MT 전체 합계를 독립 검산한다', () => {
    // 원문 TOTAL 열(AI)과 행 합산이 5척 전부 일치한다
    expect(reeferWeeklyReport.rows.map((row) => sumDeliveries(row))).toEqual([
      3_275,
      3_432,
      4_880,
      5_025,
      2_902,
    ]);
    expect(reeferWeeklyReport.rows.reduce((sum, row) => sum + sumDeliveries(row), 0))
      .toBeCloseTo(19_514, 3);
  });

  it('35주차 이력을 보존하고 최신 행은 보고 시점 자료로 표기한다', () => {
    expect(reeferWeek35).toHaveLength(6);
    expect(reeferWeeklyReport.rows.every((row) => row.status === '주간 보고 기록')).toBe(true);
    expect(reeferWeeklyReport.rows.every((row) => row.daysRemaining === null)).toBe(true);
    expect(reeferWeeklyReport.rows.every((row) => row.priority === '이력')).toBe(true);
  });
});
