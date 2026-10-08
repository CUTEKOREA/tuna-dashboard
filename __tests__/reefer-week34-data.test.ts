import { describe, expect, it } from 'vitest';

import reeferWeek33 from '@/data/reefer_week33.json';
import reeferWeek34 from '@/data/reefer_week34.json';

const parseMt = (value: string) => Number.parseFloat(value.replaceAll(',', ''));

const sumDeliveries = (row: (typeof reeferWeek34)[number]) =>
  Object.entries(row.deliveries).reduce((sum, [key, value]) => {
    if (key === 'OTHER' || key === 'SHIP' || value === '') return sum;
    return sum + parseMt(value);
  }, 0);

describe('TTA 2026년 34주차 운반선 이동표 이력', () => {
  it('기존 6척에 PATSORN을 추가한 7척 접안 기록을 보존한다', () => {
    expect(reeferWeek34.map((row) => row.carrier)).toEqual([
      'SEA STAR V',
      'SEIN PRINCESS',
      'SEIN VENUS',
      'HENG HONG 9',
      'PACIFIC JOURNEY',
      'HIKARI 1',
      'PATSORN',
    ]);
    expect(reeferWeek34.map((row) => row.date)).toEqual([
      '31.07.26',
      '03.08.26',
      '06.08.26',
      '06.08.26',
      '13.08.26',
      '19.08.26',
      '25.08.26',
    ]);
  });

  it('PATSORN의 세 공장 배분과 SAMUTSAKORN 기재를 원문 그대로 보존한다', () => {
    expect(reeferWeek34.at(-1)).toMatchObject({
      carrier: 'PATSORN',
      deliveries: {
        MMP: '1,000.646',
        TUM: '770.788',
        UC: '553.245',
        OTHER: 'SAMUTSAKORN',
      },
    });
  });

  it('선박별 배분과 25,214.952MT 전체 합계를 독립 검산한다', () => {
    expect(reeferWeek34.map((row) => sumDeliveries(row))).toEqual([
      3_951.273,
      4_940,
      3_275,
      5_555,
      2_240,
      2_929,
      2_324.679,
    ]);
    expect(reeferWeek34.reduce((sum, row) => sum + sumDeliveries(row), 0))
      .toBeCloseTo(25_214.952, 3);
  });

  it('33주차 이력을 보존하고 34주차 행도 보고 시점 자료로 표기한다', () => {
    expect(reeferWeek33).toHaveLength(6);
    expect(reeferWeek34.every((row) => row.status === '주간 보고 기록')).toBe(true);
    expect(reeferWeek34.every((row) => row.daysRemaining === null)).toBe(true);
    expect(reeferWeek34.every((row) => row.priority === '이력')).toBe(true);
  });
});
