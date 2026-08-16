/**
 * 선별 위젯 한 개를 차트로 그린다.
 *
 * 원본 스키마(`tuna_real_data_v3.json`)는 chartType 과 lines/bars/areas 로 시리즈를 서술한다.
 * 여기서는 그 스키마를 타입으로 못 박아 `any` 없이 렌더한다. 색은 CSS 변수로 받아
 * 라이트·다크 어느 쪽에서도 축·격자가 읽히게 한다.
 */
'use client';

import React, { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getSmartRotation, truncateXAxis } from '@/lib/chart-standards';
import type { IndustryRow, IndustrySeries, IndustryWidget } from '@/lib/data/tuna-industry';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import styles from './TunaIndustryDashboard.module.css';

const SERIES_COLORS = [
  '#0e7490',
  '#0ea5e9',
  '#f59e0b',
  '#7c3aed',
  '#e11d48',
  '#059669',
  '#64748b',
  '#c2410c',
];

const CHART_MARGIN = { top: 12, right: 16, left: 0, bottom: 8 };

interface TooltipEntry {
  color?: string;
  name?: string | number;
  value?: number | string | ReadonlyArray<number | string>;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<TooltipEntry>;
  unit?: string | null;
}

function formatValue(value: TooltipEntry['value']): string {
  if (typeof value === 'number') return Math.round(value).toLocaleString('ko-KR');
  if (Array.isArray(value)) return value.map((v) => String(v)).join(' ~ ');
  return value === undefined || value === null ? '—' : String(value);
}

function ChartTooltip({ active, label, payload, unit }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {payload.map((entry, index) => (
        <div key={index} className={styles.tooltipRow}>
          <span className={styles.tooltipSwatch} style={{ backgroundColor: entry.color }} />
          <span className={styles.tooltipName}>{entry.name}</span>
          <strong className={styles.tooltipValue}>
            {formatValue(entry.value)}
            {unit ? ` ${unit}` : ''}
          </strong>
        </div>
      ))}
    </div>
  );
}

function formatAxisNumber(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}백만`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}천`;
  return value.toLocaleString('ko-KR');
}

/** 색까지 확정된 시리즈. 렌더 단계에서는 color 가 반드시 있어야 한다. */
interface ResolvedSeries {
  key: string;
  name: string;
  color: string;
}

/** 원본이 lines/bars/areas 중 아무것도 안 주면 x축 키를 뺀 숫자 컬럼을 시리즈로 삼는다. */
function inferSeries(rows: IndustryRow[], xKey: string): ResolvedSeries[] {
  const first = rows[0];
  if (!first) return [];
  return Object.keys(first)
    .filter((key) => key !== xKey && typeof first[key] === 'number')
    .map((key, index) => ({ key, name: key, color: SERIES_COLORS[index % SERIES_COLORS.length] }));
}

function resolveXKey(widget: IndustryWidget): string {
  if (widget.xKey) return widget.xKey;
  if (widget.xAxis) return widget.xAxis;
  const first = widget.data[0];
  if (!first) return 'name';
  const stringKey = Object.keys(first).find((key) => typeof first[key] === 'string');
  return stringKey ?? Object.keys(first)[0] ?? 'name';
}

export interface TunaIndustryChartProps {
  widget: IndustryWidget;
  height?: number;
}

