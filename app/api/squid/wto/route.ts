import { NextResponse } from 'next/server';

export const revalidate = 3600;

// 정직 STATIC: EU/한국/일본 실제 중금속 한도 + IUU 통상 규정(실측). 기존 mock(분기별 SPS 발동 건수) 제거.
export async function GET() {
  const data = {
    id: "w_wto_squid_sps",
    title: "시장별 중금속·IUU 수입 규제 매트릭스",
    subtitle: "카드뮴 한도(mg/kg) 및 IUU 통상 장벽 비교",
    isLiveApi: false,
    isLive: false,
    reliability: 88,
    chartType: "bar",
    xKey: "market",
    bars: [
      { key: "cd_limit", color: "#a855f7", name: "카드뮴 한도 (mg/kg)" }
    ],
    data: [
      { market: "EU", cd_limit: 1.0 },
      { market: "한국", cd_limit: 2.0 },
      { market: "일본", cd_limit: 2.0 }
    ],
    unit: "mg/kg",
    sit: "[시장별 비관세 장벽] 카드뮴 한도가 EU(1.0 mg/kg)는 한국·일본(2.0)보다 2배 엄격합니다. EU는 추가로 IUU 규정(EC 1005/2008)의 어획증명서를, 미국은 SIMP(수입 수산물 추적 프로그램)를 요구해 시장별 통관 요건이 상이합니다.",
    strat: "EU 수출 라인은 카드뮴 1.0 기준 + IUU 어획증명을 충족하는 합법 선단 원물로 분리 관리하고, 규제가 상대적으로 완화된 한국·일본향과 생산 라인을 이원화하십시오.",
    source: "EU Reg 1881/2006(중금속)·1005/2008(IUU) + 식약처 식품공전 + US SIMP (NOAA)"
  };
  return NextResponse.json(data);
}
