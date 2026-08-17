/**
 * 「시장 이해 > 참치」 데이터 인테이크 (ADR 0005)
 *
 * 위젯·컴포넌트가 JSON 을 보는 유일한 통로. `app/`·`components/` 에서 JSON 을 직접
 * import 하면 아키텍처 가드가 막는다.
 *
 * 두 파일을 읽는다:
 *  - `tuna_industry_v1.json`         — FAO FishStat 어획 집계 (scripts/build_tuna_industry_data.py)
 *  - `tuna_industry_widgets_v1.json` — 93위젯 중 47개 선별·재배치 (scripts/curate_tuna_industry_widgets.py)
 *
 * 둘 다 정적 산출물이다. 런타임 fetch 가 없으므로 텔레메트리는 STATIC/SYNCED 로만 표기한다(L-09).
 */
import rawAtuna from '../../public/data/tuna_industry_prices_v1.json';
import rawCatch from '../../public/data/tuna_industry_v1.json';
import rawTrade from '../../public/data/tuna_trade_v1.json';
import rawFleet from '../../public/data/tuna_fleet_v1.json';
import rawWidgets from '../../public/data/tuna_industry_widgets_v1.json';
import rawGlossary from '../../public/data/tuna_glossary_v1.json';

// ─── 어획 집계 ──────────────────────────────────────────────────────────────

export interface SpeciesShare {
  어종: string;
  코드: string;
  어획량: number;
  비중: number;
  주용도: string;
}

export interface CountryRank {
  국가: string;
  어획량: number;
  비중: number;
}

export interface AreaRank {
  해역: string;
  코드: string;
  관할: string;
  어획량: number;
  비중: number;
}

export interface RfmoShare {
  관할: string;
  한글명: string;
  어획량: number;
  비중: number;
}

export interface KoreaTrendPoint {
  연도: string;
  한국어획량: number;
  세계점유율: number;
}

export interface BluefinSourceRow {
  연도: string;
  자연산: number;
  축양: number;
  축양비중: number;
}

export interface KoreaSpeciesRow {
  어종: string;
  어획량: number;
  비중: number;
  주용도: string;
}

/** 어종별 시계열 한 점. 연도 + 어종 한글명별 어획량 + 합계. */
export type SpeciesTimelinePoint = Record<string, string | number>;

export interface TunaCatchSummary {
  기준연도: number;
  세계어획량: number;
  어종수: number;
  최대해역: string | null;
  최대해역비중: number | null;
  한국순위: number | null;
  한국어획량: number | null;
}

export interface TunaCatchMeta {
  생성일: string;
  기준연도: number;
  바스켓: string;
  단위: string;
  출처: string;
  출처경로: string;
  주의: string;
  갱신방법: string;
}

export interface TunaCatchData {
  _meta: TunaCatchMeta;
  요약: TunaCatchSummary;
  어종구성: SpeciesShare[];
  어종시계열: SpeciesTimelinePoint[];
  국가순위: CountryRank[];
  해역순위: AreaRank[];
  관할별: RfmoShare[];
  한국시계열: KoreaTrendPoint[];
  한국어종구성: KoreaSpeciesRow[];
  참다랑어자연산대축양: BluefinSourceRow[];
}

// ─── 교역 집계 (FAO FishStat 무역통계) ─────────────────────────────────────
// ⚠ 바스켓이 어획 집계와 다르다. ISSCFC 는 참치·가다랑어·새치류를 한 묶음으로 분류해
//   참치만 떼어낼 수 없다. 두 숫자를 나란히 놓을 때는 그 사실을 밝혀야 한다.

export interface TradeRank {
  국가: string;
  금액: number;
  비중: number;
}

export interface TradeBalancePoint {
  연도: string;
  수출액: number;
  수입액: number;
  무역수지: number;
}

export interface TradePriceGapPoint {
  연도: string;
  한국: number;
  세계평균: number;
  격차율: number;
}

export interface TradeStageMix {
  구분: string;
  금액: number;
  물량: number;
  단가: number;
}

