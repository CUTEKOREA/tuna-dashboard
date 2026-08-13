import { NextResponse } from 'next/server';
import { requireEnv } from '../../_shared/env';

export const runtime = 'nodejs';
export const revalidate = 3600;

/**
 * 미국 참치 수입 관문 레이더 API
 * GET /api/tuna/us-gateway
 *
 * US Census Bureau timeseries/intltrade/imports/hs — HS 160414(참치캔) hs10 합산.
 * 최신월 자동 탐색(당월부터 최대 4개월 소급 — Census는 미공표 월에 빈 응답 반환).
 * 반환: 원산지 top5 (GEN_VAL_MO 합산) + 통관지구 top6 분포 + 월 표기.
 *
 * ⚠️ 실측 함정 (2026-07-06 검증):
 *  - DISTRICT를 get 파라미터에 포함해야 지구별 행이 반환됨 (미포함 시 TOTAL 행만 옴)
 *  - CTY_NAME에 APEC/ASEAN 등 집계그룹 혼입 → CTY_CODE 숫자 1000~7999만 실제 국가
 *  - I_COMMODITY에 HS6 총계행(160414) 혼입 → hs10(10자리) 행만 합산 (검증: hs10 합산
 *    $109.6M == 공식 HS6 총계행 $109.6M 일치, 2026-04)
 *  - 수량은 UNIT_QY1==='KG' 행만 합산 (scripts/fetch_us_census_data.js:82-92 패턴)
 */

// L-10: env 우선, 없으면 하드코딩 fallback 키로 라이브 시도 (⚠️ 57ed 키만 유효)
const CENSUS_API_KEY = () => requireEnv('USCENSUS_API_KEY');
const BASE_URL = 'https://api.census.gov/data/timeseries/intltrade/imports/hs';
const HS6 = '160414';

// ─── 한글 매핑 (사용자 노출 텍스트 100% 한글 — L-01) ────────────────────────
const COUNTRY_KR: Record<string, string> = {
  'THAILAND': '태국', 'ECUADOR': '에콰도르', 'VIETNAM': '베트남', 'CHINA': '중국',
  'INDONESIA': '인도네시아', 'PHILIPPINES': '필리핀', 'MEXICO': '멕시코', 'PERU': '페루',
  'COLOMBIA': '콜롬비아', 'COSTA RICA': '코스타리카', 'EL SALVADOR': '엘살바도르',
  'CANADA': '캐나다', 'SPAIN': '스페인', 'PORTUGAL': '포르투갈', 'ITALY': '이탈리아',
  'CROATIA': '크로아티아', 'GREECE': '그리스', 'TURKEY': '튀르키예', 'ISRAEL': '이스라엘',
  'YEMEN': '예멘', 'MALDIVES': '몰디브', 'KOREA, SOUTH': '한국', 'JAPAN': '일본',
  'FIJI': '피지', 'MOROCCO': '모로코', 'ALGERIA': '알제리', 'TUNISIA': '튀니지',
  'GHANA': '가나', 'CABO VERDE': '카보베르데', 'MAURITIUS': '모리셔스',
  'SRI LANKA': '스리랑카', 'INDIA': '인도', 'TAIWAN': '대만', 'MALAYSIA': '말레이시아',
  'SINGAPORE': '싱가포르', 'SENEGAL': '세네갈', 'SEYCHELLES': '세이셸',
  'PAPUA NEW GUINEA': '파푸아뉴기니', 'SOLOMON ISLANDS': '솔로몬제도',
  'MARSHALL ISLANDS': '마셜제도', 'FRANCE': '프랑스', 'GERMANY': '독일',
};

