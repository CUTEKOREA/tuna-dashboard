import raw from '@/public/data/companies/atunsa_v1.json';

/**
 * Atunsa 기업 해부 인테이크 (ⅬⅩⅤ, 2026-10).
 * 수치는 보고서 표지에서 생성한 정본만 읽는다. 선단은 인수 전 소속 기준이며 보급선은 제외한다.
 * 금칙 정본: ~/tunawork/atunsa/build/killed.py (17개, company-report-prose.test.ts에 전량 등록).
 * 거래는 주식 양도다. 매매 체결일은 Faro de Vigo 보도(B)이며 지분율·대가는 공개되지 않았다.
 * 두 회사 재무 합산, 감면을 인수 대가로 단정, 육상 승인 미등재를 전 세계 시설 부재로 확대하지 않는다.
 */
const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`atunsa stats.${key} 가 숫자가 아니다`);
  return v;
}

function s(key: string): string {
  const v = data.stats[key];
  if (typeof v !== 'string') throw new Error(`atunsa stats.${key} 가 문자열이 아니다`);
  return v;
}

export const atunsaMeta = data._meta;
export const atunsaCard = data.card;
export const atunsaStats = data.stats;
export const atunsaSourceNotes = data.sourcenotes;

/** 설립·이사회·매매 공증 보도일. 날짜는 문자열로 보존한다. */
export function company() {
  return { 설립: n('설립'), 이사회: n('이사회'), 매매일: s('매매일') };
}

/** 인수 전 소속 기준 선망선 12척. 총톤수(GT)는 어창 용량이나 어획량이 아니다. */
export function fleet() {
  return {
    선망척: n('선망척'), 선망GT: n('선망GT'),
    Atunsa척: n('Atunsa척'), AtunsaGT: n('AtunsaGT'),
    Pevasa척: n('Pevasa척'), PevasaGT: n('PevasaGT'),
    인도양: n('인도양'), 대서양: n('대서양'),
  };
}

/** 스페인 EU 승인 사업장 목록의 두 회사 명의 시설 등재 여부. */
export function land() {
  return {
    육상시설: n('육상시설'), 승인섹션: n('승인섹션'),
    승인행: n('승인행'), 열람일: s('열람일'),
  };
}
