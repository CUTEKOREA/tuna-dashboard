import raw from '@/public/data/companies/alliance_v1.json';

/**
 * Alliance Select Foods International(ASFII) 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅫ, 2026-09).
 *
 * 필리핀 제너럴산토스의 주문자상표 캔참치 가공사. 필리핀증권거래소 FOOD.
 *
 * ⚠ **「지진이 실적을 무너뜨렸다」로 쓰지 마라.** 매출이 반토막 난 분기는 지진 두 달 전 1분기이고, 지진이 낀 2분기 매출 감소는 13%다.
 * ⚠ **「공장이 하나」가 아니라 부지가 하나다.** 68,751 ㎡ 한 곳에 캔·어분·연어 설비가 함께 있다.
 * ⚠ **일 90 t은 인도네시아 비퉁 공장 수치다.** 2019년 설비를 팔았고 제너럴산토스 능력이 아니다.
 * ⚠ **「증자가 끝났다」로 쓰지 마라.** 2026-10-15 주주총회와 규제 승인이 남았다.
 * ⚠ 「모회사」는 Strongoak이다 — ASFII 별도재무제표를 「모회사 재무제표」로 부르지 않는다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const allianceMeta = data._meta;
export const allianceCard = data.card;
export const allianceStats = data.stats;
export const allianceSourceNotes = data.sourcenotes;

/** 2022 → 2025 매출 배수. */
export function revenueMultiple(): number {
  const s = data.stats;
  return Number((s.매출_2025_usd / s.매출_2022_usd).toFixed(2));
}

/** 2025 영업활동 현금흐름(백만 달러). */
export function operatingCashFlowMn(): number {
  return Number((data.stats.영업현금흐름_2025_usd / 1e6).toFixed(2));
}

/** 증자 완료 시 일반주주 희석 폭(%p, 계산). */
export function dilutionPoints(): number {
  const s = data.stats;
  return Number((s.증자후_지분_pct - s.Strongoak_지분_pct).toFixed(2));
}
