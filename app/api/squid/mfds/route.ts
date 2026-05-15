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
    sit: "[MFDS] 중국산 조미오징어 및 진미채에서 이물질(포르말린 등) 검출 비율 상승 중.",
    strat: "중국산 OEM 비중을 줄이고, 베트남 등 통관 리스크가 낮은 동남아 가공장으로 소싱처 다변화.",
    source: "MFDS Import Safety Radar"
  };

  return NextResponse.json(data);
}
