import { describe, expect, it } from 'vitest';

import reeferWeek32 from '@/data/reefer_week32.json';

const parseMt = (value: string) => Number.parseFloat(value.replaceAll(',', ''));

const sumDeliveries = (row: (typeof reeferWeek32)[number]) =>
  Object.entries(row.deliveries).reduce((sum, [key, value]) => {
    if (key === 'OTHER' || key === 'SHIP' || value === '') return sum;
    return sum + parseMt(value);
  }, 0);

describe('reefer week 32 data', () => {
  it('matches the TTA week 32 period and six Bangkok carriers', () => {
    expect(reeferWeek32).toHaveLength(6);
    expect(reeferWeek32.map((row) => row.carrier)).toEqual([
      'LAKE PEARL',
      'SEA STAR V',
      'SEIN PRINCESS',
      'SEIN VENUS',
      'HENG HONG 9',
      'PACIFIC JOURNEY',
    ]);

    expect(reeferWeek32.map((row) => row.date)).toEqual([
      '20.07.26',
      '31.07.26',
      '03.08.26',
      '06.08.26',
      '06.08.26',
      '13.08.26',
    ]);
  });

  it('preserves the two newly reported carriers and their cannery allocations', () => {
    const seaStar = reeferWeek32.find((row) => row.carrier === 'SEA STAR V');
    const pacificJourney = reeferWeek32.find((row) => row.carrier === 'PACIFIC JOURNEY');

    expect(seaStar?.deliveries).toMatchObject({
      CMC: '930',
      GB: '316.273',
      GPZ: '1,117',
      ISA: '500',
      MMP: '461',
      PTY: '165',
      TUM: '462',
      OTHER: '23',
    });
    expect(pacificJourney?.deliveries).toMatchObject({
      DIA: '470',
      GB: '50',
      MMP: '365',
      RS: '406',
      SIF: '300',
      SE: '300',
      TUM: '349',
      OTHER: '21A',
    });
  });

  it('reconciles every carrier allocation and the 24,834.299 MT grand total', () => {
    expect(reeferWeek32.map((row) => sumDeliveries(row))).toEqual([
      4873.026,
      3951.273,
      4940,
      3275,
      5555,
      2240,
    ]);

    const grandTotal = reeferWeek32.reduce((sum, row) => sum + sumDeliveries(row), 0);
    expect(grandTotal).toBeCloseTo(24834.299, 3);
  });

  it('keeps week 32 as a separate historical report from the live operations KPIs', () => {
    expect(reeferWeek32.every((row) => row.status === '주간 보고 기록')).toBe(true);
    expect(reeferWeek32.every((row) => row.daysRemaining === null)).toBe(true);
    expect(reeferWeek32.every((row) => row.priority === '이력')).toBe(true);
  });
});
