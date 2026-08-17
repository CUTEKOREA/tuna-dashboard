import raw from '@/public/data/whelk_country_series_v1.json';

/**
 * 6개국 시리즈(영국→아일랜드→프랑스→캐나다→중국→한국) 인테이크.
 *
 * 원자료는 `whelk_country_series_v1.json` 의 w_series_* 세 위젯이다. 위젯이
 * JSON 을 보는 유일한 통로(ADR 0005). 수치는 여기서 꺼내고, 화면은 새로 만들지 않는다.
 *
 * ⚠ **측정 경계.** 여기는 관세청 HS 1605.59 2026년 1~7월 **제품중량**이다.
 *   시장 이해 01~03단계의 FAO 활어중량·국내 고둥류와 더할 수 없고, 04단계 2024년
 *   연간 표와도 달을 이어 붙이거나 연환산하지 않는다. 1605.59는 골뱅이 전용이 아니다.
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
  물량: number;
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
  syncDate?: string;
  customBody?: Array<Record<string, unknown>>;
  data?: Array<Record<string, unknown>>;
}

const widgets = (raw as { widgets: SeriesWidget[] }).widgets;

function mustWidget(id: string): SeriesWidget {
  const found = widgets.find((w) => w.id === id);
  if (!found) throw new Error(`whelk-country-series: ${id} 위젯이 v1에 없다`);
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
    throw new Error(`whelk-country-series: 역할 카드 칸이 비었다 (${name || '?'})`);
  }
  return { name, role, korea, date, scope };
}

function asWindow(row: Record<string, unknown>): SeriesWindowRow {
  const 국가 = String(row.국가 ?? '');
  const 물량 = Number(row.물량);
  if (!국가 || !Number.isFinite(물량)) {
    throw new Error(`whelk-country-series: 창구 물량 행이 깨졌다 (${국가 || '?'})`);
  }
  return { 국가, 물량 };
}

function asUnit(row: Record<string, unknown>): SeriesUnitRow {
  const 국가 = String(row.국가 ?? '');
  const 단가 = Number(row.단가);
  if (!국가 || !Number.isFinite(단가)) {
    throw new Error(`whelk-country-series: 창구 단가 행이 깨졌다 (${국가 || '?'})`);
  }
  return { 국가, 단가 };
}

export const seriesRoles: SeriesRole[] = (rolesWidget.customBody ?? []).map(asRole);
export const seriesWindows: SeriesWindowRow[] = (windowsWidget.data ?? []).map(asWindow);
export const seriesUnits: SeriesUnitRow[] = (unitWidget.data ?? []).map(asUnit);

if (seriesRoles.length !== 6) {
  throw new Error(`whelk-country-series: 역할 카드는 6개국이어야 한다 (${seriesRoles.length})`);
}
if (seriesWindows.length !== 5) {
  throw new Error(`whelk-country-series: 한국 창구 표는 시리즈 5개 공급국이어야 한다 (${seriesWindows.length})`);
}
if (seriesUnits.length !== 4) {
  throw new Error(`whelk-country-series: 단가 표는 물량이 있는 4개국이어야 한다 (${seriesUnits.length})`);
}

const franceWindow = seriesWindows.find((r) => r.국가 === '프랑스');
if (!franceWindow || franceWindow.물량 !== 0) {
  throw new Error('whelk-country-series: 프랑스 160559 창구는 0이어야 한다');
}
if (seriesUnits.some((r) => r.국가 === '프랑스')) {
  throw new Error('whelk-country-series: 프랑스 단가를 0으로 만들지 않는다');
}

export const seriesMeta = {
  source: rolesWidget.source ?? '',
  window: '2026년 1~7월',
  measurementBoundary:
    '관세청 HS 1605.59 제품중량이다. FAO 활어중량·04단계 2024년 연간 표와 더하거나 연환산하지 않는다.',
  sit: rolesWidget.sit ?? '',
} as const;

/** 시리즈 5개국 2026년 1~7월 160559 합. 프랑스는 0이라 합에 영향이 없다. */
export const SERIES_KR_PREP_TONNES = Number(
  seriesWindows.reduce((sum, row) => sum + row.물량, 0).toFixed(1),
);
