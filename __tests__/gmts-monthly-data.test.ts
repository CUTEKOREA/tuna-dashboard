import { describe, expect, it } from 'vitest';
import { getGmtsMonthly } from '../lib/data/gmts-monthly';

describe('GMTS monthly report data intake', () => {
  const data = getGmtsMonthly();

  it('preserves the monthly archive metadata', () => {
    expect(data.schemaVersion).toBe(1);
    expect(data.metadata).toEqual({
      status: 'STATIC',
      reportCount: 6,
      firstReportDate: '2026-02-24',
      latestReportDate: '2026-09-29',
      reportMonths: [2, 4, 5, 6, 8, 9],
    });
    expect(data.sources).toHaveLength(6);
    expect(data.sources.at(-1)).toEqual({
      fileName: 'GMTS 월간보고 (9월).pptx',
      reportDate: '2026-09-29',
      sha256: '22a06c8caa8a8721b442f5bb0bb245bac79645544ce3e03612009653566605f9',
    });
  });

  it('reconciles the catch and Gensan price series with the September report charts', () => {
    expect(data.catchTrend.unit).toBe('M/T');
    expect(data.catchTrend.series['2025']).toEqual([
      3335, 985, 2225, 3105, 2935, 3940, 3330, 3310, 2565, 2645, 2180, 1898,
    ]);
    expect(data.catchTrend.series['2026']).toEqual([3037, 2180, 1699, 2387, 2599, 3566, 2864, 1864]);
    expect(data.priceTrend.unit).toBe('USD/MT');
    expect(data.priceTrend.series['2026']).toEqual([1460, 1460, 1900, 2000, 1750, 1750, 1730, 1900]);
  });

  it('reconciles the September report cumulative profit tables per company', () => {
    const latest = data.reports.at(-1)!;
    expect(latest.profit.periodLabel).toBe('2026년 1~8월 손익');
    expect(latest.profit.rows).toEqual([
      '매출액', '매출원가', '매출총이익', '판매관리비',
      '영업이익', '금융손익', '기타손익', '법인세차감전이익',
    ]);
    expect(latest.profit.companies.GMTS.y2026).toEqual([
      4_994_672, 4_574_227, 420_445, 310_694, 109_751, -420, null, 109_331,
    ]);
    expect(latest.profit.companies.KFC.y2026).toEqual([
      31_738_094, 36_814_877, -5_076_783, 29_330, -5_106_113, -1_736_665, 3_000, -6_839_778,
    ]);
    expect(latest.profit.companies.NFDC.y2025).toEqual([
      2_430_000, 2_178_451, 251_549, 19_387, 232_163, -1_935_620, 81, -1_703_377,
    ]);
  });

  it('reconciles the August-end receivable/debt snapshot and excludes merged-away header residue', () => {
    const funds = data.reports.at(-1)!.funds;
    expect(funds.asOfLabel).toBe('2026년 8월말 채권/채무 내역');
    expect(funds.companies.GMTS).toEqual({
      cash: 1_676,
      deposit: 150_720,
      receivable: 5_469_833,
      assetSubtotal: 5_622_229,
      toSilla: 142_646,
      toGmts: null,
      toOthers: 2_227_328,
      debtSubtotal: 2_369_974,
      netBalance: 3_252_255,
    });
    expect(funds.companies.KFC.debtSubtotal).toBe(46_259_499);
    expect(funds.companies.KFC.netBalance).toBe(-39_457_355);
    expect(funds.companies.NFDC.netBalance).toBe(-28_551_329);
    // 122,052 / 26,529,930 / 12,239,382 live only in merged-away cells of the
    // "채 무" header row and are not displayed in the source deck.
    expect(funds.companies.GMTS.debtSubtotal).not.toBe(122_052);
    expect(funds.notes.KFC).toBe('정부기여금 $3,149,999 미지급 배당금 $449,683');
    expect(funds.notes.NFDC).toBe('정부기여금 $3,266,666');
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

  it('keeps the briefing bullets of the September report verbatim', () => {
    const latest = data.reports.at(-1)!;
    expect(latest.briefing).toEqual([
      '3개사 8월 결산',
      '스타 보합금 정산 (2026.06.25~2026.08.18)',
      '정부, 홍수방지사업 부패 의혹 강하게 조사 (전, 현직 정치인과 고위 관료들 연루 의혹)',
      '2분기 GDP 성장률 전년 대비 2.3% (2025년 2분기는 5.5% 성장), 물가 상승률 6.1%',
    ]);
    expect(latest.briefingFootnotes).toEqual(['* 매월 15일 전월자금진행내역 및 잔액 별도 보고 예정']);
    expect(latest.priceNote).toBe('(9월 3주) 어가 $2,025 Level');
  });
});
