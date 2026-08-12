import { describe, expect, it } from 'vitest';
import {
  addConsignmentRows,
  buildConsignmentDashboardData,
  buildConsignmentDashboardFromState,
  createConsignmentAccumulator,
  createConsignmentSyncState,
  getConsignmentNetworkPresentation,
  getConsignmentFreshness,
  parseConsignmentLivePage,
  replaceConsignmentLiveRange,
  replaceConsignmentOfficialMonth,
} from '../lib/consignment-data';

describe('consignment data pipeline', () => {
  it('aggregates every auction date in a month instead of treating the first day as the month', () => {
    const accumulator = createConsignmentAccumulator();

    addConsignmentRows(accumulator, [
      {
        csmtDe: '20260801',
        mprcStdCodeNm: '갈치류',
        csmtAmount: '120000',
        csmtWt: '30',
      },
      {
        csmtDe: '20260802',
        mprcStdCodeNm: '갈치류',
        csmtAmount: '180000',
        csmtWt: '20',
      },
      {
        위판일자: '2026-08-02',
        수산물표준코드명: '고등어',
        위판금액: 90000,
        위판중량: '30.00',
      },
    ]);

    const result = buildConsignmentDashboardData(accumulator, {
      generatedAt: '2026-08-12T18:00:00+09:00',
      includedPartialMonth: '2026-08',
      latestAuctionDate: '2026-08-02',
      monthSourceRecordCounts: { '2026-08': 3 },
    });

    expect(result._meta.samplingBasis).toContain('일자별 전체 거래');
    expect(result._meta.totalRecords).toBe(2);
    expect(result._meta.sourceRowCount).toBe(3);
    expect(result._meta.latestAuctionDate).toBe('2026-08-02');
    expect(result.monthlyDetail['2026-08']).toEqual([
      {
        rank: 1,
        seafoodName: '갈치류',
        saleAmount: 300000,
        saleQty: 50,
        avgUnitPrice: 6000,
      },
      {
        rank: 2,
        seafoodName: '고등어',
        saleAmount: 90000,
        saleQty: 30,
        avgUnitPrice: 3000,
      },
    ]);
    expect(result.yearlyTop['2026'][0]).toMatchObject({
      seafoodName: '갈치류',
      saleAmount: 300000,
      saleQty: 50,
    });
  });

  it('normalizes the official monthly aggregate file column names', () => {
    const accumulator = createConsignmentAccumulator();

    addConsignmentRows(accumulator, [
      {
        위판일자: '2026-06-30',
        수산물표준코드명: '살오징어',
        '총 판매액': 450000,
        '물량(킬로그램)': '75.00',
      },
    ]);

    const result = buildConsignmentDashboardData(accumulator, {
      generatedAt: '2026-07-15T09:00:00+09:00',
      latestAuctionDate: '2026-06-30',
      monthSourceRecordCounts: { '2026-06': 1 },
    });

    expect(result.monthlyDetail['2026-06'][0]).toMatchObject({
      seafoodName: '살오징어',
      saleAmount: 450000,
      saleQty: 75,
      avgUnitPrice: 6000,
    });
  });

  it('marks auction data as synced only while the published snapshot is recent', () => {
    expect(
      getConsignmentFreshness(
        { latestAuctionDate: '2026-08-12', generatedAt: '2026-08-12T18:00:00+09:00' },
        new Date('2026-08-13T00:00:00+09:00'),
      ),
    ).toEqual({ status: 'synced', ageDays: 1 });

    expect(
      getConsignmentFreshness(
        { latestAuctionDate: '2026-08-08', generatedAt: '2026-08-08T18:00:00+09:00' },
        new Date('2026-08-13T00:00:00+09:00'),
      ),
    ).toEqual({ status: 'stale', ageDays: 5 });

    expect(
      getConsignmentFreshness(
        {
          latestAuctionDate: '2026-08-08',
          checkedThrough: '2026-08-13',
          generatedAt: '2026-08-13T06:00:00+09:00',
        },
        new Date('2026-08-13T12:00:00+09:00'),
      ),
    ).toEqual({ status: 'synced', ageDays: 0 });

    expect(getConsignmentFreshness({}, new Date('2026-08-13T00:00:00+09:00'))).toEqual({
      status: 'offline',
      ageDays: null,
    });
  });

  it('presents snapshot freshness without claiming a live transaction stream', () => {
    expect(getConsignmentNetworkPresentation('synced')).toEqual({
      label: 'SYNCED',
      tone: 'success',
    });
    expect(getConsignmentNetworkPresentation('stale')).toEqual({
      label: 'STALE',
      tone: 'warning',
    });
    expect(getConsignmentNetworkPresentation('online')).toEqual({
      label: 'LIVE',
      tone: 'success',
    });
  });

  it('replaces revised live dates and promotes a completed month to the official snapshot', () => {
    const state = createConsignmentSyncState();

    replaceConsignmentOfficialMonth(state, '2026-06', [
      { 위판일자: '2026-06-30', 수산물표준코드명: '갈치류', '총 판매액': 100000, '물량(킬로그램)': 20 },
    ], 'odcloud:20260630');
    replaceConsignmentLiveRange(state, '2026-07-01', '2026-07-02', [
      { csmtDe: '20260701', mprcStdCodeNm: '고등어', csmtAmount: 50000, csmtWt: 10 },
      { csmtDe: '20260702', mprcStdCodeNm: '고등어', csmtAmount: 80000, csmtWt: 20 },
    ]);
    replaceConsignmentLiveRange(state, '2026-07-02', '2026-07-03', [
      { csmtDe: '20260702', mprcStdCodeNm: '고등어', csmtAmount: 90000, csmtWt: 30 },
      { csmtDe: '20260703', mprcStdCodeNm: '갈치류', csmtAmount: 120000, csmtWt: 20 },
    ]);

    let result = buildConsignmentDashboardFromState(state, '2026-07-03T18:00:00+09:00');
    expect(result._meta.totalRecords).toBe(3);
    expect(result._meta.sourceRowCount).toBe(4);
    expect(result._meta.officialThrough).toBe('2026-06');
    expect(result._meta.liveFrom).toBe('2026-07-01');
    expect(result._meta.liveThrough).toBe('2026-07-03');
    expect(result.monthlyDetail['2026-07']).toEqual([
      expect.objectContaining({ seafoodName: '고등어', saleAmount: 140000, saleQty: 40 }),
      expect.objectContaining({ seafoodName: '갈치류', saleAmount: 120000, saleQty: 20 }),
    ]);

    replaceConsignmentOfficialMonth(state, '2026-07', [
      { 위판일자: '2026-07-31', 수산물표준코드명: '고등어', '총 판매액': 300000, '물량(킬로그램)': 60 },
    ], 'odcloud:20260731');

    result = buildConsignmentDashboardFromState(state, '2026-08-15T09:00:00+09:00');
    expect(Object.keys(state.liveDays)).not.toEqual(expect.arrayContaining(['2026-07-01', '2026-07-02', '2026-07-03']));
    expect(result.monthlyDetail['2026-07'][0]).toMatchObject({
      seafoodName: '고등어',
      saleAmount: 300000,
      saleQty: 60,
    });
    expect(result._meta.includedPartialMonth).toBeUndefined();
    expect(result._meta.officialThrough).toBe('2026-07');
    expect(result._meta.liveFrom).toBeUndefined();
  });

  it('records a zero-transaction date as synchronized', () => {
    const state = createConsignmentSyncState();
    replaceConsignmentOfficialMonth(state, '2026-06', [
      { 위판일자: '2026-06-30', 수산물표준코드명: '갈치류', '총 판매액': 100000, '물량(킬로그램)': 20 },
    ], 'odcloud:20260630');

    replaceConsignmentLiveRange(state, '2026-08-15', '2026-08-15', []);
    const result = buildConsignmentDashboardFromState(state, '2026-08-15T09:00:00+09:00');

    expect(state.liveDays['2026-08-15']).toEqual({
      sourceRecordCount: 0,
      species: {},
    });
    expect(result._meta.latestAuctionDate).toBe('2026-06-30');
    expect(result._meta.checkedThrough).toBe('2026-08-15');
    expect(result._meta.months).toEqual(['2026-06']);
    expect(result._meta.includedPartialMonth).toBeUndefined();
    expect(
      getConsignmentFreshness(result._meta, new Date('2026-08-15T12:00:00+09:00')),
    ).toEqual({ status: 'synced', ageDays: 0 });
  });

  it('accepts the official no-data response as a synchronized empty page', () => {
    expect(
      parseConsignmentLivePage({
        responseJson: {
          header: { resultCode: '03', totalCount: 0 },
          body: {},
        },
      }),
    ).toEqual({ rows: [], totalCount: 0 });

    expect(() =>
      parseConsignmentLivePage({
        responseJson: {
          header: { resultCode: '99', totalCount: 0 },
          body: {},
        },
      }),
    ).toThrow('Live consignment API returned code 99');
  });
});
