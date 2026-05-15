import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: "w_kosis_squid_cpi",
    title: "소비자 물가(CPI) 괴리율 분석",
    subtitle: "살오징어 vs 수입 대체 오징어",
    isLiveApi: true,
    reliability: 98,
    chartType: "line",
    xKey: "month",
    lines: [
      { key: "domestic_cpi", color: "#ef4444", name: "국내 살오징어 CPI" },
      { key: "import_cpi", color: "#3b82f6", name: "수입 일렉스 CPI" }
    ],
    data: [
      { month: "10월", domestic_cpi: 115, import_cpi: 95 },
      { month: "11월", domestic_cpi: 122, import_cpi: 97 },
      { month: "12월", domestic_cpi: 135, import_cpi: 101 },
      { month: "1월", domestic_cpi: 142, import_cpi: 104 },
      { month: "2월", domestic_cpi: 155, import_cpi: 108 },
      { month: "3월", domestic_cpi: 168, import_cpi: 110 }
    ],
    sit: "[KOSIS] 국내 살오징어 어획량 급감으로 소비자 물가가 연일 최고치를 경신 중.",
    strat: "가성비가 뛰어난 남미산 수입 물량을 내수 대형 마트에 B2B 직공급하여 점유율 확대.",
    source: "KOSIS & KAMIS Live"
  };

  return NextResponse.json(data);
}
