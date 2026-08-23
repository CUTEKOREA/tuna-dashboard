/**
 * 「시장 이해」 3품목(고등어·골뱅이·새우) 데이터 인테이크 (ADR 0005)
 *
 * 참치·오징어는 자료 분량이 커서 품목마다 인테이크를 따로 뒀다. 나머지 셋은
 * 집계 하나씩이라 한 파일에 모은다 — 파일을 나누는 것이 목적이 아니라
 * `app/`·`components/` 가 JSON 을 직접 보지 않게 하는 것이 목적이다.
 *
 * ⚠ 품목마다 축이 다르다. 이것이 이 페이지 묶음의 핵심이다.
 *   · 고등어 — 크기 등급. 어법은 축이 아니다(대형선망 하나뿐)
 *   · 골뱅이 — 종 구분. 한 이름에 네 개 과(科)가 섞여 있다
 *   · 새우 — 양식 대 자연산. 양식이 이긴 유일한 주요 수산 품목이다
 *
 * 셋 다 정적 산출물이다. 런타임 fetch 가 없으므로 텔레메트리는 STATIC 으로만 표기한다(L-09).
 */
import rawMackerel from '../../public/data/mackerel_industry_v1.json';
import rawShrimp from '../../public/data/shrimp_industry_v1.json';
import rawWhelk from '../../public/data/whelk_industry_v1.json';
import rawPollock from '../../public/data/pollock_industry_v1.json';
import rawTunaAnatomy from '../../public/data/tuna_anatomy_v1.json';

interface Sectioned<T> {
  _meta: Record<string, unknown>;
  rows: T[];
}

// ─── 고등어 ────────────────────────────────────────────────────────────────

/** 위판 등급 한 줄. 상·중·하 단가가 2.4배 벌어진다. */
export interface MackerelGradeRow {
  등급: string;
  물량: number;
  비중: number;
  가중평균단가: number;
  건수: number;
}

export interface MackerelOriginRow {
  원산지: string;
  수입액: number;
  수입량: number;
  비중: number;
  단가: number;
}

export interface MackerelAreaRow {
  해역: string;
  어획량: number;
  비중: number;
}

/** 종별 어획 시계열 한 점. 연도 + 종 한글명별 어획량. */
export type MackerelTimelinePoint = Record<string, string | number>;

export interface MackerelData {
  _meta: Record<string, unknown>;
  한국어획: {
    _meta: Record<string, unknown>;
    시계열: MackerelTimelinePoint[];
    해역: MackerelAreaRow[];
  };
  위판등급: Sectioned<MackerelGradeRow>;
  수입원산지: Sectioned<MackerelOriginRow>;
}

// ─── 골뱅이 ────────────────────────────────────────────────────────────────

/** 과(科)별 생산. 이 다섯을 더해 「세계 골뱅이」라 부르면 안 된다. */
export interface WhelkGroupRow {
  그룹: string;
  과: string;
  학명: string;
  생산량: number;
  어획: number;
  양식: number;
  비중: number;
}

export interface WhelkCountryRow {
  국가: string;
  어획량?: number;
  양식량?: number;
}

export interface WhelkImportRow {
  국가: string;
  통관코드: string;
  수입액: number;
  수입량: number;
  단가: number;
}

export interface WhelkSeriesPoint {
  연도: string;
  생산량: number;
}

export interface WhelkData {
  _meta: Record<string, unknown>;
  요약: {
    기준연도: number;
    세계생산합계: number;
    최대그룹: string;
    최대그룹비중: number;
    참골뱅이비중: number;
    양식비중: number;
    한국참골뱅이어획: number;
  };
  종구성: WhelkGroupRow[];
  참골뱅이상위국: WhelkCountryRow[];
  피뿔고둥양식상위국: WhelkCountryRow[];
  한국수입: Sectioned<WhelkImportRow>;
  한국생산: {
    _meta: Record<string, unknown>;
    /** 130303 골뱅이(1990~2009)와 130311 고둥류(2010~2025)는 다른 코드다. */
    계열: Record<string, WhelkSeriesPoint[]>;
  };
}

// ─── 새우 ──────────────────────────────────────────────────────────────────

/** 양식이 자연산을 넘어선 궤적. 1950년 0.3% → 2024년 74.4%. */
export interface ShrimpTrendPoint {
  연도: string;
  자연산: number;
  양식: number;
  양식비중: number;
}

export interface ShrimpSpeciesRow {
  종: string;
  생산량: number;
  비중: number;
}

/** 「양식」 한 낱말이 감추는 것. 기수 양식장과 논·강이 같은 칸에 들어 있다. */
export interface ShrimpEnvRow {
  환경: string;
  생산량: number;
  비중: number;
}

export interface ShrimpCountryRow {
  국가: string;
  자연산: number;
  양식: number;
  합계: number;
  양식비중: number;
}

export interface ShrimpData {
  _meta: Record<string, unknown>;
  요약: {
    기준연도: number;
    세계생산: number;
    양식: number;
    자연산: number;
    양식비중: number;
    최대종: string;
    최대종비중: number;
    담수양식: number;
    담수양식비중: number;
    한국생산: number | null;
    한국양식비중: number | null;
    한국순위: number | null;
  };
  양식자연산추이: ShrimpTrendPoint[];
  양식환경: ShrimpEnvRow[];
  종구성: ShrimpSpeciesRow[];
  국가별: ShrimpCountryRow[];
  한국종구성: ShrimpSpeciesRow[];
}

