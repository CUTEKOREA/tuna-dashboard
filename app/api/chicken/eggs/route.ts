import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  const data = {
    id: 'w_chicken_eggs',
    title: '계란 수급 리스크 및 가공 의존도',
    subtitle: 'HPAI 발병에 따른 신선란 가격 폭등 및 가공계란(액상/건조) 수입 의존성',
    chartType: 'Composed',
    xKey: 'year',
    data: [
      { year: '2020 (평시)', priceIndex: 100, liquidImport: 2000, driedImport: 800 },
      { year: '2021 (HPAI)', priceIndex: 180, liquidImport: 3500, driedImport: 1200 },
      { year: '2022 (안정화)', priceIndex: 110, liquidImport: 2500, driedImport: 950 },
      { year: '2023 (미국 HPAI)', priceIndex: 150, liquidImport: 3900, driedImport: 1000 },
      { year: '2024 (회복기)', priceIndex: 120, liquidImport: 3000, driedImport: 900 }
    ],
    sit: '한국 신선란 자급률은 99%이나, 고병원성 조류인플루엔자(HPAI) 발생 시 2~3배 폭등하는 리스크 선행지표입니다. 반면 제과·제빵용 가공계란(액상란·건조란)은 평시에도 미국, 중국, 유럽 등에서 100% 수입에 의존합니다. ※ 가격지수는 2020년 기준(=100) 예시(illustrative) 수치이며 실제 KCS 수입량 데이터 대조가 필요합니다.',
    strat: 'HPAI 비발생 시기(저가)에 유럽·미국의 액상·건조란을 대량 수입해 신라교역 거점 창고에 비축해야 합니다. 이를 대형 제과·제빵 B2B 기업에 벤더관리재고(VMI) 방식으로 공급하며, HPAI 쇼크 발생 시 수급 공백에서 차익을 실현합니다.',
    reliability: 68,
    methodology: '4축 포렌식 감사 - SRC:21 FRS:19 VRF:13 INT:15. 지수형 데이터(priceIndex)의 기준 연도(Base Year) 미표기(-9)',
    source: 'FAOSTAT 가공계란 품목코드(액상란·건조란) & 축산물품질평가원(KAPE) 기반 자체추정. ⚠️ 가격지수(100=2020년 기준)는 illustrative 예시 수치. KCS 실제 수입량 데이터 대조 필요. [STATIC - 실시간 API 미연동]',
    isLive: false // L-12: 정적 스냅샷 — 실시간 API 미연동
  };

  return NextResponse.json(data);
}
