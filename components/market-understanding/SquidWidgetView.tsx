/**
 * 선별 오징어 위젯 한 개를 그린다.
 *
 * 참치 위젯은 전부 차트였지만 오징어 원본은 형태가 섞여 있다 — 차트 6개, 표 11개,
 * 원문 발췌 13개다. 발췌형은 억지로 차트로 만들지 않고 인용으로 보여준다.
 * 원문을 요약해 숫자로 바꾸면 그 순간 근거가 아니라 해석이 되기 때문이다.
 *
 * 색은 CSS 변수로 받아 라이트·다크 어느 쪽에서도 축·격자가 읽히게 한다.
 */
'use client';

import React, { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getSmartRotation, truncateXAxis } from '@/lib/chart-standards';
import type { SquidWidget } from '@/lib/data/squid-industry';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import styles from './TunaIndustryDashboard.module.css';

const SERIES_COLORS = [
  '#7c3aed',
  '#db2777',
  '#0ea5e9',
  '#f59e0b',
  '#059669',
  '#e11d48',
  '#64748b',
  '#c2410c',
];

const CHART_MARGIN = { top: 12, right: 16, left: 0, bottom: 8 };

/** 표에 한 번에 보여줄 행 수. 넘으면 「외 N행」으로 줄인다. */
const TABLE_ROW_CAP = 12;
/** 인용에 한 번에 보여줄 발췌 수. */
const EXCERPT_CAP = 6;

type Row = Record<string, string | number | null>;

function formatCell(value: string | number | null): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') {
    // 연도는 콤마를 찍지 않는다. 1,996년으로 보이면 읽는 사람이 멈춘다.
    if (Number.isInteger(value) && value >= 1900 && value <= 2100) return String(value);
    return value.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
  }
  return value;
}

/**
 * 차트용 행을 만든다. 원본이 `groupBy` 로 긴 형식(long)을 쓰는 경우
 * 넓은 형식(wide)으로 돌려야 Recharts 가 계열을 나눠 그린다.
 */
function pivotRows(widget: SquidWidget): { rows: Row[]; keys: string[] } {
  const xKey = widget.xKey ?? 'year';
  const series = widget.series ?? [];
  const grouped = series.find((item) => (item as { groupBy?: string }).groupBy);

  if (!grouped) {
    const keys = series.map((item) => item.key).filter(Boolean);
    return { rows: widget.data as Row[], keys };
  }

  const groupBy = (grouped as { groupBy?: string }).groupBy as string;
  const valueKey = grouped.key;
  const buckets = new Map<string, Row>();
  const keys: string[] = [];

  for (const raw of widget.data as Row[]) {
    const x = String(raw[xKey] ?? '');
    const label = String(raw[groupBy] ?? '');
    if (!x || !label) continue;
    if (!keys.includes(label)) keys.push(label);
    const bucket = buckets.get(x) ?? ({ [xKey]: raw[xKey] } as Row);
    bucket[label] = raw[valueKey] as number;
    buckets.set(x, bucket);
  }
  return { rows: [...buckets.values()], keys };
}

interface TooltipEntry {
  color?: string;
  name?: string | number;
  value?: number | string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className={styles.tooltipRow}>
          <span className={styles.tooltipDot} style={{ background: entry.color }} />
          {entry.name}
          <strong>
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
              : entry.value}
          </strong>
        </p>
      ))}
    </div>
  );
}

