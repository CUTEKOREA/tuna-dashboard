import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const revalidate = 3600;

export async function GET() {
  try {
    // 1. 기존 정적 JSON 데이터 로드
    const dataPath = path.join(process.cwd(), 'public', 'data', 'cashew_data.json');
    const fileContents = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(fileContents);

    // 2. 신규 위젯 데이터 오버라이드 — 위젯1=UN Comtrade 실측, 위젯2~4=업계 추정/시나리오 (모두 정적, L-09 정직 표기)
    // 위젯2~4(아프리카 가공률·마진민감도·CNSL ESG)는 라이브 API 부재 업계 지표 → 출처 명시 STATIC 유지
    
    // [위젯 1] 베트남 캐슈 가공 역설 — UN Comtrade 실측 (만톤)
    // HS 080131(in-shell RCN, flowCode=M 수입) · 080132(shelled 커널, flowCode=X 수출), reporter 704.
    // partner2=0·mot=0 클린 집계. 2024는 베트남 미보고로 제외. 연 1회 갱신 수동 스냅샷.
    data.d_vietnam_paradox = [
      { year: "2021", exportVolume: 50.7, importVolume: 253.5 },
      { year: "2022", exportVolume: 42.9, importVolume: 167.0 },
      { year: "2023", exportVolume: 48.2, importVolume: 237.0 }
    ];

    // [신규 위젯 2] 서아프리카 현지 가공 및 직공급 밸류업
    data.d_africa_processing = [
      { quarter: "23.Q1", processingRate: 12, directSupply: 8 },
      { quarter: "23.Q3", processingRate: 15, directSupply: 10 },
      { quarter: "24.Q1", processingRate: 21, directSupply: 14 },
      { quarter: "24.Q3", processingRate: 28, directSupply: 19 },
      // 25.Q1은 이미 경과한 분기이나 실측 미확보 — 전망(E)이 아닌 '추정'으로 정직 표기
      { quarter: "25.Q1(추정)", processingRate: 35, directSupply: 25 }
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

    // 기존 KPI 데이터에 fallback 오버라이드 (정적, 수동 갱신)
    if (data.kpis && data.kpis.k1) {
      data.kpis.k1.value = "$6,850";
      data.kpis.k1.trend = "up";
    }

    // Telemetry 정직 표기 (L-09 준수)
    data._metadata = {
      isLive: false,
      status: "STATIC",
      source: "정적 JSON + d_vietnam_paradox=UN Comtrade 실측(2021-23, 만톤) + 위젯3종=업계 추정(ACA·시나리오)",
      syncDate: "2026-05-29",
      // lastUpdated(요청 시각 스탬프)는 데이터 갱신일로 오인될 수 있어 제거 — syncDate가 단일 기준일
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Cashew API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch cashew data' }, { status: 500 });
  }
}
