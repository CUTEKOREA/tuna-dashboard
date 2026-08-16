'use client';

import { useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  Anchor,
  Factory,
  LayoutDashboard,
  Ship,
  ShieldCheck,
  TrendingUp,
  Warehouse,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceDot,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getGmtsDashboard, type GmtsVesselRecord } from '@/lib/data/gmts';
import {
  buildGmtsPresentation,
  type GmtsCanneryTrendPoint,
  type GmtsMonthlyVolumePoint,
  type GmtsPortTrendPoint,
  type GmtsPresentation,
  type GmtsPriceTrendPoint,
} from '@/lib/gmts-presentation';
import { TelemetryBadge } from '../TelemetryBadge';
import TermTooltip from '../TermTooltip';
import WidgetCard from '../WidgetCard';
import HeroZone from '../v2/HeroZone';
import PillTabs, { type PillTab } from '../v2/PillTabs';
import styles from './GmtsDashboard.module.css';

const GMTS_DATA = getGmtsDashboard();
const GMTS_VIEW = buildGmtsPresentation(GMTS_DATA);

export type GmtsTabKey = 'summary' | 'port' | 'cannery' | 'price-volume' | 'quality';

interface GmtsDashboardProps {
  heroOnly?: boolean;
  initialTab?: GmtsTabKey;
}

interface ChartTooltipProps<Row> {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{
    color?: string;
    name?: string | number;
    value?: number | string | ReadonlyArray<number | string>;
    payload?: Row;
  }>;
}

export interface ChartSizeProps {
  width?: number;
  height?: number;
}

interface PipelineRow {
  lane: '하역 완료' | '입항 예정';
  record: GmtsVesselRecord;
}

const GMTS_TABS: PillTab[] = [
  { key: 'summary', label: '운영 요약', icon: <LayoutDashboard size={15} /> },
  { key: 'port', label: '항만·선박', icon: <Ship size={15} /> },
  { key: 'cannery', label: '공장·재고', icon: <Factory size={15} /> },
  { key: 'price-volume', label: '가격·반입', icon: <TrendingUp size={15} /> },
  { key: 'quality', label: '데이터 품질', icon: <ShieldCheck size={15} /> },
];

const STATIC_TELEMETRY = {
  status: GMTS_DATA.metadata.status,
  syncDate: GMTS_VIEW.hero.report.reportDate,
  label: '정적',
} as const;

const SOURCE_RANGE = [
  'GMTS 주간보고',
  `${formatDisplayDate(GMTS_VIEW.sourceSummary.coverageStart)}~${formatDisplayDate(GMTS_VIEW.sourceSummary.coverageEnd)}`,
  `${GMTS_VIEW.sourceSummary.reportCount}건`,
].join(' · ');

function formatDisplayDate(value: string): string {
  return value.replaceAll('-', '.');
}

function formatShortDate(value: string): string {
  const [, month = '', day = ''] = value.split('-');
  return month && day ? `${Number(month)}/${Number(day)}` : value;
}

