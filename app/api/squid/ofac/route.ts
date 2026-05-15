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
    sit: "[OFAC/EU] 중국 원양선단의 공해상 오징어 싹쓸이 조업 및 IUU(불법어업) 제재 심화.",
    strat: "원산지 증명서(Catch Certificate) 무결점 심사를 강화하고, 컴플라이언스가 검증된 선사와만 B2B 거래 진행.",
    source: "OFAC & EU IUU Blacklist"
  };

  return NextResponse.json(data);
}
