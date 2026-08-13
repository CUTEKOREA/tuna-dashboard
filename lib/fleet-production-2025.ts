export const fisheryKeys = [
  'tunaLongline',
  'bottomLongline',
  'tunaPurseSeine',
  'stickHeldDipNet',
  'mothershipLine',
  'northPacificTrawl',
  'overseasTrawl',
  'jigging',
  'pot',
  'other',
] as const;

export type FisheryKey = (typeof fisheryKeys)[number];
export type CatchByFishery = Record<FisheryKey, number>;

export interface CompanyProduction2025 {
  no: number;
  companyKo: string;
  companyEn: string;
  reportedTotalMt: number;
  catchMt: CatchByFishery;
}

export const fisheryLabels: Record<FisheryKey, string> = {
  tunaLongline: '참치연승',
  bottomLongline: '저연승',
  tunaPurseSeine: '참치선망',
  stickHeldDipNet: '원양봉수망',
  mothershipLine: '모선식 외줄낚시',
  northPacificTrawl: '북양트롤',
  overseasTrawl: '해외트롤',
  jigging: '원양채낚기',
  pot: '원양통발',
  other: '기타',
};

const catchMt = (
  values: Partial<CatchByFishery>,
): CatchByFishery => Object.fromEntries(
  fisheryKeys.map((key) => [key, values[key] ?? 0]),
) as CatchByFishery;

