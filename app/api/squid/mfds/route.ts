import { NextResponse } from 'next/server';

// 정직 STATIC: 식약처 식품공전 중금속 기준(실측) + 한국 수입검사 프로토콜 보고서.
// 기존 mock(국가별 적발률 가공치) → 실제 규제 한도·종별 리스크로 교체.
export async function GET() {
  const data = {
    id: "w_mfds_squid_safety",
    title: "MFDS 수입 중금속 기준 & 종별 반송 리스크",
    subtitle: "식약처 식품공전 한도 — 대왕오징어(Dosidicus) 카드뮴 리스크",
    isLiveApi: false,
    isLive: false,
    reliability: 93,
    chartType: "bar",
    xKey: "item",
    bars: [
      { key: "limit", color: "#10b981", name: "한도 (mg/kg)" }
    ],
    data: [
      { item: "카드뮴 Cd (일반 두족류)", limit: 2.0 },
      { item: "카드뮴 Cd (건강식품용)", limit: 1.0 },
      { item: "납 Pb", limit: 0.5 }
    ],
    unit: "mg/kg",
    sit: "[식약처 중금속 기준] 일반 두족류 카드뮴 ≤2.0 mg/kg, 납 ≤0.5 mg/kg가 통관 기준입니다. 페루·칠레산 대왕오징어(Dosidicus gigas)는 살오징어(Todarodes)보다 카드뮴 축적이 높고 특히 내장에 집중되어 정밀검사·반송 리스크가 큽니다. 참고로 EU는 두족류 카드뮴 1.0 mg/kg로 한국보다 엄격합니다.",
    strat: "페루·칠레산 대왕오징어 매입 시 내장 제거 가공 및 선적 전 카드뮴 사전검사를 의무화하고, EU 수출 물량은 EU 1.0 mg/kg 기준으로 별도 라인 관리하십시오.",
    source: "식약처(MFDS) 식품의 기준 및 규격(식품공전) 중금속 기준 + 한국 수입검사 프로토콜 분석 보고서(agri_data) + EU Reg 1881/2006"
  };
  return NextResponse.json(data);
}