export interface TunaTradeData {
  _meta: Record<string, string | number>;
  요약: {
    기준연도: number;
    세계수입액: number;
    세계수입물량: number;
    최대수출국: string | null;
    최대수입국: string | null;
  };
  수출상위: TradeRank[];
  수입상위: TradeRank[];
  한국교역: TradeBalancePoint[];
  태국교역: TradeBalancePoint[];
  수출단가비교: TradePriceGapPoint[];
  품목군구성: TradeStageMix[];
}

// ─── 선별 위젯 ──────────────────────────────────────────────────────────────

export type IndustryChartType = 'bar' | 'line' | 'area' | 'composed' | 'pie' | 'radar';

export interface IndustrySeries {
  key: string;
  name: string;
  color?: string;
}

export type IndustryRow = Record<string, string | number | null | undefined>;

export interface IndustryWidget {
  id: string;
  title: string;
  원제목: string;
  chartType: IndustryChartType;
  xAxis?: string | null;
  unit?: string | null;
  source?: string | null;
  methodology?: string | null;
  situation?: string | null;
  takeaway?: string | null;
  syncDate?: string | null;
  /** 데이터가 끝나는 연도. 기관마다 공표 주기가 달라 위젯끼리 어긋나므로 화면에 드러낸다 */
  dataYear?: number | null;
  /** 원본에 현황·실행지침이 없어 이 페이지가 데이터에서 끌어내 채운 경우 true */
  narrativeFilled?: boolean;
  /** 신컨셉: 카드 박스 대신 차트 위에 얹는 주장 한 문장 (2026-08-17 재점검) */
  thesis?: string;
  telemetry: 'SYNCED';
  data: IndustryRow[];
  lines?: IndustrySeries[] | null;
  bars?: IndustrySeries[] | null;
  areas?: IndustrySeries[] | null;
  xKey?: string | null;
}

export type StageAxis = 'chain' | 'cross';
export type StagePillar = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

export interface IndustryStage {
  key: string;
  axis: StageAxis;
  order: number;
  label: string;
  pillar: StagePillar;
  widgets: IndustryWidget[];
}

export interface IndustryWidgetsData {
  _meta: Record<string, string>;
  stages: IndustryStage[];
}

// ─── 항구별 가격 시계열 ────────────────────────────────────────────────────
// ⚠ Atuna 는 유료 구독 자료다. 사내 열람까지만 쓰고 대외 배포물에는
//   FAO GLOBEFISH 공표치로 대체한다. 페이지 하단 「출처와 한계」에 명시돼 있다.

/** 항구 하나. 한글명은 화면 노출용이고 skjKey/yfKey 는 원본 컬럼명이다. */
export interface PriceHub {
  key: string;
  label: string;
  /** 그 항구가 어떤 시장으로 가는 원료인가 — 항구를 묶어 보면 안 되는 이유 */
  serves: string;
}

/** 가다랑어 고시 항구 5곳. */
export const SKJ_HUBS: PriceHub[] = [
  { key: 'skj_bkk', label: '방콕', serves: '태국 캐너리 — 업계 벤치마크' },
  { key: 'skj_mnt', label: '만타', serves: '에콰도르 캐너리 — 동태평양 어획' },
  { key: 'skj_sey', label: '세이셸', serves: '인도양 어획 · 유럽향' },
  { key: 'skj_abj', label: '아비장', serves: '서아프리카 · 유럽 캐너리향' },
  { key: 'skj_vig', label: '비고', serves: '스페인 캐너리 도착가' },
];

/** 월별 가격 한 점. 항구 한글명을 키로 쓴다 — 차트가 그대로 라벨로 쓴다. */
export type PricePoint = Record<string, string | number | null>;

export interface PriceTimeline {
  /** 월별 항구 가격 (USD/톤). 결측은 null 이라 선이 끊긴다 — 메우지 않는다 */
  points: PricePoint[];
  /** 마지막으로 모든 항구 값이 있는 달의 최고·최저 항구와 격차 */
  latestSpread: {
    month: string;
    maxLabel: string;
    maxPrice: number;
    minLabel: string;
    minPrice: number;
    gap: number;
    gapPct: number;
  } | null;
  meta: { source: string; unit: string; fetched: string; span: string };
}

