import { NextResponse } from 'next/server';

// 정직 STATIC: CBOT 밀 시세·KCS 타피오카 FOB 기반 HQCF 대체 경제성 모델(추정).
// 외부 실시간 API 미연동 → isLive:false, source에서 'Live' 표기 제거.
export async function GET() {
  try {
    const wheatFlourWholesale = 850; // 아프리카 수입 밀가루 도매가 추정 ($/t)
    const hqcfMarketPrice = 550;     // HQCF 도매가 추정 ($/t)
    const hqcfSavingsPerTon = wheatFlourWholesale - hqcfMarketPrice;

    const payload = {
      id: 'w_arbitrage',
      title: '글로벌 곡물 차익거래 & HQCF 대체율 계산기',
      subtitle: 'CBOT 밀 선물 vs KCS 타피오카 (수입 밀가루 대체 경제성 모델)',
      chartType: 'Composed',
      xKey: 'scenario',
      bars: [
        { key: 'wheatCost', color: '#b45309', name: '기존 밀가루 수입 비용 ($M)' },
        { key: 'hqcfCost', color: '#fbbf24', name: 'HQCF 혼합 시 비용 ($M)' }
      ],
      lines: [
        { key: 'savings', color: '#f59e0b', name: '순 절감액 (Net Savings $M)' }
      ],
      data: [
        { scenario: '밀 100% (현행)', wheatCost: 400, hqcfCost: 400, savings: 0 },
        { scenario: 'HQCF 10% 대체', wheatCost: 400, hqcfCost: 370, savings: 30 },
        { scenario: 'HQCF 20% 대체', wheatCost: 400, hqcfCost: 340, savings: 60 },
        { scenario: 'HQCF 35% 대체', wheatCost: 400, hqcfCost: 295, savings: 105 },
      ],
      sit: `[HQCF 대체 경제성] 수입 밀가루 도매가($${wheatFlourWholesale}/t) 대비 HQCF($${hqcfMarketPrice}/t) 활용 시 톤당 $${hqcfSavingsPerTon}의 비용(OPEX)이 절감되는 구조적 원가 우위가 추정됩니다.`,
      strat: `서아프리카(가나·나이지리아) 제빵 시장에서 HQCF 20% 의무 혼합 법안이 통과되면 연간 약 $60M 규모의 수입 대체 효과가 추정되므로, 현지 HQCF 가공 CAPEX 투자의 타당성을 우선 검토하십시오.`,
      reliability: 80,
      isLive: false,
      source: 'CBOT 밀 선물·KCS 타피오카 FOB 기반 HQCF 대체 경제성 모델 (정적 추정)'
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error in /api/cassava/arbitrage:', error);
    return NextResponse.json({ error: 'Failed to fetch arbitrage data' }, { status: 500 });
  }
}
