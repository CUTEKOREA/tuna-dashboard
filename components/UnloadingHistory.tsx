'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, Database, MapPinned, Ship, TrendingUp } from 'lucide-react';
import {
  CANONICAL_PORTS,
  HISTORY_YEARS,
  type HistoryNavigationKey,
  type HistoryYear,
} from '../lib/unloading-history/constants';
import type {
  PublicHistoryVoyage,
  UnloadingHistoryPublicResponse,
} from '../lib/unloading-history/schema';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import TakeawayBox from './TakeawayBox';
import TelemetryBadge from './TelemetryBadge';
import TermTooltip from './TermTooltip';
import styles from './UnloadingHistory.module.css';
import { CHART_RANK } from '@/lib/chart-palette';

export const DEFAULT_HISTORY_YEAR: HistoryYear = 2025;
export const ALL_PORTS = 'ALL';

export function getNextHistoryYear(
  current: HistoryYear,
  key: HistoryNavigationKey,
): HistoryYear {
  const index = HISTORY_YEARS.indexOf(current);
  if (key === 'Home') return HISTORY_YEARS[0];
  if (key === 'End') return HISTORY_YEARS.at(-1)!;
  if (key === 'ArrowRight' || key === 'ArrowDown') {
    return HISTORY_YEARS[(index + 1) % HISTORY_YEARS.length];
  }
  if (key === 'ArrowLeft' || key === 'ArrowUp') {
    return HISTORY_YEARS[(index - 1 + HISTORY_YEARS.length) % HISTORY_YEARS.length];
  }
  return current;
}

export function getVoyageActualForYear(
  voyage: PublicHistoryVoyage,
  year: HistoryYear,
): number | null {
  if (!voyage.kpiIncluded) {
    return (voyage.completionYear ?? voyage.sourceYear) === year
      ? voyage.actualMt
      : null;
  }
  const allocations = voyage.yearAllocations.filter((row) => row.year === year);
  if (allocations.length === 0) return null;
  return allocations.reduce((sum, row) => sum + row.actualMt, 0);
}

export function getVisibleHistoryVoyages(
  voyages: PublicHistoryVoyage[],
  year: HistoryYear,
  portCode: string,
): PublicHistoryVoyage[] {
  return voyages
    .filter((voyage) => {
      const displayYears = voyage.kpiIncluded
        ? voyage.yearAllocations
            .filter((allocation) => allocation.actualMt > 0)
            .map((allocation) => allocation.year)
        : [voyage.completionYear ?? voyage.sourceYear];
      if (!displayYears.includes(year)) return false;
      if (portCode === ALL_PORTS) return true;

      const yearPorts = voyage.kpiIncluded
        ? voyage.yearAllocations
            .filter((allocation) => allocation.year === year)
            .flatMap((allocation) => allocation.portCodes)
        : voyage.ports.map((port) => port.code);
      return yearPorts.some((code) => code === portCode);
    })
    .sort((a, b) => {
      const dateOrder = (b.period.endDate ?? '').localeCompare(a.period.endDate ?? '');
      return dateOrder || a.vessel.canonicalName.localeCompare(b.vessel.canonicalName, 'ko');
    });
}

export function getVoyagePortsForYear(
  voyage: PublicHistoryVoyage,
  year: HistoryYear,
) {
  if (!voyage.kpiIncluded) return voyage.ports;
  const codes = new Set(
    voyage.yearAllocations
      .filter((allocation) => allocation.year === year)
      .flatMap((allocation) => allocation.portCodes),
  );
  return voyage.ports.filter((port) => codes.has(port.code));
}

interface UnloadingHistoryViewProps {
  dataset: UnloadingHistoryPublicResponse;
  initialYear?: HistoryYear;
}

type HistoryLoadState =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; dataset: UnloadingHistoryPublicResponse };

type HistoryLoadEvent =
  | { type: 'failure' }
  | { type: 'retry' }
  | { type: 'success'; dataset: UnloadingHistoryPublicResponse };