const DISTRICT_KR: Record<string, string> = {
  'LOS ANGELES, CA': '로스앤젤레스', 'SAVANNAH, GA': '서배너', 'NEW YORK CITY, NY': '뉴욕',
  'CHICAGO, IL': '시카고', 'HOUSTON-GALVESTON, TX': '휴스턴', 'LAREDO, TX': '러레이도',
  'SAN FRANCISCO, CA': '샌프란시스코', 'SEATTLE, WA': '시애틀', 'SAN DIEGO, CA': '샌디에이고',
  'BALTIMORE, MD': '볼티모어', 'MIAMI, FL': '마이애미', 'NORFOLK, VA': '노퍽',
  'CHARLESTON, SC': '찰스턴', 'TAMPA, FL': '탬파', 'NEW ORLEANS, LA': '뉴올리언스',
  'BOSTON, MA': '보스턴', 'PHILADELPHIA, PA': '필라델피아', 'DALLAS-FORT WORTH, TX': '댈러스',
  'DETROIT, MI': '디트로이트', 'CLEVELAND, OH': '클리블랜드', 'ST. LOUIS, MO': '세인트루이스',
  'MINNEAPOLIS, MN': '미니애폴리스', 'PORTLAND, OR': '포틀랜드', 'COLUMBIA-SNAKE, OR': '컬럼비아',
  'ANCHORAGE, AK': '앵커리지', 'HONOLULU, HI': '호놀룰루', 'SAN JUAN, PR': '산후안',
  'BUFFALO, NY': '버펄로', 'OGDENSBURG, NY': '오그던스버그', 'EL PASO, TX': '엘패소',
  'NOGALES, AZ': '노갈레스', 'MOBILE, AL': '모빌', 'WASHINGTON, DC': '워싱턴',
  'MILWAUKEE, WI': '밀워키', 'GREAT FALLS, MT': '그레이트폴스', 'PEMBINA, ND': '펨비나',
  'ST. ALBANS, VT': '세인트올번스', 'PROVIDENCE, RI': '프로비던스', 'DULUTH, MN': '덜루스',
  'PORT ARTHUR, TX': '포트아서', 'VIRGIN ISLANDS OF THE U.S.': '버진아일랜드',
};

function ctyKr(name: string): string {
  return COUNTRY_KR[name] ?? name.replace(/,.*$/, '').trim();
}
function distKr(name: string): string {
  return DISTRICT_KR[name] ?? name.replace(/,\s*[A-Z]{2}$/, '').trim();
}

// ─── 정직 fallback (2026-04 실측치 — Census API 실호출 결과 그대로) ─────────
const FALLBACK = {
  month: '2026-04',
  totalValueMusd: 109.6,
  origins: [
    { name: '태국', valueMusd: 51.1, sharePct: 46.6, qtyT: 10750 },
    { name: '에콰도르', valueMusd: 15.7, sharePct: 14.4, qtyT: 2590 },
    { name: '베트남', valueMusd: 11.3, sharePct: 10.3, qtyT: 2020 },
    { name: '페루', valueMusd: 5.9, sharePct: 5.4, qtyT: 1230 },
    { name: '멕시코', valueMusd: 5.9, sharePct: 5.3, qtyT: 1260 },
  ],
  districts: [
    { name: '로스앤젤레스', valueMusd: 27.3, sharePct: 24.9 },
    { name: '서배너', valueMusd: 25.5, sharePct: 23.3 },
    { name: '뉴욕', valueMusd: 23.5, sharePct: 21.4 },
    { name: '시카고', valueMusd: 8.8, sharePct: 8.0 },
    { name: '휴스턴', valueMusd: 5.1, sharePct: 4.7 },
    { name: '러레이도', valueMusd: 4.2, sharePct: 3.8 },
    { name: '기타', valueMusd: 15.2, sharePct: 13.9 },
  ],
};

const TOTAL_DIST = 'TOTAL FOR ALL DISTRICTS';

function isRealCountry(ctyCode: string): boolean {
  if (!/^\d{4}$/.test(ctyCode)) return false; // '1XXX' 대륙집계·'-' 총계·'00xx' 그룹 제외
  const n = parseInt(ctyCode, 10);
  return n >= 1000 && n <= 7999;
}

