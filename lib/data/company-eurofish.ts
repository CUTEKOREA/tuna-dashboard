import raw from '@/public/data/companies/eurofish_v1.json';

/**
 * Eurofish S.A. 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅥ, 2026-09).
 *
 * 에콰도르 만타·몬테크리스티의 참치 가공사. 선단은 별도 법인 명의로 흩어져 있다.
 *
 * ⚠ **「Eurofish 가 19척을 소유」로 쓰지 마라.** MSC 부속서의 회사 칸은 인증 연계이지 소유·지배가 아니다.
 * ⚠ **「배를 갖지 않는다」로 쓰지 마라.** 2019 감사 장부에 어선 자산(장부가 786만 달러)이 있다.
 * ⚠ **58.2% 를 「관계회사산 원어 비중」으로 쓰지 마라.** 주석의 관계회사 「매입」은 품목 미분류, 금액 기준이다.
 * ⚠ **2018년 25.1% 를 쓰지 마라.** Elvayka 쪽 장부(생선 매출 1,610만)와 Eurofish 쪽 장부(매입 170만)가 어긋난다.
 * ⚠ **가동률로 읽지 마라.** 76,800 t 은 기준 조건 없는 회사 자칭 능력치다.
 * ⚠ **NIRSA 보다 큰 선단으로 쓰지 마라.** 등록 소유 기준 1위는 NIRSA 다. 인증 연계 기준은 민감도 계산이다.
 * ⚠ 인도양 4척은 「신예」가 아니다(2010~2013 건조). 파나마 법인 소유 3척의 유럽 원산지 적격은 판단할 수 없다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const eurofishMeta = data._meta;
export const eurofishCard = data.card;
export const eurofishStats = data.stats;
export const eurofishSourceNotes = data.sourcenotes;

/** 현재 에콰도르 기국 인증 연계 선단 용적 / 에콰도르 선망 전체 용적. 소유가 아니라 인증 연계 기준. */
export function linkedFleetSharePct(): number {
  const s = data.stats;
  return Number(((s.현재_에콰도르_연계_용적_m3 / s.에콰도르_선망_용적_m3) * 100).toFixed(1));
}

/** 2019 관계회사 매입 거래 / 원어 매입액. 품목 미분류 — 조건부 비교값. */
export function relatedPurchaseSharePct(): number {
  const s = data.stats;
  return Number(((s.관계회사_매입_2019_usd / s.원어_매입_2019_usd) * 100).toFixed(1));
}

/** 2019 → 2024 매출 증가율(순위 원자료). */
export function salesGrowthPct(): number {
  const s = data.stats;
  return Number(((s.매출_2024_usd / s.매출_2019_usd - 1) * 100).toFixed(1));
}

/** 인도양에서 넘어온 4척이 현재 연계 선단 용적에서 차지하는 몫. */
export function transferredShareOfLinkedPct(): number {
  const s = data.stats;
  return Number(((s.인도양_이적_용적_m3 / s.현재_에콰도르_연계_용적_m3) * 100).toFixed(1));
}
