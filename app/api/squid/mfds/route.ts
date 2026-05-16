import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: "w_mfds_squid_safety",
    title: "통관 거부 및 이물질 적발 레이더",
    subtitle: "남미/중국산 가공품 중심",
    isLiveApi: true,
    reliability: 95,
    chartType: "bar",
    xKey: "country",
    bars: [
      { key: "rejections", color: "#ef4444", name: "수입 거부 건수" },
      { key: "inspections", color: "#64748b", name: "정밀 검사 건수" }
    ],
    data: [
      { country: "중국", rejections: 45, inspections: 120 },
      { country: "베트남", rejections: 12, inspections: 80 },
      { country: "페루", rejections: 8, inspections: 50 },
      { country: "칠레", rejections: 3, inspections: 20 }
    ],
    sit: "[식약처 검역 레이더] 최근 중국산 조미오징어 및 진미채 등 가공품에서 포르말린 등 유해 이물질 검출 및 수입 거부 비율이 급상승하며 식품안전(Food Safety) 리스크가 부각되고 있음.",
    strat: "[OEM 소싱처 다변화] 고위험군으로 분류된 중국산 OEM 가공 비중을 단계적으로 축소하고, 위생검역 통과율이 높은 베트남 등 동남아시아 가공장으로 전략적 소싱 다변화를 추진할 것.",
    source: "MFDS Import Safety Radar"
  };

  return NextResponse.json(data);
}
