/**
 * 고등어 대시보드 V2 데이터 인테이크 — pillar 번들 5개 정적 로드.
 *
 * Claude의 ETL(`scripts/mackerel/build.py`)이 `data/mackerel/_bundle_S*.json` 를 생성한다.
 * 파일명·개수는 고정이며 위젯 수만 늘 수 있다. 빈 번들(`widgets: []`)도 정상이다.
 * 데이터는 빌드 시점에 Python 검증기를 통과한 것이므로 런타임 검증은 하지 않는다.
 */

import kpis from '../../data/mackerel/_kpis.json';
import s1 from '../../data/mackerel/_bundle_S1.json';
import s2 from '../../data/mackerel/_bundle_S2.json';
import s3 from '../../data/mackerel/_bundle_S3.json';
import s4 from '../../data/mackerel/_bundle_S4.json';
import s5 from '../../data/mackerel/_bundle_S5.json';

export type Pillar = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';

export type MackerelChartType = 'Area' | 'Line' | 'Bar' | 'Composed' | 'Pie' | 'Radar';

export interface MackerelProvenance {
  source_id: string;
  publisher: string;
  series: string;
  period: string;
  extract_date: string;
  input_files: string[];
  input_sha256: string[];
  method: 'script' | 'manual_extract' | 'api_live';
  grade: 'A' | 'B' | 'C';
  rebuild: string;
  note?: string;
}

export interface MackerelSeriesDef {
  key: string;
  color: string;
  yAxisId?: string;
}

export interface MackerelWidget {
  id: string;
  title: string;
  subtitle: string;
  chartType: MackerelChartType;
  stacked?: boolean;
  xKey?: string;
  unit: string;
  areas?: MackerelSeriesDef[];
  bars?: MackerelSeriesDef[];
  lines?: MackerelSeriesDef[];
  data: Record<string, string | number>[];
  sit: string;
  strat: string;
  provenance: MackerelProvenance;
}

interface MackerelBundle {
  pillar: Pillar;
  widgets: MackerelWidget[];
}

const bundles: Record<Pillar, MackerelBundle> = {
  S1: s1 as unknown as MackerelBundle,
  S2: s2 as unknown as MackerelBundle,
  S3: s3 as unknown as MackerelBundle,
  S4: s4 as unknown as MackerelBundle,
  S5: s5 as unknown as MackerelBundle,
};

const allWidgets: MackerelWidget[] = (Object.keys(bundles) as Pillar[]).flatMap(
  (pillar) => bundles[pillar].widgets ?? [],
);

/** 해당 파트의 위젯 목록. 빈 배열일 수 있다. */
export function getPillarWidgets(pillar: Pillar): MackerelWidget[] {
  return bundles[pillar]?.widgets ?? [];
}

/** id 로 단건 조회. 없으면 undefined. */
export function getWidget(id: string): MackerelWidget | undefined {
  return allWidgets.find((widget) => widget.id === id);
}

/** 전체 위젯 수. 대시보드 헤더 카운터용. */
export function widgetCount(): number {
  return allWidgets.length;
}

export interface MackerelKpi {
  title: string;
  value: string;
  trend: string;
  desc: string;
  widgetId: string;
  source_id: string;
  grade: 'A' | 'B' | 'C';
}

/** 헤더 KPI. 빌더가 위젯과 같은 소스에서 산출한 값이다. */
export function getKpis(): Record<string, MackerelKpi> {
  return kpis as unknown as Record<string, MackerelKpi>;
}
