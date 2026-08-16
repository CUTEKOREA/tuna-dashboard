'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { truncateXAxis } from '@/lib/chart-standards';

export type VolumeBarPoint = {
  label: string;
  value: number;
};

type VolumeBarShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  highlighted?: boolean;
};

/** Recharts Bar custom shape — SVG 3면 기둥. height 애니메이션 없음. */
export function VolumeBarShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill = '#22d3ee',
  highlighted = false,
}: VolumeBarShapeProps) {
  if (width <= 0 || height <= 0) return null;

  const depth = Math.min(9, Math.max(4, width * 0.22));
  const frontW = Math.max(width - depth, width * 0.72);
  const opacity = highlighted ? 1 : 0.34;

  return (
    <g aria-hidden="true">
      <path
        d={`M ${x + frontW} ${y} L ${x + width} ${y + depth * 0.45} L ${x + width} ${y + height + depth * 0.45} L ${x + frontW} ${y + height} Z`}
        fill={fill}
        fillOpacity={opacity * 0.72}
      />
      <path
        d={`M ${x} ${y} L ${x + depth} ${y - depth * 0.45} L ${x + frontW + depth} ${y - depth * 0.45} L ${x + frontW} ${y} Z`}
        fill={fill}
        fillOpacity={Math.min(1, opacity + 0.18)}
      />
      <rect
        x={x}
        y={y}
        width={frontW}
        height={height}
        rx={8}
        fill={fill}
        fillOpacity={opacity}
      />
    </g>
  );
}

function VolumeTip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number }[];
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value;
  return (
    <div
      style={{
        background: '#303c46',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10,
        padding: '8px 10px',
        color: '#fff',
        fontSize: 12.5,
      }}
    >
      {typeof value === 'number' ? `${value.toLocaleString('ko-KR')} ${unit}` : '—'}
    </div>
  );
}

export function VolumeBarChart({
  data,
  name,
  unit,
  height = 220,
  fill = '#22d3ee',
}: {
  data: VolumeBarPoint[];
  name: string;
  unit: string;
  height?: number;
  fill?: string;
}) {
  if (data.length < 2) return null;

  const maxValue = Math.max(...data.map((d) => d.value));
  const mean = data.reduce((sum, d) => sum + d.value, 0) / data.length;
  const highlightIndex = data.findIndex((d) => d.value === maxValue);

  return (
    <div style={{ width: '100%', height, position: 'relative' }} data-volume-bar="true">
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        {name} 평균 {mean.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} {unit}
      </span>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 4 }}>
          <XAxis
            dataKey="label"
            tickFormatter={truncateXAxis}
            stroke="var(--text-tertiary, #94a3b8)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            hide
            domain={[0, (max: number) => max * 1.12]}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            content={<VolumeTip unit={unit} />}
          />
          <ReferenceLine
            y={mean}
            stroke="rgba(244,244,245,0.35)"
            strokeDasharray="4 4"
            label={{
              value: `평균 ${mean.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} ${unit}`,
              position: 'right',
              fill: 'var(--text-tertiary, #94a3b8)',
              fontSize: 11,
            }}
          />
          <Bar
            dataKey="value"
            name={name}
            isAnimationActive={false}
            shape={(props) => (
              <VolumeBarShape
                {...props}
                fill={fill}
                highlighted={props.index === highlightIndex}
              />
            )}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
