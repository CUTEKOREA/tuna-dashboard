import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: 'w_chicken_global_export',
    title: '원물 vs 가공육 수출 점유율 (Export Dominance)',
    subtitle: '브라질(단순 물동량 1위) vs 태국(가공육 수익성 1위)',
    chartType: 'Composed',
    xKey: 'country',
    bars: [
      { key: 'frozen', color: '#ef4444', name: '냉동육 수출 (만 톤)' },
      { key: 'processed', color: '#3b82f6', name: '가공육 수출 (만 톤)' }
    ],
    data: [
      { country: '브라질', frozen: 489, processed: 20 },
      { country: '미국', frozen: 304, processed: 10 },
      { country: 'EU', frozen: 140, processed: 40 },
      { country: '태국', frozen: 40, processed: 75 }
    ],
    sit: '[Market Telemetry] 글로벌 수출 물동량 1,373만 톤 중 브라질이 무려 36%를 차지하며 단순 냉동육 시장을 장악하고 있습니다. 반면 태국은 수출량 4위(115만 톤)임에도 고부가가치 가공육 부문에서 압도적 1위를 유지하고 있습니다.',
    strat: '[Executive Pivot] 철저히 이원화된 수출 포트폴리오를 인지해야 합니다. 저마진 브라질산 원물 취급을 넘어서, 글로벌 프리미엄 수요를 독식하는 태국산 완조리/반조리 수입을 확대하여 HMR B2B 시장의 마진을 극대화해야 합니다.',
    reliability: 72,
    methodology: '4축 포렌식 감사 — SRC:22 FRS:18 VRF:14 INT:18. 기준연도 미표기(-4), HS코드별 추출 경로 미공개(-8)',
    source: 'USDA FAS Trade Data (2023) & Thai DLD Export Statistics (2023). HS 0207 기준. EU 역내 교역 포함 여부 추가 확인 필요'
  };

  return NextResponse.json(data);
}