export default function TunaIndustryChart({ widget, height = 280 }: TunaIndustryChartProps) {
  // 모션 감소를 요청한 사용자에게는 그리기 애니메이션을 끈다.
  const animate = !useReducedMotion();
  const xKey = resolveXKey(widget);
  const rows = widget.data;

  const { lineSeries, barSeries, areaSeries } = useMemo(() => {
    const withColor = (
      series: IndustrySeries[] | null | undefined,
      offset: number,
    ): ResolvedSeries[] =>
      (series ?? []).map((item, index) => ({
        key: item.key,
        name: item.name,
        color: item.color ?? SERIES_COLORS[(index + offset) % SERIES_COLORS.length],
      }));

    let lines = withColor(widget.lines, 0);
    let bars = withColor(widget.bars, 2);
    const areas = withColor(widget.areas, 4);

    if (lines.length === 0 && bars.length === 0 && areas.length === 0) {
      const inferred = inferSeries(rows, xKey);
      if (widget.chartType === 'line') lines = inferred;
      else bars = inferred;
    }
    return { lineSeries: lines, barSeries: bars, areaSeries: areas };
  }, [widget.lines, widget.bars, widget.areas, widget.chartType, rows, xKey]);

  const rotation = useMemo(
    () => getSmartRotation(rows.map((row) => row[xKey])),
    [rows, xKey],
  );

  if (rows.length === 0) {
    return <div className={styles.chartEmpty}>표시할 데이터가 없습니다</div>;
  }

  const axisProps = {
    stroke: 'var(--mu-axis)',
    tick: { fill: 'var(--mu-axis)', fontSize: 11 },
  } as const;

  const xAxis = (
    <XAxis
      dataKey={xKey}
      {...axisProps}
      tickFormatter={truncateXAxis}
      angle={rotation.angle}
      textAnchor={rotation.textAnchor as 'end' | 'middle'}
      height={rotation.bottomMargin}
      interval={0}
    />
  );
  const yAxis = <YAxis {...axisProps} tickFormatter={formatAxisNumber} width={56} />;
  const grid = <CartesianGrid strokeDasharray="3 3" stroke="var(--mu-grid)" vertical={false} />;
  const tooltip = <Tooltip content={<ChartTooltip unit={widget.unit} />} cursor={{ fill: 'var(--mu-hover)' }} />;
  const legend = <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />;

  if (widget.chartType === 'pie') {
    const valueKey =
      Object.keys(rows[0]).find((key) => typeof rows[0][key] === 'number') ?? 'value';
    return (
      <SafeResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={rows as Record<string, unknown>[]}
            dataKey={valueKey}
            nameKey={xKey}
            outerRadius="72%"
            label={(entry: { name?: string }) => entry.name ?? ''}
            isAnimationActive={animate}
          >
            {rows.map((_, index) => (
              <Cell key={index} fill={SERIES_COLORS[index % SERIES_COLORS.length]} />
            ))}
          </Pie>
          {tooltip}
        </PieChart>
      </SafeResponsiveContainer>
    );
  }

  if (widget.chartType === 'radar') {
    const series = lineSeries.length > 0 ? lineSeries : barSeries;
    return (
      <SafeResponsiveContainer width="100%" height={height}>
        <RadarChart data={rows as Record<string, unknown>[]} outerRadius="70%">
          <PolarGrid stroke="var(--mu-grid)" />
          <PolarAngleAxis dataKey={xKey} tick={{ fill: 'var(--mu-axis)', fontSize: 11 }} />
          <PolarRadiusAxis tick={{ fill: 'var(--mu-axis)', fontSize: 10 }} />
          {series.map((item) => (
            <Radar
              key={item.key}
              dataKey={item.key}
              name={item.name}
              stroke={item.color}
              fill={item.color}
              fillOpacity={0.22}
            isAnimationActive={animate}
            />
          ))}
          {tooltip}
          {legend}
        </RadarChart>
      </SafeResponsiveContainer>
    );
  }

  if (widget.chartType === 'line') {
    return (
      <SafeResponsiveContainer width="100%" height={height}>
        <LineChart data={rows as Record<string, unknown>[]} margin={CHART_MARGIN}>
          {grid}
          {xAxis}
          {yAxis}
          {tooltip}
          {lineSeries.length > 1 && legend}
          {lineSeries.map((item) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.name}
              stroke={item.color}
              strokeWidth={2}
              dot={false}
            isAnimationActive={animate}
            />
          ))}
        </LineChart>
      </SafeResponsiveContainer>
    );
  }

  if (widget.chartType === 'area') {
    const series = areaSeries.length > 0 ? areaSeries : lineSeries.length > 0 ? lineSeries : barSeries;
    return (
      <SafeResponsiveContainer width="100%" height={height}>
        <AreaChart data={rows as Record<string, unknown>[]} margin={CHART_MARGIN}>
          {grid}
          {xAxis}
          {yAxis}
          {tooltip}
          {series.length > 1 && legend}
          {series.map((item) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.name}
              stroke={item.color}
              fill={item.color}
              fillOpacity={0.18}
              strokeWidth={2}
            isAnimationActive={animate}
            />
          ))}
        </AreaChart>
      </SafeResponsiveContainer>
    );
  }

  if (widget.chartType === 'composed') {
    return (
      <SafeResponsiveContainer width="100%" height={height}>
        <ComposedChart data={rows as Record<string, unknown>[]} margin={CHART_MARGIN}>
          {grid}
          {xAxis}
          {yAxis}
          {tooltip}
          {legend}
          {areaSeries.map((item) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.name}
              stroke={item.color}
              fill={item.color}
              fillOpacity={0.16}
            isAnimationActive={animate}
            />
          ))}
          {barSeries.map((item) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              name={item.name}
              fill={item.color}
              radius={[3, 3, 0, 0]}
              isAnimationActive={animate}
            />
          ))}
          {lineSeries.map((item) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.name}
              stroke={item.color}
              strokeWidth={2}
              dot={false}
            isAnimationActive={animate}
            />
          ))}
        </ComposedChart>
      </SafeResponsiveContainer>
    );
  }

  // 기본: 막대
  const series = barSeries.length > 0 ? barSeries : lineSeries;
  return (
    <SafeResponsiveContainer width="100%" height={height}>
      <BarChart data={rows as Record<string, unknown>[]} margin={CHART_MARGIN}>
        {grid}
        {xAxis}
        {yAxis}
        {tooltip}
        {series.length > 1 && legend}
        {series.map((item) => (
          <Bar
              key={item.key}
              dataKey={item.key}
              name={item.name}
              fill={item.color}
              radius={[3, 3, 0, 0]}
              isAnimationActive={animate}
            />
        ))}
      </BarChart>
    </SafeResponsiveContainer>
  );
}
