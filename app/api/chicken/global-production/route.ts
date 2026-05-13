import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: 'w_chicken_global_production',
    title: '글로벌 양계 생산량 Top 4 (Global Production)',
    subtitle: '거대 내수 시장(미국/중국) vs 글로벌 수출 기지(브라질/태국)',
    chartType: 'Bar',
    xKey: 'country',
    bars: [
      { key: 'production', color: '#f59e0b', name: '연간 생산량 (만 톤)' }
    ],
    data: [
      { country: '미국 (USA)', production: 2100 },
      { country: '중국 (China)', production: 1450 },
      { country: '브라질 (Brazil)', production: 1480 },
      { country: 'EU', production: 1100 },
      { country: '태국 (Thailand)', production: 330 }
    ],
    sit: '[Market Telemetry] 2024년 전 세계 닭고기 생산량(약 1억 3,720만 톤) 중 미국과 중국이 약 35%를 점유하고 있으나, 대부분 자국 내에서 소비되는 "내수 소진형(Domestic-Consumed)" 구조입니다.',
    strat: '[Executive Pivot] 생산 1, 2위 국가들의 실질 수출 물량 기여도는 낮습니다. Silla Co.는 자국 소비 대비 생산 잉여가 월등히 높은 브라질(범용 냉동육)과 태국(프리미엄 가공육)에 집중하여 실질적인 글로벌 물동량 주도권을 장악해야 합니다.',
    reliability: 74,
    methodology: '4축 포렌식 감사 기준 — SRC:23 FRS:19 VRF:14 INT:18. 기준연도 미표기(-3), 산출식 미공개(-8), 인도(3위) 누락(-4)',
    source: 'USDA FAS PSD Online (2024) & FAOSTAT Production Qty (2023). 단위: 만 MT. 주의: 인도(~550만톤, 세계 3위) 미포함'
  };

  return NextResponse.json(data);
}