export function reduceHistoryLoadState(
  state: HistoryLoadState,
  event: HistoryLoadEvent,
): HistoryLoadState {
  if (event.type === 'failure') {
    return state.kind === 'ready' ? state : { kind: 'error' };
  }
  if (event.type === 'retry') return { kind: 'loading' };
  return { kind: 'ready', dataset: event.dataset };
}

const isObject = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const hasExactKeys = (value: Record<string, unknown>, keys: readonly string[]) => {
  const actual = Object.keys(value);
  return actual.length === keys.length && keys.every((key) => actual.includes(key));
};

const isSafeText = (value: unknown): value is string => (
  typeof value === 'string'
  && value.length > 0
  && !/(?:^|\/)(?:Users|Volumes|home|root|private|tmp|var|etc)(?:\/|$)/i.test(value)
  && !/(?:^|\s)~\//.test(value)
  && !/(?:^|[^A-Za-z0-9])[A-Za-z]:/.test(value)
  && !/\b[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(value)
  && !/@[^\s@]+\.[^\s@]+|GoogleDrive-|\\|\b(?:file|https?|smb|ftp|data|mailto):\/{0,2}/i.test(value)
);

const isFiniteNonNegative = (value: unknown): value is number => (
  typeof value === 'number' && Number.isFinite(value) && value >= 0
);

const isNonNegativeInteger = (value: unknown): value is number => (
  Number.isInteger(value) && Number(value) >= 0
);

const isHistoryYear = (value: unknown): value is HistoryYear => (
  typeof value === 'number' && HISTORY_YEARS.some((year) => year === value)
);

const isIsoDateOrNull = (value: unknown): value is string | null => {
  if (value === null) return true;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
};

const isIsoDateTimeWithOffset = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-](\d{2}):(\d{2}))$/,
  );
  if (!match) return false;
  const [year, month, day, hour, minute, second, offsetHour = 0, offsetMinute = 0] = match
    .slice(1)
    .map((part) => part === undefined ? 0 : Number(part));
  if (hour > 23 || minute > 59 || second > 59 || offsetHour > 23 || offsetMinute > 59) return false;
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day
    && date.getUTCHours() === hour
    && date.getUTCMinutes() === minute
    && date.getUTCSeconds() === second;
};

const isPort = (value: unknown) => (
  isObject(value)
  && hasExactKeys(value, ['code', 'nameKo'])
  && typeof value.code === 'string'
  && Object.hasOwn(CANONICAL_PORTS, value.code)
  && isSafeText(value.nameKo)
);

const isAllocation = (value: unknown) => (
  isObject(value)
  && hasExactKeys(value, ['year', 'actualMt', 'method', 'portCodes'])
  && isHistoryYear(value.year)
  && isFiniteNonNegative(value.actualMt)
  && typeof value.method === 'string'
  && ['daily_report', 'completion_year', 'final_report_adjustment'].includes(value.method)
  && Array.isArray(value.portCodes)
  && value.portCodes.every((code) => typeof code === 'string' && Object.hasOwn(CANONICAL_PORTS, code))
  && (value.method === 'final_report_adjustment' || value.portCodes.length > 0)
);

