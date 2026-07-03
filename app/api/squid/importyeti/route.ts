import { NextResponse } from 'next/server';

export const revalidate = 3600;

// 정직 STATIC: UN Comtrade 2023 EU 수입 상대비중(실측) + EJF 2025. 기존 mock(벤더별 TEU 가공치) 제거.
export async function GET() {
  const data = {
    id: "w_importyeti_eu_buyers",
    title: "EU 오징어 수입 게이트웨이 — 스페인 집중",
    subtitle: "UN Comtrade 2023 — EU 주요 5개국 수입 비중 (재수출 허브 포함)",
    isLiveApi: false,
    isLive: false,
    reliability: 72,
    chartType: "bar",
    xKey: "country",
    bars: [
      { key: "share", color: "#8b5cf6", name: "EU 5개국 중 수입 비중 (%)" }
    ],
    data: [
      { country: "스페인", share: 72.0 },
      { country: "포르투갈", share: 9.1 },
      { country: "이탈리아", share: 6.5 },
      { country: "독일", share: 6.4 },
      { country: "프랑스", share: 6.0 }
    ],
    unit: "%",
    sit: "[EU 관문 구조] 스페인은 EU 주요 5개국 오징어 수입액의 약 72%를 차지하는 압도적 관문이며, EJF에 따르면 세계 2위 수입국이자 EU의 주된 진입 경로입니다. 다만 비고(Vigo)항은 재수출 허브 역할이 커 수치에 중계물량이 포함됩니다.",
    strat: "대EU 진출은 스페인 비고항 대형 수산기업(Nueva Pescanova·Profand·Iberconsa 등)을 1차 B2B 채널로 공략하되, EU IUU 규정(어획증명)을 충족하는 원물만 투입해 통관·평판 리스크를 차단하십시오.",
    source: "UN Comtrade 2023 수입액 상대비중(agri_data squid_trade_comtrade.csv, 재수출 포함) + EJF 2025"
  };
  return NextResponse.json(data);
}
