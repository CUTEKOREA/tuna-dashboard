/**
 * U.S. Census Bureau 무역 통계 인테이크 모듈
 * ─────────────────────────────────────────────────────────────
 * 위젯이 JSON을 직접 import하던 패턴(AGENTS.md 함정 #4)을 차단하기 위한 단일 진입점.
 * 위젯은 본 모듈의 헬퍼만 사용한다. 향후 fetch('/api/us-census') 전환은 본 모듈 내부만 교체.
 *
 * 데이터 출처: scripts/fetch_us_census_data.{js,py} 가 빌드타임에 사전 적재한 캐시.
 * 커버리지: 2021-01 ~ 2024-04 (월별), HS 6자리 3종 — 160414/030343/030475.
 */

import rawData from '../../data/us_census_timeseries.json';

// ── 타입 ─────────────────────────────────────────────────────
export type CensusRow = {
  time: string;          // 'YYYY-MM'
  country: string;       // 원본 영문(대문자) — Census 표기
  value: number;         // 월간 수입액 (USD)
  quantity_kg: number;   // 월간 물량 (kg)
  unit_value_usd_per_kg: number;
};

export type HsCode = '160414' | '030343' | '030475';

const STORE = rawData as Record<string, CensusRow[]>;

// ── HS 라벨 ──────────────────────────────────────────────────
export const HS_LABEL_KR: Record<HsCode, string> = {
  '160414': '참치캔 (가다랑어 조제)',
  '030343': '냉동 가다랑어',
  '030475': '냉동 명태 필렛',
};

// ── 지역·경제권 집계 행 (개별 국가 아님) ────────────────────
// Census 응답에 섞여 있는 그룹 집계는 점유율 계산에서 반드시 제외.
const NON_COUNTRY = new Set([
  'TOTAL FOR ALL COUNTRIES', 'APEC', 'ASIA', 'ASEAN', 'OECD', 'LAFTA', 'NAFTA', 'USMCA',
  'OPEC', 'EUROPEAN UNION', 'EURO AREA', 'CACM', 'CAFTA', 'CAFTA-DR', 'PACIFIC RIM',
  'SUB-SAHARAN AFRICA', 'TWENTY LATIN AMERICAN REPUBLICS', 'SOUTH AMERICA', 'NORTH AMERICA',
  'CENTRAL AMERICA', 'SOUTH/CENTRAL AMERICA', 'EUROPE', 'AFRICA', 'OCEANIA', 'MIDDLE EAST',
  'ANDEAN', 'CARICOM', 'MERCOSUR', 'NORTHERN AMERICA', 'WESTERN HEMISPHERE',
  'AUSTRALIA AND OCEANIA', 'ADVANCED TECHNOLOGY PRODUCTS',
]);
export const isCountry = (name: string): boolean => !NON_COUNTRY.has(name.toUpperCase());

// ── 국가명 한글 매핑 (UI 노출용) ─────────────────────────────
const KR_COUNTRY: Record<string, string> = {
  THAILAND: '태국', VIETNAM: '베트남', ECUADOR: '에콰도르', CHINA: '중국',
  PHILIPPINES: '필리핀', INDONESIA: '인도네시아', 'KOREA, SOUTH': '한국',
  SPAIN: '스페인', ITALY: '이탈리아', MEXICO: '멕시코', PORTUGAL: '포르투갈',
  'SRI LANKA': '스리랑카', MAURITIUS: '모리셔스', FIJI: '피지', JAPAN: '일본',
  'PAPUA NEW GUINEA': '파푸아뉴기니', COLOMBIA: '콜롬비아', POLAND: '폴란드',
  'COSTA RICA': '코스타리카', SEYCHELLES: '세이셸', CANADA: '캐나다', INDIA: '인도',
  RUSSIA: '러시아', NORWAY: '노르웨이', GERMANY: '독일', FRANCE: '프랑스',
  NETHERLANDS: '네덜란드', UK: '영국', 'UNITED KINGDOM': '영국', SENEGAL: '세네갈',
  BURMA: '미얀마', MYANMAR: '미얀마', MALDIVES: '몰디브',
};
export const krCountry = (name: string): string => KR_COUNTRY[name.toUpperCase()] || name;

// ── 메타 ─────────────────────────────────────────────────────
export const META = {
  source: 'U.S. Census Bureau International Trade API',
  coverage: '2021-01 ~ 2024-04',
  syncDate: '2024-04 까지 마감 데이터',
  status: 'SYNCED' as const,  // prefetch 캐시이므로 LIVE 아닌 SYNCED 가 정직
  reliabilityGrade: 'S' as const,
  reliabilityNote: '미국 인구조사국 공식 무역 통계 (HS6 월별)',
};

