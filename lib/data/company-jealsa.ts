import raw from '@/public/data/companies/jealsa_v1.json';

/**
 * Jealsa 기업 해부 인테이크 (신라교역 사내 조사보고서, 2026-09).
 *
 * 스페인 통조림 그룹 1위인데, 통조림 회사로만 읽으면 네 군데에서 틀린다.
 *
 * ⚠ **이익률을 통조림 업황 지표로 쓰지 마라.** 2022년 연결이익 약 5,000만 € 는 풍력단지 지분
 *   매각에서 나왔고, 같은 해에 화재 보험금 약 94 M€ 도 들어왔다. 비영업 요인이 둘이다.
 * ⚠ **개별법인과 그룹 연결을 접합하지 마라.** Jealsa Foods 553.4 + Escurís 526.9 = 1,080.3 M€ 는
 *   내부거래 상계 전 수치이고 연결은 781 M€ 다. 매체가 연결 수치를 「Jealsa Foods」 명의로
 *   적는 관행이 있어 특히 위험하다.
 * ⚠ **자사 MSC 어장 인증은 현재 없다.** MSC-F-30011 은 2022-11-22 철회됐고 현행 커버리지는
 *   AGAC 집단 인증이다. 같은 인증서에 Albacora·Bolton 선박이 함께 있다.
 * ⚠ **Albacora 지분율은 어디에도 없다.** 확인된 것은 ALONSO ESCURIS, S.L. 의 부회장석(등록부)과
 *   통신사 1건의 주주 언급뿐이다. GLEIF 신고로 「지배지분은 아니다」까지만 말할 수 있다.
 */

export interface JealsaFinancial {
  연도: number;
  매출: number;
  영업이익: number | null;
  순이익: number | null;
}

export interface JealsaFleetRow {
  선명: string;
  imo: string;
  구선명: string | null;
  구기국: string | null;
  상태: string;
  소유: string;
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
  financials: JealsaFinancial[];
  galicia: { 연도: number; jealsa: number; nauterra: number; frinsa: number | null }[];
  entities: { 순위: number; 법인: string; 그룹: string; 매출: number }[];
  fleet: JealsaFleetRow[];
  sourcing: { 구분: string; 비중: number }[];
  headcount: { 연도: number; 상시: number | null; 연간총창출: number }[];
  albacora: { 층위: string; '확인된 것': string; 등급: string }[];
  stats: Record<string, number>;
};

export const jealsaMeta = data._meta;
export const jealsaCard = data.card;
export const jealsaFinancials = data.financials;
export const jealsaGalicia = data.galicia;
export const jealsaEntities = data.entities;
export const jealsaFleet = data.fleet;
export const jealsaSourcing = data.sourcing;
export const jealsaHeadcount = data.headcount;
export const jealsaAlbacora = data.albacora;
export const jealsaStats = data.stats;

/** 단일 고객 의존도. 분모는 그해 **연결** 매출이다. */
export function mercadonaShare(): number {
  return Math.round((data.stats.mercadona_매출 / data.stats.연결매출_2025) * 100);
}

/**
 * 개별법인 두 곳의 합. **연결과 나란히 놓지 마라** — 내부거래 상계 전 수치라
 * 연결(781 M€)을 넘는다. 그 차이가 이 회사를 읽는 요지다.
 */
export function entitySumPreElimination(): number {
  return Number(
    data.entities
      .filter((e) => e.그룹 === 'Jealsa')
      .reduce((a, e) => a + e.매출, 0)
      .toFixed(1),
  );
}

/** 2022년 정점 대비 상시 인력 증감률. 음수다. */
export function headcountChangeFromPeak(): number {
  const { 상시인력_2022: peak, 상시인력_2024: now } = data.stats;
  return Math.round(((now - peak) / peak) * 100);
}

/** 자료 출처와 한계. 조사 아카이브 메타를 그대로 옮긴다. */
export const jealsaSourceNotes: string[] = [
  data._meta.출처,
  data._meta.출처한계,
  data._meta.측정경계,
];
