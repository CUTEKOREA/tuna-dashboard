import raw from '@/public/data/companies/nirsa_v1.json';

/**
 * NIRSA 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅤ, 2026-09).
 *
 * 에콰도르 포소르하의 참치·정어리 캐너리. IATTC 등록부상 에콰도르 최대 선망 선단의 소유자다.
 *
 * ⚠ **「제 배로 잡은 원료가 유럽 무관세의 조건」으로 쓰지 마라.** 원산지 의정서의 적격 선박은 유럽연합·안데스 서명국 어느 쪽이든 된다.
 * ⚠ **14척과 15척을 섞지 마라.** 소유 14척(18.2%)과 운항 포함 15척(18.8%)은 모집단이 다르다.
 * ⚠ **「파나마 선적」으로 쓰지 마라.** 기국은 에콰도르이고 파나마는 어창 용적 이전이다.
 * ⚠ **Guria를 「신조」로 쓰지 마라.** 2015년 건조, 2026년 등록부 수록이다.
 * ⚠ **「100% MSC」를 사실로 쓰지 마라.** 회사 주장이다. 증서 선박 범위와 눈다랑어 심사 단계가 맞지 않는다.
 * ⚠ **Proposorja를 자회사로 쓰지 마라.** 지주 소유의 자매회사다. 새우 매출은 NIRSA 몫과 그룹 몫이 다르다.
 * ⚠ **순위 자료 순이익 칸으로 「가장 좋은 해」를 고르지 마라.** 감사보고서와 정의가 다르다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const nirsaMeta = data._meta;
export const nirsaCard = data.card;
export const nirsaStats = data.stats;
export const nirsaSourceNotes = data.sourcenotes;

/** 2024년 매출 — 에콰도르 참치 가공사 2위(Tecopesca) 대비 배수. */
export function salesVsSecondX(): number {
  const s = data.stats;
  return Number((s.매출_2024_usd / s['2위_Tecopesca_매출_2024_usd']).toFixed(2));
}

/** 2019 → 2024 매출 증가율(순위 원자료 두 해). */
export function salesGrowthPct(): number {
  const s = data.stats;
  return Number(((s.매출_2024_usd / s.매출_2019_usd - 1) * 100).toFixed(1));
}

/** 2019년 순매출 중 새우 — 분모는 경영자 보고서 총액 3억 6,706만 달러(기타 수입 포함). 그룹이 아니라 이 법인 값. */
export function shrimpShare2019Pct(): number {
  const s = data.stats;
  return Number(((s.새우_매출_2019_usd / s.경영자보고서_총매출_2019_usd) * 100).toFixed(1));
}

/** 에콰도르 조제참치 세계 수출 중 미국행(2024). 나라 몫이지 이 회사 몫이 아니다. */
export function ecuadorToUsSharePct(): number {
  const s = data.stats;
  return Number(((s.에콰도르_대미_조제참치_2024_usd / s.에콰도르_조제참치_세계수출_2024_usd) * 100).toFixed(1));
}