const companies: CompanyProduction2025[] = [
  { no: 1, companyKo: '가나마린', companyEn: 'Khana Marine Co., Ltd.', reportedTotalMt: 1_163, catchMt: catchMt({ jigging: 1_163 }) },
  { no: 2, companyKo: '경양수산', companyEn: 'Kyungyang Fisheries Co., Ltd.', reportedTotalMt: 2_840, catchMt: catchMt({ tunaLongline: 2_840 }) },
  { no: 3, companyKo: '경태', companyEn: 'Kyungtae Co., Ltd.', reportedTotalMt: 2_287, catchMt: catchMt({ jigging: 2_287 }) },
  { no: 4, companyKo: '남궁튜나', companyEn: 'Namgung Tuna Co., Ltd.', reportedTotalMt: 649, catchMt: catchMt({ tunaLongline: 649 }) },
  { no: 5, companyKo: '남북수산', companyEn: 'Nambuk Fisheries Co., Ltd.', reportedTotalMt: 12_026, catchMt: catchMt({ northPacificTrawl: 12_026 }) },
  { no: 6, companyKo: '대해수산', companyEn: 'Daehae Fisheries Co., Ltd.', reportedTotalMt: 3_300, catchMt: catchMt({ tunaLongline: 3_300 }) },
  { no: 7, companyKo: '동남', companyEn: 'Dongnam Co., Ltd.', reportedTotalMt: 3_486, catchMt: catchMt({ overseasTrawl: 3_486 }) },
  { no: 8, companyKo: '동신어업', companyEn: 'Dongsin Fisheries Co., Ltd.', reportedTotalMt: 598, catchMt: catchMt({ jigging: 598 }) },
  { no: 9, companyKo: '동원산업', companyEn: 'Dongwon Industries Co., Ltd.', reportedTotalMt: 132_609, catchMt: catchMt({ tunaLongline: 3_528, tunaPurseSeine: 110_451, overseasTrawl: 18_630 }) },
  { no: 10, companyKo: '동원수산', companyEn: 'Dongwon Fisheries Co., Ltd.', reportedTotalMt: 6_731, catchMt: catchMt({ tunaLongline: 6_731 }) },
  { no: 11, companyKo: '동원해사랑', companyEn: 'Dongwon Haesarang Co., Ltd.', reportedTotalMt: 4_058, catchMt: catchMt({ stickHeldDipNet: 1_311, jigging: 2_747 }) },
  { no: 12, companyKo: '사조대림', companyEn: 'Sajodaerim Corporation', reportedTotalMt: 2_713, catchMt: catchMt({ bottomLongline: 2_713 }) },
  { no: 13, companyKo: '사조산업', companyEn: 'Sajo Industries Co., Ltd.', reportedTotalMt: 43_104, catchMt: catchMt({ tunaLongline: 10_239, tunaPurseSeine: 32_865 }) },
  { no: 14, companyKo: '사조씨푸드', companyEn: 'Sajo Seafood Co., Ltd.', reportedTotalMt: 7_107, catchMt: catchMt({ tunaLongline: 668, tunaPurseSeine: 6_439 }) },
  { no: 15, companyKo: '사조오양', companyEn: 'Oyang Corporation', reportedTotalMt: 21_924, catchMt: catchMt({ tunaLongline: 1_108, tunaPurseSeine: 6_955, northPacificTrawl: 8_231, overseasTrawl: 5_630 }) },
  { no: 16, companyKo: '선민수산', companyEn: 'Sunmin Fisheries Co., Ltd.', reportedTotalMt: 5_565, catchMt: catchMt({ overseasTrawl: 3_007, jigging: 2_558 }) },
  { no: 17, companyKo: '성경수산', companyEn: 'Seongkyung Fisheries Co., Ltd.', reportedTotalMt: 1_192, catchMt: catchMt({ stickHeldDipNet: 1_192, jigging: 0 }) },
  { no: 18, companyKo: '승진수산', companyEn: 'Seungjin Fisheries Co., Ltd.', reportedTotalMt: 1_054, catchMt: catchMt({ jigging: 1_054 }) },
  { no: 19, companyKo: '신라교역', companyEn: 'Silla Co., Ltd.', reportedTotalMt: 58_349, catchMt: catchMt({ tunaLongline: 3_546, tunaPurseSeine: 54_803 }) },
  { no: 20, companyKo: '신지수산', companyEn: 'Shinji Fisheries Co., Ltd.', reportedTotalMt: 239, catchMt: catchMt({ pot: 239 }) },
  { no: 21, companyKo: '신해피셔리', companyEn: 'Shinhae Fisheries Co., Ltd.', reportedTotalMt: 748, catchMt: catchMt({ jigging: 748 }) },
  { no: 22, companyKo: '씨맥스피셔리', companyEn: 'Seamax Fishery Co., Ltd.', reportedTotalMt: 2_207, catchMt: catchMt({ stickHeldDipNet: 1_316, jigging: 892 }) },
  { no: 23, companyKo: '아그네스수산', companyEn: 'Agnes Fisheries Co., Ltd.', reportedTotalMt: 12_665, catchMt: catchMt({ tunaLongline: 1_352, overseasTrawl: 6_693, jigging: 4_620 }) },
  { no: 24, companyKo: '에스앤비인터내셔널', companyEn: 'SNB International Co., Ltd.', reportedTotalMt: 1_045, catchMt: catchMt({ tunaLongline: 1_045 }) },
  { no: 25, companyKo: '원양물산', companyEn: 'Wonyang Trading Co., Ltd.', reportedTotalMt: 1_080, catchMt: catchMt({ stickHeldDipNet: 1_078, jigging: 2 }) },
  { no: 26, companyKo: '정일산업', companyEn: 'Jeongil Corporation', reportedTotalMt: 20_232, catchMt: catchMt({ bottomLongline: 1_119, overseasTrawl: 14_487, jigging: 4_625 }) },
  { no: 27, companyKo: '참손푸드', companyEn: 'Charmson Foods Corporation Inc.', reportedTotalMt: 7_077, catchMt: catchMt({ overseasTrawl: 7_077 }) },
  { no: 28, companyKo: '케이에이치디코리아', companyEn: 'KHD Korea Co., Ltd.', reportedTotalMt: 1_291, catchMt: catchMt({ tunaLongline: 1_291 }) },
  { no: 29, companyKo: '코삭교역', companyEn: 'Kosac Trading Co., Ltd.', reportedTotalMt: 3_665, catchMt: catchMt({ overseasTrawl: 3_665 }) },
  { no: 30, companyKo: '티앤에스산업', companyEn: 'TNS Industries Inc.', reportedTotalMt: 1_576, catchMt: catchMt({ bottomLongline: 1_576 }) },
  { no: 31, companyKo: '피에이아이', companyEn: 'PAI Co., Ltd.', reportedTotalMt: 2_069, catchMt: catchMt({ stickHeldDipNet: 1_005, jigging: 1_064 }) },
  { no: 32, companyKo: '한성기업', companyEn: 'Hansung Enterprise Co., Ltd.', reportedTotalMt: 10_714, catchMt: catchMt({ tunaLongline: 1_658, northPacificTrawl: 9_056 }) },
  { no: 33, companyKo: '해인수산', companyEn: 'Hae In Fisheries Co., Ltd.', reportedTotalMt: 915, catchMt: catchMt({ jigging: 915 }) },
  { no: 34, companyKo: '해천물산', companyEn: 'Sea Sky Mulsan Co.,Ltd.', reportedTotalMt: 2_330, catchMt: catchMt({ tunaLongline: 2_330 }) },
  { no: 35, companyKo: '현원수산', companyEn: 'Hyunwon Fisheries Co., Ltd.', reportedTotalMt: 930, catchMt: catchMt({ jigging: 930 }) },
  { no: 36, companyKo: '홍진실업', companyEn: 'Hongjin Corporation', reportedTotalMt: 3_589, catchMt: catchMt({ bottomLongline: 1_205, jigging: 2_385 }) },
];

