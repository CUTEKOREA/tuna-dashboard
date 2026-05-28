import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: "w_mfds_squid_safety",
    title: "통관 거부 및 이물질 적발 레이더",
    subtitle: "남미/중국산 가공품 중심",
    isLiveApi: false,  // Mock data: API 파싱 미구현, 정직 라벨링
    reliability: 95,
    chartType: "composed",
    xKey: "country",
    bars: [
      { key: "inspections", color: "#64748b", name: "총 검사 건수", yAxisId: "left" },
      { key: "rejections", color: "#f43f5e", name: "적발 건수", yAxisId: "left" }
    ],
    lines: [
      { key: "rejectionRate", color: "#f59e0b", name: "적발률 (%)", yAxisId: "right" }
    ],
    data: [
      { country: "중국", inspections: 120, rejections: 45, rejectionRate: 37.5 },
      { country: "베트남", inspections: 80, rejections: 12, rejectionRate: 15.0 },
      { country: "페루", inspections: 50, rejections: 8, rejectionRate: 16.0 },
      { country: "칠레", inspections: 20, rejections: 3, rejectionRate: 15.0 }
    ],
    sit: "[식약처 검역 레이더] 최근 중국산 조미오징어 및 진미채 가공품의 적발률이 37.5%로 급상승하며 식품안전(Food Safety) 리스크가 부각됨.",
    strat: "[OEM 소싱처 다변화] 고위험군인 중국산 OEM 비중을 축소하고, 위생검역 통과율이 높은 베트남(적발률 15%) 등 동남아시아로 소싱 다변화 추진.",
    source: "MFDS Import Safety Radar"
  };

  return NextResponse.json(data);
}
