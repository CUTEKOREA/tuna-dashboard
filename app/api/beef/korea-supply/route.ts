import { NextResponse } from 'next/server';
import { logApiFail, logApiSuccess, logSchemaIssue } from '@/lib/api-debug';

/**
 * 한국 소고기 수급 구조 LIVE API — W7
 * GET /api/beef/korea-supply
 *
 * Primary: KOSIS Open API (통계청 가축동향조사)
 *   - orgId: 101 (통계청)
 *   - tblId: DT_1EO211 (한육우 시도/사육규모별 농장수 및 마리수)
 *   - itmId: T01(농장수) + T02(마리수)
 *   - objL1=ALL: 시도별, objL2=ALL: 사육규모별
 *   - prdSe=Q: 분기 (1Q만 추출하여 연간 proxy로 활용)
 *
 * Auth: KOSIS_API_KEY
 * 한계: KOSIS는 사육두수만 제공. 수입량/1인당소비/자급률은 fallback 정적값 유지
 *       (별도 데이터 소스 필요: FAOSTAT FBS 또는 KASS)
 *
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
  PRD_DE: string; // 분기 (YYYYQQ, 예: 202501)
  DT: string;     // 데이터값
  ITM_ID?: string; // T01=농장수, T02=마리수
  C1?: string;     // 시도 코드 (00=전국)
  C2?: string;     // 사육규모 코드 (00=합계)
}

async function fetchKosisMeat(): Promise<typeof FALLBACK | null> {
  // 통계청 가축동향조사 — 한육우 시도/사육규모별 마리수 (KOSIS OPENAPI 버튼 검증)
  const url = `${KOSIS_BASE}?method=getList&apiKey=${KOSIS_KEY}&itmId=T01+T02&objL1=ALL&objL2=ALL&format=json&jsonVD=Y&prdSe=Q&startPrdDe=201501&endPrdDe=202604&orgId=101&tblId=DT_1EO211`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 86400 * 7 },
    });
    if (!res.ok) {
      logApiFail('beef/korea-supply', `HTTP ${res.status}`, await res.text().catch(() => ''));
      return null;
    }
    const json = await res.json();
    if (!Array.isArray(json) || !json.length) {
      logSchemaIssue('beef/korea-supply', 'array with rows', json);
      return null;
    }
    if (json[0]?.err) {
      logApiFail('beef/korea-supply', 'KOSIS err', JSON.stringify(json[0]));
      return null;
    }

    // 전국(C1=00) + 합계(C2=00) + T02(마리수) + 1Q(PRD_DE 끝자리 01)만 추출
    const cattleByYear: Record<string, number> = {};
    (json as KosisRow[]).forEach(row => {
      if (row.C1 !== '00' || row.C2 !== '00') return;
      if (row.ITM_ID !== 'T02') return;
      const prd = row.PRD_DE || '';
      if (!prd.endsWith('01')) return; // 1분기만 (연간 proxy)
      const year = prd.slice(0, 4);
      cattleByYear[year] = Math.round(Number(row.DT) || 0);
    });

    const years = Object.keys(cattleByYear).sort();
    if (years.length < 3) {
      logSchemaIssue('beef/korea-supply', '≥3 years parsed', `got ${years.length} years; sample row: ${JSON.stringify(json[0]).slice(0, 200)}`);
      return null;
    }
    logApiSuccess('beef/korea-supply', `${years.length} years cattle inventory from ${years[0]} to ${years[years.length - 1]}`);

    // 한육우 사육두수(마리) → production(천톤) 추정:
    //   사육두수의 약 35% 도축률 × 평균 도체중 350kg ≈ 마리수 × 0.123 톤
    //   → 천톤 환산 시 × 0.000123
    // FALLBACK의 imports/perCapita/selfRate는 KOSIS 미제공 → 정적 값 유지
    return years.map(y => {
      const cattleHeads = cattleByYear[y]; // 마리 (절대값)
      const productionTon = Math.round(cattleHeads * 0.000123); // 천톤
      const fb = FALLBACK.find(f => f.year === y);
      const imports = fb?.imports || 500;
      const perCapita = fb?.perCapita || 14;
      const selfRate = productionTon + imports > 0
        ? Number(((productionTon / (productionTon + imports)) * 100).toFixed(1))
        : (fb?.selfRate || 37);
      return {
        year: y,
        production: productionTon, // LIVE (KOSIS 사육두수 × 0.000123 추정)
        imports,                    // fallback
        perCapita,                  // fallback
        selfRate,                   // 동적 재계산
      };
    });
  } catch (e) {
    logApiFail('beef/korea-supply', 'exception', String(e));
    return null;
  }
}

export async function GET() {
  let data = FALLBACK;
  let isLive = false;
  let source = 'KOSIS + KREI 식량수급표 정적 미러';

  if (KOSIS_KEY) {
    const live = await fetchKosisMeat();
    if (live && live.length >= 3) {
      data = live;
      isLive = true;
      source = `KOSIS API (DT_1EO211 한육우 사육두수 LIVE, ${live.length} years, 수입/소비/자급률은 fallback)`;
    } else {
      source = 'KOSIS 응답 schema 불일치 - 정적 미러';
    }
  } else {
    source = 'KOSIS_API_KEY 미설정 - 정적 미러';
  }

  return NextResponse.json({
    isLive,
    source,
    fetchedAt: new Date().toISOString(),
    data,
  }, { headers: { 'Cache-Control': 's-maxage=604800, stale-while-revalidate=2592000' } });
}
