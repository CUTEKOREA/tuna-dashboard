import { NextResponse } from 'next/server';

export const revalidate = 0;

// 정직 라벨 (L-09/L-12): 본 라우트는 외부 API 실연동이 없는 정적 베이스라인이다.
// 과거의 시뮬레이션 fetch(존재하지 않는 SCFI/Comtrade 등 가짜 URL + 1.5s timeout fallback)는
// 100% fallback으로만 동작했으므로 제거하고, isLive:false 를 표준 출력한다.
const DATA_BASELINE = '2026-05-29'; // 베이스라인 데이터 큐레이션 기준일

export async function GET() {
  try {
    // 1. Climate-Yield Predictor (NOAA ONI vs VHT Survival Yield) — 정적 베이스라인
    const climateYieldData = [
      { year: '2018', oni: 0.2, yield: 90 },
      { year: '2019', oni: 0.8, yield: 95 },
      { year: '2020', oni: -1.2, yield: 75 },
      { year: '2021', oni: -1.0, yield: 76 },
      { year: '2022', oni: -0.9, yield: 78 },
      { year: '2023', oni: 1.5, yield: 98 },
      { year: '2024', oni: 0.1, yield: 92 },
      { year: '2025', oni: -0.5, yield: 84 },
    ];

    // 2. Logistics & Phyto-Sanitary Barrier (Modal Shift Impact) — 업계 추정 베이스라인
    const logisticsData = [
      { mode: '항공 운송 (Air)', cost: 5.50, netYield: 98 },
      { mode: '일반 해상 (Reefer)', cost: 2.20, netYield: 75 },
      { mode: '해상 + MAP (가스치환)', cost: 2.95, netYield: 92 },
    ];

    // 3. K-Fruit Arbitrage (Apple Wholesale vs Mangosteen Import) — 정적 베이스라인
    const arbitrageData = [
      { month: '23.09', applePrice: 42000, mangoImport: 120 },
      { month: '23.11', applePrice: 51000, mangoImport: 150 },
      { month: '24.01', applePrice: 73000, mangoImport: 310 },
      { month: '24.03', applePrice: 85000, mangoImport: 450 },
      { month: '24.05', applePrice: 62000, mangoImport: 280 },
      { month: '24.07', applePrice: 55000, mangoImport: 210 },
      { month: '24.09', applePrice: 48000, mangoImport: 160 },
      { month: '24.11', applePrice: 45000, mangoImport: 130 },
      { month: '25.01', applePrice: 68000, mangoImport: 340 },
    ];

    // 4. B2C Fresh vs B2B IQF Margin Tracker (Based on KCS 2025 actual import prices)
    const marginData = [
      { month: '2024-Q3', b2cMargin: 15.2, b2bMargin: 22.4 },
      { month: '2024-Q4', b2cMargin: 8.5, b2bMargin: 22.1 },
      { month: '2025-Jan', b2cMargin: 18.3, b2bMargin: 23.0 },
      { month: '2025-Feb', b2cMargin: -2.1, b2bMargin: 22.8 },
      { month: '2025-Mar', b2cMargin: 5.4, b2bMargin: 22.5 },
    ];

    // 5. Global Hegemony (FAOSTAT Production vs Trade)
    const productionVsTradeData = [
      { country: 'Indonesia', production: 320000, export: 2500, type: '생산 위주 (PLS 한계)' },
      { country: 'Thailand', production: 280000, export: 245000, type: '수출 독점 (VHT 보유)' },
      { country: 'Malaysia', production: 65000, export: 8000, type: '내수 중심' },
      { country: 'Vietnam', production: 42000, export: 12000, type: '신흥 가공 허브' },
    ];

    // 6. Bilateral Re-export Trade Flow
    //    한국 재수출은 KCS 실측(data/mangosteen_kr_export.json 연간 합산: 2024년 355kg ≈ 0.36톤, 전량 몽골향).
    //    과거 '한국 → 몽골 450톤 / 괌 120톤' 표기는 실측 대비 약 1,000배 과장으로 정정(2026-06-11).
    //    괌·북마리아나 라인은 2020년 이후 실적 0 → 행 삭제. 비(非)한국 흐름은 출처 미확정 업계 추정 구조치.
    const bilateralReExportData = [
      { flow: '태국 → 한국 (생과, 추정)', value: 12400 },
      { flow: '인니 → 베트남 (가공, 추정)', value: 4500 },
      { flow: '베트남 → 한국 (IQF/퓨레, 추정)', value: 3800 },
      { flow: '한국 → 몽골 (재수출, KCS 실측)', value: 0.36 },
    ];

    // 7. Rind Upcycling & Pet Food ESG — 시나리오 추정
    const upcyclingData = [
      { scenario: '기존 (과육 B2C)', revenue: 100, rindDisposalCost: -5, netMargin: 95 },
      { scenario: 'ESG 업사이클링 (크산톤 펫푸드)', revenue: 145, rindDisposalCost: 0, netMargin: 145 },
    ];

    // 8. 1-MCP Coldchain Shelf-life Extension — 내부 R&D 베이스라인
    const coldchainData = [
      { day: 'Day 5', standardYield: 95, mcpYield: 98 },
      { day: 'Day 10', standardYield: 75, mcpYield: 96 },
      { day: 'Day 15', standardYield: 50, mcpYield: 92 },
      { day: 'Day 20', standardYield: 25, mcpYield: 85 },
      { day: 'Day 25 (해상도착)', standardYield: 5, mcpYield: 78 },
    ];

    // 9. RCEP Arbitrage (Tariff & Margin) — 시나리오 추정
    const rcepArbitrageData = [
      { route: 'ID -> KR (수입금지)', tariff: 0, margin: 0, type: '불가' },
      { route: 'TH -> KR (생과 항공)', tariff: 24, margin: 12, type: '고비용' },
      { route: 'TH -> KR (생과 해상)', tariff: 24, margin: 18, type: '리스크' },
      { route: 'ID -> VN -> KR (RCEP IQF)', tariff: 0, margin: 28, type: '무관세' },
    ];

    const mangosteenKpis = {
      k1: { title: '태국 수출 패권도 (한국)', value: '96.5~98.7%', trend: '👑', desc: '한국 수입 내 태국산 점유율 - 사실상 독점 (KCS/KATI)', source: '[VERIFIED] KCS + NotebookLM 279소스' },
      k2: { title: '기후-수율 타격 (라니냐)', value: '75%', trend: '🌧️', desc: '강우량 증가로 인한 VHT 통과 수율 급락치', source: '[BASELINE] NOAA ONI + Packhouse 추정' },
      k3: { title: '물류 전환 원가 절감', value: '-46.3%', trend: '📉', desc: '항공 -> 해상+MAP 포장 전환 시 절감액', source: '[BASELINE] SCFI / IATA 추정' },
      k4: { title: '아비트리지 임계점', value: '8.5만원', trend: '🍎', desc: '사과 도매가 돌파 시 망고스틴 수입량 폭증', source: '[BASELINE] KAMIS 추정' },
      k5: { title: 'B2B 가공품 안정 마진', value: '22.8%', trend: '🧊', desc: '관세/기후 무관 IQF 냉동 고정 마진 (KCS)', source: '[BASELINE] KCS 추정' },
      k6: { title: '프리미엄 재수출 단가', value: '$12.4/kg', trend: '🚀', desc: '몽골향 재수출 단가 - 2026-03 단월 실측 (연간 물량 1톤 미만)', source: '[VERIFIED] KCS 수출 실적 (HS 0804)' },
    };

    const response = {
      isLive: false, // L-12 표준 필드 — 외부 API 실연동 없음 (정적 베이스라인)
      apiStatus: 'static_baseline',
      lastSynced: DATA_BASELINE,
      data: {
        climateYieldData,
        logisticsData,
        arbitrageData,
        marginData,
        productionVsTradeData,
        bilateralReExportData,
        upcyclingData,
        coldchainData,
        rcepArbitrageData,
        kpis: mangosteenKpis
      }
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ isLive: false, error: "Failed to build Mangosteen baseline data" }, { status: 500 });
  }
}
