import raw from '@/public/data/shrimp_real_data_v4.json';

/**
 * 6개국 시리즈(에콰도르→베트남→인도→태국→중국→한국) 인테이크.
 *
 * 원자료는 `shrimp_real_data_v4.json` 의 w_series_* 세 위젯이다. 위젯이 JSON 을
 * 보는 유일한 통로(ADR 0005). 수치는 여기서 꺼내고, 화면은 새로 만들지 않는다.
 *
 * ⚠ **측정 경계.** 여기는 관세청 nitemtrade 2026년 1~6월 **제품중량**이다.
 *   시장 이해 01~04단계의 FAO 활어중량과 더할 수 없고, 05단계 1~5월 HS 030617
 *   표와도 달을 합치거나 연환산하지 않는다. 기간·세번·상대국 집합이 다르다.
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
  원물: number;
  조제품: number;
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
  if (!found) throw new Error(`shrimp-country-series: ${id} 위젯이 v4에 없다`);
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
    throw new Error(`shrimp-country-series: 역할 카드 칸이 비었다 (${name || '?'})`);
  }
  return { name, role, korea, date, scope };
}

function asWindow(row: Record<string, unknown>): SeriesWindowRow {
  const 국가 = String(row.국가 ?? '');
  const 원물 = Number(row.원물);
  const 조제품 = Number(row.조제품);
  if (!국가 || !Number.isFinite(원물) || !Number.isFinite(조제품)) {
    throw new Error(`shrimp-country-series: 창구 물량 행이 깨졌다 (${국가 || '?'})`);
  }
  return { 국가, 원물, 조제품 };
}

function asUnit(row: Record<string, unknown>): SeriesUnitRow {
  const 국가 = String(row.국가 ?? '');
  const 단가 = Number(row.단가);
  if (!국가 || !Number.isFinite(단가)) {
    throw new Error(`shrimp-country-series: 창구 단가 행이 깨졌다 (${국가 || '?'})`);
  }
  return { 국가, 단가 };
}

export const seriesRoles: SeriesRole[] = (rolesWidget.customBody ?? []).map(asRole);
export const seriesWindows: SeriesWindowRow[] = (windowsWidget.data ?? []).map(asWindow);
export const seriesUnits: SeriesUnitRow[] = (unitWidget.data ?? []).map(asUnit);

if (seriesRoles.length !== 6) {
  throw new Error(`shrimp-country-series: 역할 카드는 6개국이어야 한다 (${seriesRoles.length})`);
}
if (seriesWindows.length !== 5 || seriesUnits.length !== 5) {
  throw new Error('shrimp-country-series: 한국 창구 표는 시리즈 5개 공급국이어야 한다');
}

export const seriesMeta = {
  source: rolesWidget.source ?? '',
  window: '2026년 1~6월',
  measurementBoundary:
    '관세청 nitemtrade 제품중량이다. FAO 활어중량·05단계 1~5월 HS 030617 표와 더하거나 연환산하지 않는다.',
  sit: rolesWidget.sit ?? '',
} as const;

/**
 * v4 sit 문장의 합. kg 합을 한 번만 나눈 값이라 행 반올림 합(25,918.3)과
 * 0.1톤 어긋난다. 화면 합계는 이 값을 쓰고, 행은 위젯 data 를 그대로 그린다.
 */
export const SERIES_KR_RAW_TONNES = 25918.2;
export const SERIES_KR_PREP_TONNES = 11754.1;
