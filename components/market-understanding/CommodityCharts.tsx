/**
 * 고등어·골뱅이·새우 차트.
 *
 * 참치·오징어와 같은 규율을 따른다 — 차트는 주장의 근거이지 주인공이 아니다.
 * 색은 역할로 쓴다. 강조할 하나만 다른 색을 주고 나머지는 같은 색으로 둔다.
 */
'use client';

import React, { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getSmartRotation, truncateXAxis } from '@/lib/chart-standards';
import type {
  MackerelData,
  ShrimpData,
  WhelkData,
} from '@/lib/data/commodity-industry';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import styles from './TunaIndustryDashboard.module.css';

/**
 * 품목별 시그니처 색 (룰북 D-04). 강조색은 「여기를 보라」는 신호로만 쓰고,
 * 나머지 항목은 전부 기본색으로 둔다 — 색이 많아지면 강조가 죽는다.
 */
const PALETTE = {
  고등어: { base: '#0e7490', highlight: '#e11d48', second: '#0ea5e9' },
  골뱅이: { base: '#92400e', highlight: '#fbbf24', second: '#d97706' },
  새우: { base: '#0d9488', highlight: '#f43f5e', second: '#34d399' },
} as const;

const MARGIN = { top: 12, right: 16, left: 0, bottom: 8 };
const AXIS = { stroke: 'var(--mu-axis)', tick: { fill: 'var(--mu-axis)', fontSize: 11 } } as const;

interface TipEntry {
  color?: string;
  name?: string | number;
  value?: number | string;
}

function Tip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: TipEntry[];
  label?: string | number;
  unit?: string;
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
            {unit ?? ''}
          </strong>
        </p>
      ))}
    </div>
  );
}

const grid = <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" vertical={false} />;
const legend = <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />;

function rotated(values: (string | number)[]) {
  return getSmartRotation(values.map((v) => String(v)));
}

// ─── 고등어 ────────────────────────────────────────────────────────────────