const isVoyage = (value: unknown) => {
  if (!isObject(value) || !isObject(value.vessel) || !isObject(value.period)) return false;
  return hasExactKeys(value, [
    'voyageId', 'sourceYear', 'completionYear', 'displayYearBasis', 'vessel',
    'period', 'ports', 'reportedMt', 'actualMt', 'verification', 'kpiIncluded',
    'yearAllocations', 'evidenceDocumentCount',
  ])
    && typeof value.voyageId === 'string'
    && /^[a-z0-9-]+$/.test(value.voyageId)
    && isHistoryYear(value.sourceYear)
    && (value.completionYear === null || isHistoryYear(value.completionYear))
    && typeof value.displayYearBasis === 'string'
    && ['daily_report', 'completion_year', 'source_year'].includes(value.displayYearBasis)
    && hasExactKeys(value.vessel, ['canonicalName'])
    && isSafeText(value.vessel.canonicalName)
    && hasExactKeys(value.period, ['startDate', 'endDate'])
    && isIsoDateOrNull(value.period.startDate)
    && isIsoDateOrNull(value.period.endDate)
    && Array.isArray(value.ports)
    && value.ports.every(isPort)
    && (value.reportedMt === null || isFiniteNonNegative(value.reportedMt))
    && (value.actualMt === null || isFiniteNonNegative(value.actualMt))
    && typeof value.verification === 'string'
    && ['verified', 'partial', 'unverified'].includes(value.verification)
    && typeof value.kpiIncluded === 'boolean'
    && Array.isArray(value.yearAllocations)
    && value.yearAllocations.every(isAllocation)
    && isNonNegativeInteger(value.evidenceDocumentCount);
};

const isAnnual = (value: unknown) => {
  if (!isObject(value) || !isObject(value.allocationMethodCounts)) return false;
  return hasExactKeys(value, [
    'year', 'verifiedActualMt', 'verifiedVoyageCount', 'candidateVoyageCount',
    'partialCount', 'unverifiedCount', 'averageVerifiedMt', 'portCount', 'ports',
    'allocationMethodCounts', 'isMinimumVerifiedTotal',
  ])
    && isHistoryYear(value.year)
    && isFiniteNonNegative(value.verifiedActualMt)
    && isNonNegativeInteger(value.verifiedVoyageCount)
    && isNonNegativeInteger(value.candidateVoyageCount)
    && isNonNegativeInteger(value.partialCount)
    && isNonNegativeInteger(value.unverifiedCount)
    && isFiniteNonNegative(value.averageVerifiedMt)
    && isNonNegativeInteger(value.portCount)
    && Array.isArray(value.ports)
    && value.ports.every(isPort)
    && hasExactKeys(value.allocationMethodCounts, [
      'dailyReport', 'completionYear', 'finalReportAdjustment',
    ])
    && isNonNegativeInteger(value.allocationMethodCounts.dailyReport)
    && isNonNegativeInteger(value.allocationMethodCounts.completionYear)
    && isNonNegativeInteger(value.allocationMethodCounts.finalReportAdjustment)
    && typeof value.isMinimumVerifiedTotal === 'boolean';
};

const isCompletionBaseline = (value: unknown) => (
  isObject(value)
  && hasExactKeys(value, [
    'year', 'verifiedActualMt', 'verifiedVoyageCount', 'candidateVoyageCount',
  ])
  && isHistoryYear(value.year)
  && isFiniteNonNegative(value.verifiedActualMt)
  && isNonNegativeInteger(value.verifiedVoyageCount)
  && isNonNegativeInteger(value.candidateVoyageCount)
);

const isPublicMeta = (value: unknown) => (
  isObject(value)
  && hasExactKeys(value, [
    'sourceLabel', 'sourceFolderCount', 'sourceFileCount', 'processedFileCount',
    'failedFileCount', 'candidateVoyageCount', 'verifiedVoyageCount',
    'partialVoyageCount', 'unverifiedVoyageCount', 'snapshotStatus', 'generatedAt',
    'dataAsOf', 'extractorVersion',
  ])
  && value.sourceLabel === 'Google Drive 하역업무 정제본'
  && isNonNegativeInteger(value.sourceFolderCount)
  && isNonNegativeInteger(value.sourceFileCount)
  && isNonNegativeInteger(value.processedFileCount)
  && isNonNegativeInteger(value.failedFileCount)
  && isNonNegativeInteger(value.candidateVoyageCount)
  && isNonNegativeInteger(value.verifiedVoyageCount)
  && isNonNegativeInteger(value.partialVoyageCount)
  && isNonNegativeInteger(value.unverifiedVoyageCount)
  && value.snapshotStatus === 'SYNCED'
  && isIsoDateTimeWithOffset(value.generatedAt)
  && typeof value.dataAsOf === 'string'
  && isIsoDateOrNull(value.dataAsOf)
  && typeof value.extractorVersion === 'string'
  && /^[A-Za-z0-9._-]{1,64}$/.test(value.extractorVersion)
);

