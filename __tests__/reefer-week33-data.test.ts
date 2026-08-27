import { describe, expect, it } from 'vitest';

import reeferWeek32 from '@/data/reefer_week32.json';
import reeferWeek33 from '@/data/reefer_week33.json';

const parseMt = (value: string) => Number.parseFloat(value.replaceAll(',', ''));

const sumDeliveries = (row: (typeof reeferWeek33)[number]) =>
  Object.entries(row.deliveries).reduce((sum, [key, value]) => {
    if (key === 'OTHER' || key === 'SHIP' || value === '') return sum;
    return sum + parseMt(value);
  }, 0);

describe('TTA 2026년 33주차 운반선 이동표 이력', () => {
  it('방콕항 6척과 보고서 기재 접안일을 보존한다', () => {
    expect(reeferWeek33.map((row) => row.carrier)).toEqual([
      'SEA STAR V',
      'SEIN PRINCESS',
      'SEIN VENUS',
      'HENG HONG 9',
      'PACIFIC JOURNEY',
      'HIKARI 1',
    ]);
    expect(reeferWeek33.map((row) => row.date)).toEqual([
      '31.07.26',
      '03.08.26',
      '06.08.26',
      '06.08.26',
      '13.08.26',
      '19.08.26',
    ]);
  });

  it('HIKARI 1의 공장 배분과 부두를 원문 그대로 보존한다', () => {
    expect(reeferWeek33.at(-1)).toMatchObject({
      carrier: 'HIKARI 1',
      deliveries: {
        ASIAN: '404',
        CMC: '405',
        GB: '130',
        GPZ: '500',
        ISA: '790',
        MMP: '300',
        RMK: '100',
        TUM: '300',
        OTHER: '33B',
      },
    });
  });

  it('선박별 배분 합계와 22,890.273 MT 전체 합계를 검산한다', () => {
    expect(reeferWeek33.map((row) => sumDeliveries(row))).toEqual([
      3_951.273,
      4_940,
      3_275,
      5_555,
      2_240,
      2_929,
    ]);
    expect(reeferWeek33.reduce((sum, row) => sum + sumDeliveries(row), 0))
      .toBeCloseTo(22_890.273, 3);
  });

  it('32·33주차 스냅샷을 서로 덮어쓰지 않고 보존한다', () => {
    expect(reeferWeek32).toHaveLength(6);
    expect(reeferWeek32[0].carrier).toBe('LAKE PEARL');
    expect(reeferWeek33).toHaveLength(6);
    expect(reeferWeek33.every((row) => row.status === '주간 보고 기록')).toBe(true);
    expect(reeferWeek33.every((row) => row.daysRemaining === null)).toBe(true);
    expect(reeferWeek33.every((row) => row.priority === '이력')).toBe(true);
  });
});
