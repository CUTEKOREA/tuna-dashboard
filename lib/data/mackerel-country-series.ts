import raw from '@/public/data/mackerel_country_series_v1.json';

/**
 * 6개국 시리즈(노르웨이→영국→중국→일본→아이슬란드→한국) 인테이크.
 *
 * 원자료는 `mackerel_country_series_v1.json` 의 w_series_* 세 위젯이다. 위젯이
 * JSON 을 보는 유일한 통로(ADR 0005).
 *
 * ⚠ **측정 경계.** 여기는 관세청 2026년 1~7월 **제품중량**이다.
 *   01단계 FAO 활어중량과 더할 수 없고, 04단계 2026년 1~5월 혼합 HSK 바구니와
 *   달을 이어 붙이거나 연환산하지 않는다. 030354(냉동)와 0304895000(필렛)을 섞지 않는다.
 */

export interface SeriesRole {
  name: string;
  role: string;
  korea: string;
  date: string;
  scope: string;
}

export interface SeriesWindowRow {
  국가: string;
  냉동: number;
  필렛: number;
}

export interface SeriesUnitRow {
  국가: string;
  단가: number;
}

interface SeriesWidget {
  id: string;
  title?: string;
  sit?: string;
  source?: string;
  customBody?: Array<Record<string, unknown>>;
  data?: Array<Record<string, unknown>>;
}

const widgets = (raw as { widgets: SeriesWidget[] }).widgets;

function mustWidget(id: string): SeriesWidget {
  const found = widgets.find((w) => w.id === id);
  if (!found) throw new Error(`mackerel-country-series: ${id} 위젯이 v1에 없다`);
  return found;
}

const rolesWidget = mustWidget('w_series_country_roles');
const windowsWidget = mustWidget('w_series_kr_windows');
const unitWidget = mustWidget('w_series_kr_unit');

function asRole(row: Record<string, unknown>): SeriesRole {
  const name = String(row.name ?? '');
  const role = String(row.role ?? '');
  const korea = String(row.korea ?? '');
  const date = String(row.date ?? '');
  const scope = String(row.scope ?? '');
  if (!name || !role || !korea || !scope) {
    throw new Error(`mackerel-country-series: 역할 카드 칸이 비었다 (${name || '?'})`);
  }
  return { name, role, korea, date, scope };
}

function asWindow(row: Record<string, unknown>): SeriesWindowRow {
  const 국가 = String(row.국가 ?? '');
  const 냉동 = Number(row.냉동);
  const 필렛 = Number(row.필렛);
  if (!국가 || !Number.isFinite(냉동) || !Number.isFinite(필렛)) {
    throw new Error(`mackerel-country-series: 창구 물량 행이 깨졌다 (${국가 || '?'})`);
  }
  return { 국가, 냉동, 필렛 };
}

function asUnit(row: Record<string, unknown>): SeriesUnitRow {
  const 국가 = String(row.국가 ?? '');
  const 단가 = Number(row.단가);
  if (!국가 || !Number.isFinite(단가)) {
    throw new Error(`mackerel-country-series: 창구 단가 행이 깨졌다 (${국가 || '?'})`);
  }
  return { 국가, 단가 };
}

export const seriesRoles: SeriesRole[] = (rolesWidget.customBody ?? []).map(asRole);
export const seriesWindows: SeriesWindowRow[] = (windowsWidget.data ?? []).map(asWindow);
export const seriesUnits: SeriesUnitRow[] = (unitWidget.data ?? []).map(asUnit);

if (seriesRoles.length !== 6) {
  throw new Error(`mackerel-country-series: 역할 카드는 6개국이어야 한다 (${seriesRoles.length})`);
}
if (seriesWindows.length !== 5) {
  throw new Error(`mackerel-country-series: 한국 창구 표는 시리즈 5개 공급국이어야 한다 (${seriesWindows.length})`);
}
if (seriesUnits.length !== 4) {
  throw new Error(`mackerel-country-series: 단가 표는 물량이 있는 4개국이어야 한다 (${seriesUnits.length})`);
}

const iceland = seriesWindows.find((r) => r.국가 === '아이슬란드');
if (!iceland || iceland.냉동 !== 0 || iceland.필렛 !== 0) {
  throw new Error('mackerel-country-series: 아이슬란드 030354·필렛 창구는 0이어야 한다');
}
if (seriesUnits.some((r) => r.국가 === '아이슬란드')) {
  throw new Error('mackerel-country-series: 아이슬란드 단가를 0으로 만들지 않는다');
}

export const seriesMeta = {
  source: rolesWidget.source ?? '',
  window: '2026년 1~7월',
  measurementBoundary:
    '관세청 HS 030354·0304895000 제품중량이다. FAO 활어중량·04단계 1~5월 혼합 바구니와 더하거나 연환산하지 않는다.',
  sit: rolesWidget.sit ?? '',
} as const;

export const SERIES_KR_FROZEN_TONNES = Number(
  seriesWindows.reduce((sum, row) => sum + row.냉동, 0).toFixed(1),
);
export const SERIES_KR_FILLET_TONNES = Number(
  seriesWindows.reduce((sum, row) => sum + row.필렛, 0).toFixed(1),
);
