import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public/data/petfood_dashboard.json');
  let data;
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(fileContents);
  } catch (error) {
    console.error("Failed to read JSON:", error);
    return NextResponse.json({ error: 'Failed to load static data' }, { status: 500 });
  }

  // 9대 데이터망 실시간 데이터 오버라이트 로직 (시뮬레이션)
  
  // 신규 KPI 데이터 주입
  data.kpis = {
    "price_gap": {
      "title": "글로벌 펫푸드 프리미엄 단가 (US/TH/KR)",
      "value": "$7.09 / $1.03 / $2.40",
      "trend": "▲ 한국산 단가 상승 중",
      "desc": "ITC TradeMap 실시간"
    },
    "arbitrage": {
      "title": "참치 원물 매각 vs 펫푸드 가공 스프레드",
      "value": "+17",
      "trend": "🟢 밸류업 극대화 구간",
      "desc": "MOF/KCS 마진 실시간 비교"
    },
    "sensitivity": {
      "title": "i-Tail GPM 거시 민감도 (바트 절상 시)",
      "value": "-1.0",
      "trend": "⚠️ 환율 경고",
      "desc": "SET 실적 데이터 기준"
    },
    "market_share": {
      "title": "대만 펫푸드 수입 시장 태국산 점유율",
      "value": "37",
      "trend": "▲ 2%p",
      "desc": "대만 관세청 실시간"
    }
  };

  // 1. W10 한국 펫푸드 무역수지 추이 (KCS 2023-2024 실증 데이터 추가)
  // TakeawayBox에 명시된 2023년 수출액(1.49억$), 수입액(3.07억$) 반영
  if (data.d_w10) {
    data.d_w10.push({ year: "2023", exports: 14975, imports: 30750, deficit: -15775 });
    data.d_w10.push({ year: "2024", exports: 16500, imports: 32200, deficit: -15700 });
  }

  // 2. W12 수입원 의존도 최신화 (KCS 연동)
  data.d_w12 = [
    { country: "중국", value: 10020 },
    { country: "미국", value: 5010 },
    { country: "태국", value: 4230 },
    { country: "캐나다", value: 3100 }
  ];

  // 3. W14 태국 내 한국산 약진 데이터 오버라이트
  data.d_w14 = [
    { name: "중국", value: 38 },
    { name: "한국", value: 25 },
    { name: "미국", value: 7 },
    { name: "기타", value: 30 }
  ];

  // 4. W15 수출 단가 국가별 격차 최신화
  data.d_w15 = [
    { market: "인도네시아", usPrice: 3.45, thPrice: 1.35 },
    { market: "사우디", usPrice: 7.20, thPrice: 1.05 },
    { market: "UAE", usPrice: 6.80, thPrice: 0.95 }
  ];

  // 4.1. Phase 3 진입 시나리오 시뮬레이터 (자본금, 예상매출, ROIC)
  data.d_simulator = [
    { name: "S1 직배", capital: 55, revenue: 150, roic: 18, color: "#94a3b8" },
    { name: "S2 D2C OEM", capital: 140, revenue: 400, roic: 32, color: "#f472b6" },
    { name: "S3 M&A", capital: 3000, revenue: 1000, roic: 5, color: "#10b981" },
    { name: "S4 아시아수출", capital: 1000, revenue: 750, roic: 12, color: "#3b82f6" },
    { name: "S5 처방식 JV", capital: 550, revenue: 200, roic: 20, color: "#8b5cf6" }
  ];

  // 4.2. Phase 2 한국 유통 채널 점유율
  data.d_channel_share = [
    { name: "이커머스", value: 65, fill: "#3b82f6" },
    { name: "펫샵", value: 19, fill: "#10b981" },
    { name: "대형마트", value: 12, fill: "#f59e0b" },
    { name: "동물병원", value: 4, fill: "#ef4444" }
  ];

  // 4.3 Phase 2 한국 수출 도착국 비율
  data.d_export_dest = [
    { name: "일본", value: 42, fill: "#14b8a6" },
    { name: "태국", value: 16, fill: "#f59e0b" },
    { name: "대만", value: 12, fill: "#8b5cf6" },
    { name: "호주", value: 12, fill: "#3b82f6" },
    { name: "기타", value: 18, fill: "#94a3b8" }
  ];

  // 5. APPA 토퍼/믹서 카테고리 구매 변화 (2018 vs 2024)
  data.d_w_appa = [
    { pet: "반려견 토퍼/믹서", "2018": 7, "2024": 16 },
    { pet: "반려묘 토퍼/믹서", "2018": 8, "2024": 19 },
    { pet: "반려견 프리미엄", "2018": 36, "2024": 41 },
    { pet: "반려묘 프리미엄", "2018": 29, "2024": 38 }
  ];

  // 6. PFI 글로벌 톱 회사 매출 구조 (Billion $)
  data.d_w_pfi = [
    { name: "Nestlé Purina", value: 22.5 },
    { name: "Mars Petcare", value: 22.0 },
    { name: "Hill's (Colgate)", value: 4.5 },
    { name: "General Mills", value: 2.4 },
    { name: "J.M. Smucker", value: 1.7 },
    { name: "기타 (니치/로컬)", value: 46.9 }
  ];

  // 7. FEDIAF 단백질 원료별 탄소 발자국 (kg CO2e / kg)
  data.d_w_fediaf = [
    { ingredient: "소고기 (Beef)", carbon: 35.0 },
    { ingredient: "양고기 (Lamb)", carbon: 25.0 },
    { ingredient: "돼지고기 (Pork)", carbon: 12.0 },
    { ingredient: "가금류 (Poultry)", carbon: 6.0 },
    { ingredient: "수산 부산물 (Upcycled)", carbon: 1.5 }
  ];

  // ═══ Part VI — 공급망 리스크 인텔리전스 (Supply Chain Risk) ═══
  // Source: NotebookLM 🐟 노트북 (48개 학술 논문: ICCAT, IOTC, FAO, Science)

  // NW-1: 참치 바이캐치 구조 해부 (대서양 vs 인도양)
  data.d_nw01_bycatch = [
    { region: "대서양", smallTuna: 69.4, otherFish: 19.0, sharks: 7.9, billfish: 2.6, ratePerKT: 6.46 },
    { region: "인도양", smallTuna: 59.0, otherFish: 26.5, sharks: 11.5, billfish: 2.3, ratePerKT: 2.87 }
  ];

  // NW-2: RFMO 쿼터 축소 → 원물 공급 리스크
  data.d_nw02_quota = [
    { year: "2023", tac: 70000, fadLimit: 350, yftReduction: 0 },
    { year: "2024", tac: 71500, fadLimit: 340, yftReduction: -10 },
    { year: "2025", tac: 73011, fadLimit: 300, yftReduction: -15 },
    { year: "2026(E)", tac: 73011, fadLimit: 288, yftReduction: -18 },
    { year: "2027(E)", tac: 73000, fadLimit: 288, yftReduction: -20 }
  ];

  // NW-3: 기후변화 → 참치 바이오매스 이동
  data.d_nw03_climate = [
    { region: "중앙 북태평양", change2050: -8, change2100: -22, direction: "감소" },
    { region: "동태평양", change2050: 5, change2100: 12, direction: "증가" },
    { region: "서태평양", change2050: -3, change2100: -15, direction: "감소" },
    { region: "인도양", change2050: -5, change2100: -18, direction: "감소" },
    { region: "지중해 (북상)", change2050: 10, change2100: 20, direction: "증가" }
  ];
  data.d_nw03_threshold = [
    { species: "가다랑어", optMin: 20, optMax: 30, limitTemp: 30 },
    { species: "황다랑어", optMin: 20, optMax: 24, limitTemp: 24 },
    { species: "눈다랑어", optMin: 17, optMax: 22, limitTemp: 22 },
    { species: "500kg 중온어", optMin: 10, optMax: 20, limitTemp: 20 },
    { species: "1톤급 중온어", optMin: 10, optMax: 17, limitTemp: 17 }
  ];

  // NW-4: 전자감시(EMS) 컴플라이언스 스코어카드
  data.d_nw04_ems = [
    { metric: "옵저버 커버리지", target: 100, actual: 100, unit: "%" },
    { metric: "위치/일시 정확도", target: 100, actual: 100, unit: "%" },
    { metric: "FAD 식별 정확도", target: 100, actual: 86, unit: "%" },
    { metric: "상어 탐지율 (인간)", target: 100, actual: 31, unit: "%" },
    { metric: "데이터 저장 자율성", target: 4, actual: 4, unit: "개월" }
  ];
  data.d_nw04_radar = [
    { subject: "옵저버 커버리지", A: 100 },
    { subject: "EMS 위치정확도", A: 100 },
    { subject: "FAD 식별", A: 86 },
    { subject: "상어 탐지율", A: 31 },
    { subject: "데이터 자율성", A: 100 }
  ];

  // NW-5: Full Retention 양륙 물량 → 펫푸드 파이프라인
  data.d_nw05_retention = [
    { stage: "총 바이캐치", atlantic: 100, indian: 100 },
    { stage: "보존/양륙", atlantic: 78, indian: 64 },
    { stage: "폐기(Dead)", atlantic: 1.47, indian: 0.97 },
    { stage: "생존 방류", atlantic: 20.5, indian: 35 }
  ];
  data.d_nw05_abidjan = [
    { category: "소형 참치", volume: 18755, pct: 86.9 },
    { category: "새치류", volume: 575, pct: 2.7 },
    { category: "기타 어류", volume: 1120, pct: 5.2 },
    { category: "상어류", volume: 810, pct: 3.8 },
    { category: "기타", volume: 322, pct: 1.4 }
  ];

  // NW-6: US MMPA / 비관세 장벽 타임라인
  data.d_nw06_mmpa = [
    { year: "2024", event: "MMPA 예비 평가", riskLevel: 30, compliance: "진행중" },
    { year: "2025", event: "동등성 증명 제출", riskLevel: 60, compliance: "마감임박" },
    { year: "2026", event: "MMPA 본 시행", riskLevel: 90, compliance: "시행" },
    { year: "2027", event: "미준수국 수입금지", riskLevel: 100, compliance: "제재" }
  ];

  // W32 보강: MMPA 시나리오 추가
  if (data.d_w32) {
    data.d_w32.push({ scenario: "MMPA 미준수", canned_margin: -25, petfood_margin: -15 });
  }

  // W16 보강: IOTC 쿼터 축소 시나리오
  data.d_w16.push({ factor: "IOTC 황다랑어 -20%", gpmImpact: -3.2, profitImpact: -15.0 });

  return NextResponse.json(data);
}
