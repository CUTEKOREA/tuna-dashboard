import { NextResponse } from 'next/server';

/**
 * 한국 소고기 수입 파트너 LIVE API — W6
 * GET /api/beef/korea-imports
 *
 * Primary: 관세청(KCS) Newtrade API
 *   - HS Code: 0201 + 0202 (소고기 전체)
 *   - imxpTpcd: 2 (수입)
 *   - 국가별 집계
 * Auth: KCS_API_KEY
 * Fallback: 정적 (beefData.ts koreaImportPartnersData)
 */

const KCS_KEY = process.env.KCS_API_KEY || '';
const KCS_BASE = 'https://unipass.customs.go.kr/ets/index.do';

const FALLBACK = [
  { country: '미국', volume: 248000, pct: 47.6, share2018: 51.2 },
  { country: '호주', volume: 188000, pct: 36.1, share2018: 39.5 },
  { country: '뉴질랜드', volume: 38000, pct: 7.3, share2018: 5.8 },
  { country: '캐나다', volume: 22000, pct: 4.2, share2018: 1.5 },
  { country: '우루과이', volume: 15000, pct: 2.9, share2018: 1.2 },
  { country: '멕시코', volume: 9500, pct: 1.8, share2018: 0.8 },
];

// KCS 국가코드 (ISO Alpha-2) → 한글
const CC_KO: Record<string, string> = {
  US: '미국', AU: '호주', NZ: '뉴질랜드', CA: '캐나다',
  UY: '우루과이', MX: '멕시코', AR: '아르헨티나', CL: '칠레',
  BR: '브라질', JP: '일본', CN: '중국', ES: '스페인',
  DK: '덴마크', NL: '네덜란드', IE: '아일랜드', FR: '프랑스',
};

interface KcsItem {
  cntrCd?: string;
  cntyCd?: string;
  wgt?: string;
  impWgt?: string;
  dlr?: string;
  impDlr?: string;
}

async function fetchKcsByHs(hs: string, year: string): Promise<KcsItem[]> {
  const params = new URLSearchParams({
    serviceKey: KCS_KEY,
    pageNo: '1',
    numOfRows: '100',
    type: 'json',
    strtYymm: `${year}01`,
    endYymm: `${year}12`,
    hsSgnGrpCol: 'HS4',
    hsSgn: hs,
    imxpTpcd: '2', // 수입
  });
  try {
    const res = await fetch(`${KCS_BASE}?${params}`, {
      signal: AbortSignal.timeout(10000),
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 * 7 },
    });
    if (!res.ok) return [];
    const text = await res.text();
    if (text.includes('Forbidden') || text.includes('error')) return [];
    try {
      const json = JSON.parse(text);
      return json?.items || json?.response?.body?.items?.item || [];
    } catch { return []; }
  } catch { return []; }
}

async function fetchKcsBeefImports(year: string): Promise<typeof FALLBACK | null> {
  const [hs0201, hs0202] = await Promise.all([
    fetchKcsByHs('0201', year),
    fetchKcsByHs('0202', year),
  ]);
  const all = [...hs0201, ...hs0202];
  if (!all.length) return null;

  const byCountry: Record<string, number> = {};
  let total = 0;
  for (const it of all) {
    const cc = it.cntrCd || it.cntyCd || 'XX';
    const wgt = parseInt(it.wgt || it.impWgt || '0');
    if (wgt <= 0) continue;
    byCountry[cc] = (byCountry[cc] || 0) + wgt;
    total += wgt;
  }
  if (total <= 0) return null;

  const sorted = Object.entries(byCountry)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([cc, vol]) => ({
      country: CC_KO[cc] || cc,
      volume: vol,
      pct: Number(((vol / total) * 100).toFixed(1)),
      share2018: FALLBACK.find(f => f.country === (CC_KO[cc] || cc))?.share2018 || 0,
    }));
  return sorted;
}

export async function GET() {
  let data = FALLBACK;
  let isLive = false;
  let source = '관세청(KCS) HS 0201+0202 정적 미러';

  if (KCS_KEY) {
    const year = String(new Date().getFullYear() - 1);
    const live = await fetchKcsBeefImports(year);
    if (live && live.length >= 3) {
      data = live;
      isLive = true;
      source = `KCS Newtrade API (HS 0201+0202 ${year}, 1w 캐시)`;
    } else {
      source = 'KCS 응답 부족 — 정적 미러';
    }
  } else {
    source = 'KCS_API_KEY 미설정 — 정적 미러';
  }

  return NextResponse.json({
    isLive,
    source,
    fetchedAt: new Date().toISOString(),
    data,
  }, { headers: { 'Cache-Control': 's-maxage=604800, stale-while-revalidate=2592000' } });
}
