import { NextResponse } from 'next/server';

/**
 * 참치 시장 인텔리전스 (시뮬레이션 데이터)
 *
 * ⚠️ 정직성 라벨: 본 endpoint는 실시간 API 연결이 아닌 *정기 갱신 스냅샷*입니다.
 * 이전 "🟢 LIVE API" 표시는 misleading이라 STATIC/SYNCED로 강등.
 * 실시간 KCS/KAMIS 데이터는 /api/tuna (서버사이드 API 키 기반 직접 호출) 사용.
 *
 * 최근 갱신: 2026-05-20
 *  - arbitrageRadar: Atuna skjbkk 2026-05-06 실측 $1,975 반영
 *  - historicalChartData: 일부 priceHist 값을 Atuna 실측 추세로 보정 (특히 25-Q3~26-Q2)
 *  - 22-Q1 ~ 23-Q4 가격은 보수적 추정치 유지 (Atuna 과거 자료 부분 확보)
 */

export async function GET() {
  const timestamp = new Date().toISOString();

  const marketData = {
    source: "Atuna skjbkk 정기 스냅샷 + KCS 통관 (지연 데이터)",
    status: "SYNCED",
    syncDate: "2026-05-06",
    note: "본 데이터는 실시간 API 호출이 아닌 정기 갱신 스냅샷입니다. 실시간 통관은 /api/tuna 참조.",
    lastUpdated: timestamp,
    arbitrageRadar: {
      skjPrice: 1975,
      mgoPrice: 2050,
      landingCost: 1476,
      expectedMargin: "25.4%",
      action: "방콕 직수출 관망 (Wait-and-see)",
      analysis: "2026-Q2 호르무즈 봉쇄 위기로 MGO $2,000+/t 진행 중. 가다랑어 4월 $2,100 → 5월 $1,975로 가공업체 매입 거부에 따른 박스권 진정. (Atuna skjbkk 2026-05-06 실측 기반 의견)"
    },
    thaiTrade: {
      importVol: 193367,
      importTrend: -7.0,
      exportVol: 118723,
      exportTrend: -12.0,
      source: "Atuna 'Thai Processors Turn To IO WR As Pacific Supply Dwindles In Q1' (2026.05.04) 분기 합계"
    },
    historicalChartData: [
      { month: '21-Q1', import: 52000, export: 38000, priceHist: 1283, brentPriceHist: 480 },
      { month: '21-Q2', import: 54000, export: 41000, priceHist: 1323, brentPriceHist: 544 },
      { month: '21-Q3', import: 58000, export: 45000, priceHist: 1400, brentPriceHist: 584 },
      { month: '21-Q4', import: 61000, export: 48000, priceHist: 1616, brentPriceHist: 640 },
      { month: '22-Q1', import: 63000, export: 46000, priceHist: 1716, brentPriceHist: 840 },
      { month: '22-Q2', import: 59000, export: 42000, priceHist: 1608, brentPriceHist: 960 },
      { month: '22-Q3', import: 62000, export: 44000, priceHist: 1666, brentPriceHist: 760 },
      { month: '22-Q4', import: 65000, export: 47000, priceHist: 1660, brentPriceHist: 680 },
      { month: '23-Q1', import: 45000, export: 35000, priceHist: 1820, brentPriceHist: 656 },
      { month: '23-Q2', import: 38000, export: 29000, priceHist: 1700, brentPriceHist: 624, note: '라니냐 영향 어획 약세 (실측 보정)' },
      { month: '23-Q3', import: 42000, export: 32000, priceHist: 1600, brentPriceHist: 696 },
      { month: '23-Q4', import: 48000, export: 38000, priceHist: 1516, brentPriceHist: 640 },
      { month: '24-Q1', import: 55000, export: 42000, priceHist: 1333, brentPriceHist: 664 },
      { month: '24-Q2', import: 57000, export: 44000, priceHist: 1478, brentPriceHist: 680 },
      { month: '24-Q3', import: 59000, export: 45000, priceHist: 1576, brentPriceHist: 624 },
      { month: '24-Q4', import: 60000, export: 46000, priceHist: 1463, brentPriceHist: 600 },
      { month: '25-Q1', import: 58000, export: 45000, priceHist: 1650, brentPriceHist: 640, note: 'Atuna 실측 평균' },
      { month: '25-Q2', import: 54000, export: 43000, priceHist: 1510, brentPriceHist: 672, note: 'Atuna 실측 평균' },
      { month: '25-Q3', import: 52000, export: 41000, priceHist: 1565, brentPriceHist: 688, note: 'Atuna 실측 평균' },
      { month: '25-Q4', import: 55000, export: 43000, priceHist: 1609, brentPriceHist: 664, note: 'Atuna 실측 평균' },
      { month: '26-Q1', import: 42000, export: 32000, priceHist: 1662, brentPriceHist: 760, note: 'Atuna 실측 평균' },
      { month: '26-Q2', import: 38000, export: 28000, priceHist: 2008, brentPriceHist: 785, note: '호르무즈 봉쇄 위기 (4~5월 실측 평균)' }
    ]
  };

  const fleetData = {
    source: "NOAA ENSO Index + 추정",
    status: "STATIC",
    syncDate: "2026-05-20",
    lastUpdated: timestamp,
    climateRisk: {
      sstAnomaly: "+1.2°C",
      riskLevel: "Medium",
      impact: "수온 상승으로 어군 남하. 조업지 이동에 따른 유류비 8% 증가 예상.",
      analysis: "NOAA ENSO Index 기반 정기 갱신 (실시간 폴링 아님)"
    }
  };

  const unloadingData = {
    source: "추정 시뮬레이션",
    status: "STATIC",
    syncDate: "2026-05-20",
    lastUpdated: timestamp,
    bottleneck: {
      portCongestion: "High",
      delayDays: 3.2,
      estimatedDemurrage: "$18,500",
      analysis: "방콕항 컨테이너 터미널 대기열 추정치 (실시간 항만 API 미연동)"
    }
  };

  const logisticsData = {
    source: "추정 시뮬레이션 + KCS 통관",
    status: "STATIC",
    syncDate: "2026-05-20",
    lastUpdated: timestamp,
    marginIndex: {
      rawCost: 2100,
      freight: 350,
      processing: 500,
      retailPrice: 4200,
      netMargin: "29.7%",
      analysis: "착지원가 시나리오 추정 (Freightos 실시간 미연동)"
    }
  };

  return NextResponse.json({
    market: marketData,
    fleet: fleetData,
    unloading: unloadingData,
    logistics: logisticsData,
  });
}
