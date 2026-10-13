import raw from '@/public/data/companies/aps_v1.json';

/**
 * APS Alimentos Prosalud 기업 해부 인테이크 (ⅬⅩⅥ, 2026-10).
 * 수치는 발행본 표지 타일에서만 채택한다. 가공 개시는 설립등기 확인값이 아니다.
 * 성장률은 회사 목표, PET 투자·면적·능력은 회사 발표다. 참치 처리능력으로 바꾸지 않는다.
 * 금칙 정본: ~/tunawork/aps/build/killed.py (4개, company-report-prose.test.ts에 전량 등록).
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`aps stats.${key} 가 숫자가 아니다`);
  return v;
}

function s(key: string): string {
  const v = data.stats[key];
  if (typeof v !== 'string') throw new Error(`aps stats.${key} 가 문자열이 아니다`);
  return v;
}

export const apsMeta = data._meta;
export const apsCard = data.card;
export const apsStats = data.stats;
export const apsSourceNotes = data.sourcenotes;

/** 회사 연혁의 참치 가공 개시와 El Roble 공장 개장. 설립등기 확인값이 아니다. */
export function company() {
  return { 참치가공개시: s('참치가공개시'), ElRoble개장: n('ElRoble개장') };
}

/** 회사 목표와 PET 공장 발표 수치. 새 공장 설계 예산·참치 처리능력이 아니다. */
export function expansion() {
  return {
    성장목표: n('매출성장목표_pct'), PET투자백만달러: n('PET투자_백만USD'),
    PET면적: n('PET발표면적_m2'), PET캔일: n('PET발표능력_캔일'),
  };
}
