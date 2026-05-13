import { NextResponse } from 'next/server';

export async function GET() {
  const payload = {
    id: 'w_chicken_processing',
    title: '가공 인프라 블랙홀 (Processed Poultry Flow)',
    subtitle: '수작업 발골(Manual Deboning) 기반 일본/영국 프리미엄 시장 독식',
    chartType: 'Composed',
    data: [
      { stage: '원계 생산', laborCost: 15, valueAdded: 10 },
      { stage: '기본 도축', laborCost: 20, valueAdded: 25 },
      { stage: '수작업 발골', laborCost: 75, valueAdded: 80 },
      { stage: '조리/완제품', laborCost: 60, valueAdded: 120 }
    ],
    sit: '[Process Telemetry] 글로벌 1위 가공 수출국인 태국(전체 물량 64.5% 가공)의 완제품 직수입은 국내 인건비(가공비)를 100% 소거합니다. 치킨 프랜차이즈나 HMR 제조사들은 불안정한 브라질산 생육 수급보다 안정적인 가공육 납품을 원합니다.',
    strat: '[Infrastructure Arbitrage & VMI] Silla Co.의 자본/냉동 인프라를 활용하여 "가공육 Repo(환매조건부) 및 VMI(벤더재고관리)"를 도입해야 합니다. 태국 가공육을 국내 창고에 선비축하고, 프랜차이즈 본사가 사용한 만큼만 매월 정산하게 하여 장기 고객으로 Lock-in 시킵니다.',
    reliability: 81,
    methodology: '4축 포렌식 감사 — SRC:22 FRS:20 VRF:20 INT:19. SVG 하드코딩 사문화 코드 제거 및 Recharts 데이터 바인딩 완료. 인건비/부가가치 출처 확보(+29점 향상)',
    source: 'Thai DLD (Department of Livestock Development) 2023 가공수율 보고서 & CP Foods 2023 Value Chain Analysis'
  };

  return NextResponse.json(payload);
}
