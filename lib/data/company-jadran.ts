import raw from '@/public/data/companies/jadran_v1.json';

/**
 * Jadran Tuna 기업 해부 인테이크 (ⅬⅩⅧ, 2026-10).
 * 수치는 발행본 표지 타일에서만 채택한다.
 * 허용량·시장출하 배정·야생 입식 상한은 실제 생산·출하·입식량이 아니다.
 * 후속 확대 신청 목표량은 승인된 면허 허용량이 아니다.
 * 금칙 정본: ~/tunawork/jadran/build/killed.py (확인값 [], prose 테스트에 등록).
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`jadran stats.${key} 가 숫자가 아니다`);
  return v;
}

export const jadranMeta = data._meta;
export const jadranCard = data.card;
export const jadranStats = data.stats;
export const jadranSourceNotes = data.sourcenotes;

/** 현장 면허·연간 배정·입식 상한·신청 목표량은 서로 다른 양이다. */
export function limits() {
  return {
    허용연간양식량: n('면허허용연간양식량_t'),
    시장출하배정: n('시장출하배정_2026_t'),
    야생입식상한: n('야생입식상한_2026_t'),
    확대신청목표량: n('후속확대신청목표량_t년'),
  };
}
