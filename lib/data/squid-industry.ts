/**
 * 「시장 이해 > 오징어」 데이터 인테이크 (ADR 0005)
 *
 * 위젯·컴포넌트가 JSON 을 보는 유일한 통로. `app/`·`components/` 에서 JSON 을 직접
 * import 하면 아키텍처 가드가 막는다.
 *
 * 세 파일을 읽는다:
 *  - `squid_industry_v1.json`         — FAO FishStat 2026.1.0 어획 집계 (scripts/build_squid_industry_data.py)
 *  - `squid_trade_v1.json`            — 관세청 통관 집계 (scripts/build_squid_trade_data.py)
 *  - `squid_industry_widgets_v1.json` — 기존 39위젯 중 선별·재배치 (scripts/curate_squid_industry_widgets.py)
 *
 * 셋 다 정적 산출물이다. 런타임 fetch 가 없으므로 텔레메트리는 STATIC/SYNCED 로만 표기한다(L-09).
 *
 * ⚠ 바스켓 주의 — 어획 집계와 통관 집계는 범위가 다르다.
 *   어획은 FAO ISSCAAP 오징어·갑오징어 계열(문어 제외), 통관은 HS 0307.4x + 1605.54 다.
 *   0307.4x 는 갑오징어와 오징어가 한 소호에 있어 통관에서 둘을 가를 수 없다.
 *   두 수치를 직접 빼거나 나누지 마라.
 */
import rawCatch from '../../public/data/squid_industry_v1.json';
import rawOceanFleet from '../../public/data/squid_ocean_fleet_v1.json';
import rawTrade from '../../public/data/squid_trade_v1.json';
import rawFleet from '../../public/data/squid_fleet_v1.json';
import rawWidgets from '../../public/data/squid_industry_widgets_v1.json';

// ─── 어획 집계 ──────────────────────────────────────────────────────────────

export interface BasketRow {
  구분: string;
  어획량: number;
  비중: number;
}

export interface SquidSpeciesShare {
  어종: string;
  어획량: number;
  비중: number;
  구분: string;
}

export interface SquidCountryRank {
  국가: string;
  어획량: number;
  비중: number;
}

export interface SquidAreaRank {
  해역: string;
  어획량: number;
  비중: number;
}

/** 살오징어 붕괴 시계열 한 점. */
export interface CollapsePoint {
  연도: string;
  세계: number;
  한국: number;
}

export interface SquidKoreaTrendPoint {
  연도: string;
  어획량: number;
  세계점유율: number;
}

export interface SquidKoreaSpeciesRow {
  어종: string;
  어획량: number;
  비중: number;
}

/** 어종별 시계열 한 점. 연도 + 어종 한글명별 어획량. */
export type SquidTimelinePoint = Record<string, string | number>;

export interface SquidCatchSummary {
  기준연도: number;
  세계어획량: number;
  최대어종: string;
  최대어종비중: number;
  최대국: string;
  최대국비중: number;
  최대해역: string;
  최대해역비중: number;
  한국어획량: number;
  한국순위: number | null;
  한국비중: number;
  살오징어세계정점연도: number;
  살오징어세계정점: number;
  살오징어세계최신: number;
  살오징어한국정점연도: number;
  살오징어한국정점: number;
  살오징어한국최신: number;
  양식누적: number;
  양식최종연도: number | null;
}

export interface SquidCatchData {
  _meta: {
    생성일: string;
    출처: string;
    원본: string;
    단위: string;
    기준연도: number;
    바스켓: string;
    주의: string;
    갱신방법: string;
  };
  요약: SquidCatchSummary;
  바스켓구성: BasketRow[];
  어종구성: SquidSpeciesShare[];
  어종시계열: SquidTimelinePoint[];
  살오징어붕괴: CollapsePoint[];
  국가순위: SquidCountryRank[];
  해역순위: SquidAreaRank[];
  한국시계열: SquidKoreaTrendPoint[];
  한국어종구성: SquidKoreaSpeciesRow[];
}

// ─── 통관 집계 ──────────────────────────────────────────────────────────────

