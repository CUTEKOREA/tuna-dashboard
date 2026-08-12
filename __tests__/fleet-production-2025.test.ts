import { describe, expect, it } from 'vitest';

import {
  fleetProduction2025,
  fleetProductionDisplayFisheryTotals,
  fleetProductionReconciliation,
  getCompanyProduction,
  rankCompaniesByProduction,
} from '@/lib/fleet-production-2025';

describe('2025 company catch by fishery', () => {
  it('keeps all 36 companies and the reported grand total from pages 112-115', () => {
    expect(fleetProduction2025.source).toMatchObject({
      title: '25년도 선사별 업종별 원양어업 생산량 자료',
      pages: '112-115',
      unit: 'M/T',
      status: 'STATIC',
    });
    expect(fleetProduction2025.companies).toHaveLength(36);
    expect(fleetProduction2025.companies.map((company) => company.no)).toEqual(
      Array.from({ length: 36 }, (_, index) => index + 1),
    );
    expect(fleetProduction2025.reportedGrandTotalMt).toBe(383_130);
  });

  it('preserves Silla Trading production and fishery mix exactly', () => {
    expect(getCompanyProduction('신라교역')).toMatchObject({
      companyKo: '신라교역',
      companyEn: 'Silla Co., Ltd.',
      reportedTotalMt: 58_349,
      catchMt: {
        tunaLongline: 3_546,
        bottomLongline: 0,
        tunaPurseSeine: 54_803,
        stickHeldDipNet: 0,
        mothershipLine: 0,
        northPacificTrawl: 0,
        overseasTrawl: 0,
        jigging: 0,
        pot: 0,
        other: 0,
      },
    });
    expect(rankCompaniesByProduction().slice(0, 3).map(({ companyKo, reportedTotalMt }) => ({ companyKo, reportedTotalMt }))).toEqual([
      { companyKo: '동원산업', reportedTotalMt: 132_609 },
      { companyKo: '신라교역', reportedTotalMt: 58_349 },
      { companyKo: '사조산업', reportedTotalMt: 43_104 },
    ]);
  });

  it('keeps printed totals separate from independently summed row values', () => {
    expect(fleetProduction2025.reportedFisheryTotalsMt).toEqual({
      tunaLongline: 40_287,
      bottomLongline: 6_614,
      tunaPurseSeine: 211_513,
      stickHeldDipNet: 5_901,
      mothershipLine: 0,
      northPacificTrawl: 29_313,
      overseasTrawl: null,
      jigging: 26_588,
      pot: 239,
      other: 0,
    });
    expect(fleetProductionReconciliation.calculatedFisheryTotalsMt).toEqual({
      tunaLongline: 40_285,
      bottomLongline: 6_613,
      tunaPurseSeine: 211_513,
      stickHeldDipNet: 5_902,
      mothershipLine: 0,
      northPacificTrawl: 29_313,
      overseasTrawl: 62_675,
      jigging: 26_588,
      pot: 239,
      other: 0,
    });
    expect(fleetProductionReconciliation).toMatchObject({
      reportedCompanyTotalMt: 383_127,
      calculatedFisheryTotalMt: 383_128,
      reportedGrandTotalMt: 383_130,
    });
    expect(fleetProductionDisplayFisheryTotals).toEqual({
      tunaLongline: 40_287,
      bottomLongline: 6_614,
      tunaPurseSeine: 211_513,
      stickHeldDipNet: 5_901,
      mothershipLine: 0,
      northPacificTrawl: 29_313,
      overseasTrawl: 62_675,
      jigging: 26_588,
      pot: 239,
      other: 0,
    });
    expect(Object.values(fleetProductionDisplayFisheryTotals).reduce((total, value) => total + value, 0)).toBe(383_130);
  });

  it('surfaces the three source rows whose printed total differs from their fishery sum', () => {
    expect(fleetProductionReconciliation.rowDiscrepancies).toEqual([
      { no: 22, companyKo: '씨맥스피셔리', reportedTotalMt: 2_207, calculatedTotalMt: 2_208, differenceMt: 1 },
      { no: 26, companyKo: '정일산업', reportedTotalMt: 20_232, calculatedTotalMt: 20_231, differenceMt: -1 },
      { no: 36, companyKo: '홍진실업', reportedTotalMt: 3_589, calculatedTotalMt: 3_590, differenceMt: 1 },
    ]);
  });
});
