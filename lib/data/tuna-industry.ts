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
import rawCatch from '../../public/data/tuna_industry_v1.json';
import rawWidgets from '../../public/data/tuna_industry_widgets_v1.json';

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

// ─── 접근자 ────────────────────────────────────────────────────────────────

const catchData = rawCatch as unknown as TunaCatchData;
const widgetsData = rawWidgets as unknown as IndustryWidgetsData;

/** FAO FishStat 기반 어획 집계 전체. */
export function getTunaCatchData(): TunaCatchData {
  return catchData;
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
