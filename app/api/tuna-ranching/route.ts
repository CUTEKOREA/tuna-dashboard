import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function GET() {
  const filePath = path.join(process.cwd(), 'public/data/tuna_ranching_dashboard.json');
  let data;
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    data = JSON.parse(fileContents);
  } catch (error) {
    console.error("Failed to read JSON:", error);
    return NextResponse.json({ error: 'Failed to load static data' }, { status: 500 });
  }

  // ⚠️ 시뮬레이션 오버라이트 — 다음 9개 필드는 실시간 API 호출이 아닌 정기 갱신 추정치입니다.
  // 실시간 KCS/KAMIS 통관은 /api/tuna 참조. 본 endpoint는 SYNCED 라벨 적용 권장.
  // 1. KCS(관세청) - 글로벌 단일 시장 수출 단가 업데이트
  data.livePriceData = {
    japanPrice: 14.85,
    koreaUSPrice: 22.18,
    lastUpdated: '2026-05 (정기 갱신 추정치)' // L-09: 현재시각 스탬프 금지 — 추정치 작성 시점 표기
  };

  // 2. ICCAT/GLOBEFISH API - 쿼터 소진율
  data.quotaExhaustion = {
    totalQuota: 48283,
    euExhaustionRate: 85.4, // 유럽 소진율 85.4%
    moroccoExhaustionRate: 42.1,
    koreaExhaustionRate: 98.5,
    dumpingRisk: "HIGH",
    alertMessage: "유럽 업체의 쿼터 조기 소진으로 단기 덤핑 리스크 감지됨"
  };

  // 3. MOF/FAO 통계 기반 양식 vs 어획 크로스오버 스프레드 (정기 갱신 추정치 — 라이브 아님)
  data.aquaculturePremium.push({
    year: "2026 추정",
    "야생_어획_단가": 23200,
    "양식_단가": 33100,
    note: "스프레드 확대 (양식 프리미엄 +42%, 2026-05 추정)"
  });

  // 4. Middle East Local API + EUMOFA + Logistics + BOK = 글로벌 차익거래 레이더
  // ⚠️ 시뮬레이션 데이터 — 두바이/지중해 가격은 IMARC Middle East Seafood 2026-2034 기반 추정
  data.arbitrageRadar = {
    dubaiLocalPriceUSD: 45.0, // 두바이 판매가 (위젯 $42~48 범위 평균치, IMARC 2026-2034)
    dubaiPriceRange: "42~48",
    mediterraneanSpotPriceUSD: 18.5, // 지중해 매입가 (Balfegó 등 가공품 OEM 단가 추정)
    airFreightCostUSD: 4.2, // 항공 운임
    processingCostUSD: 2.8, // 가공비
    netMarginUSD: 19.5, // 45.0 - 18.5 - 4.2 - 2.8
    marginGapVsJapan: "+15%",
    recommendation: "두바이 직수출 마진이 일본향 대비 우위. 단 First-mover 윈도우는 1~2년(스페인·일본 트레이딩 하우스 진입 임박)",
    source: "IMARC Middle East Seafood Market 2026-2034 추정 + 자체 분석"
  };

  // 5. NOAA 기후 리스크 및 운임 지수 시뮬레이터 파라미터 한계값
  data.simulatorParams = {
    waterTempBase: 24.5,
    waterTempMax: 28.0,
    freightCostBase: 4.2,
    freightCostMax: 10.0
  };

  // 6. KCS (관세청) 중동(UAE, 사우디, 카타르) 실제 참치 수출액 백테스팅 데이터 (2021-2024)
  if (data.middleEastMarket) {
    data.middleEastMarket.kcsBacktesting = [
      { year: "2021", kcsExportUsd: 12.5, note: "초기" }, // 단위: 백만 달러 (M USD)
      { year: "2022", kcsExportUsd: 18.2, note: "카타르 월드컵 기점" },
      { year: "2023", kcsExportUsd: 25.4, note: "사우디 콜드체인 확장" },
      { year: "2024", kcsExportUsd: 36.8, note: "CEPA 기대감/본격 궤도" }
    ];
  }

  // 7. S-Grade KPI Generation for Tuna Ranching Dashboard
  data.kpis = {
    kpi1: {
      title: "글로벌 축양 쿼터 (ICCAT)",
      value: "48,283톤",
      trend: "유지",
      desc: "대서양/지중해 배정 한도 (ICCAT 2025 공시)",
      telemetry: "STATIC",
      syncDate: "2025 ICCAT"
    },
    kpi2: {
      title: "유럽 쿼터 소진율",
      value: "85.4%",
      trend: "+12.1%p",
      desc: "단기 덤핑 리스크 경보 (2026 Q1 추정)",
      telemetry: "STATIC",
      syncDate: "2026-Q1 추정"
    },
    kpi3: {
      title: "두바이 프리미엄 단가 (UAE)",
      value: "$42~48/kg",
      trend: "+8.5%",
      desc: "IMARC Middle East Seafood Market 2026-2034 추정 범위",
      telemetry: "STATIC",
      syncDate: "2026-05-20"
    },
    kpi4: {
      title: "두바이 직납 순마진 (Net Margin)",
      value: "$19.5/kg",
      trend: "+15%",
      desc: "vs 일본 츠키지 수출 (시뮬레이션)",
      telemetry: "STATIC",
      syncDate: "2026-05-20"
    },
    kpi5: {
      title: "양식 프리미엄",
      value: "+42.6%",
      trend: "확대",
      desc: "vs 야생 어획 단가 (추정치)",
      telemetry: "STATIC",
      syncDate: "2026-05 추정"
    }
  };

  // Telemetry 표준화: 정적 JSON + 9개 livePriceData/quotaExhaustion 오버라이트는 SYNCED (정기 갱신 추정치)
  data.isLive = false;
  data.source = data.source || 'tuna_ranching_dashboard.json + 정기 갱신 추정치 (SYNCED)';
  // L-09: 현재시각을 갱신일로 위조하지 않음 — JSON에 명시된 값이 없으면 생략
  return NextResponse.json(data);
}