export interface TradePoint {
  연도: string;
  수입액: number;
  수입량: number;
  수출액: number;
  수출량: number;
  수입단가: number;
  /** 관세청 상세는 2024년까지다. 그 뒤는 유엔 무역통계로 이었다. */
  출처: string;
}

export interface OriginRow {
  국가: string;
  수입액: number;
  수입량: number;
  비중: number;
  단가: number;
}

export interface TradeStageRow {
  구분: string;
  수입액: number;
  수입량: number;
  단가: number;
}

/** 주요국 수출입 비교 한 줄. 보고가 없는 해는 null 로 둔다 — 0 이 아니다. */
export interface CountryCompareRow {
  국가: string;
  연도: string;
  수입액: number | null;
  수출액: number | null;
  수입량: number | null;
  수출량: number | null;
}

export interface SquidTradeData {
  _meta: {
    생성일: string;
    출처: string;
    단위: string;
    기준연도: number;
    바스켓: string;
    제외: string;
    이중계상방지: string;
    갱신방법: string;
  };
  요약: {
    기준연도: number;
    수입액: number;
    수입량: number;
    수출액: number;
    수출량: number;
    수입단가: number;
    최대수입국: string;
    최대수입국비중: number;
  };
  바스켓제외: {
    기준연도: number;
    오징어수입액: number;
    제외수입액: number;
    제외비중: number;
    제외품목: string[];
  };
  교역시계열: TradePoint[];
  국가비교: CountryCompareRow[];
  수입국구성: OriginRow[];
  품목단계: TradeStageRow[];
  최근누계: {
    구간: string;
    수입액: number;
    수입량: number;
    수출액: number;
    수출량: number;
  } | null;
}

// ─── 어법별 선단 ────────────────────────────────────────────────────────────
//
// 이 품목의 가장 중요한 축이다. 어법이 다르면 잡는 종·어장·선박·사업이 모두 다르다.
// 척당 배분량이 20배 벌어지는 것이 그 증거다.

export interface GearRow {
  업종: string;
  척수: number;
  선령31년이상: number;
  대상: string;
}

export interface SquidVessel {
  회사: string;
  선명: string;
  톤수: number;
  길이: number;
  진수: string;
  선령: number;
}

export interface VesselCompany {
  회사: string;
  척수: number;
  합계톤수: number;
  최고선령: number;
}

export interface NationFleetRow {
  국가: string;
  척수: number;
  합계톤수: number | null;
  평균톤수: number | null;
  기준: string;
  출처: string;
}

export interface CoastalGearRow {
  업종: string;
  어법: string;
  선박수: number;
  배분량: number;
  소진율: number | null;
  척당배분량: number;
}

export interface FishingGroundRow {
  어장: string;
  제도: string;
  한국배분: number;
  전체: number;
  비중: number;
  대상종: string;
  비고: string;
}

interface Sectioned<T> {
  _meta: Record<string, unknown>;
  rows: T[];
}

export interface SquidFleetData {
  _meta: Record<string, unknown>;
  원양업종: Sectioned<GearRow>;
  채낚기선박: Sectioned<SquidVessel> & { 회사별: VesselCompany[] };
  국가별선단: Sectioned<NationFleetRow>;
  연근해업종: Sectioned<CoastalGearRow>;
  어장: Sectioned<FishingGroundRow>;
}

// ─── 선별 위젯 ──────────────────────────────────────────────────────────────

export interface SquidSeries {
  key: string;
  name: string;
  color?: string;
  /** 원본이 긴 형식(long)일 때 계열을 가르는 열. 렌더러가 넓은 형식으로 돌린다. */
  groupBy?: string;
}

/**
 * 측정 게이트. 원본 위젯이 들고 있던 `basis` 를 그대로 옮긴 것으로,
 * 이 위젯의 수치를 **무엇과 비교하면 안 되는지**를 화면에 밝히는 데 쓴다.
 */
export interface MeasurementBasis {
  분류범위?: string;
  중량기준?: string;
  거래단계?: string;
  합산여부?: string;
  쿼터의미?: string;
}

