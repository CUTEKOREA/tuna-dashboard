import { describe, expect, it } from 'vitest';

import reeferWeek38 from '@/data/reefer_week38.json';
import { reeferWeeklyReport } from '@/lib/data/reefer-weekly';

const parseMt = (value: string) => Number.parseFloat(value.replaceAll(',', ''));

/* deliveries.OTHER 는 하역처가 아니라 원문 REMARK(부두)다 — 「41/ASIMAR」·「21A」처럼
 * 숫자가 아닌 값이 들어온다. 화면도 이 칸을 「부두」로 렌더하고 합계에서 뺀다. */
const sumDeliveries = (row: (typeof reeferWeeklyReport.rows)[number]) =>
  Object.entries(row.deliveries).reduce((sum, [key, value]) => {
    if (key === 'OTHER' || key === 'SHIP' || value === '') return sum;
    return sum + parseMt(value);
  }, 0);

describe('TTA 2026년 39주차 운반선 이동표', () => {
  it('39주차 원본과 보고기간을 최신 계약으로 고정한다', () => {
    expect(reeferWeeklyReport.source).toEqual({
      file: 'Reefer ship movement for week 39th.xlsx',
      sha256: '33952c4f9401b12b566772fbe3721cd3f6bc0b4db794075221a3323a8f03ee3d',
      week: 39,
      startDate: '2026-09-25',
      endDate: '2026-10-01',
    });
  });

  it('38주차 5척에서 4척이 빠지고 CHERRY STAR 가 붙은 2척이다', () => {
    expect(reeferWeeklyReport.rows.map((row) => row.carrier)).toEqual(['RYOMA', 'CHERRY STAR']);
    expect(reeferWeeklyReport.rows.map((row) => row.date)).toEqual(['22.09.26', '28.09.26']);
    /* 표는 접안 중인 배만 남긴다 - 하역을 마친 배는 다음 주 표에서 빠진다. */
    const previous = new Set(reeferWeek38.map((row) => row.carrier));
    const current = new Set(reeferWeeklyReport.rows.map((row) => row.carrier));
    expect([...previous].filter((name) => !current.has(name)))
      .toEqual(['SEITA MARU', 'FONG KUO NO.818', 'FONG KUO NO.819', 'SEIN GALAXY']);
    expect([...current].filter((name) => !previous.has(name))).toEqual(['CHERRY STAR']);
  });

  it('신규 CHERRY STAR 의 배분과 원문 기재를 그대로 보존한다', () => {
    /* 9/28 접안분이다 — 방콕 주간보고(9/30 정정본) 입항표의 CHERRY STAR(ITOCHU) 3,415 MT 와 같다. */
    expect(reeferWeeklyReport.rows.at(-1)).toMatchObject({
      carrier: 'CHERRY STAR',
      date: '28.09.26',
      deliveries: {
        CMC: '500',
        GPZ: '373',
        ISA: '430',
        SPA: '1,000',
        TUM: '530',
        UC: '582',
        OTHER: '33',   // 부두 - 하역량이 아니다
      },
    });
  });

  it('선박별 배분과 6,705MT 전체 합계를 독립 검산한다', () => {
    // 원문 TOTAL 열(AI)과 행 합산이 2척 모두 일치한다
    expect(reeferWeeklyReport.rows.map((row) => sumDeliveries(row))).toEqual([3_290, 3_415]);
    expect(reeferWeeklyReport.rows.reduce((sum, row) => sum + sumDeliveries(row), 0))
      .toBeCloseTo(6_705, 3);
  });

  it('38주차 이력을 보존하고 최신 행은 보고 시점 자료로 표기한다', () => {
    expect(reeferWeek38).toHaveLength(5);
    expect(reeferWeeklyReport.rows.every((row) => row.status === '주간 보고 기록')).toBe(true);
    expect(reeferWeeklyReport.rows.every((row) => row.daysRemaining === null)).toBe(true);
    expect(reeferWeeklyReport.rows.every((row) => row.priority === '이력')).toBe(true);
  });
});
