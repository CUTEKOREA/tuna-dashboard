/**
 * 문어 차트. 공용 `CommodityCharts.tsx` 는 다른 품목 작성자가 고치는 중이라 따로 둔다.
 *
 * 세 칸 규칙을 차트에서도 지킨다. 냉동 문어(0307521000)와 조제 문어류(1605550000)는
 * 세번이 달라 한 차트·한 Y축에 두지 않는다. KOSIS 세 품종은 선을 나란히 둘 뿐 합계 선을 그리지 않는다.
 */
'use client';

import React from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { OctopusIndustryData } from '@/lib/data/octopus-industry';
import { OCTOPUS_ROLE } from '@/lib/octopus-chart-colors';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import styles from './TunaIndustryDashboard.module.css';

const { volume: BASE, highlight: HIGHLIGHT, second: SECOND } = OCTOPUS_ROLE;
const MARGIN = { top: 12, right: 16, left: 0, bottom: 8 };
const AXIS = { stroke: 'var(--mu-axis)', tick: { fill: 'var(--mu-axis)', fontSize: 11 } } as const;
const grid = <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" vertical={false} />;
const legend = <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />;
const thousands = (v: number) => `${Math.round(v / 1000)}천`;

interface TipEntry {
  color?: string;
  name?: string | number;
  value?: number | string;
}

function Tip({ active, payload, label }: { active?: boolean; payload?: TipEntry[]; label?: string | number }) {
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
              : entry.value ?? '칸 없음'}
          </strong>
        </p>
      ))}
    </div>
  );
}

/** 세계 합계와 상위 6개국. 한국(OCT 3종 합)은 넣지 않는다. */
export function OctopusWorldChart({ data }: { data: OctopusIndustryData }) {
  const animate = !useReducedMotion();
  const others = ['모리타니', '멕시코', '일본', '인도'];
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <LineChart data={data.세계어획.시계열} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={thousands} />
        <Tooltip content={<Tip />} />
        {legend}
        <Line type="monotone" dataKey="세계" name="세계 (톤)" stroke={BASE} strokeWidth={2.6} dot={false} isAnimationActive={animate} />
        <Line type="monotone" dataKey="중국" name="중국 (톤)" stroke={HIGHLIGHT} strokeWidth={2} dot={false} isAnimationActive={animate} />
        <Line type="monotone" dataKey="모로코" name="모로코 (톤)" stroke={SECOND} strokeWidth={2} dot={false} isAnimationActive={animate} />
        {others.map((name) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            name={`${name} (톤)`}
            stroke="var(--mu-axis)"
            strokeWidth={1.2}
            strokeOpacity={0.7}
            dot={false}
            isAnimationActive={animate}
          />
        ))}
      </LineChart>
    </SafeResponsiveContainer>
  );
}

/** KOSIS 연근해 세 품종. 합계 선은 없다. */
export function OctopusKoreaChart({ data }: { data: OctopusIndustryData }) {
  const animate = !useReducedMotion();
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <LineChart data={data.한국생산.연도별} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} interval="preserveStartEnd" minTickGap={20} />
        <YAxis {...AXIS} tickFormatter={thousands} />
        <Tooltip content={<Tip />} />
        {legend}
        <Line type="monotone" dataKey="문어류" name="문어류 140412 (톤)" stroke={BASE} strokeWidth={2.6} dot={false} isAnimationActive={animate} />
        <Line type="monotone" dataKey="낙지류" name="낙지류 140409 (톤)" stroke="var(--mu-axis)" strokeWidth={1.4} strokeDasharray="4 3" dot={false} isAnimationActive={animate} />
        <Line type="monotone" dataKey="주꾸미" name="주꾸미 140415 (톤)" stroke="var(--mu-axis)" strokeWidth={1.4} strokeDasharray="1 3" dot={false} isAnimationActive={animate} />
      </LineChart>
    </SafeResponsiveContainer>
  );
}

/** 위판 물량(막대)과 단가(선). 2026 은 1~6월 누계라 막대가 짧다. */
export function OctopusAuctionChart({ data }: { data: OctopusIndustryData }) {
  const animate = !useReducedMotion();
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data.위판.연도별} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} interval="preserveStartEnd" minTickGap={20} />
        <YAxis yAxisId="t" {...AXIS} tickFormatter={thousands} />
        <YAxis yAxisId="krw" orientation="right" {...AXIS} tickFormatter={thousands} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar yAxisId="t" dataKey="물량" name="위판 물량 (톤)" fill={BASE} fillOpacity={0.45} isAnimationActive={animate} />
        <Line yAxisId="krw" type="monotone" dataKey="단가" name="위판 단가 (원/kg)" stroke={HIGHLIGHT} strokeWidth={2.4} dot={{ r: 3 }} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 차트에는 세번 하나를 넣는다. 원장 연도별 행에 두 세번이 같이 있어도 한 축으로 넘기지 않는다. */
export function octopusFrozenTradeRows(data: OctopusIndustryData) {
  return data.수입.연도별.map((row) => ({ 연도: row.연도, 톤: row.냉동문어_톤 }));
}

export function octopusPreparedTradeRows(data: OctopusIndustryData) {
  return data.수입.연도별.flatMap((row) =>
    row.조제문어류_톤 == null ? [] : [{ 연도: row.연도, 톤: row.조제문어류_톤 }],
  );
}

/** 냉동 문어 0307521000 전용. 조제 세번과 같은 축에 두지 않는다. */
export function OctopusFrozenTradeChart({ data }: { data: OctopusIndustryData }) {
  const animate = !useReducedMotion();
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <BarChart data={octopusFrozenTradeRows(data)} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={thousands} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="톤" name="냉동 문어 0307521000 (톤)" fill={HIGHLIGHT} isAnimationActive={animate} />
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 조제 문어류 1605550000 전용. 2022년 이전 칸은 없다. 냉동 세번과 같은 축에 두지 않는다. */
export function OctopusPreparedTradeChart({ data }: { data: OctopusIndustryData }) {
  const animate = !useReducedMotion();
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <BarChart data={octopusPreparedTradeRows(data)} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={thousands} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="톤" name="조제 문어류 1605550000 (톤)" fill={SECOND} isAnimationActive={animate} />
      </BarChart>
    </SafeResponsiveContainer>
  );
}