const isPublicMetadata = (value: unknown) => {
  if (!isObject(value) || !isObject(value.apiHealth)) return false;
  return hasExactKeys(value, [
    'isLive', 'status', 'source', 'syncDate', 'dataAsOf', 'schemaVersion',
    'method', 'apiHealth',
  ])
    && value.isLive === false
    && value.status === 'STATIC'
    && value.source === 'lib/unloading-history/history_2021_2025.json'
    && typeof value.syncDate === 'string'
    && isIsoDateOrNull(value.syncDate)
    && typeof value.dataAsOf === 'string'
    && isIsoDateOrNull(value.dataAsOf)
    && value.schemaVersion === '1.0.0'
    && value.method === '결정론적 Excel 추출·최종보고 우선·일보 교차검증'
    && hasExactKeys(value.apiHealth, ['ok'])
    && value.apiHealth.ok === true;
};

export function decodeUnloadingHistoryResponse(
  payload: unknown,
): UnloadingHistoryPublicResponse | null {
  if (!isObject(payload) || !hasExactKeys(payload, [
    'success', 'meta', 'completionYearBaseline', 'annual', 'voyages', 'isLive',
    'snapshotStatus', '_metadata',
  ])) return null;
  if (payload.success !== true || payload.isLive !== false || payload.snapshotStatus !== 'SYNCED') return null;
  if (!isPublicMeta(payload.meta) || !isPublicMetadata(payload._metadata)) return null;
  if (!Array.isArray(payload.completionYearBaseline) || payload.completionYearBaseline.length !== HISTORY_YEARS.length) return null;
  if (!payload.completionYearBaseline.every(isCompletionBaseline)) return null;
  if (payload.completionYearBaseline.some((row, index) => (row as Record<string, unknown>).year !== HISTORY_YEARS[index])) return null;
  if (!Array.isArray(payload.annual) || payload.annual.length !== HISTORY_YEARS.length) return null;
  if (!payload.annual.every(isAnnual)) return null;
  if (payload.annual.some((row, index) => (row as Record<string, unknown>).year !== HISTORY_YEARS[index])) return null;
  if (!Array.isArray(payload.voyages) || payload.voyages.length !== 98 || !payload.voyages.every(isVoyage)) return null;
  if (new Set(payload.voyages.map((row) => (row as Record<string, unknown>).voyageId)).size !== 98) return null;
  return payload as UnloadingHistoryPublicResponse;
}

