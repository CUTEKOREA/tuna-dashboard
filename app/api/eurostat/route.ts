import { NextResponse } from 'next/server';

/**
 * Eurostat Comext 고등어(HS 030354) EU-27 역외 수입 통계 API
 * GET /api/eurostat
 *
 * L-09/L-12: 실데이터 파싱에 성공했을 때만 isLive=true.
 * 카탈로그 핑(dataflow 목록 응답)만으로 라이브를 선언하지 않는다.
 * 데이터셋: DS-045409 (EU trade since 1988 by HS2-4-6 and CN8), JSON-stat 2.0
 */

const COMEXT_URL =
  'https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409' +
  '?format=JSON&lang=en&reporter=EU27_2020&partner=EXT_EU27_2020&product=030354&flow=1' +
  '&indicators=VALUE_IN_EUROS&indicators=QUANTITY_IN_100KG' +
  '&time=2019&time=2020&time=2021&time=2022&time=2023&time=2024&time=2025';

// 폴백: 정적 추정치 (EU-27 수입, 2019-2023). isLive=false로만 제공.
const FALLBACK_IMPORT = [
  { year: '2019', volume: 215, value: 420 },
  { year: '2020', volume: 230, value: 455 },
  { year: '2021', volume: 210, value: 410 },
  { year: '2022', volume: 245, value: 510 },
  { year: '2023', volume: 260, value: 580 },
];
const FALLBACK_DATA_AS_OF = '2023-12-31';

// 정적 구성비 (EUMOFA 기반 추정) — 라이브 소스 없음
const FALLBACK_PROD = [
  { name: '냉동 필렛', value: 45 },
  { name: '통조림(조제)', value: 35 },
  { name: '훈제/염장', value: 15 },
  { name: '기타', value: 5 },
];

type ImportRow = { year: string; volume: number; value: number };

/** JSON-stat 2.0 응답에서 (freq=A, indicators, time) 셀 값을 추출 */
function parseComextJsonStat(json: any): ImportRow[] {
  const ids: string[] = json?.id;
  const sizes: number[] = json?.size;
  const dimension = json?.dimension;
  const values = json?.value;
  if (!Array.isArray(ids) || !Array.isArray(sizes) || !dimension || !values) return [];

  // 차원별 stride 계산 (row-major)
  const strides: Record<string, number> = {};
  let acc = 1;
  for (let i = ids.length - 1; i >= 0; i--) {
    strides[ids[i]] = acc;
    acc *= sizes[i];
  }

  const catIndex = (dim: string): Record<string, number> | null =>
    dimension?.[dim]?.category?.index ?? null;

  const cellAt = (codes: Record<string, string>): number | null => {
    let pos = 0;
    for (const dim of ids) {
      const idx = catIndex(dim);
      if (!idx) return null;
      let ci = 0;
      if (codes[dim] !== undefined) {
        ci = idx[codes[dim]];
        if (ci === undefined) return null;
      }
      pos += ci * strides[dim];
    }
    const v = values[String(pos)] ?? values[pos];
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
  };

  const timeIdx = catIndex('time');
  if (!timeIdx) return [];
  const years = Object.keys(timeIdx).sort();

  const rows: ImportRow[] = [];
  for (const y of years) {
    const eur = cellAt({ freq: 'A', indicators: 'VALUE_IN_EUROS', time: y });
    const q100kg = cellAt({ freq: 'A', indicators: 'QUANTITY_IN_100KG', time: y });
    if (eur === null || q100kg === null || eur <= 0 || q100kg <= 0) continue;
    rows.push({
      year: y,
      volume: Math.round((q100kg / 10000) * 10) / 10, // 100kg → 천톤
      value: Math.round(eur / 1e6),                   // EUR → 백만 유로
    });
  }
  return rows;
}

export async function GET() {
  let isLive = false;
  let imports: ImportRow[] = FALLBACK_IMPORT;
  let dataAsOf = FALLBACK_DATA_AS_OF;
  let scope = 'EU-27 수입 (정적 추정치, 2019-2023)';

  try {
    const res = await fetch(COMEXT_URL, { signal: AbortSignal.timeout(9000) });
    if (res.ok) {
      const json = await res.json();
      const parsed = parseComextJsonStat(json);
      // 실데이터 파싱 성공(연도 3개 이상) 시에만 라이브 선언 (mackerel-comtrade 패턴)
      if (parsed.length >= 3) {
        imports = parsed;
        isLive = true;
        dataAsOf = `${parsed[parsed.length - 1].year}-12-31`;
        scope = 'EU-27 역외(Extra-EU) 수입, HS 030354 (Eurostat Comext DS-045409)';
      }
    }
  } catch (e) {
    console.warn('[Eurostat Comext] 연동 실패, Fallback 사용');
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    isLive,
    dataAsOf,
    scope,
    source: isLive
      ? 'Eurostat Comext DS-045409 (실데이터 파싱)'
      : 'Eurostat Fallback (정적 추정치)',
    imports,
    // 가공형태 구성비는 라이브 소스가 없는 정적 추정치 (참고용)
    production: FALLBACK_PROD,
    productionStatic: true,
  }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