interface AtunaRow {
  month: string;
  [key: string]: string | number | undefined;
}

interface AtunaFile {
  _meta: {
    생성일: string;
    출처: string;
    단위: string;
    구간: string;
    재배포제한: string;
    결측처리: string;
    계열별_마지막관측: Record<string, string | null>;
    갱신방법: string;
  };
  timeline: AtunaRow[];
}

const atunaFile = rawAtuna as unknown as AtunaFile;

function buildPriceTimeline(): PriceTimeline {
  const rows = atunaFile.timeline;

  const points: PricePoint[] = rows.map((row) => {
    const point: PricePoint = { 월: row.month };
    for (const hub of SKJ_HUBS) {
      const value = row[hub.key];
      point[hub.label] = typeof value === 'number' ? value : null;
    }
    return point;
  });

  // 모든 항구가 채워진 마지막 달을 찾는다. 결측이 섞인 달로 격차를 재면
  // 빠진 항구가 최고·최저였을 수 있어 숫자가 거짓이 된다.
  let latestSpread: PriceTimeline['latestSpread'] = null;
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = rows[index];
    const observed = SKJ_HUBS.map((hub) => ({ label: hub.label, price: row[hub.key] })).filter(
      (entry): entry is { label: string; price: number } => typeof entry.price === 'number',
    );
    if (observed.length < SKJ_HUBS.length) continue;

    const sorted = [...observed].sort((a, b) => a.price - b.price);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    latestSpread = {
      month: row.month,
      maxLabel: max.label,
      maxPrice: max.price,
      minLabel: min.label,
      minPrice: min.price,
      gap: max.price - min.price,
      gapPct: Number((((max.price - min.price) / min.price) * 100).toFixed(1)),
    };
    break;
  }

  return {
    points,
    latestSpread,
    meta: {
      source: atunaFile._meta.출처,
      unit: atunaFile._meta.단위,
      fetched: atunaFile._meta.생성일,
      span: atunaFile._meta.구간,
    },
  };
}

const priceTimeline = buildPriceTimeline();

/** 항구별 가다랑어 가격 시계열. 「가격 형성」 축이 쓴다. */
export function getSkjPriceTimeline(): PriceTimeline {
  return priceTimeline;
}

// ─── 접근자 ────────────────────────────────────────────────────────────────

const catchData = rawCatch as unknown as TunaCatchData;
const tradeData = rawTrade as unknown as TunaTradeData;
const widgetsData = rawWidgets as unknown as IndustryWidgetsData;

/** FAO FishStat 기반 어획 집계 전체. */
export function getTunaCatchData(): TunaCatchData {
  return catchData;
}

/** FAO FishStat 무역통계 기반 교역 집계. */
export function getTunaTradeData(): TunaTradeData {
  return tradeData;
}

/** 밸류체인 단계별 선별 위젯 전체 (사슬 7단계 + 횡단 3축). */
export function getTunaIndustryStages(): IndustryStage[] {
  return widgetsData.stages;
}

/** 단계 키로 하나만 꺼낸다. 없으면 undefined. */
export function getTunaIndustryStage(key: string): IndustryStage | undefined {
  return widgetsData.stages.find((stage) => stage.key === key);
}

/** 선별 위젯 메타(원본·선별 규칙·갱신 방법). 페이지 하단 출처 표기에 쓴다. */
export function getTunaIndustryWidgetsMeta(): Record<string, string> {
  return widgetsData._meta;
}

/** 사슬 7단계만. */
export function getChainStages(): IndustryStage[] {
  return widgetsData.stages
    .filter((stage) => stage.axis === 'chain')
    .sort((a, b) => a.order - b.order);
}

/** 횡단 3축만. */
export function getCrossStages(): IndustryStage[] {
  return widgetsData.stages
    .filter((stage) => stage.axis === 'cross')
    .sort((a, b) => a.order - b.order);
}

// ─── 어법·선단 ──────────────────────────────────────────────────────────────
//
// 선망과 연승은 잡는 어종도 가는 시장도 다르다. 선망 어획은 통조림으로,
// 연승 어획은 횟감으로 간다 — 합산해 「참치 어선」이라 부르면 안 된다.

