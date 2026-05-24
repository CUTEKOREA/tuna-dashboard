import { NextResponse } from 'next/server';

/**
 * 미국 소 도축 LIVE API — W3 미국 도축장 가동률 + 도체중
 * GET /api/beef/slaughter-rate
 *
 * Primary: USDA NASS QuickStats API (commodity=CATTLE, statisticcat=SLAUGHTER)
 * Auth: NASS_API_KEY (무료 등록 https://quickstats.nass.usda.gov/api)
 * Fallback: 정적 캐시 (beefData.ts slaughterData 동기화)
 *
 * 반환:
 *  - data[]: 분기별 [{ month, usUtil, auUtil, usCarcassKg, auCarcassKg }]
 *    - usUtil: 미국 가동률 (도축두수 / 도축능력 표준값으로 정규화)
 *    - usCarcassKg: 미국 평균 도체중 (lb → kg 환산)
 *    - au*: MLA 호주 데이터는 정적 fallback (NASS 영역 외)
 *  - isLive, source, fetchedAt
 */

const FALLBACK = [
  { month: '24-Q1', usUtil: 78, auUtil: 72, usCarcassKg: 369, auCarcassKg: 312 },
  { month: '24-Q2', usUtil: 81, auUtil: 75, usCarcassKg: 372, auCarcassKg: 315 },
  { month: '24-Q3', usUtil: 83, auUtil: 79, usCarcassKg: 374, auCarcassKg: 318 },
  { month: '24-Q4', usUtil: 79, auUtil: 81, usCarcassKg: 371, auCarcassKg: 320 },
  { month: '25-Q1', usUtil: 75, auUtil: 83, usCarcassKg: 376, auCarcassKg: 322 },
];

// 호주 분기별 정적 (MLA Industry Stats — 향후 별도 endpoint 분리 가능)
const AU_BY_QUARTER: Record<string, { auUtil: number; auCarcassKg: number }> = {
  '24-Q1': { auUtil: 72, auCarcassKg: 312 },
  '24-Q2': { auUtil: 75, auCarcassKg: 315 },
  '24-Q3': { auUtil: 79, auCarcassKg: 318 },
  '24-Q4': { auUtil: 81, auCarcassKg: 320 },
  '25-Q1': { auUtil: 83, auCarcassKg: 322 },
};

// 미국 연방 인증 도축장 분기별 표준 능력 (USDA NASS 기준치, 천 두)
const US_QUARTERLY_CAPACITY_HEAD = 8500000; // 약 850만 두/분기

interface NassRow {
  year: string;
  reference_period_desc: string;
  short_desc: string;
  Value: string;
  unit_desc: string;
}

const QUARTER_MAP: Record<string, string> = {
  'JAN THRU MAR': 'Q1', 'APR THRU JUN': 'Q2',
  'JUL THRU SEP': 'Q3', 'OCT THRU DEC': 'Q4',
};

function lbToKg(lb: number) { return Math.round(lb * 0.4536); }
function parseNum(v: string) { return Number((v || '0').replace(/,/g, '')); }

async function fetchNassSlaughter(key: string): Promise<typeof FALLBACK | null> {
  // 도축 두수 (분기별)
  const slaughterUrl = `https://quickstats.nass.usda.gov/api/api_GET/?key=${key}&commodity_desc=CATTLE&statisticcat_desc=SLAUGHTER&unit_desc=HEAD&agg_level_desc=NATIONAL&freq_desc=QUARTERLY&year__GE=2024&short_desc=CATTLE,%20INCL%20CALVES%20-%20SLAUGHTERED,%20COMMERCIAL%20-%20HEAD&format=JSON`;
  // 도체중 (평균 dressed weight, 분기별)
  const weightUrl = `https://quickstats.nass.usda.gov/api/api_GET/?key=${key}&commodity_desc=CATTLE&statisticcat_desc=WEIGHT&unit_desc=LB&agg_level_desc=NATIONAL&freq_desc=QUARTERLY&year__GE=2024&short_desc=CATTLE,%20DRESSED%20WEIGHT%20-%20MEASURED%20IN%20LB%20/%20HEAD&format=JSON`;

  try {
    const [sRes, wRes] = await Promise.all([
      fetch(slaughterUrl, { signal: AbortSignal.timeout(15000), next: { revalidate: 86400 } }),
      fetch(weightUrl, { signal: AbortSignal.timeout(15000), next: { revalidate: 86400 } }),
    ]);
    if (!sRes.ok || !wRes.ok) return null;
    const sJson = await sRes.json();
    const wJson = await wRes.json();
    const sRows: NassRow[] = sJson?.data || [];
    const wRows: NassRow[] = wJson?.data || [];
    if (!sRows.length) return null;

    // 분기 키 생성: "24-Q1" 형식
    const slaughterByQ: Record<string, number> = {};
    const weightByQ: Record<string, number> = {};

    sRows.forEach(r => {
      const q = QUARTER_MAP[r.reference_period_desc];
      if (!q) return;
      const key = `${r.year.slice(-2)}-${q}`;
      slaughterByQ[key] = parseNum(r.Value);
    });
    wRows.forEach(r => {
      const q = QUARTER_MAP[r.reference_period_desc];
      if (!q) return;
      const key = `${r.year.slice(-2)}-${q}`;
      weightByQ[key] = parseNum(r.Value);
    });

    const quarters = Object.keys(slaughterByQ).sort();
    if (!quarters.length) return null;

    return quarters.slice(-5).map(q => {
      const head = slaughterByQ[q] || 0;
      const lb = weightByQ[q] || 825; // 평균 fallback ~825lb
      const au = AU_BY_QUARTER[q] || { auUtil: 75, auCarcassKg: 315 };
      return {
        month: q,
        usUtil: Math.min(100, Math.round((head / US_QUARTERLY_CAPACITY_HEAD) * 100)),
        auUtil: au.auUtil,
        usCarcassKg: lbToKg(lb),
        auCarcassKg: au.auCarcassKg,
      };
    });
  } catch {
    return null;
  }
}

export async function GET() {
  const key = process.env.NASS_API_KEY;
  let data = FALLBACK;
  let isLive = false;
  let source = '미국 농업통계국(USDA NASS) + 호주 축산공사(MLA) 정적 미러';

  if (key) {
    const live = await fetchNassSlaughter(key);
    if (live && live.length >= 3) {
      data = live;
      isLive = true;
      source = 'USDA NASS QuickStats API (미국 LIVE) + MLA 호주 정적';
    } else {
      source = 'USDA NASS API 응답 부족 — 정적 미러 사용';
    }
  } else {
    source = 'NASS_API_KEY 미설정 — 정적 미러 (등록: https://quickstats.nass.usda.gov/api)';
  }

  return NextResponse.json({
    isLive,
    source,
    fetchedAt: new Date().toISOString(),
    data,
  }, {
    headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800' },
  });
}