/** 룰북 Universal 5-Pillar. 큐레이션이 이 다섯만 낸다. */
export type SquidPillar = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

export interface WidgetColumn {
  key: string;
  label: string;
}

/** 원문 발췌 한 건. 한글 번역이 있는 것만 담는다(L-01). */
export interface WidgetExcerpt {
  인용: string;
  출처: string;
}

export interface SquidWidget {
  id: string;
  title: string;
  chartType: string;
  data: Array<Record<string, string | number | null>>;
  columns?: WidgetColumn[];
  excerpts?: WidgetExcerpt[];
  xKey?: string;
  xLabel?: string;
  series?: SquidSeries[];
  unit?: string;
  cardDesc?: string;
  source?: string;
  dataYear?: number;
  situation?: string;
  takeaway?: string;
  pillar?: SquidPillar;
  basis?: MeasurementBasis;
  /** SIT/TAK 를 이 페이지가 그 위젯 자신의 데이터에서 끌어내 채웠으면 true. */
  narrativeFilled?: boolean;
  /** 신컨셉: 카드 박스 대신 차트 위에 얹는 주장 한 문장 (2026-08-17 재점검) */
  thesis?: string;
}

export interface SquidStage {
  key: string;
  title: string;
  widgets: SquidWidget[];
}

interface WidgetsFile {
  _meta: Record<string, unknown>;
  stages: SquidStage[];
}

const CATCH = rawCatch as unknown as SquidCatchData;
const TRADE = rawTrade as unknown as SquidTradeData;
const WIDGETS = rawWidgets as unknown as WidgetsFile;
const FLEET = rawFleet as unknown as SquidFleetData;

/** 사슬 단계 키 접두사. 횡단 단계는 `x` 로 시작한다. */
const CHAIN_PREFIX = 's';

export function getSquidCatchData(): SquidCatchData {
  return CATCH;
}

export function getSquidTradeData(): SquidTradeData {
  return TRADE;
}

export function getSquidStages(): SquidStage[] {
  return WIDGETS.stages;
}

export function getSquidChainStages(): SquidStage[] {
  return WIDGETS.stages.filter((stage) => stage.key.startsWith(CHAIN_PREFIX));
}

export function getSquidCrossStages(): SquidStage[] {
  return WIDGETS.stages.filter((stage) => !stage.key.startsWith(CHAIN_PREFIX));
}

export function getSquidWidgetsMeta(): Record<string, unknown> {
  return WIDGETS._meta;
}

/** 어법별 선단 구조. 「오징어 어선 몇 척」이라는 합산을 막는 자료다. */
export function getSquidFleetData(): SquidFleetData {
  return FLEET;
}

/** 살오징어 붕괴 시계열. 이 페이지의 중심 서사가 쓴다. */
export function getSquidCollapse(): CollapsePoint[] {
  return CATCH.살오징어붕괴;
}

// ─── 남태평양 공해 인가 선단 ────────────────────────────────────────────────

/**
 * 오징어 주 어장의 인가 선단. `scripts/build_squid_ocean_fleet.py` 산출물이다.
 *
 * ⚠ 참치와 달리 **선사 이름이 없다.** 남태평양 공해 관리기구는 소유사를 공개하지 않아
 *   목록에도 선박 상세에도 항목이 없다. 그래서 이 품목은 선적국까지가 한계다.
 */
export interface OceanFlagRow {
  선적: string;
  척수: number;
  비중?: number;
}

export interface OceanSizeRow {
  선적: string;
  척수: number;
  평균톤수: number;
  합계톤수: number;
}

export interface SquidOceanFleetData {
  _meta: Record<string, unknown>;
  전체선적: OceanFlagRow[];
  채낚기선적: OceanFlagRow[];
  채낚기톤급: OceanSizeRow[];
  선종구성: { 선종: string; 척수: number }[];
}

const OCEAN_FLEET = rawOceanFleet as unknown as SquidOceanFleetData;

/** 오징어 — 남태평양 공해 인가 선단. 선사가 아니라 선적국 단위다. */
export function getSquidOceanFleet(): SquidOceanFleetData {
  return OCEAN_FLEET;
}