export interface TunaOceanFleetRow {
  해역: string;
  기구: string;
  허가: number;
  실조업: number | null;
}

export interface TunaFlagRow {
  선적국: string;
  척수: number;
  어창용적: number;
}

export interface TunaGearRow {
  업종: string;
  척수: number;
  선령31년이상: number;
  용도: string;
  주어장: string;
}

export interface TunaCompanyFleetRow {
  회사: string;
  구분: string;
  참치선망: number;
  참치연승: number;
  기타: number;
  합계: number;
  비고: string;
}

export interface TunaGearProfileRow {
  어법: string;
  주대상: string;
  용도: string;
  조업방식: string;
  선박: string;
  한국척수: number;
}

interface TunaSectioned<T> {
  _meta: Record<string, unknown>;
  rows: T[];
}

export interface TunaFleetData {
  _meta: Record<string, unknown>;
  세계선단: Record<string, unknown>;
  해역별: TunaSectioned<TunaOceanFleetRow>;
  선적국: TunaSectioned<TunaFlagRow>;
  한국업종: TunaSectioned<TunaGearRow>;
  한국선사: TunaSectioned<TunaCompanyFleetRow>;
  어법성격: TunaSectioned<TunaGearProfileRow>;
}

const FLEET = rawFleet as unknown as TunaFleetData;

/** 어법·선단 구조. 「참치 어선 몇 척」이라는 합산을 막는 자료다. */
export function getTunaFleetData(): TunaFleetData {
  return FLEET;
}

// ─── 용어·어종 참조 ────────────────────────────────────────────────────────

/**
 * 약어 한 줄. 한글이 비어 있으면 아직 옮기지 않은 것이다 —
 * 화면에서는 한글이 있는 것만 쓰고, 없는 것은 영문 그대로 두되 사전에는 남긴다.
 */
export interface GlossaryRow {
  약어: string;
  영문: string;
  한글: string;
}

/** 어종 프로필. 항목이 어종마다 달라 선택적으로 담긴다. */
export interface SpeciesProfile {
  어종: string;
  원문명: string;
  학명?: string;
  '일반 크기'?: string;
  최대?: string;
  성숙?: string;
  '주요 어장'?: string;
  '주요 어법'?: string;
  '참치 어획 중 비중'?: string;
  '주요 가공국'?: string;
  '주요 선적국'?: string;
  생활사?: string;
  '주요 시장'?: string;
  '주요 제품 형태'?: string;
}

/**
 * 기구가 평가한 계군 상태.
 * ⚠ 오늘 상태가 아니라 **그 해에 그렇게 평가했다**는 뜻이다. 평가연도를 함께 낸다.
 */
export interface StockStatusRow {
  어종: string;
  해역: string;
  기구: string;
  상태: string;
  평가연도: string;
}

/** 인증 제도 한 줄. 조문이 아니라 「어떤 제도가 있고 무엇을 보는가」다. */
export interface CertificationRow {
  구분: string;
  이름: string;
  약어: string;
  무엇: string;
}

/**
 * 식품안전 기준 한 줄.
 * ⚠ `구분` 이 규제인지 관측인지 가른다 — 섞어 읽으면 관측값을 기준으로 오해한다.
 */
export interface FoodSafetyRow {
  항목: string;
  구분: string;
  값: string;
  설명: string;
}

export interface TunaGlossaryData {
  _meta: Record<string, string>;
  약어: GlossaryRow[];
  어종프로필: SpeciesProfile[];
  자원상태: StockStatusRow[];
  인증: {
    _meta: Record<string, string>;
    rows: CertificationRow[];
    사회책임항목: { 항목: string; 내용: string }[];
  };
  식품안전: { _meta: Record<string, string>; rows: FoodSafetyRow[] };
}

const GLOSSARY = rawGlossary as unknown as TunaGlossaryData;

/** 참치 — 약어·어종 프로필·자원상태. 수치가 아니라 용어와 분류다. */
export function getTunaGlossary(): TunaGlossaryData {
  return GLOSSARY;
}
