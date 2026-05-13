import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: 'w_chicken_risk_radar',
    title: '기후/질병 리스크 헷징 레이더 (Heat Stress & HPAI)',
    subtitle: '태국 프라두 항덤 유전자원의 내서성 및 HPAI 완전 저항성 비교',
    chartType: 'Radar',
    xKey: 'dimension',
    radars: [
      { key: 'brazil', name: '브라질 육계 (Conventional)', color: '#ef4444' },
      { key: 'thai', name: '태국 토종 (Pradu Hang Dum)', color: '#8b5cf6' }
    ],
    data: [
      { dimension: '고온 폭염 생존율 (Heat Tolerance)', brazil: 60, thai: 95 },
      { dimension: 'HPAI (조류독감) 저항성 (Blec2*TH2)', brazil: 45, thai: 100 },
      { dimension: '공정 자동화 수율 (수작업 발골)', brazil: 70, thai: 99 },
      { dimension: '사료 효율 (FCR)', brazil: 85, thai: 90 },
      { dimension: '온습도지수(THI) 방어력', brazil: 50, thai: 95 }
    ],
    sit: '[Risk Telemetry] 한국의 수입 생육은 87%가 브라질에 단일 의존 중입니다. 브라질에서 HPAI가 발생할 경우 국내 생육 밸류체인은 즉각 마비됩니다. 태국 가공육은 기후 탄력성과 HPAI 저항성이 뛰어나 가장 확실한 대안입니다.',
    strat: '[Spatial Arbitrage] Silla Co.는 "공간(무역) 차익거래"를 활용해야 합니다. 브라질 발 HPAI 무역 병목이 발생할 때, 글로벌 가공육 수출 1위인 태국의 대규모 수직계열화 물량을 선제 확보하여 국내 대형 프랜차이즈에 직공급하는 우회 소싱 구조를 구축해야 합니다.',
    reliability: 55,
    methodology: '4축 포렌식 감사 — SRC:18 FRS:16 VRF:8 INT:13. ⚠️ 레이더 5축 점수의 정량 산출 근거 전무(-14). Blec2*TH2 유전자 주장에 학술 인용 없음. 공정 자동화 수율 99점은 수작업 발골과 모순',
    source: 'OIE WAHIS (World Animal Health Info System) & Thai DLD Annual Report. ⚠️ 레이더 스코어(0-100)는 NotebookLM 정성 분석 기반 추정이며 공식 지수가 아님. 향후 PubMed/OIE 실증 앵커링 필요'
  };

  return NextResponse.json(data);
}
