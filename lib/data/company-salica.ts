import raw from '@/public/data/companies/salica_v1.json';

/**
 * Salica 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅩⅥ, 2026-09).
 *
 * Albacora 그룹의 가공부문 세 법인. 가장 작은 공장이 가장 두껍게 적힌다.
 *
 * ⚠ **「가동률 12.2%」 금지.** 48,015 t은 완제품 상한이고 5,838 t은 캔·세척제를 포함한
 *    「원료 및 부자재」 총투입이다. 분자와 분모의 줄자가 달라 나눗셈이 가동률이 아니다.
 * ⚠ **「포소르하는 관청 문서가 0건」 금지.** 에콰도르 생산부 명부에 PP-670으로 있고
 *    국제항만보안 시설 등록 ECPSJ-0001도 있다. 열리지 않은 것은 이 회선이다.
 * ⚠ **「사람의 92%」를 분모 없이 쓰지 마라.** 세 공장 인원 2,564명 기준이고
 *    그룹 전체 3,770명으로 놓으면 62.5%다.
 * ⚠ **「매출의 74.1%」를 기준 없이 쓰지 마라.** 세 법인 총액 단순합이고 내부거래가
 *    지워지지 않았다 — 같은 보고서 본문은 세 공장 매출을 250 M€ 언저리로 적는다.
 * ⚠ **「내부거래 32%」에 연도를 안 붙이는 것 금지.** 2019년 값이고 이후 기탁분은 확인되지 않는다.
 * ⚠ **「선망선 18척」 금지.** 그룹 보고서는 23척(용선 4척 포함)이다.
 * ⚠ **「통합을 발표한 해에 상표를 놓았다」 금지.** 놓은 것이 먼저다 — 2025-05-25 만료·
 *    2025-11-25 유예 종료 대 2026-04 통합 로고 발표.
 * ⚠ **「전부 최고 등급」만 적는 것 금지.** ALTO는 등급 기재 450건의 40.2%로 최빈 등급이다.
 * ⚠ **「갈리시아가 베르메오보다 더럽다」 금지.** 감시체계가 다르다(주 검사 대 자기 신고).
 * ⚠ **「SAC는 S.L.」 금지.** Salica Alimentos Congelados는 **S.A.**다.
 * ⚠ **「베르메오가 가장 작은 공장」에 줄자 없이 금지.** 사람 기준이다 — 부지는 아 포브라가 작다.
 * ⚠ **「Campos가 스페인 매대 상위 브랜드」 금지.** 마드리드 권역 실사 상위 셋에 없고,
 *    인증 판매 순위는 시장의 1.4~3%만 자른 것이다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number | string>;
  sourcenotes: string[];
};

/** 숫자 칸만 골라 쓴다 — `포소르하_생산부코드`·`상표_EU_만료일`은 문자열이다. */
function n(key: string): number {
  const v = data.stats[key];
  if (typeof v !== 'number') throw new Error(`salica stats.${key} 가 숫자가 아니다`);
  return v;
}

export const salicaMeta = data._meta;
export const salicaCard = data.card;
export const salicaStats = data.stats;
export const salicaSourceNotes = data.sourcenotes;

/**
 * 세 공장 인원 가운데 에콰도르 몫(%).
 *
 * **분모는 세 법인 2,564명이다.** 그룹 전체 3,770명으로 놓으면 62.5%이므로
 * 이 값을 「그룹의 92%」로 옮겨 적지 않는다.
 */
export function ecuadorHeadcountShare(): number {
  const ec = n('인원_포소르하_2025');
  const total = n('인원_베르메오_2025') + n('인원_아포브라_2025') + ec;
  return Number(((ec / total) * 100).toFixed(1));
}

/**
 * 베르메오 허가 능력 대 2022년 총투입.
 *
 * ⚠ **이 비율은 가동률이 아니다.** 48,015 t/년은 완제품 상한이고 5,838 t은
 * 캔·세척제를 포함한 「원료 및 부자재」 총투입이다. 단서를 함께 들고 다니라고
 * 값이 아니라 객체로 돌려준다.
 */
export function permitVsInput(): { 허가: number; 투입2022: number; 비율: number; 단서: string } {
  const 허가 = n('베르메오_허가능력_t');
  const 투입2022 = n('베르메오_투입_2022_t');
  return {
    허가,
    투입2022,
    비율: Number(((투입2022 / 허가) * 100).toFixed(1)),
    단서: '완제품 상한 대 캔·세척제 포함 총투입 — 가동률이 아니다',
  };
}