function formatNumber(value: number | null, digits = 0): string {
  if (value === null) return '미기재';
  return value.toLocaleString('ko-KR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatCount(value: number | null): string {
  return value === null ? '미확정' : `${value.toLocaleString('ko-KR')}척`;
}

function formatPrice(value: number | null): string {
  return value === null ? '미확정' : `$${value.toLocaleString('ko-KR')}`;
}

function formatPercent(value: number | null, digits = 0): string {
  return value === null ? '미확정' : `${value.toFixed(digits)}%`;
}

function formatDelta(value: number | null): string {
  if (value === null) return '비교 미확정';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function comparablePeriodLabel(view: GmtsPresentation): string {
  const { currentYear, comparableMonthIndexes } = view.comparisons.volume;
  if (currentYear === null || comparableMonthIndexes.length === 0) return '비교 기간 미확정';

  const months = comparableMonthIndexes.map((index) => index + 1);
  const isContiguous = months.every((month, index) => index === 0 || month === months[index - 1] + 1);
  const monthLabel = isContiguous
    ? months.length === 1
      ? `${months[0]}월`
      : `${months[0]}~${months.at(-1)}월`
    : `${months.join('·')}월`;
  return `${currentYear}년 ${monthLabel}`;
}

function tooltipRow<Row>(payload: ChartTooltipProps<Row>['payload']): Row | undefined {
  return payload?.find((entry) => entry.payload)?.payload;
}

function GmtsHero() {
  const activeLine = GMTS_VIEW.hero.activeVessels.tone === 'warning'
    ? `하역 중 선언 건수: 자료 ${GMTS_VIEW.hero.activeVessels.value}`
    : `하역 중 선언 건수: ${GMTS_VIEW.hero.activeVessels.value}`;

  return (
    <HeroZone
      className={styles.hero}
      variant="kpi"
      title="GMTS 제너럴산토스 주간보고"
      subtitle={[
        GMTS_VIEW.hero.report.reportDateLabel,
        GMTS_VIEW.hero.report.operationalAsOfLabel,
        GMTS_VIEW.hero.report.archiveLabel,
      ].join(' · ')}
      primaryKpi={{
        label: '생산 가동률',
        value: GMTS_DATA.latest.canneryTotal.productionUtilizationPct,
        unit: '(%)',
      }}
      secondaryKpis={[
        {
          label: '하역 완료 관찰',
          value: GMTS_DATA.latest.port.completed.recordCount,
          unit: '(척)',
        },
        {
          label: '입항 예정 관찰',
          value: GMTS_DATA.latest.port.incoming.recordCount,
          unit: '(척)',
        },
        {
          label: '창고 이용률',
          value: GMTS_DATA.latest.canneryTotal.storageUtilizationPct,
          unit: '(%)',
        },
      ]}
      warning={{
        title: '자료 미확정',
        lines: [
          activeLine,
          `가격 ${GMTS_VIEW.hero.gspPrice.unit} · 반입량 ${GMTS_VIEW.hero.ytdVolume.unit}`,
        ],
      }}
      minHeight={340}
    >
      <div className={styles.heroContext}>
        <TermTooltip
          term="GMTS"
          description="원문의 작성 주체 약어입니다. 풀네임은 원문에 기재되지 않았습니다."
        />
        <TelemetryBadge {...STATIC_TELEMETRY} />
      </div>
    </HeroZone>
  );
}

function SummaryMetric({
  label,
  value,
  note,
  warning = false,
}: {
  label: string;
  value: string;
  note?: string;
  warning?: boolean;
}) {
  return (
    <article className={`${styles.summaryMetric} ${warning ? styles.warningMetric : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </article>
  );
}

function SummaryPanel() {
  const comparableLabel = comparablePeriodLabel(GMTS_VIEW);
  const decisions = [
    { title: '항만 판단', body: GMTS_VIEW.insights.port.action },
    { title: '공장 판단', body: GMTS_VIEW.insights.cannery.action },
    { title: '가격·반입 판단', body: GMTS_VIEW.insights.priceVolume.action },
  ];

  return (
    <div className={styles.panelStack}>
      <section className={styles.decisionSection} aria-labelledby="gmts-decision-title">
        <header className={styles.sectionHeader}>
          <div>
            <span className={styles.eyebrow}>오늘의 운영 판단</span>
            <h2 id="gmts-decision-title">확정값과 미확정값을 분리한 최신 판단</h2>
          </div>
          <TelemetryBadge {...STATIC_TELEMETRY} />
        </header>
        <div className={styles.decisionStrip}>
          {decisions.map((decision) => (
            <article key={decision.title}>
              <h3>{decision.title}</h3>
              <p>{decision.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.summaryComposition} aria-labelledby="gmts-summary-title">
        <article className={styles.featureMetric}>
          <div className={styles.featureLabel}>
            <TermTooltip
              term="제너럴산토스(Gensan)"
              description="원문의 지역 표시명입니다. 반입량 원문에는 단위가 기재되지 않았습니다."
            />
            <span>{comparableLabel}</span>
          </div>
          <h2 id="gmts-summary-title">비교 가능 누적 반입량</h2>
          <strong>{GMTS_VIEW.hero.ytdVolume.value}</strong>
          <p>{GMTS_VIEW.hero.ytdVolume.unit}</p>
          <small>
            {GMTS_VIEW.hero.ytdVolume.priorYear ?? '직전 연도'}년 동기 대비{' '}
            {formatDelta(GMTS_VIEW.hero.ytdVolume.deltaPct)}
          </small>
        </article>

        <div className={styles.summaryMetricGrid}>
          <SummaryMetric
            label="하역 중 선언"
            value={GMTS_VIEW.hero.activeVessels.value}
            note={`관찰 행 ${GMTS_DATA.latest.port.active.recordCount}건`}
            warning={GMTS_VIEW.hero.activeVessels.tone === 'warning'}
          />
          <SummaryMetric
            label="하역 완료 선언"
            value={GMTS_VIEW.hero.completedVessels.value}
            note={`관찰 행 ${GMTS_DATA.latest.port.completed.recordCount}건`}
            warning={GMTS_VIEW.hero.completedVessels.tone === 'warning'}
          />
          <SummaryMetric
            label="입항 예정 선언"
            value={GMTS_VIEW.hero.incomingVessels.value}
            note={`관찰 행 ${GMTS_DATA.latest.port.incoming.recordCount}건`}
            warning={GMTS_VIEW.hero.incomingVessels.tone === 'warning'}
          />
          <SummaryMetric
            label="생산 가동률"
            value={`${GMTS_VIEW.hero.productionUtilization.value}${GMTS_VIEW.hero.productionUtilization.unit}`}
            note={`${formatNumber(GMTS_DATA.latest.canneryTotal.currentDailyProductionMt)} / ${formatNumber(GMTS_DATA.latest.canneryTotal.maxDailyProductionMt)} MT`}
          />
          <SummaryMetric
            label="창고 이용률"
            value={`${GMTS_VIEW.hero.storageUtilization.value}${GMTS_VIEW.hero.storageUtilization.unit}`}
            note={`${formatNumber(GMTS_DATA.latest.canneryTotal.currentStockMt)} / ${formatNumber(GMTS_DATA.latest.canneryTotal.storageCapacityMt)} MT`}
          />
          <SummaryMetric
            label="비특혜 가격"
            value={GMTS_VIEW.hero.nonGspPrice.value}
            note={GMTS_VIEW.hero.nonGspPrice.unit}
          />
          <SummaryMetric
            label="특혜 가격"
            value={GMTS_VIEW.hero.gspPrice.value}
            note={GMTS_VIEW.hero.gspPrice.unit}
          />
        </div>
      </section>

      <aside className={styles.unitNotice} aria-label="원문 단위 주의">
        <AlertTriangle size={18} aria-hidden="true" />
        <div>
          <TermTooltip
            term="GSP·Non-GSP"
            description="원문의 가격 제도 구분 약어입니다. 풀네임을 추정하지 않고 원문 표기를 보존합니다."
          />
          <p>
            가격은 {GMTS_VIEW.hero.gspPrice.unit}, 제너럴산토스 반입량은{' '}
            {GMTS_VIEW.hero.ytdVolume.unit}입니다.
          </p>
        </div>
      </aside>
    </div>
  );
}

function PortTooltip({ active, payload }: ChartTooltipProps<GmtsPortTrendPoint>) {
  const row = tooltipRow(payload);
  if (!active || !row) return null;

  const lanes = [
    ['하역 중', row.activeDeclaredCount, row.activeRecordCount],
    ['하역 완료', row.completedDeclaredCount, row.completedRecordCount],
    ['입항 예정', row.incomingDeclaredCount, row.incomingRecordCount],
  ] as const;

  return (
    <div className={styles.chartTooltip}>
      <strong>{formatDisplayDate(row.reportDate)}</strong>
      <dl>
        {lanes.map(([label, declared, observed]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>선언 {formatCount(declared)} · 관찰 {observed}행</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function PortFlowChart({ width, height }: ChartSizeProps) {
  return (
    <ComposedChart
      width={width}
      height={height}
      data={GMTS_VIEW.portTrend}
      margin={{ top: 12, right: 18, left: 0, bottom: 12 }}
      role="img"
      aria-label={`${GMTS_VIEW.sourceSummary.reportCount}건 보고의 하역 중, 하역 완료, 입항 예정 원문 선언 건수 추세`}
      accessibilityLayer
    >
      <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="reportDate"
        tickFormatter={formatShortDate}
        minTickGap={20}
        tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
        axisLine={{ stroke: 'var(--chart-grid)' }}
        tickLine={false}
      />
      <YAxis
        allowDecimals={false}
        width={42}
        tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        label={{ value: '원문 선언(척)', angle: -90, position: 'insideLeft', fill: 'var(--chart-axis)' }}
      />
      <RechartsTooltip content={<PortTooltip />} filterNull={false} isAnimationActive={false} />
      <Legend verticalAlign="top" height={34} />
      <Line
        type="monotone"
        dataKey="activeDeclaredCount"
        name="하역 중 선언"
        stroke="var(--chart-s3)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      <Line
        type="monotone"
        dataKey="completedDeclaredCount"
        name="하역 완료 선언"
        stroke="var(--chart-s1)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      <Line
        type="monotone"
        dataKey="incomingDeclaredCount"
        name="입항 예정 선언"
        stroke="var(--chart-s8)"
        strokeWidth={2}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
    </ComposedChart>
  );
}

function ObservedRowsContext() {
  const lanes = [
    ['하역 중', GMTS_DATA.latest.port.active.declaredCount, GMTS_DATA.latest.port.active.recordCount],
    ['하역 완료', GMTS_DATA.latest.port.completed.declaredCount, GMTS_DATA.latest.port.completed.recordCount],
    ['입항 예정', GMTS_DATA.latest.port.incoming.declaredCount, GMTS_DATA.latest.port.incoming.recordCount],
  ] as const;

  return (
    <div className={styles.observedContext} aria-label="최신 선언 건수와 관찰 행 비교">
      {lanes.map(([label, declared, observed]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>선언 {formatCount(declared)}</strong>
          <small>관찰 행 {observed}건</small>
        </div>
      ))}
    </div>
  );
}

function normalizedVesselDates(record: GmtsVesselRecord): string {
  const values: string[] = [];
  if (record.dates.arrived.value) values.push(`입항 ${formatDisplayDate(record.dates.arrived.value)}`);
  if (record.dates.unloadingStarted.value) {
    values.push(`하역 시작 ${formatDisplayDate(record.dates.unloadingStarted.value)}`);
  }
  if (record.dates.etd.value) values.push(`출항 ${formatDisplayDate(record.dates.etd.value)}`);
  if (record.dates.etaStart.value) {
    const end = record.dates.etaEnd.value;
    values.push(
      end && end !== record.dates.etaStart.value
        ? `입항 예정 ${formatDisplayDate(record.dates.etaStart.value)}~${formatDisplayDate(end)}`
        : `입항 예정 ${formatDisplayDate(record.dates.etaStart.value)}`,
    );
  }
  return values.join(' · ') || '일자 미기재';
}

function rawVesselDates(record: GmtsVesselRecord): string {
  const rawValues = Array.from(new Set([
    record.dates.arrived.rawText,
    record.dates.unloadingStarted.rawText,
    record.dates.etd.rawText,
    record.dates.etaStart.rawText,
    record.dates.etaEnd.rawText,
  ].filter((value): value is string => Boolean(value))));
  return rawValues.length > 0 ? `원문 일자: ${rawValues.join(' · ')}` : '원문 일자 미기재';
}

function VesselPipelineTable() {
  const rows: PipelineRow[] = [
    ...GMTS_VIEW.latestPort.completed.records.map((record) => ({ lane: '하역 완료' as const, record })),
    ...GMTS_VIEW.latestPort.incoming.records.map((record) => ({ lane: '입항 예정' as const, record })),
  ];

  if (rows.length === 0) {
    return <p className={styles.inlineEmpty}>최신 보고에 표시할 선박 행이 없습니다.</p>;
  }

  return (
    <div
      className={`${styles.tableScroll} ${styles.pipelineScroll}`}
      role="region"
      aria-label="최신 선박 파이프라인 표"
      tabIndex={0}
    >
      <table className={`${styles.dataTable} ${styles.pipelineTable}`}>
        <caption>최신 보고 선박별 화물·제너럴산토스 명시 배정·정규화 일자</caption>
        <thead>
          <tr>
            <th scope="col">선박</th>
            <th scope="col">트레이더</th>
            <th scope="col">표시 총화물(MT)</th>
            <th scope="col">제너럴산토스 명시 배정(MT)</th>
            <th scope="col">정규화 일자</th>
            <th scope="col">수하인</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ lane, record }) => (
            <tr key={`${lane}-${record.sourceIdentifier}`}>
              <th scope="row" data-label="선박">
                <span className={styles.laneChip}>{lane}</span>
                <strong>{record.displayName}</strong>
                <small>{record.sourceIdentifier}</small>
              </th>
              <td data-label="트레이더">{record.traders.join(' · ') || '미기재'}</td>
              <td data-label="표시 총화물">{formatNumber(record.cargo, 3)}</td>
              <td data-label="명시 배정">
                {record.gensanAllocation === null
                  ? '명시 없음'
                  : formatNumber(record.gensanAllocation, 3)}
              </td>
              <td data-label="정규화 일자">
                <span title={rawVesselDates(record)}>{normalizedVesselDates(record)}</span>
              </td>
              <td data-label="수하인">{record.consignees.join(' · ') || '미기재'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PortPanel() {
  return (
    <div className={styles.widgetGrid} data-gmts-widget-grid="port">
      <WidgetCard
        id="gmts-port-flow"
        title="주간 선박 흐름"
        icon={Anchor}
        iconColor="#509ee3"
        pillar="S3"
        unit="(척)"
        cardDesc={`${GMTS_VIEW.sourceSummary.reportCount}건 GMTS 주간보고의 원문 선언 건수 추세와 관찰 선박 행 수를 분리 비교`}
        telemetry={STATIC_TELEMETRY}
        chart={<PortFlowChart />}
        chartHeight={330}
        customBody={<ObservedRowsContext />}
        takeaway={{
          situation: GMTS_VIEW.insights.port.situation,
          actionPlan: GMTS_VIEW.insights.port.action,
          source: SOURCE_RANGE,
        }}
      />
      <WidgetCard
        id="gmts-vessel-pipeline"
        title="최신 선박 파이프라인"
        icon={Ship}
        iconColor="#509ee3"
        termTooltip={{
          term: 'Gensan',
          description: '원문의 제너럴산토스 표시명입니다. 전체 화물과 명시 배정량을 분리합니다.',
        }}
        pillar="S3"
        unit="(MT·일자)"
        cardDesc="최신 보고의 선박별 화물·제너럴산토스 명시 배정·정규화 일자"
        telemetry={STATIC_TELEMETRY}
        customBody={<VesselPipelineTable />}
        takeaway={{
          situation: GMTS_VIEW.insights.port.situation,
          actionPlan: GMTS_VIEW.insights.port.action,
          source: SOURCE_RANGE,
        }}
      />
    </div>
  );
}

function CanneryTooltip({ active, payload }: ChartTooltipProps<GmtsCanneryTrendPoint>) {
  const row = tooltipRow(payload);
  if (!active || !row) return null;

  return (
    <div className={styles.chartTooltip}>
      <strong>{formatDisplayDate(row.reportDate)}</strong>
      <dl>
        <div><dt>생산 가동률</dt><dd>{formatPercent(row.productionUtilizationPct)}</dd></div>
        <div>
          <dt>일생산</dt>
          <dd>{formatNumber(row.currentDailyProductionMt)} / {formatNumber(row.maxDailyProductionMt)} MT</dd>
        </div>
        <div><dt>창고 이용률</dt><dd>{formatPercent(row.storageUtilizationPct)}</dd></div>
        <div>
          <dt>냉동 재고</dt>
          <dd>{formatNumber(row.currentStockMt)} / {formatNumber(row.storageCapacityMt)} MT</dd>
        </div>
        <div><dt>처리일수</dt><dd>{formatNumber(row.reportedProcessingDays)}일</dd></div>
      </dl>
    </div>
  );
}

export function CanneryUtilizationChart({ width, height }: ChartSizeProps) {
  return (
    <ComposedChart
      width={width}
      height={height}
      data={GMTS_VIEW.canneryTrend}
      margin={{ top: 12, right: 18, left: 0, bottom: 12 }}
      role="img"
      aria-label={`${GMTS_VIEW.sourceSummary.reportCount}건 보고의 생산 가동률과 냉동창고 이용률 비교`}
      accessibilityLayer
    >
      <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="reportDate"
        tickFormatter={formatShortDate}
        minTickGap={20}
        tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
        axisLine={{ stroke: 'var(--chart-grid)' }}
        tickLine={false}
      />
      <YAxis
        domain={[0, 'auto']}
        width={42}
        tickFormatter={(value: number) => `${value}%`}
        tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        label={{ value: '이용률(%)', angle: -90, position: 'insideLeft', fill: 'var(--chart-axis)' }}
      />
      <RechartsTooltip content={<CanneryTooltip />} isAnimationActive={false} />
      <Legend verticalAlign="top" height={34} />
      <Line
        type="monotone"
        dataKey="productionUtilizationPct"
        name="생산 가동률"
        stroke="var(--chart-s1)"
        strokeWidth={2.5}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      <Line
        type="monotone"
        dataKey="storageUtilizationPct"
        name="창고 이용률"
        stroke="var(--chart-s8)"
        strokeWidth={2.5}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
    </ComposedChart>
  );
}

function CanneryKpiSummary() {
  const items = [
    {
      label: '최신 일생산',
      value: `${formatNumber(GMTS_DATA.latest.canneryTotal.currentDailyProductionMt)} / ${formatNumber(GMTS_DATA.latest.canneryTotal.maxDailyProductionMt)} MT`,
    },
    {
      label: '최신 냉동 재고',
      value: `${formatNumber(GMTS_DATA.latest.canneryTotal.currentStockMt)} / ${formatNumber(GMTS_DATA.latest.canneryTotal.storageCapacityMt)} MT`,
    },
  ];

  return (
    <div className={styles.canneryKpiGrid} aria-label="최신 생산과 냉동 재고 요약">
      {items.map((item) => (
        <article key={item.label} className={styles.canneryKpi} data-gmts-kpi>
          <span data-gmts-kpi-label>{item.label}</span>
          <strong data-gmts-kpi-value>{item.value}</strong>
        </article>
      ))}
    </div>
  );
}

function CanneryTable() {
  return (
    <div className={styles.tableScroll} role="region" aria-label="공장별 원어 압력 표" tabIndex={0}>
      <table className={styles.dataTable}>
        <caption>최신 보고 7개 공장 생산·재고·처리일수 원문 대조</caption>
        <thead>
          <tr>
            <th scope="col">공장</th>
            <th scope="col">일생산(MT)</th>
            <th scope="col">생산 가동률(%)</th>
            <th scope="col">재고(MT)</th>
            <th scope="col">창고 이용률(%)</th>
            <th scope="col">처리일수(일)</th>
            <th scope="col">원문 대조</th>
          </tr>
        </thead>
        <tbody>
          {GMTS_VIEW.latestCanneries.map((cannery) => (
            <tr key={cannery.name} className={cannery.requiresSourceCheck ? styles.warningRow : undefined}>
              <th scope="row">{cannery.name}</th>
              <td>{formatNumber(cannery.currentProductionMt)} / {formatNumber(cannery.maximumProductionMt)}</td>
              <td>{formatPercent(cannery.productionUtilizationPercent)}</td>
              <td>{formatNumber(cannery.currentStockMt)} / {formatNumber(cannery.maximumCapacityMt)}</td>
              <td>{formatPercent(cannery.storageUtilizationPercent)}</td>
              <td>{formatNumber(cannery.processingDays)}</td>
              <td>
                <span className={cannery.requiresSourceCheck ? styles.warningChip : styles.neutralChip}>
                  {cannery.requiresSourceCheck ? '원문 확인 필요' : '원문 대조'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CanneryPanel() {
  return (
    <div className={styles.widgetGrid} data-gmts-widget-grid="cannery">
      <WidgetCard
        id="gmts-cannery-utilization"
        title="생산·창고 이용률"
        icon={Warehouse}
        iconColor="#509ee3"
        pillar="S2"
        unit="(%, MT)"
        cardDesc={`${GMTS_VIEW.sourceSummary.reportCount}건 GMTS 주간보고의 생산 가동률과 냉동창고 이용률 주간 비교`}
        telemetry={STATIC_TELEMETRY}
        chart={<CanneryUtilizationChart />}
        chartHeight={330}
        customBody={<CanneryKpiSummary />}
        takeaway={{
          situation: GMTS_VIEW.insights.cannery.situation,
          actionPlan: GMTS_VIEW.insights.cannery.action,
          source: SOURCE_RANGE,
        }}
      />
      <WidgetCard
        id="gmts-cannery-pressure"
        title="공장별 원어 압력"
        icon={Factory}
        iconColor="#509ee3"
        pillar="S2"
        unit="(MT·%·일)"
        cardDesc="최신 보고의 7개 공장 생산·재고·처리일수 원문 대조"
        telemetry={STATIC_TELEMETRY}
        customBody={<CanneryTable />}
        takeaway={{
          situation: GMTS_VIEW.insights.cannery.situation,
          actionPlan: GMTS_VIEW.insights.cannery.action,
          source: SOURCE_RANGE,
        }}
      />
    </div>
  );
}

function PriceTooltip({ active, payload }: ChartTooltipProps<GmtsPriceTrendPoint>) {
  const row = tooltipRow(payload);
  if (!active || !row) return null;

  return (
    <div className={styles.chartTooltip}>
      <strong>{formatDisplayDate(row.reportDate)}</strong>
      <dl>
        <div>
          <dt>비특혜 가격</dt>
          <dd>{formatPrice(row.nonGspAmount)} · {row.nonGspQualifierLabel}</dd>
        </div>
        <div>
          <dt>특혜 가격</dt>
          <dd>{formatPrice(row.gspAmount)} · {row.gspQualifierLabel}</dd>
        </div>
      </dl>
      <p>{row.unit}</p>
    </div>
  );
}

export function PriceTrendChart({ width, height }: ChartSizeProps) {
  return (
    <ComposedChart
      width={width}
      height={height}
      data={GMTS_VIEW.priceTrend}
      margin={{ top: 12, right: 18, left: 8, bottom: 12 }}
      role="img"
      aria-label={`${GMTS_VIEW.sourceSummary.reportCount}건 보고의 특혜와 비특혜 가격 추세 및 원문 공란`}
      accessibilityLayer
    >
      <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="reportDate"
        tickFormatter={formatShortDate}
        minTickGap={20}
        tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
        axisLine={{ stroke: 'var(--chart-grid)' }}
        tickLine={false}
      />
      <YAxis
        width={58}
        tickFormatter={(value: number) => `$${value.toLocaleString('ko-KR')}`}
        tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        label={{ value: '$·원문 분모 미기재', angle: -90, position: 'insideLeft', fill: 'var(--chart-axis)' }}
      />
      <RechartsTooltip content={<PriceTooltip />} filterNull={false} isAnimationActive={false} />
      <Legend verticalAlign="top" height={34} />
      <Line
        type="monotone"
        dataKey="nonGspAmount"
        name="비특혜 가격"
        stroke="var(--chart-s1)"
        strokeWidth={2.5}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
      <Line
        type="monotone"
        dataKey="gspAmount"
        name="특혜 가격"
        stroke="var(--chart-s8)"
        strokeWidth={2.5}
        dot={false}
        connectNulls={false}
        isAnimationActive={false}
      />
    </ComposedChart>
  );
}

function QualifierContext() {
  const qualifiers = Array.from(new Set(GMTS_VIEW.priceTrend.flatMap((row) => [
    row.nonGspQualifierLabel,
    row.gspQualifierLabel,
  ]))).filter((label) => label !== '호가');

  return (
    <div className={styles.qualifierContext}>
      <div>
        <span>원문 가격 한정어</span>
        <div className={styles.chipRow}>
          {qualifiers.map((label) => <span key={label}>{label}</span>)}
        </div>
      </div>
      <div>
        <span>최신 특혜 가격 차이</span>
        <strong>{formatPrice(GMTS_VIEW.comparisons.pricePremium.amount)}</strong>
        <small>{formatPercent(GMTS_VIEW.comparisons.pricePremium.pct, 2)} · {GMTS_VIEW.comparisons.pricePremium.unit}</small>
      </div>
    </div>
  );
}

function VolumeTooltip({ active, payload }: ChartTooltipProps<GmtsMonthlyVolumePoint>) {
  const row = tooltipRow(payload);
  if (!active || !row) return null;

  return (
    <div className={styles.chartTooltip}>
      <strong>{row.month}</strong>
      <dl>
        <div><dt>{row.currentYear ?? '현재 연도'}년</dt><dd>{formatNumber(row.currentValue)}</dd></div>
        <div><dt>{row.priorYear ?? '직전 연도'}년</dt><dd>{formatNumber(row.priorValue)}</dd></div>
        <div><dt>전년 동월 대비</dt><dd>{formatDelta(row.yearOverYearPct)}</dd></div>
      </dl>
      <p>{row.unit}</p>
    </div>
  );
}

export function MonthlyVolumeChart({ width, height }: ChartSizeProps) {
  const revisionRows = GMTS_VIEW.monthlyVolume.filter((row) => (
    row.currentValue !== null && row.revisions.length > 0
  ));
  const currentName = `${GMTS_VIEW.comparisons.volume.currentYear ?? '현재 연도'}년`;
  const priorName = `${GMTS_VIEW.comparisons.volume.priorYear ?? '직전 연도'}년`;

  return (
    <ComposedChart
      width={width}
      height={height}
      data={GMTS_VIEW.monthlyVolume}
      margin={{ top: 20, right: 18, left: 8, bottom: 12 }}
      role="img"
      aria-label="현재와 직전 연도 제너럴산토스 월별 반입량 및 수정 이력"
      accessibilityLayer
    >
      <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="month"
        tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
        axisLine={{ stroke: 'var(--chart-grid)' }}
        tickLine={false}
      />
      <YAxis
        width={62}
        tickFormatter={(value: number) => value.toLocaleString('ko-KR')}
        tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        label={{ value: '원문 단위 미기재', angle: -90, position: 'insideLeft', fill: 'var(--chart-axis)' }}
      />
      <RechartsTooltip content={<VolumeTooltip />} filterNull={false} isAnimationActive={false} />
      <Legend verticalAlign="top" height={34} />
      <Bar
        dataKey="currentValue"
        name={currentName}
        fill="var(--chart-s1)"
        radius={[4, 4, 0, 0]}
        isAnimationActive={false}
      />
      <Bar
        dataKey="priorValue"
        name={priorName}
        fill="var(--chart-s8)"
        radius={[4, 4, 0, 0]}
        isAnimationActive={false}
      />
      {revisionRows.map((row) => (
        <ReferenceDot
          key={`revision-${row.month}`}
          x={row.month}
          y={row.currentValue ?? 0}
          r={5}
          fill="var(--chart-s3)"
          stroke="var(--dsc-surface)"
          label={{ value: '수정', position: 'top', fill: 'var(--dsc-ink)', fontSize: 10 }}
        />
      ))}
    </ComposedChart>
  );
}

function RevisionContext() {
  const revisions = GMTS_VIEW.monthlyVolume.flatMap((row) => (
    row.revisions.map((revision) => ({ row, revision }))
  ));

  if (revisions.length === 0) {
    return <p className={styles.inlineEmpty}>표시할 반입량 수정 이력이 없습니다.</p>;
  }

  return (
    <div className={styles.revisionList} aria-label="월별 반입량 수정 이력">
      {revisions.map(({ row, revision }) => (
        <article key={`${row.month}-${revision.reportDate}`}>
          <span>원문 수정</span>
          <strong>{row.currentYear ?? '현재 연도'}년 {row.month}</strong>
          <p>
            {formatNumber(revision.previousValue)} → {formatNumber(revision.value)} ·{' '}
            {formatDisplayDate(revision.previousReportDate)} → {formatDisplayDate(revision.reportDate)}
          </p>
          <small>{row.unit}</small>
        </article>
      ))}
    </div>
  );
}

function PriceVolumePanel() {
  return (
    <div className={styles.widgetGrid} data-gmts-widget-grid="price-volume">
      <WidgetCard
        id="gmts-price-trend"
        title="GSP·Non-GSP 가격 추세"
        icon={TrendingUp}
        iconColor="#509ee3"
        termTooltip={{
          term: 'GSP·Non-GSP',
          description: '원문의 가격 제도 구분 약어입니다. 풀네임과 가격 분모를 추정하지 않습니다.',
        }}
        pillar="S1"
        unit="($·원문 분모 미기재)"
        cardDesc={`${GMTS_VIEW.sourceSummary.reportCount}건 GMTS 주간보고의 특혜·비특혜 가격과 원문 가격 한정어 추세`}
        telemetry={STATIC_TELEMETRY}
        chart={<PriceTrendChart />}
        chartHeight={330}
        customBody={<QualifierContext />}
        takeaway={{
          situation: GMTS_VIEW.insights.priceVolume.situation,
          actionPlan: GMTS_VIEW.insights.priceVolume.action,
          source: SOURCE_RANGE,
        }}
      />
      <WidgetCard
        id="gmts-monthly-volume"
        title="Gensan 월별 반입량"
        icon={Warehouse}
        iconColor="#509ee3"
        termTooltip={{
          term: 'Gensan',
          description: '원문의 제너럴산토스 표시명입니다. 반입량 단위는 원문에 기재되지 않았습니다.',
        }}
        pillar="S1"
        unit="(원문 단위 미기재)"
        cardDesc={`현재·직전 연도 월별 반입량과 원문 수정 이력 비교 (${GMTS_VIEW.comparisons.volume.currentYear ?? '현재 연도'}·${GMTS_VIEW.comparisons.volume.priorYear ?? '직전 연도'})`}
        telemetry={STATIC_TELEMETRY}
        chart={<MonthlyVolumeChart />}
        chartHeight={330}
        customBody={<RevisionContext />}
        takeaway={{
          situation: GMTS_VIEW.insights.priceVolume.situation,
          actionPlan: GMTS_VIEW.insights.priceVolume.action,
          source: SOURCE_RANGE,
        }}
      />
    </div>
  );
}

function QualityCount({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <article className={styles.qualityCount}>
      <span>{label}</span>
      <strong>{value.toLocaleString('ko-KR')}</strong>
      <small>{note}</small>
    </article>
  );
}

function QualityPanel() {
  const { qualitySummary, sourceSummary } = GMTS_VIEW;

  return (
    <div className={styles.panelStack}>
      <section className={styles.qualityRule} aria-labelledby="gmts-quality-rule-title">
        <div>
          <span className={styles.eyebrow}>확정 규칙</span>
          <h2 id="gmts-quality-rule-title">{qualitySummary.unknownRuleNotice}</h2>
        </div>
        <TelemetryBadge {...STATIC_TELEMETRY} />
      </section>

      <section className={styles.qualitySection} aria-labelledby="gmts-quality-counts-title">
        <header className={styles.sectionHeader}>
          <div>
            <span className={styles.eyebrow}>구조화된 품질 플래그</span>
            <h2 id="gmts-quality-counts-title">원문 공란·한정어·수정·용량·단위</h2>
          </div>
          <strong className={styles.totalFlag}>{qualitySummary.totalFlags.toLocaleString('ko-KR')}건</strong>
        </header>
        <div className={styles.qualityGrid}>
          <QualityCount label="선박 선언 공란" value={qualitySummary.byCode.blankDeclaredCount} note="관찰 행과 분리" />
          <QualityCount label="가격 한정어" value={qualitySummary.byCode.priceQualifier} note="공란·수준·기존 계약" />
          <QualityCount label="반입량 수정" value={qualitySummary.byCode.volumeRevision} note="이전·수정값 보존" />
          <QualityCount label="표시 용량 초과" value={qualitySummary.byCode.capacityExceeded} note="자동 정정하지 않음" />
          <QualityCount label="가격 분모 누락" value={qualitySummary.byCode.priceBasisUnitMissing} note="원문 분모 미기재" />
          <QualityCount label="반입량 단위 누락" value={qualitySummary.byCode.volumeUnitMissing} note="원문 단위 미기재" />
        </div>

        <div className={styles.qualityWarnings}>
          {qualitySummary.volumeRevisions.map((revision) => (
            <article key={`${revision.month}-${revision.reportDate}`}>
              <span>반입량 수정 이력</span>
              <strong>{revision.month}</strong>
              <p>
                {formatNumber(revision.previousValue)} → {formatNumber(revision.value)} ·{' '}
                {formatDisplayDate(revision.previousReportDate)} → {formatDisplayDate(revision.reportDate)}
              </p>
              <small>원문 단위 미기재</small>
            </article>
          ))}
          {qualitySummary.capacityExceeded.map((flag) => (
            <article key={`${flag.reportDate}-${flag.name}`} className={styles.capacityWarning}>
              <span>원문 확인 필요</span>
              <strong>{flag.name} {formatPercent(flag.storageUtilizationPercent)}</strong>
              <p>{formatDisplayDate(flag.reportDate)} 보고의 표시 용량 초과값을 자동 정정하지 않았습니다.</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.archiveSection} aria-labelledby="gmts-archive-title">
        <header className={styles.sectionHeader}>
          <div>
            <span className={styles.eyebrow}>출처 매니페스트</span>
            <h2 id="gmts-archive-title">보고서 원문 아카이브</h2>
            <p>
              {sourceSummary.reportCount}건 · {sourceSummary.pageCount}쪽 ·{' '}
              {formatDisplayDate(sourceSummary.coverageStart)}~{formatDisplayDate(sourceSummary.coverageEnd)}
            </p>
          </div>
        </header>
        {sourceSummary.sources.length === 0 ? (
          <p className={styles.inlineEmpty}>표시할 원문 보고서가 없습니다.</p>
        ) : (
          <div className={styles.archiveVisibility}>
            <div
              className={styles.tableScroll}
              role="region"
              aria-label={`GMTS 원문 보고서 ${sourceSummary.reportCount}건 목록`}
              tabIndex={0}
            >
              <table className={`${styles.dataTable} ${styles.archiveTable}`}>
                <caption>보고일·파일명·페이지 수·해시 앞 12자리</caption>
                <thead>
                  <tr>
                    <th scope="col">보고일</th>
                    <th scope="col">원문 파일명</th>
                    <th scope="col">페이지</th>
                    <th scope="col">해시 앞 12자리</th>
                  </tr>
                </thead>
                <tbody>
                  {sourceSummary.sources.map((source) => (
                    <tr key={source.sha256} data-source-report={source.reportDate}>
                      <th scope="row">{formatDisplayDate(source.reportDate)}</th>
                      <td>{source.fileName}</td>
                      <td>{source.pages.toLocaleString('ko-KR')}쪽</td>
                      <td><code>{source.sha256Prefix}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ActivePanel({ activeTab }: { activeTab: GmtsTabKey }): ReactNode {
  switch (activeTab) {
    case 'summary':
      return <SummaryPanel />;
    case 'port':
      return <PortPanel />;
    case 'cannery':
      return <CanneryPanel />;
    case 'price-volume':
      return <PriceVolumePanel />;
    case 'quality':
      return <QualityPanel />;
  }
}

export default function GmtsDashboard(
  { heroOnly = false, initialTab = 'summary' }: GmtsDashboardProps = {},
) {
  const [activeTab, setActiveTab] = useState<GmtsTabKey>(initialTab);
  const hero = <GmtsHero />;

  if (heroOnly) {
    return <div className={styles.dashboard}>{hero}</div>;
  }

  if (GMTS_DATA.weekly.length === 0) {
    return (
      <div className={styles.dashboard}>
        {hero}
        <section className={styles.emptyState} role="status">
          <h2>주간 자료가 없습니다</h2>
          <p>원문 보고서가 추가되면 정적 스냅샷을 다시 생성해 주세요.</p>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {hero}
      <PillTabs
        tabs={GMTS_TABS}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as GmtsTabKey)}
        accentFrom="var(--accent-primary)"
        className={styles.tabs}
        ariaLabel="GMTS 주간보고 업무 화면"
        tabIdPrefix="gmts-tab"
        panelIdPrefix="gmts-panel"
      />
      <section
        id={`gmts-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`gmts-tab-${activeTab}`}
        className={styles.panel}
        data-gmts-active-tab={activeTab}
      >
        <ActivePanel activeTab={activeTab} />
      </section>
    </div>
  );
}
