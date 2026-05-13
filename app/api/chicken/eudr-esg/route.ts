import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: 'w_chicken_eudr_esg',
    title: 'EUDR/ESG 규제 대응 스코어카드 (Green Trade Barrier)',
    subtitle: 'EU 삼림벌채방지법(EUDR) 대응력: 태국 빅3 vs 브라질 빅3',
    chartType: 'Radar',
    xKey: 'dimension',
    radars: [
      { key: 'thaiScore', name: '태국 빅3 (CP/Betagro/GFPT)', color: '#10b981' },
      { key: 'brazilScore', name: '브라질 빅3 (JBS/BRF/Seara)', color: '#ef4444' }
    ],
    data: [
      { dimension: 'EUDR 추적 시스템', thaiScore: 95, brazilScore: 55 },
      { dimension: 'SBTi Net-Zero 인증', thaiScore: 90, brazilScore: 40 },
      { dimension: 'Scope 3 배출 보고', thaiScore: 85, brazilScore: 30 },
      { dimension: '블록체인 공급망', thaiScore: 92, brazilScore: 45 },
      { dimension: '항생제 프리(ABF)', thaiScore: 88, brazilScore: 50 },
      { dimension: 'HPAI 방역 등급', thaiScore: 100, brazilScore: 35 }
    ],
    sit: '[ESG Telemetry] EU 삼림벌채방지법(EUDR)은 사료용 대두의 GPS 지리적 위치 증명을 강제합니다. EU 닭고기 수입량은 2021년 64.7만톤 → 2026년 84만톤(+30%)으로 급증 예상이나, EUDR 준수 비용이 진입장벽으로 작용합니다. CP는 세계 식품업계 최초 SBTi Net-Zero 2050 승인, Betagro는 2023년 CAPEX 44.1억 바트(약 1,600억원)를 e-Traceability에 투자, 2시간 내 제품 이력 추적이 가능합니다. 반면 브라질 중소 농가는 디지털 인프라 부족으로 규제 준수 비용 급증이 예상됩니다.',
    strat: '[Green Barrier Arbitrage] EUDR은 태국 대기업에게 \"녹색 진입장벽\"이라는 강력한 무기입니다. Silla Co.는 이를 활용해 ①EUDR 인증 태국산 가공육의 프리미엄 라벨링으로 국내 B2B 바이어에게 ESG 컴플라이언스 제안 ②향후 한국에서도 유사 규제 도입 시 선점 효과 ③항생제 프리(ABF) 인증 닭고기로 소비자 신뢰 확보 및 프리미엄 마진을 실현해야 합니다.',
    reliability: 58,
    methodology: '4축 포렌식 감사 — SRC:19 FRS:16 VRF:8 INT:15. ⚠️ 레이더 6개 차원의 정량 점수(0~100) 산출 방법론 전무(-14). 외부 데이터로 재현 불가',
    source: 'EU Official Journal L 2023/1115 & CP/Betagro/GFPT Annual Reports. ⚠️ 레이더 스코어는 자체 추정이며 공식 ESG 기관(MSCI, Sustainalytics 등)의 평가 등급과 무관함'
  };

  return NextResponse.json(data);
}
