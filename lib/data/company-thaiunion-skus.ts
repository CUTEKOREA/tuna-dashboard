import raw from '@/public/data/companies/thaiunion_skus_v1.json';

/**
 * Thai Union 브랜드 SKU 카탈로그 (2026-08-20 조사 아카이브).
 *
 * Frinsa 보고서는 제품 하나하나를 규격·가격까지 적었는데 Thai Union 쪽은 브랜드별 개수와
 * 가격 표본만 실려 있었다. 원자료는 그때 이미 다 받아 뒀고 화면에 안 올라갔을 뿐이다.
 *
 * 아홉 브랜드 **467 SKU** — 여섯 곳은 회사 공개 카탈로그(등급 A), 셋은 전용 사이트가
 * 없거나 막혀 Open Food Facts 로 받은 것(등급 B)이다. 두 갈래를 섞지 않고 등급으로 가른다.
 *
 * ⚠ **빈 칸은 채우지 않는다.** 어종 442/467 · 규격 363/467 · 인증 162/467이고 나머지는
 *   원자료에 없다. 「—」가 곧 「출처에 없음」이라는 뜻이다.
 * ⚠ 어종은 원자료의 분류·학명이 있으면 그것을, 없으면 **제품명 자체에 적힌 어종**을 읽는다.
 *   지어낸 값이 아니라 그 이름을 옮긴 것이다.
 */

export interface Sku {
  브랜드: string;
  국가: string;
  제품명: string;
  /** 「—」는 출처에 없다는 뜻이다 */
  어종: string;
  규격: string;
  타입: string;
  인증: string;
  /** A=회사 공개 카탈로그 · B=Open Food Facts */
  등급: 'A' | 'B';
  출처: string;
  url: string;
}

export interface BrandRow {
  브랜드: string; 국가: string; 수: number; 등급: 'A' | 'B'; 출처: string;
}

export interface PriceRow {
  브랜드: string; 제품명: string; 규격: string; 가격: string;
  단가: string; 소매처: string; 국가: string; 기준일: string; 출처: string;
}

const data = raw as unknown as {
  _meta: { 회사: string; 출처: string; 등급: string; 한계: string; 갱신방법: string };
  brands: BrandRow[];
  skus: Sku[];
  prices: PriceRow[];
};

export const tuSkuMeta = data._meta;
export const tuBrands = data.brands;
export const tuSkus = data.skus;
export const tuPrices = data.prices;

/** 그 브랜드의 SKU. 보고서 절 순서를 그대로 지킨다. */
export function skusOf(brand: string): Sku[] {
  return data.skus.filter((s) => s.브랜드 === brand);
}

export function pricesOf(brand: string): PriceRow[] {
  return data.prices.filter((p) => p.브랜드 === brand);
}

/** 전체 SKU 수. 브랜드 표의 합과 같아야 한다 — 테스트가 잰다. */
export function skuTotal(): number {
  return data.skus.length;
}

/**
 * 어종별 SKU 수. 「—」(출처에 없음)는 세지 않는다.
 *
 * 한 SKU 가 어종을 둘 달고 있으면 양쪽에 센다 — 그래서 합이 SKU 수보다 클 수 있다.
 */
export function speciesMix(): { 어종: string; 수: number }[] {
  const m = new Map<string, number>();
  for (const s of data.skus) {
    if (s.어종 === '—') continue;
    // 학명·품종 괄호는 떼고 한글명으로 묶는다 — 「청어 (Clupea harengus)」와 「청어」가 갈리면 안 된다.
    // 한 행에 어종이 둘 붙은 것도 있어(「연어(핑크) · 연어」) 항목 단위로 쪼갠 뒤 중복을 없앤다.
    const keys = new Set(
      s.어종.split('·').map((x) => x.replace(/\s*\([^)]*\)/g, '').trim()).filter(Boolean),
    );
    for (const key of keys) m.set(key, (m.get(key) ?? 0) + 1);
  }
  return [...m.entries()].map(([어종, 수]) => ({ 어종, 수 })).sort((a, b) => b.수 - a.수);
}

/** 참치 계열 SKU 수 — 가다랑어·황다랑어·날개다랑어를 포함한다. */
export function tunaSkus(): number {
  return data.skus.filter((s) => /참치|다랑어/.test(s.어종)).length;
}

/** 출처 등급별 SKU 수. A와 B를 섞어 세지 않기 위한 것이다. */
export function byGrade(): { A: number; B: number } {
  return {
    A: data.skus.filter((s) => s.등급 === 'A').length,
    B: data.skus.filter((s) => s.등급 === 'B').length,
  };
}

/** 칸이 실제로 채워진 비율. 화면에 「무엇이 없는지」를 밝히는 데 쓴다. */
export function fillRate(field: ' 어종' | '어종' | '규격' | '인증'): number {
  const k = field.trim() as keyof Sku;
  const n = data.skus.filter((s) => s[k] !== '—').length;
  return Math.round((n / data.skus.length) * 1000) / 10;
}
