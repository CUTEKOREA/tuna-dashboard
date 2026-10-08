import raw from '@/public/data/companies/nauterra_v1.json';

/**
 * Nauterra 기업 해부 인테이크 (신라교역 사내 조사보고서, 2026-09).
 *
 * 등기 상호는 Luis Calvo Sanz, S.A.(CIF A15017205)다. 「Nauterra」는 2023년에 얹은
 * 기업 브랜드이고 상업등기부에 그 이름의 법인은 없다. 이 회사를 명부로 되짚으면
 * 층마다 다른 법인이 나온다.
 *
 * ⚠ **판매량 115.822 t 을 생산량으로 쓰지 마라.** 회사 원문이 «conservas y aceite de oliva»
 *   라 적는다 — 올리브유가 섞인 판매량이다. 회사는 생산량을 「10만 t 이상」으로 따로 적으므로
 *   캐파 166.000 t 로 나눈 가동률은 분자와 분모가 다른 것을 재게 된다.
 * ⚠ **보조금 819.140,62 € 를 「거의 안 받는다」로 읽지 마라.** 811.793,07 € 가 선단 법인
 *   한 곳이고 그중 97,4% 가 어업용 경유·에너지비용 보전이다. 경쟁사가 받은 공장 전환투자와
 *   돈이 붙은 자리가 다르다. 정작 공장을 돌리는 법인은 0건이다.
 * ⚠ **인당 매출 분모를 섞지 마라.** 거점 인력 합 4.370명(회사 웹)·기말 5.454명(실적 발표)·
 *   평균인원 5.563명(등기 계정)은 세는 기준이 다르다. 매출과 같은 문단의 수를 쓴다.
 * ⚠ **갈리시아 3강 매출을 같은 자로 잰 값으로 쓰지 마라.** 셋의 연결 범위가 서로 다르다.
 * ⚠ **6:4 를 AGCM 이 적었다고 쓰지 마라.** 결정문은 이사회 인원을 [omissis] 로 가렸다.
 *   숫자의 근거는 회사 지배구조 페이지·2012년 현지 보도·상업등기 공고다.
 */

export interface NauterraFinancial {
  연도: number;
  매출: number;
  순이익: number | null;
}

export interface NauterraEntity {
  법인: string;
  nif: string;
  역할: string;
  보조금: number;
}

export interface NauterraVessel {
  선명: string;
  imo: string;
  기국: string;
  유형: string;
}

const data = raw as unknown as {
  _meta: {
    회사: string; 국가: string; 업종: string; 출처: string;
    출처한계: string; 측정경계: string; 갱신방법: string;
  };
  card: {
    numeral: string; name: string; country: string; tagline: string;
    stats: { label: string; value: string }[];
  };
  financials: NauterraFinancial[];
  galicia: { 연도: number; jealsa: number; frinsa: number | null; nauterra: number }[];
  entities: NauterraEntity[];
  fleet: NauterraVessel[];
  plants: { 거점: string; 인력: number; 캐파: number | null }[];
  subsidy: { 회사: string; 금액: number; 성격: string }[];
  registries: { 명부: string; 결과: string; 대조군: string }[];
  stats: Record<string, number>;
};

export const nauterraMeta = data._meta;
export const nauterraCard = data.card;
export const nauterraFinancials = data.financials;
export const nauterraGalicia = data.galicia;
export const nauterraEntities = data.entities;
export const nauterraFleet = data.fleet;
export const nauterraPlants = data.plants;
export const nauterraSubsidy = data.subsidy;
export const nauterraRegistries = data.registries;
export const nauterraStats = data.stats;

/**
 * 선단 여덟 척 가운데 스페인 국적선이 아닌 비율.
 * 나머지는 전부 엘살바도르 기이고 등록 소유자는 현지 특수법인이다.
 */
export function nonSpanishFlagShare(): number {
  const { 선단: total, 선단_엘살바도르기: es } = data.stats;
  return Math.round((es / total) * 100);
}

/**
 * 그룹 보조금 가운데 선단 법인 한 곳이 차지하는 몫.
 * **액수보다 이 비율이 요지다** — 돈이 공장이 아니라 배에 붙었다.
 */
export function fleetEntitySubsidyShare(): number {
  const { 보조금_선단법인: fleet, 보조금_그룹: group } = data.stats;
  return Math.round((fleet / group) * 100);
}

/**
 * 경쟁사 대비 배수. 갈리시아 두 곳이 같은 시스템에서 받은 금액과의 비다.
 * 분모가 이 그룹이므로 값이 1보다 크다.
 */
export function subsidyGapVs(company: 'Jealsa' | 'Frinsa'): number {
  const rival = data.subsidy.find((s) => s.회사 === company);
  if (!rival) return 0;
  return Number((rival.금액 / data.stats.보조금_그룹).toFixed(1));
}

/** 2023년 순이익 감소분 가운데 이자 증가가 설명하는 몫. 나머지 절반 이상은 설명되지 않는다. */
export function interestExplainedShare(): number {
  return data.stats.이자설명분_pct;
}

/** 가공 캐파에서 브라질이 차지하는 몫. 본사가 있는 나라보다 크다. */
export function brazilCapacityShare(): number {
  const { 캐파_브라질: br, 캐파_합계: all } = data.stats;
  return Math.round((br / all) * 100);
}

/** 자료 출처와 한계. 조사 아카이브 메타를 그대로 옮긴다. */
export const nauterraSourceNotes: string[] = [
  data._meta.출처,
  data._meta.출처한계,
  data._meta.측정경계,
];
