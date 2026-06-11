import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: 'w_chicken_feed_cost',
    title: '글로벌 사료 원가 트렌드 (Feed Cost Dynamics)',
    subtitle: 'CBOT 옥수수/대두박 3년 연속 하락 → 태국 수직계열화 마진 극대화 구간',
    chartType: 'Composed',
    xKey: 'year',
    areas: [
      { key: 'cornPrice', color: '#f59e0b', name: 'CBOT 옥수수 ($/부셸)' }
    ],
    lines: [
      { key: 'soybeanMeal', color: '#10b981', name: '대두박 ($/톤)' }
    ],
    bars: [
      { key: 'thaiMargin', color: '#8b5cf6', name: '태국 통합 마진 지수' }
    ],
    data: [
      { year: '2021', cornPrice: 5.56, soybeanMeal: 410, thaiMargin: 62 },
      { year: '2022', cornPrice: 6.54, soybeanMeal: 480, thaiMargin: 48 },
      { year: '2023', cornPrice: 4.95, soybeanMeal: 430, thaiMargin: 68 },
      { year: '2024', cornPrice: 4.42, soybeanMeal: 385, thaiMargin: 78 },
      { year: '2025(E)', cornPrice: 4.15, soybeanMeal: 365, thaiMargin: 85 },
      { year: '2026(E)', cornPrice: 4.00, soybeanMeal: 350, thaiMargin: 90 }
    ],
    sit: '[Feed Telemetry] 닭고기 생산 원가의 60~70%를 차지하는 사료비(옥수수·대두)는 2022년 $6.54/부셸 고점 이후 3년 연속 하락세(-3.9% YoY)입니다. 태국 현지 옥수수 가격은 kg당 9.8바트, 대두박 19.2바트로 안정화되었으며, 2025년 추가 4~5% 하락 전망입니다. 이 구조적 하락은 사육→가공까지 수직계열화(Vertical Integration)를 구축한 태국 통합 기업(CP/Betagro/GFPT)의 수익 마진을 극대화하는 환경입니다.',
    strat: '[Margin Window Strategy] Silla Co.는 현재의 \"사료비 하락 → 생산 마진 확대\" 윈도우를 적극 활용해야 합니다. 태국 공급사의 원가 절감 효과가 최대인 지금이 장기 고정가 계약(LTA) 체결의 최적 타이밍입니다. 향후 곡물가 반등 시 Silla Co.는 잠긴(Locked-in) 저가에 소싱하여 국내 경쟁사 대비 원가 우위를 확보할 수 있습니다.',
    reliability: 75,
    methodology: '4축 포렌식 감사 — SRC:24 FRS:20 VRF:16 INT:15. 2025E/2026E 예측 2개(-3), 태국 통합 마진 지수=자체 산출(-6), 태국 현지 곡물가 출처 미명시(-7)',
    source: 'CBOT Corn Futures (2021-2024 실데이터) & USDA WASDE 2025. ⚠️ "태국 통합 마진 지수"는 자체 생성 복합 지표이며 외부 기관 발행이 아님. 2025E/2026E는 WASDE 전망 기반 추정',
    isLive: false // L-12: 정적 스냅샷 — 실시간 API 미연동
  };

  return NextResponse.json(data);
}
