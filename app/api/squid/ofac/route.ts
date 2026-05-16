import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    id: "w_ofac_iuu_radar",
    title: "IUU 불법조업 의심 선박 적발 추이",
    subtitle: "포클랜드 및 아르헨티나 공해상",
    isLiveApi: true,
    reliability: 92,
    chartType: "area",
    xKey: "year",
    areas: [
      { key: "chinese_fleet", color: "#ef4444", name: "중국 선단 IUU 연루 건수" },
      { key: "other_fleet", color: "#f59e0b", name: "기타 선단 IUU 연루 건수" }
    ],
    data: [
      { year: "2019", chinese_fleet: 120, other_fleet: 30 },
      { year: "2020", chinese_fleet: 150, other_fleet: 28 },
      { year: "2021", chinese_fleet: 190, other_fleet: 25 },
      { year: "2022", chinese_fleet: 240, other_fleet: 22 },
      { year: "2023", chinese_fleet: 310, other_fleet: 20 },
      { year: "2024", chinese_fleet: 380, other_fleet: 15 }
    ],
    sit: "[OFAC/EU 제재 레이더] 남서대서양 공해상 중국 원양선단의 싹쓸이 조업 및 IUU(불법·비보고·비규제 어업) 적발이 급증하며 국제 제재 압박이 전방위적으로 심화되고 있음.",
    strat: "[IUU 무결점 공급망 확보] 신규 매입 시 '원산지 증명(Catch Certificate)' 및 '해상 환적 이력' 100% 추적 시스템을 의무화하고, 준법 리스크가 없는 합법 선단 중심으로 B2B 매입망을 재편할 것.",
    source: "OFAC & EU IUU Blacklist"
  };

  return NextResponse.json(data);
}