function ChartView({ widget, height }: { widget: SquidWidget; height: number }) {
  const animate = !useReducedMotion();
  const { rows, keys } = useMemo(() => pivotRows(widget), [widget]);
  const xKey = widget.xKey ?? 'year';

  const rotation = useMemo(
    () => getSmartRotation(rows.map((row) => row[xKey] as string)),
    [rows, xKey],
  );

  if (rows.length === 0 || keys.length === 0) {
    return <div className={styles.chartEmpty}>표시할 데이터가 없습니다</div>;
  }

  const axisProps = {
    stroke: 'var(--mu-axis)',
    tick: { fill: 'var(--mu-axis)', fontSize: 11 },
  } as const;

  const nameOf = (key: string) =>
    widget.series?.find((item) => item.key === key)?.name ?? key;

  const shared = (
    <>
      <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey={xKey}
        {...axisProps}
        tickFormatter={truncateXAxis}
        angle={rotation.angle}
        textAnchor={rotation.textAnchor as 'end' | 'middle'}
        height={rotation.angle ? 56 : 30}
        interval="preserveStartEnd"
      />
      <YAxis {...axisProps} tickFormatter={(value: number) => value.toLocaleString('ko-KR')} />
      <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--mu-grid)' }} />
      <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
    </>
  );

  if (widget.chartType === 'line') {
    return (
      <SafeResponsiveContainer width="100%" height={height}>
        <LineChart data={rows} margin={CHART_MARGIN}>
          {shared}
          {keys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={nameOf(key)}
              stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
              strokeWidth={2}
              dot={false}
              isAnimationActive={animate}
            />
          ))}
        </LineChart>
      </SafeResponsiveContainer>
    );
  }

  const stacked = widget.chartType === 'stackedBar';
  return (
    <SafeResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} margin={CHART_MARGIN}>
        {shared}
        {keys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            name={nameOf(key)}
            stackId={stacked ? 'a' : undefined}
            fill={SERIES_COLORS[index % SERIES_COLORS.length]}
            radius={stacked ? undefined : [3, 3, 0, 0]}
            isAnimationActive={animate}
          />
        ))}
      </BarChart>
    </SafeResponsiveContainer>
  );
}

function TableView({ widget }: { widget: SquidWidget }) {
  const columns = widget.columns ?? [];
  const rows = widget.data as Row[];
  if (columns.length === 0 || rows.length === 0) {
    return <div className={styles.chartEmpty}>표시할 데이터가 없습니다</div>;
  }
  const shown = rows.slice(0, TABLE_ROW_CAP);
  const hidden = rows.length - shown.length;

  return (
    <div className={styles.dataTableWrap}>
      <table className={styles.dataTable}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>{formatCell(row[column.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {hidden > 0 && <p className={styles.dataTableMore}>표에 {rows.length}행 중 {shown.length}행을 보였다. 나머지 {hidden}행은 원본에 있다.</p>}
    </div>
  );
}

function ExcerptView({ widget }: { widget: SquidWidget }) {
  const excerpts = widget.excerpts ?? [];
  if (excerpts.length === 0) {
    return <div className={styles.chartEmpty}>표시할 발췌가 없습니다</div>;
  }
  const shown = excerpts.slice(0, EXCERPT_CAP);
  const hidden = excerpts.length - shown.length;

  return (
    <div className={styles.excerptWrap}>
      {shown.map((item, index) => (
        <blockquote key={index} className={styles.excerpt}>
          <p>{item.인용}</p>
          {item.출처 && <cite className={styles.excerptCite}>{item.출처.split('/').pop()}</cite>}
        </blockquote>
      ))}
      {hidden > 0 && <p className={styles.dataTableMore}>발췌 {excerpts.length}건 중 {shown.length}건을 보였다.</p>}
    </div>
  );
}

export interface SquidWidgetViewProps {
  widget: SquidWidget;
  height?: number;
}

export default function SquidWidgetView({ widget, height = 280 }: SquidWidgetViewProps) {
  const isChart =
    widget.chartType === 'line' ||
    widget.chartType === 'bar' ||
    widget.chartType === 'stackedBar';

  return (
    <div className={styles.squidWidgetBody}>
      {isChart ? (
        <ChartView widget={widget} height={height} />
      ) : widget.chartType === 'excerpt' ? (
        <ExcerptView widget={widget} />
      ) : (
        <TableView widget={widget} />
      )}

      {/* 표 위젯인데 발췌도 함께 있으면 둘 다 보여준다. 원문이 표를 설명하기 때문이다. */}
      {!isChart && widget.chartType !== 'excerpt' && (widget.excerpts?.length ?? 0) > 0 && (
        <ExcerptView widget={widget} />
      )}

      {widget.basis && (
        <dl className={styles.basisRow}>
          <dt>측정 기준</dt>
          {Object.entries(widget.basis).map(([key, value]) => (
            <dd key={key}>
              <span>{key}</span>
              {value}
            </dd>
          ))}
        </dl>
      )}
    </div>
  );
}
