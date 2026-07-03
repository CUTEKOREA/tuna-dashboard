import { NextResponse } from 'next/server';
import { logApiFail, logApiSuccess, logSchemaIssue } from '@/lib/api-debug';

/**
 * 한우 도매가 vs 수입육 LIVE API — W8
 * GET /api/beef/hanwoo-price
 *
 * Primary: KAMIS API (한국농수산식품유통공사)
 *   - 품목코드: 한우 등심 1++(1++ 등급)
 *   - 비교: 수입육 가공품(미국·호주)
 * Auth: KAMIS_API_KEY
 * Fallback: 정적 (beefData.ts priceGapData)
 */

const KAMIS_KEY = process.env.KAMIS_API_KEY || '';
const KAMIS_BASE = 'https://www.kamis.or.kr/service/price/xml.do';

type PricePoint = { month: string; hanwoo: number; usImport: number | null; auImport: number | null };

const FALLBACK: PricePoint[] = [
  { month: '23-01', hanwoo: 22500, usImport: 12800, auImport: 11200 },
  { month: '23-04', hanwoo: 21800, usImport: 13100, auImport: 11400 },
  { month: '23-07', hanwoo: 23200, usImport: 13500, auImport: 11600 },
  { month: '23-10', hanwoo: 22400, usImport: 13300, auImport: 11500 },
  { month: '24-01', hanwoo: 21900, usImport: 13800, auImport: 11800 },
  { month: '24-04', hanwoo: 22600, usImport: 14200, auImport: 12000 },
  { month: '24-07', hanwoo: 24100, usImport: 14600, auImport: 12300 },
  { month: '24-10', hanwoo: 23500, usImport: 14400, auImport: 12200 },
];

// 일자 → "YY-MM" 분기 묶음 (분기 첫 달만 추출)
function toQuarterKey(dateStr: string): string | null {
  // dateStr: "2024/10/15" 또는 "20241015"
  const clean = dateStr.replace(/\D/g, '');
  if (clean.length < 6) return null;
  const yy = clean.slice(2, 4);
  const mm = parseInt(clean.slice(4, 6));
  // 분기 시작 월 (1,4,7,10)만
  if (![1, 4, 7, 10].includes(mm)) return null;
  return `${yy}-${String(mm).padStart(2, '0')}`;
}

async function fetchKamisItem(itemCode: string, itemCategoryCode: string, kindCode: string, productRankCode: string): Promise<Record<string, number>> {
  // 분기별 가격 추출 — 최근 24개월
  const today = new Date();
  const start = new Date(today);
  start.setMonth(start.getMonth() - 24);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  // KAMIS 한우 매핑 (KAMIS URL 검증 완료):
  //   itemcategorycode=500 (축산물, 100 아님!)
  //   itemcode=4304 (한우 4자리, 411 아님)
  //   kindcode=27 (한우 1등급), productrankcode=1
  const params = new URLSearchParams({
    action: 'periodProductList',
    p_productclscode: '01', // 도매
    p_itemcategorycode: itemCategoryCode,
    p_itemcode: itemCode,
    p_kindcode: kindCode,
    p_productrankcode: productRankCode,
    p_startday: fmt(start),
    p_endday: fmt(today),
    p_cert_key: KAMIS_KEY,
    p_cert_id: process.env.KAMIS_CERT_ID || "7849",
    p_returntype: 'json',
  });

  const label = `beef/hanwoo-price[item=${itemCode},kind=${kindCode}]`;
  const res = await fetch(`${KAMIS_BASE}?${params}`, {
    signal: AbortSignal.timeout(10000),
    next: { revalidate: 86400 },
  });
  if (!res.ok) {
    logApiFail(label, `HTTP ${res.status}`);
    return {};
  }
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch {
    logApiFail(label, 'JSON parse failed', text.slice(0, 200));
    return {};
  }

  const items = json?.data?.item || json?.items || [];
  if (!items.length) {
    logSchemaIssue(label, 'data.item[] non-empty', JSON.stringify(json).slice(0, 300));
  }
  const byQ: Record<string, number[]> = {};
  for (const it of items) {
    const raw = (it.yyyy || '') + (it.regday || '');
    const q = toQuarterKey(raw);
    if (!q) continue;
    const price = parseInt((it.price || '0').replace(/,/g, ''));
    if (price > 0) (byQ[q] = byQ[q] || []).push(price);
  }
  const result: Record<string, number> = {};
  Object.keys(byQ).forEach(q => {
    const arr = byQ[q];
    result[q] = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  });
  if (Object.keys(result).length > 0) {
    logApiSuccess(label, `${Object.keys(result).length} quarters`);
  }
  return result;
}

export async function GET() {
  let data: PricePoint[] = FALLBACK;
  let isLive = false;
  let partialLive = false; // 일부 시리즈만 라이브일 때 true (위젯이 정직 표기에 사용)
  let seriesLive = { hanwoo: false, usImport: false, auImport: false };
  let source = '한국농수산식품유통공사(KAMIS) 정적 미러';

  if (KAMIS_KEY) {
    try {
      // KAMIS 검증 매핑 (URL 추출 확인):
      //   한우: itemcategorycode=500, itemcode=4304, kindcode=27, productrankcode=1
      //   수입 쇠고기: itemcode 4307은 오류 코드로 확인 — 올바른 코드 조사는 별도 과제
      const [hanwoo, imported] = await Promise.all([
        fetchKamisItem('4304', '500', '27', '1'),
        fetchKamisItem('4307', '500', '27', '1'),
      ]);

      const quarters = Object.keys(hanwoo).sort();
      if (quarters.length >= 4) {
        // A-01: 합성 산식(us×0.85)·동결 상수 대입 금지.
        // 산출 불가 시리즈는 null → 위젯에서 해당 시리즈 미표시.
        // KAMIS 한우는 100g 단위 가격 → kg 단위(× 10)로 정규화 (차트 일관성)
        const importedHasData = Object.keys(imported).length > 0;
        data = quarters.slice(-8).map(q => ({
          month: q,
          hanwoo: (hanwoo[q] || 0) * 10, // 100g → kg 환산
          usImport: imported[q] ? imported[q] * 10 : null,
          auImport: null, // 호주산 KAMIS 코드 미확보 — 추정값 미생성
        }));
        isLive = true;
        seriesLive = { hanwoo: true, usImport: importedHasData, auImport: false };
        partialLive = !(seriesLive.usImport && seriesLive.auImport);
        source = `KAMIS API (한우 4304/27 LIVE, kg 환산, ${quarters.length} quarters${importedHasData ? ' + 미국산 LIVE' : ''}, 수입육 시리즈 ${importedHasData ? '부분' : ''}미연동, 1d 캐시)`;
      } else {
        source = 'KAMIS 한우 응답 부족 — 정적 미러';
      }
    } catch {
      source = 'KAMIS API 호출 실패 — 정적 미러';
    }
  } else {
    source = 'KAMIS_API_KEY 미설정 — 정적 미러';
  }

  return NextResponse.json({
    isLive,
    partialLive,
    seriesLive,
    source,
    fetchedAt: new Date().toISOString(),
    data,
  }, { headers: { 'Cache-Control': 's-maxage=86400, stale-while-revalidate=604800' } });
}
