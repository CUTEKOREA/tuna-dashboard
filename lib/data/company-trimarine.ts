import raw from '@/public/data/companies/trimarine_v1.json';

/**
 * Tri Marine 기업 해부 인테이크 (신라교역 사내 조사보고서 ⅩⅩⅠ, 2026-09).
 *
 * 스무 편이 잡는 회사·만드는 회사·쥔 회사를 덮는 동안 **거래상이 비어 있었다.**
 * 열 편이 각주로 스치고 아무도 해부하지 않은 회사다.
 *
 * ⚠ **「2013년에 인수했다」로 쓰지 마라.** 그해 취득은 거부권을 통한 공동지배이고 단독 지배는 2019년이다.
 * ⚠ **「연결에서 뺐다」로 쓰지 마라.** 회계로는 연결돼 있다. 빠진 것은 KPI 분모(Net FMCG Sales)다.
 * ⚠ **「선망 7척」으로 쓰지 마라.** 등록부 현재 등재는 6척이고 SOLOMON DIAMOND 는 세 등록부에 없다.
 * ⚠ **「이탈리아에 이 회사 공장이 있다」로 쓰지 마라.** 체르메나테는 Bolton Food S.p.A. 자산이다.
 * ⚠ **「선단을 줄였다」로 쓰지 마라.** 507→323 은 매입 대상 선박 수이고 세는 범위가 좁아진 결과다.
 * ⚠ **「담합 무죄」로 쓰지 마라.** 판결이 아니라 원고 자진취하다.
 * ⚠ **「지금도 경쟁사에 판다」로 쓰지 마라.** 공개 확인되는 가장 늦은 선적이 2022년 6월이다.
 * ⚠ **「2025년에 칸이 사라졌다」로 쓰지 마라.** FY2023 판이다.
 * ⚠ **사모아 공장 배출 위반을 이 회사 몫으로 옮기지 마라.** 허가 명의인은 StarKist Samoa Co. 다.
 * ⚠ **「배가 한 척도 없다」를 무제한으로 쓰지 마라.** 태평양 세 등록부 한정이다.
 */

const data = raw as unknown as {
  _meta: { 회사: string; 국가: string; 업종: string; 종목: string; 출처: string; 조사일: string };
  card: { numeral: string; tagline: string };
  stats: Record<string, number>;
  sourcenotes: string[];
};

export const trimarineMeta = data._meta;
export const trimarineCard = data.card;
export const trimarineStats = data.stats;
export const trimarineSourceNotes = data.sourcenotes;

/**
 * 매입 대상 선박이 2020년에서 2022년 사이 몇 % 줄었나.
 *
 * ⚠ 소유선이 아니다. 그리고 2022년판이 간접 매입을 세는 범위에서 뺐다 —
 * 배가 준 것이 아니라 자가 바뀐 것이다.
 */
export function purchaseVesselDropPct(): number {
  const { 매입선박_2020: a, 매입선박_2022: b } = data.stats;
  return Number((((a - b) / a) * 100).toFixed(1));
}

/** 솔로몬제도 인원이 두 기준일 사이에 몇 % 줄었나. */
export function solomonHeadcountDropPct(): number {
  const { 솔로몬_인원_2024: a, 솔로몬_인원_2025: b } = data.stats;
  return Number((((a - b) / a) * 100).toFixed(1));
}

/**
 * 콜롬비아 법인의 미국행 선적 가운데 경쟁 브랜드로 간 건수 몫.
 *
 * 분모는 **그 법인 명의 24건 전체**다. 표에 실린 19건이 아니다.
 */
export function competitorShipmentSharePct(): number {
  const { 세관_GRALCO_경쟁사행_건수: n, 세관_GRALCO_총건수: d } = data.stats;
  return Number(((n / d) * 100).toFixed(1));
}
