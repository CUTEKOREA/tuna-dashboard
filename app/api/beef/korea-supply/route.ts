import { NextResponse } from 'next/server';

/**
 * 한국 소고기 수급 구조 LIVE API — W7
 * GET /api/beef/korea-supply
 *
 * Primary: KOSIS Open API (통계청)
 *   - orgId: 114 (농림축산식품부) / tblId: DT_114_2017_S0034 (육류수급)
 *   - 또는 식량수급표(FBS) 1인당 소비량
 * Auth: KOSIS_API_KEY
 * Fallback: 정적 (beefData.ts koreaSupplyData)
 */

const KOSIS_KEY = process.env.KOSIS_API_KEY || '';
const KOSIS_BASE = 'https://kosis.kr/openapi/Param/statisticsParameterData.do';

const FALLBACK = [
  { year: '2015', production: 268, imports: 297, perCapita: 11.6, selfRate: 47.5 },
  { year: '2016', production: 245, imports: 363, perCapita: 12.3, selfRate: 40.3 },
  { year: '2017', production: 238, imports: 411, perCapita: 12.7, selfRate: 36.7 },
  { year: '2018', production: 237, imports: 444, perCapita: 13.0, selfRate: 34.8 },
  { year: '2019', production: 247, imports: 425, perCapita: 13.6, selfRate: 36.7 },
  { year: '2020', production: 258, imports: 464, perCapita: 13.0, selfRate: 35.7 },
  { year: '2021', production: 262, imports: 489, perCapita: 14.0, selfRate: 34.9 },
  { year: '2022', production: 286, imports: 478, perCapita: 14.2, selfRate: 37.4 },
  { year: '2023', production: 305, imports: 521, perCapita: 14.5, selfRate: 36.9 },
];

interface KosisRow {
  PRD_DE: string; // 연도 (YYYY)
  DT: string; // 값
  ITM_NM?: string; // 항목명 (생산/수입/소비)
  C1_NM?: string;
}

async function fetchKosisMeat(): Promise<typeof FALLBACK | null> {
  // 농림부 가축유통 통계 — 소고기 수급 (orgId=114, tblId 후보들)
  // 실제 통계표 ID는 KOSIS 메뉴에서 확인 필요
  // DT_114_2017_S0034 = 가축통계 (수급 항목 포함)
  const url = `${KOSIS_BASE}?method=getList&apiKey=${KOSIS_KEY}&itmId=T1+T2+T3+&objL1=ALL&format=json&jsonVD=Y&prdSe=Y&startPrdDe=2015&endPrdDe=2024&orgId=114&tblId=DT_114_2017_S0034`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 86400 * 7 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json) || !json.length) return null;
    if (json[0]?.err) return null;

    // 연도별 production/imports/perCapita 매핑 시도
    const byYear: Record<string, any> = {};
    (json as KosisRow[]).forEach(row => {
      const year = (row.PRD_DE || '').slice(0, 4);
      if (!year || year < '2015') return;
      if (!byYear[year]) byYear[year] = { year };
      const itm = row.ITM_NM || '';
      const val = Number(row.DT) || 0;
      if (itm.includes('생산')) byYear[year].production = Math.round(val);
      else if (itm.includes('수입')) byYear[year].imports = Math.round(val);
      else if (itm.includes('1인당')) byYear[year].perCapita = Number(val.toFixed(1));
    });

    const years = Object.keys(byYear).sort();
    if (years.length < 5) return null;

    return years.map(y => {
      const r = byYear[y];
      const production = r.production || 0;
      const imports = r.imports || 0;
      const selfRate = imports + production > 0 ? Number(((production / (imports + production)) * 100).toFixed(1)) : 0;
      return {
        year: y,
        production,
        imports,
        perCapita: r.perCapita || 0,
        selfRate,
      };
    });
  } catch {
    return null;
  }
}

export async function GET() {
  let data = FALLBACK;
  let isLive = false;
  let source = 'KOSIS + KREI 식량수급표 정적 미러';

  if (KOSIS_KEY) {
    const live = await fetchKosisMeat();
    if (live && live.length >= 5) {
      data = live;
      isLive = true;
      source = 'KOSIS API (농림부 DT_114_2017_S0034, 1w 캐시)';
    } else {
      source = 'KOSIS 응답 schema 불일치 — 정적 미러 (실제 tblId 매핑 필요)';
    }
  } else {
    source = 'KOSIS_API_KEY 미설정 — 정적 미러';
  }

  return NextResponse.json({
    isLive,
    source,
    fetchedAt: new Date().toISOString(),
    data,
  }, { headers: { 'Cache-Control': 's-maxage=604800, stale-while-revalidate=2592000' } });
}
