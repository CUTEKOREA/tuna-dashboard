import { describe, expect, it } from 'vitest';
import { getGmtsMonthly } from '../lib/data/gmts-monthly';

describe('GMTS monthly report data intake', () => {
  const data = getGmtsMonthly();

  it('preserves the monthly archive metadata', () => {
    expect(data.schemaVersion).toBe(1);
    expect(data.metadata).toEqual({
      status: 'STATIC',
      reportCount: 5,
      firstReportDate: '2026-02-24',
      latestReportDate: '2026-08-25',
      reportMonths: [2, 4, 5, 6, 8],
    });
    expect(data.sources).toHaveLength(5);
    expect(data.sources.at(-1)).toEqual({
      fileName: 'GMTS 월간보고 (8월).pptx',
      reportDate: '2026-08-25',
      sha256: '8a65fe2ebd78c11cc40df881af3780c85c1de5802358dbf06293fd3069a81474',
    });
  });

  it('reconciles the catch and Gensan price series with the August report charts', () => {
    expect(data.catchTrend.unit).toBe('M/T');
    expect(data.catchTrend.series['2025']).toEqual([
      3335, 985, 2225, 3105, 2935, 3940, 3330, 3310, 2565, 2645, 2180, 1898,
    ]);
    expect(data.catchTrend.series['2026']).toEqual([3037, 2180, 1699, 2387, 2599, 3566, 2864]);
    expect(data.priceTrend.unit).toBe('USD/MT');
    expect(data.priceTrend.series['2026']).toEqual([1460, 1460, 1900, 2000, 1750, 1750, 1730]);
  });

  it('reconciles the August cumulative profit tables per company', () => {
    const latest = data.reports.at(-1)!;
    expect(latest.profit.periodLabel).toBe('2026년 1~7월 손익');
    expect(latest.profit.rows).toEqual([
      '매출액', '매출원가', '매출총이익', '판매관리비',
      '영업이익', '금융손익', '기타손익', '법인세차감전이익',
    ]);
    expect(latest.profit.companies.GMTS.y2026).toEqual([
      4_969_573, 4_573_061, 396_512, 265_574, 130_938, -470, null, 130_468,
    ]);
    expect(latest.profit.companies.KFC.y2026).toEqual([
      27_681_308, 31_721_573, -4_040_265, 28_191, -4_068_456, -1_516_746, 3_000, -5_582_202,
    ]);
    expect(latest.profit.companies.NFDC.y2025).toEqual([
      2_120_000, 1_906_144, 213_856, 18_328, 195_527, -1_684_023, 81, -1_488_414,
    ]);
  });

  it('reconciles the July-end receivable/debt snapshot and excludes merged-away header residue', () => {
    const funds = data.reports.at(-1)!.funds;
    expect(funds.asOfLabel).toBe('2026년 7월말 채권/채무 내역');
    expect(funds.companies.GMTS).toEqual({
      cash: 1_234,
      deposit: 225_301,
      receivable: 5_854_232,
      assetSubtotal: 6_080_767,
      toSilla: 127_146,
      toGmts: null,
      toOthers: 2_684_179,
      debtSubtotal: 2_811_325,
      netBalance: 3_269_442,
    });
    expect(funds.companies.KFC.debtSubtotal).toBe(47_413_998);
    expect(funds.companies.KFC.netBalance).toBe(-41_002_295);
    expect(funds.companies.NFDC.netBalance).toBe(-28_688_703);
    // 122,052 / 26,529,930 / 12,239,382 live only in merged-away cells of the
    // "채 무" header row and are not displayed in the source deck.
    expect(funds.companies.GMTS.debtSubtotal).not.toBe(122_052);
    expect(funds.notes.KFC).toBe('정부기여금 $3,116,666 미지급 배당금 $449,683');
    expect(funds.notes.NFDC).toBe('정부기여금 $3,233,333');
  });

  it('keeps printed source values and surfaces identity mismatches as flags only', () => {
    expect(data.qualityFlags).toEqual([
      {
        code: 'PROFIT_IDENTITY_MISMATCH',
        where: 'GMTS 월간보고 (5월).pptx NFDC y2026 영업이익',
        expected: 98_357,
        printed: 98_367,
      },
      {
        code: 'PROFIT_IDENTITY_MISMATCH',
        where: 'GMTS 월간보고 (5월).pptx NFDC y2026 법인세차감전이익',
        expected: -883_814,
        printed: -883_824,
      },
    ]);
  });

  it('keeps the briefing bullets of the August report verbatim', () => {
    const latest = data.reports.at(-1)!;
    expect(latest.briefing).toEqual([
      '3개사 7월 결산',
      '8월 자금 집행 및 9월 정기 자금 집행 계획',
      '사라 두테르테 부통령 탄핵심판 본격화 (상원이 탄핵재판소 역할, 2028년 대통령 선거 예정)',
      '우기 시즌으로 7월말부터 강화된 몬순성 폭우로 홍수, 학교 휴교 등 피해 속출',
    ]);
    expect(latest.briefingFootnotes).toEqual(['* 매월 15일 전월자금진행내역 및 잔액 별도 보고 예정']);
    expect(latest.priceNote).toBe('(8월 3주) 어가 $1,900 Level');
  });
});
