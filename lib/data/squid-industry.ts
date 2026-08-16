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
import rawTrade from '../../public/data/squid_trade_v1.json';
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

/** 살오징어 붕괴 시계열. 이 페이지의 중심 서사가 쓴다. */
export function getSquidCollapse(): CollapsePoint[] {
  return CATCH.살오징어붕괴;
}
