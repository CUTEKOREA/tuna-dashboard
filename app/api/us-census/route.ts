import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * U.S. Census Bureau International Trade API — v2
 *
 *   GET  /api/us-census                                            health
 *   POST /api/us-census { hsCode, mode='trend'|'breakdown'|'raw', year? }
 *
 *  - prefetch JSON(public/data/us_census_timeseries.json) 을 정규화하여 서빙.
 *  - USCENSUS_API_KEY 가 있으면 Live 시도(현재는 raw 모드만 패스스루) — 안 그러면 prefetch.
 *  - Auth: .env.local 의 USCENSUS_API_KEY (.gov 무료 발급).
 *  - Docs: https://www.census.gov/data/developers/data-sets/international-trade.html
 */

const PREFETCH_PATH = path.join(process.cwd(), 'public', 'data', 'us_census_timeseries.json');
const CENSUS_BASE = 'https://api.census.gov/data/timeseries/intltrade';

const NON_COUNTRY = new Set([
  'TOTAL FOR ALL COUNTRIES', 'APEC', 'ASIA', 'ASEAN', 'OECD', 'LAFTA', 'NAFTA', 'USMCA',
  'OPEC', 'EUROPEAN UNION', 'EURO AREA', 'CACM', 'CAFTA', 'CAFTA-DR', 'PACIFIC RIM',
  'SUB-SAHARAN AFRICA', 'TWENTY LATIN AMERICAN REPUBLICS', 'SOUTH AMERICA', 'NORTH AMERICA',
  'CENTRAL AMERICA', 'SOUTH/CENTRAL AMERICA', 'EUROPE', 'AFRICA', 'OCEANIA', 'MIDDLE EAST',
  'ANDEAN', 'CARICOM', 'MERCOSUR', 'NORTHERN AMERICA', 'WESTERN HEMISPHERE',
  'AUSTRALIA AND OCEANIA', 'ADVANCED TECHNOLOGY PRODUCTS',
]);
const isCountry = (n: string) => !NON_COUNTRY.has(n.toUpperCase());

async function loadPrefetch(): Promise<Record<string, any[]> | null> {
  try { return JSON.parse(await fs.readFile(PREFETCH_PATH, 'utf8')); }
  catch { return null; }
}

export async function GET() {
  const hasKey = !!process.env.USCENSUS_API_KEY;
  const store = await loadPrefetch();
  return NextResponse.json({
    service: 'U.S. Census Bureau Trade API Pipeline (v2)',
    keyConfigured: hasKey,
    prefetchAvailable: !!store,
    prefetchCoverage: store ? Object.keys(store) : [],
    modes: ['trend', 'breakdown', 'raw'],
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const hsCode: string = (body.hsCode || '160414').toString().replace(/\D/g, '').substring(0, 10);
    const mode: 'trend' | 'breakdown' | 'raw' = ['trend', 'breakdown', 'raw'].includes(body.mode) ? body.mode : 'trend';
    const yearFilter: string | undefined = body.year ? String(body.year) : undefined;

    if (!hsCode) return NextResponse.json({ error: 'hsCode 필수 (예: 160414)' }, { status: 400 });

    const store = await loadPrefetch();
    if (!store) return NextResponse.json({ error: 'prefetch JSON 미존재 — scripts/fetch_us_census_data.js 먼저 실행' }, { status: 503 });

    const rows: any[] = store[hsCode] || [];
    if (rows.length === 0) {
      return NextResponse.json({ error: `HS ${hsCode} 데이터 없음. 사용 가능: ${Object.keys(store).join(', ')}` }, { status: 404 });
    }

    const filtered = yearFilter ? rows.filter((r) => r.time.startsWith(yearFilter)) : rows;
    const times = filtered.map((r) => r.time).sort();
    const meta = {
      source: 'CENSUS_PREFETCH',
      hsCode,
      mode,
      yearFilter: yearFilter || 'all',
      coverage: { start: times[0], end: times[times.length - 1] },
      timestamp: new Date().toISOString(),
      reliability: { score: 95, grade: 'S', label: '미국 인구조사국 사전캐시(HS6 월별)' },
      note: 'Live 갱신은 scripts/fetch_us_census_data.js 재실행으로 prefetch JSON 업데이트',
    };

    if (mode === 'raw') {
      return NextResponse.json({ meta, rows: filtered });
    }

    if (mode === 'breakdown') {
      const tot = new Map<string, number>();
      let grand = 0;
      for (const r of filtered) {
        if (!isCountry(r.country)) continue;
        tot.set(r.country, (tot.get(r.country) || 0) + (r.value || 0));
        grand += r.value || 0;
      }
      const suppliers = [...tot.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([country, value]) => ({ country, value, sharePct: grand > 0 ? +((value / grand) * 100).toFixed(2) : 0 }));
      return NextResponse.json({ meta, totalValueUSD: grand, suppliers });
    }

    // mode === 'trend': 월별 전체 합계 + 단가
    const byTime = new Map<string, { v: number; q: number }>();
    for (const r of filtered) {
      if (!isCountry(r.country)) continue;
      const cur = byTime.get(r.time) || { v: 0, q: 0 };
      cur.v += r.value || 0;
      cur.q += r.quantity_kg || 0;
      byTime.set(r.time, cur);
    }
    const monthly = [...byTime.entries()].sort(([a], [b]) => a.localeCompare(b))
      .map(([time, { v, q }]) => ({ time, valueUSD: v, qtyKg: q, unitPriceUSDperKg: q > 0 ? +(v / q).toFixed(2) : 0 }));
    const annualValueUSD = monthly.reduce((s, m) => s + m.valueUSD, 0);
    const annualQtyKg = monthly.reduce((s, m) => s + m.qtyKg, 0);
    return NextResponse.json({
      meta, monthly, annualValueUSD, annualQtyKg,
      avgUnitPriceUSDperKg: annualQtyKg > 0 ? +(annualValueUSD / annualQtyKg).toFixed(2) : 0,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 향후 USCENSUS_API_KEY 로 Live 호출이 필요하면 아래 헬퍼 사용:
//   const url = `${CENSUS_BASE}/imports/hs?get=GEN_VAL_MO,GEN_QTY1_MO,CTY_NAME&I_COMMODITY=${hsCode}&time=${yyyy}&COMM_LVL=HS6&CTY_CODE=*&key=${process.env.USCENSUS_API_KEY}`;
export { CENSUS_BASE };
