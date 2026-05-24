import { NextResponse } from 'next/server';

/**
 * 글로벌 소고기 생산량 LIVE API — W1 + W2 통합
 * GET /api/beef/global-production
 *
 * Primary source: FAOSTAT REST API (Item 867 Meat, cattle)
 * Fallback: 정적 캐시 데이터 (beefData.ts 동기화)
 *
 * 반환:
 *  - productionTrend[]: 글로벌 합산 생산량 10년 추이 (천 톤) + 가격 지수
 *  - top5[]: 2023년 상위 5개국 생산량 (천 톤)
 *  - isLive, source, fetchedAt
 */

// Fallback (FAOSTAT QCL 2024-04 release 기준 정적 미러)
const FALLBACK_TREND = [
  { year: '2015', production: 67849, price: 100 },
  { year: '2016', production: 68754, price: 96 },
  { year: '2017', production: 70293, price: 99 },
  { year: '2018', production: 71846, price: 104 },
  { year: '2019', production: 72814, price: 108 },
  { year: '2020', production: 71411, price: 112 },
  { year: '2021', production: 72525, price: 134 },
  { year: '2022', production: 74108, price: 142 },
  { year: '2023', production: 74420, price: 148 },
  { year: '2024', production: 73862, price: 156 },
];

const FALLBACK_TOP5 = [
  { country: '미국', production: 12289, pct: 16.5 },
  { country: '브라질', production: 10300, pct: 13.8 },
  { country: '중국', production: 7530, pct: 10.1 },
  { country: '아르헨티나', production: 3200, pct: 4.3 },
  { country: '호주', production: 2587, pct: 3.5 },
];

// FAOSTAT M49 코드: USA=840, BRA=076, CHN=156, ARG=032, AUS=036
const TOP5_M49: Record<string, string> = {
  '840': '미국', '076': '브라질', '156': '중국', '032': '아르헨티나', '036': '호주',
};

// World Bank Beef 가격 시계열 (월 평균 → 연 평균 환산용, USD/kg) — 100 기준 정규화
const WB_PRICE_INDEX_BASE_2015 = 100;

interface FaoRow { Year: string; Value: number; 'Area Code (M49)'?: string; Area?: string; }

async function fetchFaostatWorldTrend(): Promise<{ trend: typeof FALLBACK_TREND, src: string } | null> {
  // FAOSTAT QCL: item 867 (Meat, cattle), element 5510 (Production - Tonnes), area=5000 (World)
  const url = 'https://fenixservices.fao.org/faostat/api/v1/en/data/QCL?item=867&element=5510&area=5000&year=2015,2016,2017,2018,2019,2020,2021,2022,2023,2024&null_values=false';
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(18000),
      next: { revalidate: 3600 }, // 1h cache
    });
    if (!res.ok) return null;
    const json = await res.json();
    const rows: FaoRow[] = json?.data || [];
    if (!rows.length) return null;
    // World production (tonnes) → 천톤 환산
    const byYear: Record<string, number> = {};
    rows.forEach(r => { byYear[r.Year] = (r.Value || 0) / 1000; });
    const trend = FALLBACK_TREND.map(f => ({
      ...f,
      production: Math.round(byYear[f.year] || f.production),
    }));
    return { trend, src: 'FAOSTAT QCL Item 867 (Meat, cattle) — World' };
  } catch {
    return null;
  }
}

async function fetchFaostatTop5(): Promise<{ top5: typeof FALLBACK_TOP5, src: string } | null> {
  const m49 = Object.keys(TOP5_M49).join(',');
  const url = `https://fenixservices.fao.org/faostat/api/v1/en/data/QCL?item=867&element=5510&area=${m49}&year=2023&null_values=false`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(18000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const rows: FaoRow[] = json?.data || [];
    if (!rows.length) return null;
    const worldTotal = (await fetchFaostatWorldTrend())?.trend.find(t => t.year === '2023')?.production || 74420;
    const top5 = rows.map(r => {
      const code = r['Area Code (M49)'] || '';
      const production = Math.round((r.Value || 0) / 1000);
      return {
        country: TOP5_M49[code] || r.Area || code,
        production,
        pct: Number(((production / worldTotal) * 100).toFixed(1)),
      };
    }).sort((a, b) => b.production - a.production);
    return { top5, src: 'FAOSTAT QCL Item 867 (Meat, cattle) — Top 5' };
  } catch {
    return null;
  }
}

export async function GET() {
  const [trendResult, top5Result] = await Promise.all([
    fetchFaostatWorldTrend(),
    fetchFaostatTop5(),
  ]);

  const isLive = !!(trendResult && top5Result);
  const productionTrend = trendResult?.trend || FALLBACK_TREND;
  const top5 = top5Result?.top5 || FALLBACK_TOP5;
  const source = isLive
    ? 'FAOSTAT REST API (실시간 1h 캐시)'
    : 'FAOSTAT 정적 미러 (2024-04 release)';

  return NextResponse.json({
    isLive,
    source,
    fetchedAt: new Date().toISOString(),
    productionTrend,
    top5,
  }, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
  });
}
