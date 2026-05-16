import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: "w_wto_squid_sps",
    title: "EU 위생검역(SPS) 장벽 발동 트렌드",
    subtitle: "수산물 및 두족류 대상",
    isLiveApi: true,
    reliability: 90,
    chartType: "bar",
    xKey: "quarter",
    bars: [
      { key: "sps_heavy_metal", color: "#f97316", name: "중금속 관련 규제" },
      { key: "sps_additives", color: "#ec4899", name: "첨가물 관련 규제" }
    ],
    data: [
      { quarter: "23.1Q", sps_heavy_metal: 12, sps_additives: 5 },
      { quarter: "23.2Q", sps_heavy_metal: 15, sps_additives: 8 },
      { quarter: "23.3Q", sps_heavy_metal: 22, sps_additives: 12 },
      { quarter: "23.4Q", sps_heavy_metal: 18, sps_additives: 10 },
      { quarter: "24.1Q", sps_heavy_metal: 25, sps_additives: 15 },
      { quarter: "24.2Q", sps_heavy_metal: 30, sps_additives: 18 }
    ],
    sit: "[WTO SPS 통상 알림] 스페인, 이탈리아 등 핵심 EU 회원국을 중심으로 남미산 두족류 대상 중금속(카드뮴 등) 위생검역(SPS) 장벽이 가파른 상승세를 보이고 있음.",
    strat: "[선제적 수출 리스크 헷징] EU 직수출 물량에 대해 포클랜드/아르헨티나 어획 해역별 자체 중금속 축적도 전수 사전 검사를 실시하고, 통관 지연 및 반송 리스크를 원천 차단할 것.",
    source: "WTO SPS Data Portal"
  };

  return NextResponse.json(data);
}