// ── 헬퍼: 월별 전체 합계 (가액·물량·단가) ──────────────────
export function monthlyTotals(hs: HsCode): Array<{ time: string; valueUSD: number; qtyKg: number; unitPriceUSDperKg: number }> {
  const rows = STORE[hs] || [];
  const m = new Map<string, { v: number; q: number }>();
  for (const r of rows) {
    if (!isCountry(r.country)) continue;            // 그룹 합계 제외
    const cur = m.get(r.time) || { v: 0, q: 0 };
    cur.v += r.value || 0;
    cur.q += r.quantity_kg || 0;
    m.set(r.time, cur);
  }
  return [...m.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, { v, q }]) => ({ time, valueUSD: v, qtyKg: q, unitPriceUSDperKg: q > 0 ? v / q : 0 }));
}

// ── 헬퍼: 월별 국가별 점유율(%) 시계열 — 100% 누적 차트용 ─
export function monthlyCountryShare(hs: HsCode, topN = 5): {
  series: Array<Record<string, number | string> & { time: string }>;
  countries: string[];  // 한글 라벨 (영문 dataKey와 1:1)
  dataKeys: string[];   // 차트 dataKey (영문 그대로 — 안정성)
} {
  const rows = STORE[hs] || [];
  // 1) 전 기간 상위 N개국 추출
  const total = new Map<string, number>();
  for (const r of rows) if (isCountry(r.country)) total.set(r.country, (total.get(r.country) || 0) + (r.value || 0));
  const top = [...total.entries()].sort((a, b) => b[1] - a[1]).slice(0, topN).map(([c]) => c);

  // 2) 월별 분모(전체) + 분자(상위국)
  const byTime = new Map<string, { tot: number; perCty: Map<string, number> }>();
  for (const r of rows) {
    if (!isCountry(r.country)) continue;
    const slot = byTime.get(r.time) || { tot: 0, perCty: new Map() };
    slot.tot += r.value || 0;
    if (top.includes(r.country)) slot.perCty.set(r.country, (slot.perCty.get(r.country) || 0) + (r.value || 0));
    byTime.set(r.time, slot);
  }
  const series = [...byTime.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, { tot, perCty }]) => {
      const row: Record<string, string | number> & { time: string } = { time };
      for (const c of top) row[c] = tot > 0 ? +(((perCty.get(c) || 0) / tot) * 100).toFixed(2) : 0;
      return row;
    });
  return { series, countries: top.map(krCountry), dataKeys: top };
}

// ── 헬퍼: 연간 누적 공급국 랭킹 ──────────────────────────────
export function annualSupplierBreakdown(hs: HsCode, year?: number): Array<{ country: string; raw: string; value: number; sharePct: number }> {
  const rows = STORE[hs] || [];
  const filterYear = year ? String(year) : undefined;
  const tot = new Map<string, number>();
  let grand = 0;
  for (const r of rows) {
    if (!isCountry(r.country)) continue;
    if (filterYear && !r.time.startsWith(filterYear)) continue;
    const v = r.value || 0;
    tot.set(r.country, (tot.get(r.country) || 0) + v);
    grand += v;
  }
  return [...tot.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([raw, value]) => ({ country: krCountry(raw), raw, value, sharePct: grand > 0 ? +((value / grand) * 100).toFixed(1) : 0 }));
}

// ── 헬퍼: 특정 국가군 월별 시계열 ───────────────────────────
export function monthlyByCountries(hs: HsCode, countryNames: string[]): Array<Record<string, number | string> & { time: string }> {
  const rows = STORE[hs] || [];
  const set = new Set(countryNames.map((c) => c.toUpperCase()));
  const byTime = new Map<string, Record<string, number>>();
  for (const r of rows) {
    const c = r.country.toUpperCase();
    if (!set.has(c)) continue;
    const slot = byTime.get(r.time) || {};
    slot[c] = (slot[c] || 0) + (r.value || 0);
    byTime.set(r.time, slot);
  }
  return [...byTime.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, vals]) => {
      const row: Record<string, string | number> & { time: string } = { time };
      for (const c of countryNames) row[c.toUpperCase()] = vals[c.toUpperCase()] || 0;
      return row;
    });
}

// ── 메타데이터: 데이터 신선도 일자 자동 산출 ────────────────
export function dataRange(hs: HsCode): { start: string; end: string } {
  const times = (STORE[hs] || []).map((r) => r.time).sort();
  return { start: times[0] || '-', end: times[times.length - 1] || '-' };
}
