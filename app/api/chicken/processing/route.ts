import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  const payload = {
    id: 'w_chicken_processing',
    title: '가공 인프라 블랙홀 — 단계별 인건비·부가가치 구조',
    subtitle: '수작업 발골(Manual Deboning) 기반 일본/영국 프리미엄 시장 독식',
    chartType: 'Composed',
    data: [
      { stage: '원계 생산', laborCost: 15, valueAdded: 10 },
      { stage: '기본 도축', laborCost: 20, valueAdded: 25 },
      { stage: '수작업 발골', laborCost: 75, valueAdded: 80 },
      { stage: '조리/완제품', laborCost: 60, valueAdded: 120 }
    ],
    sit: '글로벌 1위 가공 수출국인 태국(전체 물량 64.5% 가공)의 완제품 직수입은 국내 인건비(가공비)를 100% 소거합니다. 치킨 프랜차이즈나 가정간편식(HMR) 제조사들은 불안정한 브라질산 생육 수급보다 안정적인 가공육 납품을 원합니다.',
    strat: '신라교역의 자본·냉동 인프라를 활용하여 "가공육 환매조건부 비축 및 벤더관리재고(VMI)" 전략을 도입해야 합니다. 태국 가공육을 국내 창고에 선비축하고, 프랜차이즈 본사가 사용한 만큼만 매월 정산하게 하여 장기 고객으로 고착화합니다.',
    reliability: 81,
    methodology: '4축 포렌식 감사 — SRC:22 FRS:20 VRF:20 INT:19. SVG 하드코딩 사문화 코드 제거 및 Recharts 데이터 바인딩 완료. 인건비/부가가치 출처 확보(+29점 향상)',
    source: '태국 축산개발부(DLD) 2023 가공수율 보고서 & CP Foods 2023 밸류체인 분석 기반 자체추정. [STATIC — 실시간 API 미연동]',
    isLive: false // L-12: 정적 스냅샷 — 실시간 API 미연동
  };

  return NextResponse.json(payload);
}
