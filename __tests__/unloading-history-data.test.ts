import { describe, expect, it } from 'vitest';
import snapshot from '../lib/unloading-history/history_2021_2025.json';
import {
  hasPrivateTextMarker,
  UnloadingHistoryPublicResponseSchema,
} from '../lib/unloading-history/schema';

const data = UnloadingHistoryPublicResponseSchema.parse(snapshot);

describe('2021-2025 public unloading history snapshot', () => {
  it('promotes the January 2023 SEIN QUEEN workbook into the verified baseline', () => {
    expect(data.voyages.find(({ voyageId }) => voyageId === 'sein-queen-2023-01-11-bkk'))
      .toMatchObject({
        sourceYear: 2023,
        completionYear: 2023,
        displayYearBasis: 'completion_year',
        vessel: { canonicalName: 'SEIN QUEEN' },
        period: { startDate: '2023-01-11', endDate: '2023-01-31' },
        ports: [{ code: 'BKK', nameKo: '방콕' }],
        reportedMt: 5916,
        actualMt: 5828.97,
        verification: 'verified',
        kpiIncluded: true,
        yearAllocations: [{
          year: 2023,
          actualMt: 5828.97,
          method: 'completion_year',
          portCodes: ['BKK'],
        }],
        evidenceDocumentCount: 1,
      });

    expect(data.annual.find(({ year }) => year === 2023)).toMatchObject({
      verifiedActualMt: 94075.08,
      verifiedVoyageCount: 29,
      candidateVoyageCount: 29,
      unverifiedCount: 0,
    });
    expect(data.completionYearBaseline.find(({ year }) => year === 2023)).toMatchObject({
      verifiedActualMt: 89338.33,
      verifiedVoyageCount: 27,
      candidateVoyageCount: 28,
    });
  });

  it('contains 98 unique candidates with reviewed verification counts', () => {
    expect(data.voyages).toHaveLength(98);
    expect(new Set(data.voyages.map(({ voyageId }) => voyageId)).size).toBe(98);
    expect(data.meta).toMatchObject({
      candidateVoyageCount: 98,
      verifiedVoyageCount: 88,
      partialVoyageCount: 4,
      unverifiedVoyageCount: 6,
      failedFileCount: 0,
    });
    expect(data.voyages.map(({ voyageId }) => voyageId).join('\n'))
      .not.toMatch(/unknown-[a-f0-9]{8}$/m);
  });

  it('matches both annual bases without changing the five-year total', () => {
    expect(data.annual.map(({ verifiedActualMt }) => verifiedActualMt)).toEqual([
      29247.939, 28086.502, 94075.08, 111659.476, 76050.2388,
    ]);
    expect(data.completionYearBaseline.map(({ verifiedActualMt }) => verifiedActualMt)).toEqual([
      29247.939, 25985.162, 89338.33, 118497.566, 76050.2388,
    ]);
    expect(data.annual.reduce((sum, row) => sum + row.verifiedActualMt, 0)).toBeCloseTo(
      339119.2358,
      4,
    );
    expect(
      data.completionYearBaseline.reduce((sum, row) => sum + row.verifiedActualMt, 0),
    ).toBeCloseTo(339119.2358, 4);
  });

  it('preserves the three reviewed cross-year allocations', () => {
    const allocation = (voyageId: string) => data.voyages
      .find((voyage) => voyage.voyageId === voyageId)?.yearAllocations
      .map(({ year, actualMt, method }) => ({ year, actualMt, method }));

    expect(allocation('tai-ji-2022-12-24-hcm')).toEqual([
      { year: 2022, actualMt: 2101.34, method: 'daily_report' },
      { year: 2023, actualMt: 3170.06, method: 'daily_report' },
    ]);
    expect(allocation('sein-phoenix-2023-11-21-hcm')).toEqual([
      { year: 2023, actualMt: 6611.53, method: 'daily_report' },
      { year: 2024, actualMt: 795.5, method: 'daily_report' },
      { year: 2024, actualMt: 1.519, method: 'final_report_adjustment' },
    ]);
    expect(allocation('sein-frontier-2023-12-25-bkk')).toEqual([
      { year: 2023, actualMt: 226.56, method: 'daily_report' },
      { year: 2024, actualMt: 5225, method: 'daily_report' },
    ]);
  });

  it('preserves partial actuals while excluding them from KPI allocations', () => {
    expect(data.voyages
      .filter(({ verification }) => verification === 'partial')
      .map(({ voyageId, actualMt, kpiIncluded, yearAllocations }) => ({
        voyageId,
        actualMt,
        kpiIncluded,
        yearAllocations,
      }))).toEqual([
      { voyageId: 'liaoyu-reefer-1-2021-03-17-bkk', actualMt: 1061.14, kpiIncluded: false, yearAllocations: [] },
      { voyageId: 'liaoyu-reefer-1-2021-07-31-ges', actualMt: 1730.07, kpiIncluded: false, yearAllocations: [] },
      { voyageId: 'sein-venus-2022-01-10-bkk', actualMt: 2170.64, kpiIncluded: false, yearAllocations: [] },
      { voyageId: 'sein-venus-2022-04-12-bkk', actualMt: 191.29, kpiIncluded: false, yearAllocations: [] },
    ]);
  });

  it('contains only public-safe strings and no digest-shaped values', () => {
    const visit = (value: unknown): void => {
      if (typeof value === 'string') {
        expect(hasPrivateTextMarker(value)).toBe(false);
        expect(value).not.toMatch(/^[a-f0-9]{64}$/i);
        return;
      }
      if (Array.isArray(value)) {
        value.forEach(visit);
        return;
      }
      if (value && typeof value === 'object') {
        Object.values(value).forEach(visit);
      }
    };

    visit(data);
  });
});
