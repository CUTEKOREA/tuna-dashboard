import { NextResponse } from 'next/server';

// 정직 STATIC: 관세청 조정관세(관세법 §69, 오징어 냉동 22%) + FTA 협정세율 + Comtrade CIF 실측.
// 기존 mock(MFN 20% 등 추정치) → 실제 세율·CIF 기반으로 교체.
export async function GET() {
  // 공통 기준 CIF: 아르헨티나 냉동 오징어 2023 실측 $2,269/t (squid_unit_price.json)
  const CIF = 2269;
  const data = {
    id: "w_squid_hs_tariff_sim",
    title: "오징어 냉동(HS 0307.43) 관세 구조 & 착지원가",
    subtitle: "조정관세 22% vs 기본 10% vs FTA 협정세율 — 공통 CIF $2,269/t 적용",
    isLiveApi: false,
    isLive: false,
    reliability: 85,
    chartType: "composed",
    xKey: "tier",
    bars: [
      { key: "rate", color: "#3b82f6", name: "적용 관세율 (%)" }
    ],
    lines: [
      { key: "landed", color: "#f59e0b", name: "착지원가 ($/t)", yAxisId: "right" }
    ],
    data: [
      { tier: "FTA 협정세율(페루·중국)", rate: 0, landed: CIF },
      { tier: "기본세율(WTO 양허)", rate: 10, landed: Math.round(CIF * 1.10) },
      { tier: "조정관세(미체결국)", rate: 22, landed: Math.round(CIF * 1.22) }
    ],
    unit: "USD/Ton",
    sit: "[관세 구조] 오징어 냉동(HS 0307.43)은 기본세율 10% 위에 22% 조정관세(관세법 §69)가 부과됩니다. FTA 미체결국(아르헨티나·포클랜드) 원물은 22%를 전액 부담해 착지원가 $2,768/t, FTA 체결국(페루) 원물은 협정세율로 $2,269/t — 동일 CIF에서도 톤당 약 $500 차이가 발생합니다.",
    strat: "FTA 체결국(페루) 원물 비중을 높여 조정관세 22%를 회피하고, 미체결국 원물은 ASEAN 경유 가공(베트남 OEM) 등 원산지 전환으로 관세 부담을 최소화하십시오.",
    source: "관세청 조정관세(관세법 §69 일부개정령안, 오징어 냉동 22%) + FTA 협정세율 + UN Comtrade CIF 실측 2023"
  };
  return NextResponse.json(data);
}
