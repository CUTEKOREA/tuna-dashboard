import { describe, expect, it } from 'vitest';

import reeferWeek34 from '@/data/reefer_week34.json';
import { reeferWeeklyReport } from '@/lib/data/reefer-weekly';

const parseMt = (value: string) => Number.parseFloat(value.replaceAll(',', ''));

const sumDeliveries = (row: (typeof reeferWeeklyReport.rows)[number]) =>
  Object.entries(row.deliveries).reduce((sum, [key, value]) => {
    if (key === 'OTHER' || key === 'SHIP' || value === '') return sum;
    return sum + parseMt(value);
  }, 0);

describe('TTA 2026년 35주차 운반선 이동표', () => {
  it('35주차 원본과 보고기간을 최신 계약으로 고정한다', () => {
    expect(reeferWeeklyReport.source).toEqual({
      file: 'Reefer ship movement for week 35th.xlsx',
      sha256: '6740bc3c393589978f4642a289d15c73443e81a47f039dacef0712181fba1564',
      week: 35,
      startDate: '2026-08-28',
      endDate: '2026-09-03',
    });
  });

  it('34주차에서 4척이 빠지고 3척이 새로 들어온 6척 접안 기록을 보존한다', () => {
    expect(reeferWeeklyReport.rows.map((row) => row.carrier)).toEqual([
      'SEIN VENUS',
      'PACIFIC JOURNEY',
      'PATSORN',
      'SEITA MARU',
      'FONG KUO NO.818',
      'ZHONG YU MARINE',
    ]);
    expect(reeferWeeklyReport.rows.map((row) => row.date)).toEqual([
      '06.08.26',
      '13.08.26',
      '25.08.26',
      '29.08.26',
      '01.09.26',
      '02.09.26',
    ]);
  });

  it('신규 ZHONG YU MARINE의 배분과 원문 기재를 그대로 보존한다', () => {
    expect(reeferWeeklyReport.rows.at(-1)).toMatchObject({
      carrier: 'ZHONG YU MARINE',
      deliveries: {
        UC: '1,396',
        RS: '869',
        PTY: '606',
        MMP: '574',
        OTHER: '23',
      },
    });
  });

  it('선박별 배분과 21,176.679MT 전체 합계를 독립 검산한다', () => {
    expect(reeferWeeklyReport.rows.map((row) => sumDeliveries(row))).toEqual([
      3_275,
      2_240,
      2_324.679,
      3_432,
      4_880,
      5_025,
    ]);
    expect(reeferWeeklyReport.rows.reduce((sum, row) => sum + sumDeliveries(row), 0))
      .toBeCloseTo(21_176.679, 3);
  });

  it('34주차 이력을 보존하고 최신 행은 보고 시점 자료로 표기한다', () => {
    expect(reeferWeek34).toHaveLength(7);
    expect(reeferWeeklyReport.rows.every((row) => row.status === '주간 보고 기록')).toBe(true);
    expect(reeferWeeklyReport.rows.every((row) => row.daysRemaining === null)).toBe(true);
    expect(reeferWeeklyReport.rows.every((row) => row.priority === '이력')).toBe(true);
  });
});