const formatMt = (value: number) => value.toLocaleString('ko-KR', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

const formatDate = (value: string | null) => value?.replaceAll('-', '.') ?? '날짜 미확인';

const statusLabel = (voyage: PublicHistoryVoyage) => {
  if (voyage.verification === 'verified') return '검증 완료';
  if (voyage.verification === 'partial') return '부분 자료 · 연간 지표 합계 제외';
  return '자료 미확인 · 연간 지표 합계 제외';
};

const yearBasisLabel = (voyage: PublicHistoryVoyage, year: HistoryYear) => {
  if (!voyage.kpiIncluded) return voyage.completionYear === null ? '원본연도 기준' : '완료연도 기준';
  const methods = voyage.yearAllocations.filter((row) => row.year === year).map((row) => row.method);
  if (methods.includes('daily_report')) return '달력연도 배분';
  return '완료연도 기준';
};

function HistorySectionState({ text, action }: { text: string; action?: ReactNode }) {
  return (
    <section className={styles.stateCard} data-testid="unloading-history-section" aria-labelledby="unloading-history-state-title">
      <h2 id="unloading-history-state-title">2021~2025 역사 실적</h2>
      <p role={action ? 'alert' : 'status'} aria-live="polite">{text}</p>
      {action}
    </section>
  );
}

export function UnloadingHistoryView({
  dataset,
  initialYear = DEFAULT_HISTORY_YEAR,
}: UnloadingHistoryViewProps) {
  const [selectedYear, setSelectedYear] = useState<HistoryYear>(initialYear);
  const [selectedPort, setSelectedPort] = useState<string>(ALL_PORTS);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const annual = dataset.annual.find((row) => row.year === selectedYear)!;
  const voyages = getVisibleHistoryVoyages(dataset.voyages, selectedYear, selectedPort);
  const availablePorts = annual.ports;
  const chartData = dataset.annual.map((row) => ({
    year: String(row.year),
    '검증 하역량': row.verifiedActualMt,
    '검증 항차': row.verifiedVoyageCount,
  }));

  const chooseYear = (year: HistoryYear, focus = false) => {
    setSelectedYear(year);
    setSelectedPort(ALL_PORTS);
    if (focus) tabRefs.current[HISTORY_YEARS.indexOf(year)]?.focus();
  };

  const onYearKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    chooseYear(getNextHistoryYear(selectedYear, event.key as HistoryNavigationKey), true);
  };

  return (
    <section
      className={styles.section}
      data-testid="unloading-history-section"
      aria-labelledby="unloading-history-title"
    >
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>S3 물류·통관 · 검증 이력</span>
          <h2 id="unloading-history-title">2021~2025 역사 실적</h2>
          <p className={styles.cardDesc}>구글 드라이브 하역 원자료에서 확인된 실제 하역량만 집계합니다.</p>
        </div>
        <div className={styles.telemetry}>
          <TelemetryBadge status="SYNCED" syncDate={dataset._metadata.syncDate} label="SYNCED 정제 완료" />
          <TermTooltip
            term="자료 상태"
            description="STATIC은 배포 스냅샷 전달 방식, SYNCED는 원자료 검증과 정제를 완료했다는 뜻입니다."
          />
          <span className={styles.srOnly}>
            자료 상태 설명: STATIC은 배포 스냅샷 전달 방식, SYNCED는 원자료 검증과 정제를 완료했다는 뜻입니다.
          </span>
        </div>
      </header>

      <div className={styles.chartCard}>
        <div className={styles.chartTitle}>
          <div><BarChart3 size={18} /><strong>연도별 검증 실적</strong></div>
          <span>왼쪽 하역량(MT) · 오른쪽 항차(척) · 막대 클릭 = 해당 연도 항차 상세</span>
        </div>
        <SafeResponsiveContainer height={300} className={styles.chart}>
          <ComposedChart
            data={chartData}
            margin={{ top: 16, right: 14, left: 4, bottom: 4 }}
            style={{ cursor: 'pointer' }}
            onClick={(state) => {
              // P2 클릭 문법: 차트의 연도 클릭 → 아래 연도 탭·항차 표(원천 레코드)로 드릴
              const year = Number(state?.activeLabel);
              if (HISTORY_YEARS.includes(year as HistoryYear)) chooseYear(year as HistoryYear, true);
            }}
          >
            <CartesianGrid stroke="rgba(var(--w-slate-400-rgb), .14)" strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fill: 'var(--w-slate-300)', fontSize: 12 }} />
            <YAxis yAxisId="mt" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}천`} />
            <YAxis yAxisId="count" orientation="right" tick={{ fill: 'var(--w-slate-400)', fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#303c46', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: 10, color: '#fff' }}
              formatter={(value, name) => name === '검증 하역량' ? [`${formatMt(Number(value))} MT`, name] : [`${value}척`, name]}
              labelFormatter={(label) => `${label}년`}
            />
            <Legend />
            <Bar yAxisId="mt" dataKey="검증 하역량" fill={CHART_RANK} radius={[5, 5, 0, 0]} isAnimationActive={false} />
            <Line yAxisId="count" dataKey="검증 항차" stroke="var(--w-amber-500)" strokeWidth={3} dot={{ fill: 'var(--w-amber-500)', r: 4 }} isAnimationActive={false} />
          </ComposedChart>
        </SafeResponsiveContainer>
        <ul className={styles.srOnly}>
          {dataset.annual.map((row) => <li key={row.year}>{row.year}년 검증 하역량 {formatMt(row.verifiedActualMt)}MT, 검증 항차 {row.verifiedVoyageCount}척</li>)}
        </ul>
      </div>

      <div className={styles.yearTabs} role="tablist" aria-label="하역 실적 연도 선택">
        {HISTORY_YEARS.map((year, index) => (
          <button
            key={year}
            ref={(element) => { tabRefs.current[index] = element; }}
            id={`unloading-history-tab-${year}`}
            data-testid={`history-year-${year}`}
            className={`${styles.yearTab} ${selectedYear === year ? styles.yearTabActive : ''}`}
            type="button"
            role="tab"
            aria-selected={selectedYear === year}
            aria-controls="unloading-history-panel"
            tabIndex={selectedYear === year ? 0 : -1}
            onClick={() => chooseYear(year)}
            onKeyDown={onYearKeyDown}
          >
            {year}년
          </button>
        ))}
      </div>

      <div id="unloading-history-panel" data-testid="unloading-history-panel" role="tabpanel" aria-labelledby={`unloading-history-tab-${selectedYear}`}>
        <div className={styles.kpiGrid}>
          <article className={styles.kpiCard}>
            <Database size={17} /><span>검증 하역량</span>
            <strong data-testid="history-kpi-actual">{formatMt(annual.verifiedActualMt)} MT</strong>
            <small>{annual.isMinimumVerifiedTotal ? '검증된 최소치 · 미확인 항차 제외' : '검증 완료 항차 합계'}</small>
          </article>
          <article className={styles.kpiCard}>
            <Ship size={17} /><span>검증·전체 항차</span>
            <strong>{annual.verifiedVoyageCount}척 / {annual.candidateVoyageCount}척</strong>
            <small>부분 {annual.partialCount}척 · 미확인 {annual.unverifiedCount}척</small>
          </article>
          <article className={styles.kpiCard}>
            <TrendingUp size={17} /><span>항차당 평균</span>
            <strong>{formatMt(annual.averageVerifiedMt)} MT</strong>
            <small>검증 항차 기준</small>
          </article>
          <article className={styles.kpiCard}>
            <MapPinned size={17} /><span>확인 항만</span>
            <strong>{annual.portCount}곳</strong>
            <small>{annual.ports.map((port) => port.nameKo).join(' · ') || '항만 미확인'}</small>
          </article>
        </div>

        <div className={styles.portFilters} aria-label="항만 필터">
          <button type="button" className={styles.portButton} aria-pressed={selectedPort === ALL_PORTS} onClick={() => setSelectedPort(ALL_PORTS)}>전체 항만</button>
          {availablePorts.map((port) => (
            <button
              key={port.code}
              type="button"
              className={styles.portButton}
              data-testid={`history-port-${port.code}`}
              aria-pressed={selectedPort === port.code}
              onClick={() => setSelectedPort(port.code)}
            >
              {port.nameKo}
            </button>
          ))}
        </div>

        {voyages.length === 0 ? (
          <p className={styles.empty}>선택한 조건에 해당하는 항차가 없습니다.</p>
        ) : (
          <>
            <div className={styles.desktopTable}>
              <table>
                <thead><tr><th>운반선</th><th>기간</th><th>항만</th><th>선택연도 실제량</th><th>검증 상태</th><th>근거</th></tr></thead>
                <tbody>
                  {voyages.map((voyage) => {
                    const actual = getVoyageActualForYear(voyage, selectedYear);
                    const ports = getVoyagePortsForYear(voyage, selectedYear);
                    return (
                      <tr key={voyage.voyageId}>
                        <th scope="row">{voyage.vessel.canonicalName}</th>
                        <td>{formatDate(voyage.period.startDate)} ~ {formatDate(voyage.period.endDate)}</td>
                        <td>{ports.map((port) => port.nameKo).join(' · ') || '항만 미확인'}</td>
                        <td>{actual === null ? '미확인' : `${formatMt(actual)} MT`}<small>{yearBasisLabel(voyage, selectedYear)}</small></td>
                        <td><span className={`${styles.status} ${styles[voyage.verification]}`}>{statusLabel(voyage)}</span></td>
                        <td>{voyage.evidenceDocumentCount}건</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className={styles.mobileList}>
              {voyages.map((voyage) => {
                const actual = getVoyageActualForYear(voyage, selectedYear);
                const ports = getVoyagePortsForYear(voyage, selectedYear);
                return (
                  <article className={styles.voyageCard} key={voyage.voyageId}>
                    <h3>{voyage.vessel.canonicalName}</h3>
                    <p>{formatDate(voyage.period.startDate)} ~ {formatDate(voyage.period.endDate)}</p>
                    <dl>
                      <div><dt>항만</dt><dd>{ports.map((port) => port.nameKo).join(' · ') || '항만 미확인'}</dd></div>
                      <div>
                        <dt>실제량</dt>
                        <dd>
                          {actual === null ? '미확인' : `${formatMt(actual)} MT`}
                          <small>{yearBasisLabel(voyage, selectedYear)}</small>
                        </dd>
                      </div>
                      <div><dt>상태</dt><dd>{statusLabel(voyage)}</dd></div>
                      <div><dt>근거</dt><dd>{voyage.evidenceDocumentCount}건</dd></div>
                    </dl>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>

      <TakeawayBox
        situation={`${selectedYear}년 검증 완료 ${annual.verifiedVoyageCount}항차의 실제 하역량은 ${formatMt(annual.verifiedActualMt)} MT입니다. 부분·미확인 항차는 합계에서 제외했습니다.`}
        takeaway="항만별 처리량과 연도경계 배분량을 현재 선박 배치의 용량·지연 리스크 검토 기준으로 삼습니다. 부분·미확인 항차는 확정 의사결정 분모에서 제외합니다."
        source="구글 드라이브 하역업무 정제본(2021~2025)"
      />
    </section>
  );
}

export default function UnloadingHistory() {
  const [retryKey, setRetryKey] = useState(0);
  const [state, setState] = useState<HistoryLoadState>({ kind: 'loading' });

  useEffect(() => {
    let requestController: AbortController | null = null;

    const loadHistory = () => {
      requestController?.abort();
      const controller = new AbortController();
      requestController = controller;

      fetch('/api/unloading-history', { cache: 'no-store', signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error(`history API ${response.status}`);
          const payload: unknown = await response.json();
          const decoded = decodeUnloadingHistoryResponse(payload);
          if (decoded === null) throw new Error('invalid history response');
          setState((current) => reduceHistoryLoadState(current, {
            type: 'success',
            dataset: decoded,
          }));
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return;
          setState((current) => reduceHistoryLoadState(current, { type: 'failure' }));
        });
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') loadHistory();
    };

    loadHistory();
    window.addEventListener('focus', loadHistory);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      requestController?.abort();
      window.removeEventListener('focus', loadHistory);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [retryKey]);

  if (state.kind === 'loading') {
    return <HistorySectionState text="과거 실적을 불러오는 중입니다." />;
  }
  if (state.kind === 'error') {
    return (
      <HistorySectionState
        text="과거 이력을 불러오지 못했습니다. 2026 운영 현황은 계속 사용할 수 있습니다."
        action={(
          <button
            className={styles.retryButton}
            type="button"
            onClick={() => {
              setState((current) => reduceHistoryLoadState(current, { type: 'retry' }));
              setRetryKey((key) => key + 1);
            }}
          >
            다시 시도
          </button>
        )}
      />
    );
  }
  return <UnloadingHistoryView dataset={state.dataset} />;
}
