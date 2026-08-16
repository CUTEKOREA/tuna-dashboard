'use client';

import React from 'react';
import {
  Bar,
  BarChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { truncateXAxis } from '@/lib/chart-standards';

export type VolumeBarPoint = {
  label: string;
  value: number;
};

const BASE_FILL = '#509ee3';
const TOKEN_FILL = 'var(--chart-s1, #509ee3)';

function hexToRgb(hex: string): [number, number, number] {
  const match = hex.match(/[0-9a-f]{6}/i);
  const raw = match ? match[0] : '509ee3';
  return [
    parseInt(raw.slice(0, 2), 16),
    parseInt(raw.slice(2, 4), 16),
    parseInt(raw.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function mix(
  from: [number, number, number],
  to: [number, number, number],
  t: number,
): [number, number, number] {
  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ];
}

/** 값이 클수록 같은 계열의 진한 파랑. 최저·최고가 같으면 중간색. */
export function volumeBarFillForValue(
  value: number,
  min: number,
  max: number,
  fill = TOKEN_FILL,
): string {
  const base = hexToRgb(fill);
  const t = max <= min ? 0.62 : (value - min) / (max - min);
  const light = mix(base, [255, 255, 255], 0.52);
  const dark = mix(base, [14, 42, 78], 0.58);
  return rgbToHex(...mix(light, dark, t));
}

type VolumeBarShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
};

/** Recharts Bar custom shape — SVG 3면 기둥. height 애니메이션 없음. */
export function VolumeBarShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  fill = TOKEN_FILL,
}: VolumeBarShapeProps) {
  if (width <= 0 || height <= 0) return null;

  const depth = Math.min(7, Math.max(3, width * 0.18));
  const frontW = Math.max(width - depth, width * 0.75);
  const bodyH = Math.max(1, height - depth * 0.45);
  const frontY = y + depth * 0.45;

  return (
    <g aria-hidden="true">
      <path
        d={`M ${x + frontW} ${frontY} L ${x + width} ${y} L ${x + width} ${y + bodyH} L ${x + frontW} ${frontY + bodyH} Z`}
        fill={fill}
        fillOpacity={0.72}
      />
      <path
        d={`M ${x} ${frontY} L ${x + depth} ${y} L ${x + frontW + depth} ${y} L ${x + frontW} ${frontY} Z`}
        fill={fill}
        fillOpacity={1}
      />
      <rect
        x={x}
        y={frontY}
        width={frontW}
        height={bodyH}
        rx={6}
        fill={fill}
        fillOpacity={1}
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
        fontFamily: 'var(--font-pretendard), var(--font-geist-sans), sans-serif',
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
  width,
  height = 160,
  fill = TOKEN_FILL,
}: {
  data: VolumeBarPoint[];
  name: string;
  unit: string;
  width?: number;
  height?: number;
  fill?: string;
}) {
  if (data.length < 2) return null;

  const chartWidth = width && width > 0 ? width : 640;
  const mean = data.reduce((sum, d) => sum + d.value, 0) / data.length;
  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);

  return (
    <div
      data-volume-bar="true"
      style={{
        width: '100%',
        height,
        maxHeight: height,
        overflow: 'hidden',
        flex: '0 0 auto',
        position: 'relative',
      }}
    >
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>
        {name} 평균 {mean.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} {unit}
      </span>
      <BarChart
        width={chartWidth}
        height={height}
        data={data}
        margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
      >
        <XAxis
          dataKey="label"
          tickFormatter={truncateXAxis}
          stroke="var(--chart-axis, #8d93a5)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis hide domain={[0, (max: number) => max * 1.12]} />
        <Tooltip
          cursor={{ fill: 'rgba(80, 158, 227, 0.08)' }}
          content={<VolumeTip unit={unit} />}
        />
        <ReferenceLine
          y={mean}
          stroke="var(--chart-axis, #8d93a5)"
          strokeDasharray="4 4"
          label={{
            value: `평균 ${mean.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} ${unit}`,
            position: 'insideTopRight',
            fill: 'var(--chart-axis, #8d93a5)',
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
              fill={volumeBarFillForValue(
                Number(props.payload?.value ?? minValue),
                minValue,
                maxValue,
                fill,
              )}
            />
          )}
        />
      </BarChart>
    </div>
  );
}
