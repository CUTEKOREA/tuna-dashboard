import raw from '@/public/data/companies/chancerelle_v1.json';

/**
 * Chancerelle · La Belle-Îloise · Gonidec 기업 해부 인테이크 (ⅬⅩⅦ, 2026-10).
 * 수치는 발행본 표지 타일에서만 채택한다. 세 회사 수치를 합산하지 않는다.
 * Chancerelle 회사 설명 매출의 법정 연결 범위는 미확인이다.
 * 어류 구매량·생산 캔 수를 참치 부문 수치로 바꾸지 않는다.
 * 금칙 정본: ~/tunawork/chancerelle/build/killed.py (확인값 [], prose 테스트에 등록).
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`chancerelle stats.${key} 가 숫자가 아니다`);
  return v;
}

export const chancerelleMeta = data._meta;
export const chancerelleCard = data.card;
export const chancerelleStats = data.stats;
export const chancerelleSourceNotes = data.sourcenotes;

/** 회사 연혁의 출발 연도. 현재 운영법인의 생성일이 아니다. */
export function company() {
  return { 출발연도: n('Chancerelle_통조림출발연도') };
}

/** Chancerelle의 회사 설명 규모. 참치 부문 수치가 아니다. */
export function scale() {
  return {
    매출백만유로: n('Chancerelle_회사설명매출_2025_백만EUR'),
    어류구매량: n('Chancerelle_어류구매량_2025_t'),
    생산백만캔: n('Chancerelle_생산규모_2025_백만캔'),
    직원: n('Chancerelle_회사설명직원_명'),
  };
}