async function fetchMonth(timeKey: string): Promise<string[][] | null> {
  const url = `${BASE_URL}?get=GEN_VAL_MO,GEN_QY1_MO,UNIT_QY1,CTY_CODE,CTY_NAME,DISTRICT,DIST_NAME` +
    `&I_COMMODITY=${HS6}*&time=${timeKey}&key=${CENSUS_API_KEY()}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const text = await res.text();
  if (!text.trim()) return null; // 미공표 월 → 빈 응답
  try {
    const rows = JSON.parse(text) as string[][];
    return Array.isArray(rows) && rows.length > 1 ? rows : null;
  } catch {
    return null;
  }
}

export async function GET() {
  let payload = { ...FALLBACK };
  let isLive = false;

  try {
    // 최신월 자동 탐색: 당월부터 최대 4개월 소급
    let rows: string[][] | null = null;
    let month = '';
    const now = new Date();
    for (let back = 0; back <= 4 && !rows; back++) {
      const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
      const timeKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      rows = await fetchMonth(timeKey);
      if (rows) month = timeKey;
    }

    if (rows) {
      const header = rows[0];
      const idx: Record<string, number> = {};
      header.forEach((h, i) => { idx[h] = i; });

      const ctyVal: Record<string, number> = {};
      const ctyKg: Record<string, number> = {};
      const distVal: Record<string, number> = {};

      for (const r of rows.slice(1)) {
        const commodity = r[idx['I_COMMODITY']] ?? '';
        const ctyCode = r[idx['CTY_CODE']] ?? '';
        const distName = r[idx['DIST_NAME']] ?? '';
        if (commodity.length !== 10) continue;      // hs10 행만 (HS6 총계행 제외)
        if (!isRealCountry(ctyCode)) continue;       // 집계그룹(APEC/ASEAN 등) 제외
        const val = parseFloat(r[idx['GEN_VAL_MO']]) || 0;

        if (distName === TOTAL_DIST) {
          // 국가 합산은 TOTAL 행 기준 (지구별 행과 이중 합산 방지)
          const cty = r[idx['CTY_NAME']] ?? '';
          ctyVal[cty] = (ctyVal[cty] || 0) + val;
          if (r[idx['UNIT_QY1']] === 'KG') {
            ctyKg[cty] = (ctyKg[cty] || 0) + (parseFloat(r[idx['GEN_QY1_MO']]) || 0);
          }
        } else {
          // 통관지구 분포는 TOTAL 행 제외
          distVal[distName] = (distVal[distName] || 0) + val;
        }
      }

      const totalVal = Object.values(ctyVal).reduce((a, b) => a + b, 0);
      if (totalVal > 0) {
        const origins = Object.entries(ctyVal)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, v]) => ({
            name: ctyKr(name),
            valueMusd: Math.round(v / 1e6 * 10) / 10,
            sharePct: Math.round(v / totalVal * 1000) / 10,
            qtyT: Math.round((ctyKg[name] || 0) / 1000),
          }));

        const distSorted = Object.entries(distVal).sort((a, b) => b[1] - a[1]);
        const distTotal = Object.values(distVal).reduce((a, b) => a + b, 0);
        const top6 = distSorted.slice(0, 6);
        const restVal = distTotal - top6.reduce((a, [, v]) => a + v, 0);
        const districts = top6.map(([name, v]) => ({
          name: distKr(name),
          valueMusd: Math.round(v / 1e6 * 10) / 10,
          sharePct: Math.round(v / distTotal * 1000) / 10,
        }));
        if (restVal > 0) {
          districts.push({
            name: '기타',
            valueMusd: Math.round(restVal / 1e6 * 10) / 10,
            sharePct: Math.round(restVal / distTotal * 1000) / 10,
          });
        }

        payload = {
          month,
          totalValueMusd: Math.round(totalVal / 1e6 * 10) / 10,
          origins,
          districts,
        };
        isLive = true; // L-09: 실호출 성공 시에만 LIVE
      }
    }
  } catch {
    console.warn('[US Census API] 연동 실패, 2026-04 실측 fallback 사용');
  }

  // L-12: isLive 필드 표준 + fallback 분기도 isLive:false 명시 (정직 telemetry)
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    isLive,
    hsCode: HS6,
    source: isLive
      ? '미국 인구조사국 수입통계 OpenAPI (실시간)'
      : '미국 인구조사국 2026-04 실측 스냅샷 (fallback)',
    ...payload,
  }, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