/** 위판 등급별 물량과 단가 — 크기가 곧 수익성이다. */
export function MackerelGradeChart({ data }: { data: MackerelData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.고등어;
  const rows = data.위판등급.rows;
  const rot = rotated(rows.map((r) => r.등급));

  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={rows} margin={{ ...MARGIN, bottom: rot.angle ? 50 : 8 }}>
        {grid}
        <XAxis
          dataKey="등급"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'}
          height={rot.angle ? 64 : 30}
          interval={0}
        />
        <YAxis
          yAxisId="left"
          {...AXIS}
          tickFormatter={(v: number) => `${Math.round(v / 1000)}천`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          {...AXIS}
          tickFormatter={(v: number) => `${Math.round(v / 1000)}천`}
        />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar
          yAxisId="left"
          dataKey="물량"
          name="위판 물량 (kg)"
          fill={BASE}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="가중평균단가"
          name="가중평균 단가 (원/kg)"
          stroke={HIGHLIGHT}
          strokeWidth={2.4}
          dot={{ r: 4 }}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 한국 어획 30년 — 1996년 정점에서 3분의 1 아래로 떨어졌다가 되올라오는 중이다. */
export function MackerelCatchChart({ data }: { data: MackerelData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.고등어;
  const rows = data.한국어획.시계열;
  const hasBlue = rows.some((r) => Number(r['망치고등어'] ?? 0) > 0);

  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <LineChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} interval="preserveStartEnd" minTickGap={24} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        {legend}
        <Line
          type="monotone"
          dataKey="고등어"
          name="고등어 (톤)"
          stroke={BASE}
          strokeWidth={2.4}
          dot={false}
          isAnimationActive={animate}
        />
        {hasBlue && (
          <Line
            type="monotone"
            dataKey="망치고등어"
            name="망치고등어 (톤)"
            stroke={HIGHLIGHT}
            strokeWidth={2}
            dot={false}
            isAnimationActive={animate}
          />
        )}
      </LineChart>
    </SafeResponsiveContainer>
  );
}

/** 수입 원산지 — 노르웨이 의존도가 드러난다. */
export function MackerelOriginChart({ data }: { data: MackerelData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.고등어;
  const rows = data.수입원산지.rows;
  const rot = rotated(rows.map((r) => r.원산지));

  return (
    <SafeResponsiveContainer width="100%" height={290}>
      <BarChart data={rows} margin={{ ...MARGIN, bottom: rot.angle ? 50 : 8 }}>
        {grid}
        <XAxis
          dataKey="원산지"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'}
          height={rot.angle ? 64 : 30}
          interval={0}
        />
        <YAxis {...AXIS} />
        <Tooltip content={<Tip unit=" %" />} />
        <Bar dataKey="비중" name="수입액 비중 (%)" radius={[3, 3, 0, 0]} isAnimationActive={animate}>
          {rows.map((r, i) => (
            <Cell key={i} fill={r.원산지 === '노르웨이' ? HIGHLIGHT : BASE} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

// ─── 골뱅이 ────────────────────────────────────────────────────────────────

/** 과(科)별 생산 — 「골뱅이」 한 이름에 무엇이 섞였나. */
export function WhelkGroupChart({ data }: { data: WhelkData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT, second: SECOND } = PALETTE.골뱅이;
  const rows = data.종구성;
  const rot = rotated(rows.map((r) => r.그룹));

  return (
    <SafeResponsiveContainer width="100%" height={310}>
      <BarChart data={rows} margin={{ ...MARGIN, bottom: rot.angle ? 52 : 8 }}>
        {grid}
        <XAxis
          dataKey="그룹"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'}
          height={rot.angle ? 66 : 30}
          interval={0}
        />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        {legend}
        <Bar
          dataKey="양식"
          name="양식 (톤)"
          stackId="a"
          fill={SECOND}
          isAnimationActive={animate}
        />
        <Bar dataKey="어획" name="어획 (톤)" stackId="a" radius={[3, 3, 0, 0]} isAnimationActive={animate}>
          {rows.map((r, i) => (
            <Cell key={i} fill={r.그룹 === '참골뱅이류' ? HIGHLIGHT : BASE} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 참골뱅이 어획 상위국 — 한국이 없다는 것이 이 그림의 요지다. */
export function WhelkBuccinumChart({ data }: { data: WhelkData }) {
  const animate = !useReducedMotion();
  const { base: BASE } = PALETTE.골뱅이;
  const rows = data.참골뱅이상위국;
  const rot = rotated(rows.map((r) => r.국가));

  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} margin={{ ...MARGIN, bottom: rot.angle ? 50 : 8 }}>
        {grid}
        <XAxis
          dataKey="국가"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'}
          height={rot.angle ? 64 : 30}
          interval={0}
        />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        <Bar
          dataKey="어획량"
          name="어획량 (톤)"
          fill={BASE}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 한국 수입 — 통조림 원료가 어디서 오나. */
export function WhelkImportChart({ data }: { data: WhelkData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.골뱅이;
  const rows = data.한국수입.rows;
  const rot = rotated(rows.map((r) => r.국가));

  return (
    <SafeResponsiveContainer width="100%" height={290}>
      <ComposedChart data={rows} margin={{ ...MARGIN, bottom: rot.angle ? 50 : 8 }}>
        {grid}
        <XAxis
          dataKey="국가"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'}
          height={rot.angle ? 64 : 30}
          interval={0}
        />
        <YAxis yAxisId="left" {...AXIS} />
        <YAxis yAxisId="right" orientation="right" {...AXIS} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar
          yAxisId="left"
          dataKey="수입액"
          name="수입액 (백만 달러)"
          fill={BASE}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="단가"
          name="수입단가 (달러/톤)"
          stroke={HIGHLIGHT}
          strokeWidth={2.2}
          dot={{ r: 3 }}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/**
 * 국내 생산 — 세 계열을 **한 선으로 잇지 않는다.**
 * 130303 골뱅이(1990~2009)와 130311 고둥류(2010~2025)는 다른 통계 코드이고,
 * 130310 소라는 아예 다른 종이다. 선이 끊긴 자리가 곧 코드가 바뀐 자리다.
 */
export function WhelkKoreaSeriesChart({ data }: { data: WhelkData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT, second: SECOND } = PALETTE.골뱅이;
  const rows = useMemo(() => {
    const byYear = new Map<string, Record<string, string | number>>();
    for (const [name, points] of Object.entries(data.한국생산.계열)) {
      for (const point of points) {
        const row = byYear.get(point.연도) ?? { 연도: point.연도 };
        row[name] = point.생산량;
        byYear.set(point.연도, row);
      }
    }
    return [...byYear.values()].sort((a, b) => String(a.연도).localeCompare(String(b.연도)));
  }, [data]);

  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <LineChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} interval="preserveStartEnd" minTickGap={24} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        {legend}
        {/* connectNulls 는 기본값 false 다. 코드가 바뀐 2009~2010 사이를 그대로 끊어 둔다. */}
        <Line
          type="monotone"
          dataKey="골뱅이"
          name="골뱅이 130303 (톤)"
          stroke={BASE}
          strokeWidth={2.2}
          dot={false}
          isAnimationActive={animate}
        />
        <Line
          type="monotone"
          dataKey="고둥류"
          name="고둥류 130311 (톤)"
          stroke={HIGHLIGHT}
          strokeWidth={2.2}
          dot={false}
          isAnimationActive={animate}
        />
        <Line
          type="monotone"
          dataKey="소라"
          name="소라 130310 (톤)"
          stroke={SECOND}
          strokeWidth={1.8}
          strokeDasharray="4 3"
          dot={false}
          isAnimationActive={animate}
        />
      </LineChart>
    </SafeResponsiveContainer>
  );
}

// ─── 새우 ──────────────────────────────────────────────────────────────────

/** 양식이 자연산을 넘어선 궤적 — 이 품목의 중심 서사. */
export function ShrimpTrendChart({ data }: { data: ShrimpData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT, second: SECOND } = PALETTE.새우;
  return (
    <SafeResponsiveContainer width="100%" height={310}>
      <ComposedChart data={data.양식자연산추이} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} interval="preserveStartEnd" />
        <YAxis
          yAxisId="left"
          {...AXIS}
          tickFormatter={(v: number) => `${Math.round(v / 1000)}천`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          {...AXIS}
          tickFormatter={(v: number) => `${v}%`}
          domain={[0, 100]}
        />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar
          yAxisId="left"
          dataKey="자연산"
          name="자연산 (톤)"
          stackId="a"
          fill={BASE}
          isAnimationActive={animate}
        />
        <Bar
          yAxisId="left"
          dataKey="양식"
          name="양식 (톤)"
          stackId="a"
          fill={SECOND}
          isAnimationActive={animate}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="양식비중"
          name="양식 비중 (%)"
          stroke={HIGHLIGHT}
          strokeWidth={2.4}
          dot={false}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 종 구성 — 한 종이 세계의 60%다. */
export function ShrimpSpeciesChart({ data }: { data: ShrimpData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.새우;
  const rows = data.종구성;
  const rot = rotated(rows.map((r) => r.종));

  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} margin={{ ...MARGIN, bottom: rot.angle ? 52 : 8 }}>
        {grid}
        <XAxis
          dataKey="종"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'}
          height={rot.angle ? 66 : 30}
          interval={0}
        />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        <Bar dataKey="생산량" name="생산량 (톤)" radius={[3, 3, 0, 0]} isAnimationActive={animate}>
          {rows.map((r, i) => (
            <Cell key={i} fill={r.종 === '흰다리새우' ? HIGHLIGHT : BASE} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 양식 환경 — 「양식」 한 낱말 안에 기수 양식장과 논·강이 함께 들어 있다. */
export function ShrimpEnvChart({ data }: { data: ShrimpData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT, second: SECOND } = PALETTE.새우;
  const rows = useMemo(
    () => [
      { 구분: '자연산 어획', 생산량: data.요약.자연산 },
      ...data.양식환경.map((r) => ({ 구분: `${r.환경} 양식`, 생산량: r.생산량 })),
    ],
    [data],
  );

  return (
    <SafeResponsiveContainer width="100%" height={270}>
      <BarChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="구분" {...AXIS} tickFormatter={truncateXAxis} interval={0} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        <Bar dataKey="생산량" name="생산량 (톤)" radius={[3, 3, 0, 0]} isAnimationActive={animate}>
          {rows.map((r, i) => (
            <Cell key={i} fill={r.구분 === '담수 양식' ? HIGHLIGHT : r.구분 === '기수 양식' ? SECOND : BASE} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 국가별 양식 비중 — 나라마다 성격이 갈린다. */
export function ShrimpCountryChart({ data }: { data: ShrimpData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT, second: SECOND } = PALETTE.새우;
  const rows = useMemo(() => data.국가별.slice(0, 12), [data]);
  const rot = rotated(rows.map((r) => r.국가));

  return (
    <SafeResponsiveContainer width="100%" height={320}>
      <ComposedChart data={rows} margin={{ ...MARGIN, bottom: rot.angle ? 54 : 8 }}>
        {grid}
        <XAxis
          dataKey="국가"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'}
          height={rot.angle ? 68 : 30}
          interval={0}
        />
        <YAxis
          yAxisId="left"
          {...AXIS}
          tickFormatter={(v: number) => `${Math.round(v / 1000)}천`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          {...AXIS}
          tickFormatter={(v: number) => `${v}%`}
          domain={[0, 100]}
        />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar
          yAxisId="left"
          dataKey="자연산"
          name="자연산 (톤)"
          stackId="a"
          fill={BASE}
          isAnimationActive={animate}
        />
        <Bar
          yAxisId="left"
          dataKey="양식"
          name="양식 (톤)"
          stackId="a"
          fill={SECOND}
          isAnimationActive={animate}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="양식비중"
          name="양식 비중 (%)"
          stroke={HIGHLIGHT}
          strokeWidth={2}
          dot={{ r: 3 }}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 한국 종 구성 — 젓새우가 절반이다. 새우젓이라는 소비 형태가 통계에 찍혔다. */
export function ShrimpKoreaChart({ data }: { data: ShrimpData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.새우;
  const rows = data.한국종구성;
  const rot = rotated(rows.map((r) => r.종));

  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} margin={{ ...MARGIN, bottom: rot.angle ? 50 : 8 }}>
        {grid}
        <XAxis
          dataKey="종"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'}
          height={rot.angle ? 64 : 30}
          interval={0}
        />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        <Bar dataKey="생산량" name="생산량 (톤)" radius={[3, 3, 0, 0]} isAnimationActive={animate}>
          {rows.map((r, i) => (
            <Cell key={i} fill={r.종 === '젓새우' ? HIGHLIGHT : BASE} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}
