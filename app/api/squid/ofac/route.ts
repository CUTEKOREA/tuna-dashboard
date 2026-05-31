import { NextResponse } from 'next/server';

// 정직 STATIC: agri_data 실측(UN Comtrade 거울통계) + EJF 2025 보고서 기반.
// 기존 mock(중국 선단 IUU '적발 건수' 가공치) → 실측 무역 불일치 데이터로 교체.
export async function GET() {
  const data = {
    id: "w_ofac_iuu_radar",
    title: "남서대서양 IUU 무역 불일치 & Mile 201",
    subtitle: "수출국 신고 - 수입국 신고 '거울통계' 갭 (보고 누락 = IUU·환적 리스크)",
    isLiveApi: false,
    isLive: false,
    reliability: 80,
    chartType: "bar",
    xKey: "route",
    bars: [
      { key: "gap", color: "#ef4444", name: "거울통계 갭 (톤)" }
    ],
    data: [
      { route: "아르헨→한국", gap: 28393 },
      { route: "중국→미국", gap: 21453 },
      { route: "아르헨→싱가포르", gap: 19560 },
      { route: "러시아→중국", gap: 12366 },
      { route: "베트남→일본", gap: 11383 }
    ],
    sit: "[거울통계 IUU 레이더] 수출국 신고 물량과 수입국 신고분의 격차가 최대 28,393톤(아르헨티나→한국)에 달합니다. EJF 조사에 따르면 아르헨티나 EEZ 외곽 'Mile 201'에서 약 350척(중국·한국·대만)이 무규제 조업 중이며, 공해 조업시간이 2019~2024년 +65%(중국 선단 +85%) 급증했습니다.",
    strat: "[무결점 공급망] 거울통계 갭이 큰 경로(아르헨·러시아산) 원물 매입 시 어획증명서·환적이력 100% 추적을 의무화하고, Mile 201 무규제 조업분과 분리된 합법 선단 중심으로 B2B 매입망을 재편하십시오.",
    source: "UN Comtrade 거울통계(insight10_iuu_discrepancy.json) + EJF 'Unseen & Unregulated: the hidden price of squid in Spain' (2025)"
  };
  return NextResponse.json(data);
}
