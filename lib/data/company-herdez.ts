import raw from '@/public/data/companies/herdez_v1.json';

/**
 * Grupo Herdez 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅩⅢ, 2026-09).
 *
 * 멕시코 가공식품 상장사. 2020년에 참치 선단·공장·상표를 팔고 브랜드만 남겼다.
 *
 * ⚠ **「참치를 만든다」로 쓰지 마라.** 2020년 이후 제3자 위탁 생산이고 제조사 상호는 공시에 없다.
 * ⚠ **「참치에서 철수했다」도 아니다.** 브랜드를 갖고 유통·판매를 계속한다.
 * ⚠ **Herdez Del Fuerte는 지분 50%이지만 연결 종속회사다.** 지분법 대상은 MegaMex다.
 * ⚠ **참치 단독 매출은 어느 해에도 공시에 없다.** 통조림 카테고리 8.1%는 채소를 포함한 상한이다.
 * ⚠ **설비용량 합계 480,593 → 531,024 t는 합작사 공장표 범위다.** KUO 그룹 전체가 아니다.
 * ⚠ 「미달폭이 가장 크다」로 쓰지 마라 — Great Value 140 g의 하한 미달폭이 더 크다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const herdezMeta = data._meta;
export const herdezCard = data.card;
export const herdezStats = data.stats;
export const herdezSourceNotes = data.sourcenotes;

/** 판 공장의 2019년 실제 처리량(t, 설비용량 × 가동률). */
export function soldPlantThroughput(): number {
  const s = data.stats;
  return Math.round(s.판_공장_설비용량_t * (s.판_공장_가동률_pct / 100));
}

/** 표시 배수중량 대비 실측 미달률(%). */
export function drainedShortfallPct(): number {
  const s = data.stats;
  return Number(((s.실측_배수중량_g / s.표시_배수중량_g - 1) * 100).toFixed(1));
}

/** 100 g당 가격에서 Herdez가 대중 브랜드보다 비싼 배수. */
export function priceRatioVsDolores(): number {
  const s = data.stats;
  return Number((s.Herdez130_페소_100g / s.Dolores140_페소_100g).toFixed(2));
}