const MACKEREL = rawMackerel as unknown as MackerelData;
const WHELK = rawWhelk as unknown as WhelkData;
const SHRIMP = rawShrimp as unknown as ShrimpData;

/** 고등어 — 크기 등급이 축이다. */
export function getMackerelIndustryData(): MackerelData {
  return MACKEREL;
}

/** 골뱅이 — 종 구분이 축이다. 그룹 합계를 「세계 골뱅이」로 부르지 않는다. */
export function getWhelkIndustryData(): WhelkData {
  return WHELK;
}

/** 새우 — 양식 대 자연산이 축이다. */
export function getShrimpIndustryData(): ShrimpData {
  return SHRIMP;
}

// ─── 명태 ──────────────────────────────────────────────────────────────────
// 축은 「잡지 않고 먹는 생선」 — 원양 할당 한 장과 수입 제품 구성이다.

export type PollockWorldPoint = Record<string, string | number>;

export interface PollockWorldCountryRow {
  국가: string;
  어획량: number;
  비중: number;
}

export interface PollockQuotaRow {
  연도: number;
  할당: number;
  어획: number;
  입어료: number;
  비고?: string;
}

/** 전용 세번 연도별 — 2026 은 1~7월 누계라 연도 칸이 문자열이다 */
export type PollockImportRow = Record<string, string | number>;

export interface PollockOriginRow {
  원산지: string;
  수입액: number;
  수입량: number;
  비중: number;
  단가: number;
}

export type PollockProcessingRow = Record<string, string | number>;

export interface PollockStockRow {
  월: string;
  재고: number;
  수입: number | null;
  소비: number | null;
}

export interface PollockData {
  _meta: Record<string, unknown>;
  세계어획: { _meta: Record<string, unknown>; 시계열: PollockWorldPoint[]; 국가: PollockWorldCountryRow[] };
  원양할당: Sectioned<PollockQuotaRow>;
  수입세번: Sectioned<PollockImportRow>;
  수입원산지: Sectioned<PollockOriginRow>;
  가공품목: Sectioned<PollockProcessingRow>;
  재고: Sectioned<PollockStockRow>;
}

export function getPollockIndustryData(): PollockData {
  return rawPollock as unknown as PollockData;
}

// ─── 참치 해부 ─────────────────────────────────────────────────────────────
//
// 축은 **잡아서 남에게 파는 생선**이다. 원양 선단·환적·수출 척추·판매 상대·국내 캔·수입·값·재무.
// 정적 산출물이므로 텔레메트리는 STATIC 으로만 표기한다(L-09).

/** 연도별 한 점. 한글 키 + 숫자 값. */
export type TunaAnatomyPoint = Record<string, string | number | null>;

export interface TunaAnatomyCountryRow {
  국가: string;
  어획량: number;
  비중: number;
}

export interface TunaAnatomyCompanyRow {
  회사: string;
  선망2024: number;
  연승2024: number;
  선망2025: number;
  연승2025: number;
}

export interface TunaAnatomyFleetRow {
  회사: string;
  척수: number;
  선망: number;
  연승: number;
  총톤수: number;
  평균선령: number;
  '20년초과': number;
}

export interface TunaAnatomyPartnerBlock {
  연도: number;
  rows: { 국가: string; 톤: number; 비중: string | null; 단가: number | null }[];
  대만: number;
}

export interface TunaAnatomyFinanceRow {
  회사: string;
  매출2024: number;
  영업이익2024: number;
  영업이익률2024: string;
  매출2023: number;
  영업이익2023: number;
  매출2025H1: number;
  영업이익2025H1: number;
  기준: string;
}

export interface TunaAnatomyFcfRow {
  연도: number;
  FCF: number;
  연결매출: number;
  비중: string;
}

export interface TunaAnatomyData {
  _meta: Record<string, unknown>;
  세계어획: { _meta: Record<string, unknown>; 시계열: TunaAnatomyPoint[]; 국가: TunaAnatomyCountryRow[]; 한국어종2024: Record<string, number | null>; 한국해역2024: Record<string, number> };
  한국생산: { _meta: Record<string, unknown>; 연도별: TunaAnatomyPoint[]; 월별: TunaAnatomyPoint[] };
  선사: Sectioned<TunaAnatomyCompanyRow>;
  선단: { _meta: Record<string, unknown>; rows: TunaAnatomyFleetRow[]; 선령분포: TunaAnatomyPoint[] };
  교역: { _meta: Record<string, unknown>; 연도별: TunaAnatomyPoint[]; 원어수출상대: TunaAnatomyPartnerBlock[]; 캔세번분해: TunaAnatomyPoint[]; 필레수입2025: TunaAnatomyPoint[] };
  캔: { _meta: Record<string, unknown>; 연도별: TunaAnatomyPoint[]; 공장별: TunaAnatomyPoint[] };
  가격: { _meta: Record<string, unknown>; 방콕: TunaAnatomyPoint[]; 원화단가: TunaAnatomyPoint[] };
  재무: { _meta: Record<string, unknown>; rows: TunaAnatomyFinanceRow[]; FCF: TunaAnatomyFcfRow[] };
  환적: { _meta: Record<string, unknown>; PNA월별: TunaAnatomyPoint[] };
}

export function getTunaAnatomyData(): TunaAnatomyData {
  return rawTunaAnatomy as unknown as TunaAnatomyData;
}
