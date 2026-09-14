import raw from '@/public/data/companies/tog_v1.json';

/**
 * TOG(Thunnus Overseas Group) 기업 해부 인테이크 (참치 기업 해부 ⅩⅬⅠ, 2026-09).
 *
 * 아비장 캔공장 SCODI 의 프랑스 지주 TOG. 선망선이 없던 캔 지주를 2026-07-10 결정문에서
 * 선망 회사 CFTO 의 단독사원 PP THON 이 단독사원으로 가졌다. 2021-06-30 에는 PP THON 과
 * 창업자의 TOG 주식 수가 28,870,966주로 같았다.
 *
 * ⚠ **「TOG 가 SCODI 지분 X %」 금지** — 지분율은 소집공고·명부 어디에도 없다. 2019년 SCODI
 *    증자 의안이 신주인수권을 TOG 에 배정했을 뿐이고 결의 결과도 아니다.
 * ⚠ **「PFCI 가동 중」 금지** — 2016-11-25 단독주주가 조기 해산을 결의했고 110 PP 는
 *    2020년 9월 기준 목록부터 없다. 업계지가 2026년에도 공장 이름으로 세는 것은 업계지 서술이다.
 * ⚠ **「지금 돌아가는 공장 하나」 금지** — 옛 PFCI 설비의 행방은 어느 공고에도 없고,
 *    SCODI 의 현재 능력·실적·인원도 공개 자료에 없다. 가동 공장 수를 세지 않는다.
 * ⚠ **「SCODI 연 6만 t」을 현재 값으로 금지** — 2004년 명판, 2005년 3월 폐쇄 전 공장의 값이다.
 * ⚠ **「110 PP 2019년 삭제」 금지** — 2019-09-21 에 게시돼 있던 2016-11-20 발효판에 110 PP 가
 *    있다. 번호가 없는 것은 **2020년 9월 기준 목록부터**다.
 * ⚠ **「PP 그룹이 50 % 를 샀다」 금지** — 반반은 사모펀드 지분 매수 1,300만 € · 창업자와 SMS 만
 *    떠안은 감자 · PP THON 신주 670만 주가 겹친 결과이고, 결의록 본문에 「50 %」는 없다.
 * ⚠ Airone Côte d'Ivoire(120 PP)는 TOG 계열이 아니다 — 이탈리아 Airone S.r.l. 의 자회사다.
 * ⚠ 2026년 창업자 지분의 대금은 결정문·정관·등기공고에 없다. 값을 붙이지 않는다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

/** 숫자 칸만 골라 쓴다 — SIREN·RCCM·날짜는 문자열이다. */
function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`tog stats.${key} 가 숫자가 아니다`);
  return v;
}

export const togMeta = data._meta;
export const togCard = data.card;
export const togStats = data.stats;
export const togSourceNotes = data.sourcenotes;

/**
 * 2021-06-30 의 반반 — 네 단계가 겹쳐 두 줄의 주식 수가 같아진다.
 *
 * ⚠ 「50 % 를 샀다」로 옮기지 않는다. 결의록에 퍼센트가 없고 주식 수가 같을 뿐이다.
 */
export function halfHalf(): {
  PP_THON_주식: number; 창업자_주식: number; 자본_EUR: number;
  ECP_매수_EUR: number; 신주: number; 감자_EUR: number; 감자_창업자: number; 감자_SMS: number;
  단독사원_결정일: string;
  단서: string;
} {
  return {
    PP_THON_주식: n('TOG_주식_PP_THON_2021'),
    창업자_주식: n('TOG_주식_창업자_2021'),
    자본_EUR: n('TOG_자본_EUR'),
    ECP_매수_EUR: n('ECP_잔여지분_매수_EUR'),
    신주: n('PP_THON_신주'),
    감자_EUR: n('감자_EUR'),
    감자_창업자: n('감자_창업자_주식'),
    감자_SMS: n('감자_SMS_주식'),
    단독사원_결정일: String(data.stats.단독사원_결정일),
    단서: '2026년 창업자 쪽 절반의 값은 결정문·정관·등기공고에 없다',
  };
}

/**
 * 코트디부아르 세관의 캔참치(HS 160414) 대세계 수출 신고 대 프랑스 세관의 코트디부아르산 수입 신고.
 *
 * ⚠ 나라 단위 통계다. 공장별 몫으로 쪼개지 않는다(코트디부아르에는 Airone 도 있었다).
 */
export function customsGap(): {
  수출신고_kg: { 연도: number; kg: number }[];
  수출신고_3년합_kg: number;
  프랑스수입_kg: { 연도: number; kg: number }[];
  단서: string;
} {
  return {
    수출신고_kg: [2021, 2022, 2023].map((y) => ({ 연도: y, kg: n(`CI세관_캔참치수출_${y}_kg`) })),
    수출신고_3년합_kg: n('CI세관_캔참치수출_3년합_kg'),
    프랑스수입_kg: [2021, 2022, 2023, 2024].map((y) => ({ 연도: y, kg: n(`프랑스_CI산_수입_${y}_kg`) })),
    단서: '코트디부아르산 캔참치의 수출 물량은 수입국 신고로만 잡힌다',
  };
}
