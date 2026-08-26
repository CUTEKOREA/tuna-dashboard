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

// 월 약자 → 분기 매핑 (NASS MONTHLY reference_period_desc)
const MONTH_TO_QUARTER: Record<string, string> = {
  JAN: 'Q1', FEB: 'Q1', MAR: 'Q1',
  APR: 'Q2', MAY: 'Q2', JUN: 'Q2',
  JUL: 'Q3', AUG: 'Q3', SEP: 'Q3',
  OCT: 'Q4', NOV: 'Q4', DEC: 'Q4',
};

function lbToKg(lb: number) { return Math.round(lb * 0.4536); }
function parseNum(v: string) { return Number((v || '0').replace(/,/g, '')); }

async function fetchNassSlaughter(key: string): Promise<typeof FALLBACK | null> {
  // 도축 두수 (월별, 분기 집계용) — CATTLE, GE 500 LBS, SLAUGHTER, COMMERCIAL
  const slaughterShortDesc = encodeURIComponent('CATTLE, GE 500 LBS, SLAUGHTER, COMMERCIAL - SLAUGHTERED, MEASURED IN HEAD');
  const slaughterUrl = `https://quickstats.nass.usda.gov/api/api_GET/?key=${key}&commodity_desc=CATTLE&statisticcat_desc=SLAUGHTERED&agg_level_desc=NATIONAL&freq_desc=MONTHLY&year__GE=2024&short_desc=${slaughterShortDesc}&format=JSON`;
  // 도체중 (월별, dressed basis lb/head)
  const weightShortDesc = encodeURIComponent('CATTLE, GE 500 LBS, SLAUGHTER, COMMERCIAL, FI - SLAUGHTERED, MEASURED IN LB / HEAD, DRESSED BASIS');
  const weightUrl = `https://quickstats.nass.usda.gov/api/api_GET/?key=${key}&commodity_desc=CATTLE&statisticcat_desc=SLAUGHTERED&agg_level_desc=NATIONAL&freq_desc=MONTHLY&year__GE=2024&short_desc=${weightShortDesc}&format=JSON`;

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

    // 월별 → 분기 집계 (도축은 합계, 도체중은 평균)
    // 완료된 분기만 포함하기 위해 월 수를 카운트
    const slaughterByQ: Record<string, number> = {};
    const slaughterMonthCnt: Record<string, number> = {};
    const weightSum: Record<string, number> = {};
    const weightCnt: Record<string, number> = {};

    sRows.forEach(r => {
      const q = MONTH_TO_QUARTER[r.reference_period_desc] || QUARTER_MAP[r.reference_period_desc];
      if (!q) return;
      const key = `${String(r.year).slice(-2)}-${q}`;
      slaughterByQ[key] = (slaughterByQ[key] || 0) + parseNum(r.Value);
      slaughterMonthCnt[key] = (slaughterMonthCnt[key] || 0) + 1;
    });
    wRows.forEach(r => {
      const q = MONTH_TO_QUARTER[r.reference_period_desc] || QUARTER_MAP[r.reference_period_desc];
      if (!q) return;
      const key = `${String(r.year).slice(-2)}-${q}`;
      const v = parseNum(r.Value);
      if (v > 0) {
        weightSum[key] = (weightSum[key] || 0) + v;
        weightCnt[key] = (weightCnt[key] || 0) + 1;
      }
    });
    const weightByQ: Record<string, number> = {};
    Object.keys(weightSum).forEach(k => {
      weightByQ[k] = weightSum[k] / (weightCnt[k] || 1);
    });

    // 3개월 모두 있는 완료된 분기만 포함 (partial quarter 제외)
    const quarters = Object.keys(slaughterByQ)
      .filter(q => slaughterMonthCnt[q] === 3)
      .sort();
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
      source = 'USDA NASS API 응답 부족 - 정적 미러 사용';
    }
  } else {
    source = 'NASS_API_KEY 미설정 - 정적 미러 (등록: https://quickstats.nass.usda.gov/api)';
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
