import { describe, expect, it } from 'vitest';

import { getMiscData } from '@/lib/data/misc';

const week31 = getMiscData('reeferWeek31');

function deliveryTotal(row: (typeof week31)[number]) {
  return Object.entries(row.deliveries)
    .filter(([destination]) => destination !== 'OTHER' && destination !== 'SHIP')
    .reduce((total, [, amount]) => total + Number(amount.replace(/,/g, '')), 0);
}

describe('TTA 2026 week 31 reefer movement', () => {
  it('preserves the four Bangkok carrier rows and reported wharves', () => {
    expect(week31.map(({ carrier, date, deliveries }) => ({
      carrier,
      date,
      wharf: deliveries.OTHER,
    }))).toEqual([
      { carrier: 'LAKE PEARL', date: '20.07.26', wharf: '11B' },
      { carrier: 'SEIN PRINCESS', date: '03.08.26', wharf: '33' },
      { carrier: 'SEIN VENUS', date: '06.08.26', wharf: '41' },
      { carrier: 'HENG HONG 9', date: '06.08.26', wharf: '23' },
    ]);
  });

  it('reconciles each carrier allocation with the workbook totals', () => {
    expect(week31.map((row) => deliveryTotal(row))).toEqual([
      4873.026,
      4940,
      3275,
      5555,
    ]);
  });

  it('keeps every factory allocation in its source workbook column', () => {
    expect(week31.map(({ deliveries }) => deliveries)).toEqual([
      {
        AEC: '696',
        ISA: '470',
        PTY: '197',
        RMK: '200',
        SEAP: '900',
        TUG: '750',
        TUM: '750',
        UC: '910.026',
        OTHER: '11B',
      },
      {
        AEC: '500',
        GPZ: '683',
        ISA: '410',
        RMK: '500',
        SIF: '300',
        SPA: '622',
        TUM: '261',
        UC: '1,664',
        OTHER: '33',
      },
      {
        GB: '143',
        GPZ: '925',
        ISA: '760',
        MMP: '400',
        PTY: '100',
        TUM: '947',
        OTHER: '41',
      },
      {
        CMC: '487',
        GB: '2,136.8',
        GPZ: '943.2',
        PTY: '533',
        RMK: '579',
        UC: '876',
        OTHER: '23',
      },
    ]);
  });

  it('reconciles the Bangkok allocation grand total', () => {
    const grandTotal = week31.reduce(
      (total, row) => total + deliveryTotal(row),
      0,
    );

    expect(grandTotal).toBeCloseTo(18643.026, 3);
  });
});
