import raw from '@/public/data/companies/boltonfood_v1.json';

/**
 * Bolton Food S.p.A. 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩ, 2026-09).
 *
 * 편 Ⅵ이 그룹을 다뤘다면 이 편은 법인 하나로 내려간다. 내려가면 숫자가 달라진다 —
 * 그룹 순매출 €3.541백만, 식품 카테고리 €2.382백만, 법인 개별 €734,2백만으로 4,8배 차이다.
 *
 * ⚠ **「밀라노 본사」로 쓰지 마라.** 등기 본점은 코모현 체르메나테다.
 * ⚠ **「그룹 €3.5십억이 식품 매출」로 쓰지 마라.** 세제·화장품·접착제를 포함한 그룹 전체다.
 * ⚠ **「2030년까지 참치 전량 인증」으로 쓰지 마라.** 원문은 대표 브랜드 참치 100%이고 2025년 실적 45%다.
 * ⚠ **「온실가스 목표에서 트레이딩 계열이 빠졌다」로 쓰지 마라.** 빠진 칸은 매출·물 지표다.
 * ⚠ **「2026년 말 편입」으로 쓰지 마라.** 2025년 갱신 때 이미 편입됐고 기준 충족 목표가 2027~2028년이다.
 * ⚠ **「이 회사가 배 16척을 소유한다」로 쓰지 마라.** 소유 법인은 별개 넷이다.
 * ⚠ **자율관세할당을 이 법인이 썼다고 쓰지 마라.** 조회 화면에 수입자 칸이 없다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const boltonfoodMeta = data._meta;
export const boltonfoodCard = data.card;
export const boltonfoodStats = data.stats;
export const boltonfoodSourceNotes = data.sourcenotes;

/** 그룹 순매출이 법인 개별 매출의 몇 배인가. */
export function groupToEntityMultiple(): number {
  return Number(
    (data.stats.그룹순매출_백만유로 / data.stats.법인개별_백만유로).toFixed(1),
  );
}

/** 공급선 명단의 고유 선박이 한 해 만에 몇 배가 됐는가. */
export function vesselListGrowthMultiple(): number {
  return Number(
    (data.stats.명단_2025_고유선박 / data.stats.명단_2024_고유선박).toFixed(1),
  );
}

/** 2025년 명단의 한국 국적선 스물셋이 선주별로 맞는지 검산한다. */
export function koreanVesselsSum(): number {
  const s = data.stats;
  return s.한국_동원 + s.한국_사조 + s.한국_신라 + s.한국_미확인;
}

/** 한국이 이탈리아 시장에서 갖는 금액 몫과 중량 몫의 차(%p). 두 순위가 갈리는 크기다. */
export function italyShareGapPp(): number {
  return Number(
    (data.stats.한국_이탈리아_금액몫_퍼센트 - data.stats.한국_이탈리아_중량몫_퍼센트).toFixed(2),
  );
}