export const fleetProduction2025 = {
  source: {
    title: '25년도 선사별 업종별 원양어업 생산량 자료',
    file: '25년도 선사별 업종별 원양어업 생산량 자료 (1).pdf',
    pages: '112-115',
    unit: 'M/T',
    status: 'STATIC' as const,
    receivedDate: '2026-08-12',
  },
  reportedGrandTotalMt: 383_130,
  reportedFisheryTotalsMt: {
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
  } satisfies Record<FisheryKey, number | null>,
  companies,
};

export const sumCatch = (companyCatch: CatchByFishery) => (
  fisheryKeys.reduce((total, key) => total + companyCatch[key], 0)
);

const calculatedFisheryTotalsMt = Object.fromEntries(
  fisheryKeys.map((key) => [
    key,
    companies.reduce((total, company) => total + company.catchMt[key], 0),
  ]),
) as CatchByFishery;

export const fleetProductionReconciliation = {
  reportedCompanyTotalMt: companies.reduce(
    (total, company) => total + company.reportedTotalMt,
    0,
  ),
  calculatedFisheryTotalsMt,
  calculatedFisheryTotalMt: fisheryKeys.reduce(
    (total, key) => total + calculatedFisheryTotalsMt[key],
    0,
  ),
  reportedGrandTotalMt: fleetProduction2025.reportedGrandTotalMt,
  rowDiscrepancies: companies.flatMap((company) => {
    const calculatedTotalMt = sumCatch(company.catchMt);
    const differenceMt = calculatedTotalMt - company.reportedTotalMt;
    return differenceMt === 0 ? [] : [{
      no: company.no,
      companyKo: company.companyKo,
      reportedTotalMt: company.reportedTotalMt,
      calculatedTotalMt,
      differenceMt,
    }];
  }),
};

export const fleetProductionDisplayFisheryTotals = Object.fromEntries(
  fisheryKeys.map((key) => [
    key,
    fleetProduction2025.reportedFisheryTotalsMt[key]
      ?? calculatedFisheryTotalsMt[key],
  ]),
) as CatchByFishery;

export const getCompanyProduction = (companyKo: string) => (
  companies.find((company) => company.companyKo === companyKo)
);

export const rankCompaniesByProduction = () => (
  [...companies].sort((a, b) => b.reportedTotalMt - a.reportedTotalMt)
);
