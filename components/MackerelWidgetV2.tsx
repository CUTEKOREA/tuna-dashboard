'use client';

/**
 * MackerelWidgetV2 — 번들 위젯 객체 1개를 WidgetCard + Recharts 로 렌더.
 *
 * 위젯별 특수 분기 없이 chartType 스위치 하나로만 처리하며,
 * 데이터 값은 가공·보정 없이 받은 그대로 그린다.
 * 차트 하단에 WidgetProvenance 를 부착해 숫자의 출처를 항상 함께 보여준다.
 */

import React from 'react';
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
import WidgetCard from './WidgetCard';
import WidgetProvenance from './WidgetProvenance';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { truncateXAxis } from '@/lib/chart-standards';
import type { MackerelSeriesDef, MackerelWidget, Pillar } from '@/lib/data/mackerel-v2';

const AXIS_STROKE = '#94a3b8';
const AXIS_TICK = { fill: '#cbd5e1', fontSize: 11 };
const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  fontSize: '0.75rem',
};
const PIE_FALLBACK_COLOR = '#38bdf8';

function getSeries(widget: MackerelWidget): MackerelSeriesDef[] {
  switch (widget.chartType) {
    case 'Area':
      return widget.areas ?? [];
    case 'Line':
      return widget.lines ?? [];
    case 'Bar':
      return widget.bars ?? [];
    case 'Composed':
      return [...(widget.bars ?? []), ...(widget.lines ?? [])];
    case 'Pie':
    case 'Radar':
      return widget.bars ?? widget.areas ?? widget.lines ?? [];
    default:
      return [];
  }
}

function buildChart(widget: MackerelWidget): React.ReactElement {
  const series = getSeries(widget);
  const hasRightAxis = series.some((s) => s.yAxisId === 'right');
  const axisId = (s: MackerelSeriesDef) =>
    hasRightAxis ? (s.yAxisId === 'right' ? 'right' : 'left') : undefined;
  const stackId = widget.stacked ? '1' : undefined;

  const axes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
      {widget.xKey && (
        <XAxis dataKey={widget.xKey} stroke={AXIS_STROKE} tick={AXIS_TICK} tickFormatter={truncateXAxis} />
      )}
      {hasRightAxis ? (
        <>
          <YAxis yAxisId="left" stroke={AXIS_STROKE} tick={AXIS_TICK} />
          <YAxis yAxisId="right" orientation="right" stroke={AXIS_STROKE} tick={AXIS_TICK} />
        </>
      ) : (
        <YAxis stroke={AXIS_STROKE} tick={AXIS_TICK} />
      )}
      <Tooltip contentStyle={TOOLTIP_STYLE} />
      <Legend wrapperStyle={{ fontSize: '0.72rem' }} />
    </>
  );

  const barNodes = (widget.bars ?? []).map((s) => (
    <Bar key={s.key} yAxisId={axisId(s)} dataKey={s.key} fill={s.color} stackId={stackId} />
  ));
  const lineNodes = (widget.lines ?? []).map((s) => (
    <Line
      key={s.key}
      yAxisId={axisId(s)}
      type="monotone"
      dataKey={s.key}
      stroke={s.color}
      strokeWidth={2}
      dot={false}
    />
  ));

  switch (widget.chartType) {
    case 'Area':
      return (
        <AreaChart data={widget.data} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
          {axes}
          {(widget.areas ?? []).map((s) => (
            <Area
              key={s.key}
              yAxisId={axisId(s)}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.55}
              stackId={stackId}
            />
          ))}
        </AreaChart>
      );
    case 'Line':
      return (
        <LineChart data={widget.data} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
          {axes}
          {lineNodes}
        </LineChart>
      );
    case 'Bar':
      return (
        <BarChart data={widget.data} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
          {axes}
          {barNodes}
        </BarChart>
      );
    case 'Composed':
      return (
        <ComposedChart data={widget.data} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
          {axes}
          {barNodes}
          {lineNodes}
        </ComposedChart>
      );
    case 'Pie': {
      const colors = series.length > 0 ? series.map((s) => s.color) : [PIE_FALLBACK_COLOR];
      return (
        <PieChart>
          <Pie data={widget.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" stroke="none">
            {widget.data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: '0.72rem' }} />
        </PieChart>
      );
    }
    case 'Radar':
      return (
        <RadarChart data={widget.data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          {widget.xKey && <PolarAngleAxis dataKey={widget.xKey} tick={{ fill: 'var(--w-slate-300)', fontSize: 11 }} />}
          <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" tick={{ fill: 'var(--w-slate-500)', fontSize: 10 }} />
          {series.map((s) => (
            <Radar key={s.key} dataKey={s.key} stroke={s.color} fill={s.color} fillOpacity={0.35} />
          ))}
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: '0.72rem' }} />
        </RadarChart>
      );
    default:
      return <></>;
  }
}

export default function MackerelWidgetV2({
  widget,
  pillar,
}: {
  widget: MackerelWidget;
  pillar: Pillar;
}): React.JSX.Element {
  const provenance = widget.provenance;
  const hasData = widget.data.length > 0;

  return (
    <WidgetCard
      id={widget.id}
      title={widget.title}
      cardDesc={widget.subtitle}
      unit={widget.unit}
      pillar={pillar}
      telemetry={{
        status:
          provenance.method === 'api_live' ? 'LIVE' : provenance.method === 'script' ? 'SYNCED' : 'STATIC',
        syncDate: provenance.period,
        source: `${provenance.publisher} ${provenance.series}`,
      }}
      chart={hasData ? <SafeResponsiveContainer height="100%">{buildChart(widget)}</SafeResponsiveContainer> : undefined}
      customBody={
        hasData ? undefined : (
          <div
            style={{
              height: '240px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--w-slate-500)',
              fontSize: '0.85rem',
              border: '1px dashed rgba(255,255,255,0.08)',
              borderRadius: '8px',
            }}
          >
            데이터 없음
          </div>
        )
      }
      takeaway={{
        situation: widget.sit,
        actionPlan: widget.strat,
        source: `${provenance.publisher} ${provenance.series} (${provenance.period}, ${provenance.extract_date} 수집)`,
      }}
    >
      <WidgetProvenance provenance={provenance} />
    </WidgetCard>
  );
}
