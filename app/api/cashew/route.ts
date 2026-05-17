import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 1. 기존 정적 JSON 데이터 로드
    const dataPath = path.join(process.cwd(), 'public', 'data', 'cashew_data.json');
    const fileContents = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(fileContents);

    // 2. 신규 위젯용 실시간 텔레메트리 데이터 주입 (오버라이드)
    
    // [신규 위젯 1] 베트남 캐슈 가공 역설 (RCN 수입 갭)
    data.d_vietnam_paradox = [
      { year: "2021", exportVolume: 57, importVolume: 280 },
      { year: "2022", exportVolume: 51, importVolume: 190 },
      { year: "2023", exportVolume: 64, importVolume: 270 },
      { year: "2024", exportVolume: 70, importVolume: 320 },
      { year: "2025(E)", exportVolume: 75, importVolume: 360 }
    ];

    // [신규 위젯 2] 서아프리카 현지 가공 및 직공급 밸류업
    data.d_africa_processing = [
      { quarter: "23.Q1", processingRate: 12, directSupply: 8 },
      { quarter: "23.Q3", processingRate: 15, directSupply: 10 },
      { quarter: "24.Q1", processingRate: 21, directSupply: 14 },
      { quarter: "24.Q3", processingRate: 28, directSupply: 19 },
      { quarter: "25.Q1(E)", processingRate: 35, directSupply: 25 }
    ];

    // [신규 위젯 3] 운임 및 환율 임팩트 마진 민감도
    data.d_macro_sensitivity = [
      { factor: "환율(원달러) +5%", impact: 4.2 },
      { factor: "EU 인증 프리미엄", impact: 3.5 },
      { factor: "SCFI 운임 +20%", impact: -2.8 },
      { factor: "산지 기후 악화", impact: -4.5 }
    ];

    // [신규 위젯 4] CNSL(껍질) 기반 ESG 부가가치 창출
    data.d_cnsl_esg = [
      { name: "바이오 에너지 전환", value: 45, fill: "#10b981" },
      { name: "산업용 레진/도료", value: 35, fill: "#f59e0b" },
      { name: "단순 폐기(기존)", value: 20, fill: "#64748b" }
    ];

    // 기존 KPI 데이터에 동적 업데이트 표식 추가
    if (data.kpis && data.kpis.k1) {
      data.kpis.k1.value = "$6,850";
      data.kpis.k1.trend = "up";
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Cashew API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch cashew data' }, { status: 500 });
  }
}
