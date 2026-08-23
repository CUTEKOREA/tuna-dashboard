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

import { CHART_RANK } from '@/lib/chart-palette';
import { MACKEREL_ROLE } from '@/lib/mackerel-chart-colors';
import { SHRIMP_ROLE } from '@/lib/shrimp-chart-colors';
import { WHELK_ROLE } from '@/lib/whelk-chart-colors';
import { POLLOCK_ROLE } from '@/lib/pollock-chart-colors';
import { getSmartRotation, truncateXAxis } from '@/lib/chart-standards';
import type {
  MackerelData,
  PollockData,
  ShrimpData,
  WhelkData,
} from '@/lib/data/commodity-industry';
import {
  argentinaCatch,
  argentinaKoreaImports,
  argentinaRoutes,
} from '@/lib/data/shrimp-argentina';
import { seriesUnits, seriesWindows } from '@/lib/data/shrimp-country-series';
import {
  seriesUnits as whelkSeriesUnits,
  seriesWindows as whelkSeriesWindows,
} from '@/lib/data/whelk-country-series';
import {
  seriesUnits as mackerelSeriesUnits,
  seriesWindows as mackerelSeriesWindows,
} from '@/lib/data/mackerel-country-series';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import styles from './TunaIndustryDashboard.module.css';

/**
 * 품목별 시그니처 색 (룰북 D-04). 강조색은 「여기를 보라」는 신호로만 쓰고,
 * 나머지 항목은 전부 기본색으로 둔다 — 색이 많아지면 강조가 죽는다.
 */
const PALETTE = {
  고등어: {
    base: MACKEREL_ROLE.volume,
    highlight: MACKEREL_ROLE.highlight,
    second: MACKEREL_ROLE.second,
  },
  골뱅이: {
    base: WHELK_ROLE.volume,
    highlight: WHELK_ROLE.highlight,
    second: WHELK_ROLE.second,
  },
  새우: {
    base: SHRIMP_ROLE.volume,
    highlight: SHRIMP_ROLE.highlight,
    second: SHRIMP_ROLE.second,
  },
  명태: {
    base: POLLOCK_ROLE.volume,
    highlight: POLLOCK_ROLE.highlight,
    second: POLLOCK_ROLE.second,
  },
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
          fill={CHART_RANK}
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

/* ── 아르헨티나 홍새우 (사내 조사보고서 2종) ──────────────────────────────
 *
 * ⚠ 이 세 차트는 **통관·수출 신고 기준**이라 위 차트들(FAO 생산 통계)과 축을 공유하지
 *   않는다. 같은 화면에 있다고 더할 수 있는 값이 아니다 — 캡션에도 그렇게 적었다.
 */

/** 한국 HS 030617 공급국 — 물량 막대에 신고단가 선을 얹는다. */
export function ShrimpArgentinaKoreaChart() {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.새우;
  const rot = rotated(argentinaKoreaImports.map((r) => r.원산지));

  return (
    <SafeResponsiveContainer width="100%" height={320}>
      <ComposedChart
        data={argentinaKoreaImports}
        margin={{ ...MARGIN, bottom: rot.angle ? 54 : 8 }}
      >
        {grid}
        <XAxis
          dataKey="원산지"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'}
          height={rot.angle ? 68 : 30}
          interval={0}
        />
        <YAxis yAxisId="left" {...AXIS} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}천`} />
        <YAxis
          yAxisId="right"
          orientation="right"
          {...AXIS}
          tickFormatter={(v: number) => `$${v}`}
          domain={[0, 14]}
        />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar
          yAxisId="left"
          dataKey="물량"
          name="수입량 (톤)"
          isAnimationActive={animate}
        >
          {argentinaKoreaImports.map((r) => (
            // 아르헨티나만 색을 바꾼다. 범례를 늘리지 않고 한 행을 짚는 방법이다.
            <Cell key={r.원산지} fill={r.원산지 === '아르헨티나' ? HIGHLIGHT : BASE} />
          ))}
        </Bar>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="단가"
          name="평균 신고단가 ($/kg)"
          stroke={PALETTE.새우.second}
          strokeWidth={2}
          dot={{ r: 3 }}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 아르헨티나 어획·양륙 추이. 자연산이 직선으로 늘지 않는다는 것을 보이는 차트다. */
export function ShrimpArgentinaCatchChart() {
  const animate = !useReducedMotion();
  const { base: BASE } = PALETTE.새우;
  const rows = useMemo(
    () => argentinaCatch.map((r) => ({ ...r, 라벨: `${r.연도}년` })),
    [],
  );

  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <ComposedChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="라벨" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="어획" name="어획·양륙 (톤)" isAnimationActive={animate}>
          {rows.map((r) => (
            // 2025년만 출처가 다르다(정부 양륙). 같은 색으로 그리면 한 계열처럼 읽힌다.
            <Cell key={r.연도} fill={r.구분 === '정부 양륙' ? '#94a3b8' : BASE} />
          ))}
        </Bar>
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 가공경로 3국 — 식약처 공개 조회행. 물량이 아니라 기록 빈도다. */
export function ShrimpArgentinaRouteChart() {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.새우;

  return (
    <SafeResponsiveContainer width="100%" height={260}>
      <ComposedChart data={argentinaRoutes} margin={MARGIN} layout="vertical">
        <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" {...AXIS} />
        <YAxis type="category" dataKey="국가" {...AXIS} width={72} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="건수" name="공개 조회행 (건)" isAnimationActive={animate}>
          {argentinaRoutes.map((r) => (
            // 베트남 0건은 «없다»가 아니라 «이 자료에서 확인되지 않았다»이다.
            <Cell key={r.국가} fill={r.검증 === '미입증' ? '#94a3b8' : r.국가 === '태국' ? HIGHLIGHT : BASE} />
          ))}
        </Bar>
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/* ── 6개국 시리즈 한국 창구 (관세청 nitemtrade 2026년 1~6월) ──────────────
 *
 * ⚠ 제품중량이다. 위 FAO 생산 차트·05단계 1~5월 표와 더하지 않는다.
 */

/** 시리즈 5개국 HS 030617 원물과 160521 조제품. 베트남만 강조 — 두 창구가 비슷한 무게다. */
export function ShrimpSeriesWindowsChart() {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.새우;
  const rot = rotated(seriesWindows.map((r) => r.국가));

  return (
    <SafeResponsiveContainer width="100%" height={320}>
      <BarChart data={seriesWindows} margin={{ ...MARGIN, bottom: rot.angle ? 54 : 8 }}>
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
        <YAxis {...AXIS} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        {legend}
        <Bar dataKey="원물" name="030617 원물 (톤)" fill={BASE} isAnimationActive={animate}>
          {seriesWindows.map((r) => (
            <Cell key={`raw-${r.국가}`} fill={r.국가 === '베트남' ? HIGHLIGHT : BASE} />
          ))}
        </Bar>
        <Bar
          dataKey="조제품"
          name="160521 조제품 (톤)"
          fill={PALETTE.새우.second}
          isAnimationActive={animate}
        />
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** HS 030617 신고단가. 에콰도르만 강조 — 물량은 작은데 단가가 가장 낮다. */
export function ShrimpSeriesUnitChart() {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.새우;
  const rot = rotated(seriesUnits.map((r) => r.국가));

  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <BarChart data={seriesUnits} margin={{ ...MARGIN, bottom: rot.angle ? 54 : 8 }}>
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
        <YAxis {...AXIS} tickFormatter={(v: number) => `$${v}`} domain={[0, 14]} />
        <Tooltip content={<Tip unit=" 달러/kg" />} />
        {legend}
        <Bar dataKey="단가" name="030617 단가 (달러/kg)" isAnimationActive={animate}>
          {seriesUnits.map((r) => (
            <Cell key={r.국가} fill={r.국가 === '에콰도르' ? HIGHLIGHT : BASE} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/* ── 6개국 시리즈 한국 창구 (관세청 HS 1605.59 2026년 1~7월) ────────────
 *
 * ⚠ 제품중량이다. 위 FAO 생산 차트·04단계 2024년 연간 표와 더하지 않는다.
 */

/** 시리즈 5개국 160559. 영국만 강조 — 이미 들어와 있는 본진 창구다. 프랑스 0은 창구 없음. */
export function WhelkSeriesWindowsChart() {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.골뱅이;
  const rot = rotated(whelkSeriesWindows.map((r) => r.국가));

  return (
    <SafeResponsiveContainer width="100%" height={320}>
      <BarChart data={whelkSeriesWindows} margin={{ ...MARGIN, bottom: rot.angle ? 54 : 8 }}>
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
        <YAxis {...AXIS} tickFormatter={(v: number) => `${v.toLocaleString('ko-KR')}`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        {legend}
        <Bar dataKey="물량" name="160559 조제 (톤)" isAnimationActive={animate}>
          {whelkSeriesWindows.map((r) => (
            <Cell key={r.국가} fill={r.국가 === '영국' ? HIGHLIGHT : BASE} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 160559 신고단가. 물량이 있는 네 나라만. 캐나다만 강조 — 단가가 가장 높다. */
export function WhelkSeriesUnitChart() {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.골뱅이;
  const rot = rotated(whelkSeriesUnits.map((r) => r.국가));

  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <BarChart data={whelkSeriesUnits} margin={{ ...MARGIN, bottom: rot.angle ? 54 : 8 }}>
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
          {...AXIS}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}천`}
          domain={[0, 18000]}
        />
        <Tooltip content={<Tip unit=" 달러/톤" />} />
        {legend}
        <Bar dataKey="단가" name="160559 단가 (달러/톤)" isAnimationActive={animate}>
          {whelkSeriesUnits.map((r) => (
            <Cell key={r.국가} fill={r.국가 === '캐나다' ? HIGHLIGHT : BASE} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/* ── 6개국 시리즈 한국 창구 (관세청 2026년 1~7월) ────────────────────────
 *
 * ⚠ 제품중량이다. 위 FAO 생산 차트·04단계 1~5월 혼합 바구니와 더하지 않는다.
 */

/** 시리즈 5개국 030354 냉동과 0304895000 필렛. 노르웨이만 강조 — 두 창구가 같이 크다. */
export function MackerelSeriesWindowsChart() {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.고등어;
  const rot = rotated(mackerelSeriesWindows.map((r) => r.국가));

  return (
    <SafeResponsiveContainer width="100%" height={320}>
      <BarChart data={mackerelSeriesWindows} margin={{ ...MARGIN, bottom: rot.angle ? 54 : 8 }}>
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
        <YAxis {...AXIS} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        {legend}
        <Bar dataKey="냉동" name="030354 냉동 (톤)" fill={BASE} isAnimationActive={animate}>
          {mackerelSeriesWindows.map((r) => (
            <Cell key={`raw-${r.국가}`} fill={r.국가 === '노르웨이' ? HIGHLIGHT : BASE} />
          ))}
        </Bar>
        <Bar
          dataKey="필렛"
          name="0304895000 필렛 (톤)"
          fill={PALETTE.고등어.second}
          isAnimationActive={animate}
        />
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** HS 030354 신고단가. 물량이 있는 네 나라만. 영국만 강조 — 단가가 가장 높다. */
export function MackerelSeriesUnitChart() {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.고등어;
  const rot = rotated(mackerelSeriesUnits.map((r) => r.국가));

  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <BarChart data={mackerelSeriesUnits} margin={{ ...MARGIN, bottom: rot.angle ? 54 : 8 }}>
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
          {...AXIS}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}천`}
          domain={[0, 6000]}
        />
        <Tooltip content={<Tip unit=" 달러/톤" />} />
        {legend}
        <Bar dataKey="단가" name="030354 단가 (달러/톤)" isAnimationActive={animate}>
          {mackerelSeriesUnits.map((r) => (
            <Cell key={r.국가} fill={r.국가 === '영국' ? HIGHLIGHT : BASE} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

// ─── 명태 ──────────────────────────────────────────────────────────────────

/** 세계 어획 — 러시아·미국 두 줄이 전부이고 한국은 바닥에 붙어 있다. */
export function PollockWorldChart({ data }: { data: PollockData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT, second: SECOND } = PALETTE.명태;
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <LineChart data={data.세계어획.시계열} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} interval="preserveStartEnd" minTickGap={24} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1e6 * 10) / 10}백만`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        {legend}
        <Line type="monotone" dataKey="세계" name="세계 (톤)" stroke={BASE} strokeWidth={2.4} dot={false} isAnimationActive={animate} />
        <Line type="monotone" dataKey="러시아" name="러시아 (톤)" stroke={HIGHLIGHT} strokeWidth={2} dot={false} isAnimationActive={animate} />
        <Line type="monotone" dataKey="미국" name="미국 (톤)" stroke={SECOND} strokeWidth={2} dot={false} isAnimationActive={animate} />
        <Line type="monotone" dataKey="한국" name="한국 (톤)" stroke="var(--mu-axis)" strokeWidth={1.6} dot={false} isAnimationActive={animate} />
      </LineChart>
    </SafeResponsiveContainer>
  );
}

/** 한·러 할당과 실제 어획 — 받은 만큼 다 잡는다. */
export function PollockQuotaChart({ data }: { data: PollockData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.명태;
  const rows = data.원양할당.rows.map((r) => ({ ...r, 연도: String(r.연도) }));
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <ComposedChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} />
        <YAxis yAxisId="t" {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <YAxis yAxisId="usd" orientation="right" {...AXIS} domain={[300, 450]} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar yAxisId="t" dataKey="할당" name="할당 (톤)" fill={BASE} fillOpacity={0.35} isAnimationActive={animate} />
        <Bar yAxisId="t" dataKey="어획" name="어획 (톤)" fill={BASE} isAnimationActive={animate} />
        <Line yAxisId="usd" type="monotone" dataKey="입어료" name="입어료 (달러/톤)" stroke={HIGHLIGHT} strokeWidth={2} dot isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 전용 세번별 수입 물량 — 동태가 줄고 연육이 는다. */
export function PollockImportMixChart({ data }: { data: PollockData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT, second: SECOND } = PALETTE.명태;
  const rows = data.수입세번.rows.map((r) => ({ ...r, 연도: String(r.연도) }));
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        {legend}
        <Bar dataKey="동태_물량" name="동태" stackId="a" fill={HIGHLIGHT} isAnimationActive={animate} />
        <Bar dataKey="연육_물량" name="연육" stackId="a" fill={SECOND} isAnimationActive={animate} />
        <Bar dataKey="필렛_물량" name="필렛" stackId="a" fill={BASE} isAnimationActive={animate} />
        <Bar dataKey="명란_물량" name="명란" stackId="a" fill={BASE} fillOpacity={0.6} isAnimationActive={animate} />
        <Bar dataKey="북어_물량" name="북어" stackId="a" fill={BASE} fillOpacity={0.35} isAnimationActive={animate} />
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 수입 원산지 — 러시아 하나가 8할이다. */
export function PollockOriginChart({ data }: { data: PollockData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.명태;
  const rows = data.수입원산지.rows;
  return (
    <SafeResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} margin={MARGIN} layout="vertical">
        {grid}
        <XAxis type="number" {...AXIS} tickFormatter={(v: number) => `${v}%`} />
        <YAxis type="category" dataKey="원산지" {...AXIS} width={64} />
        <Tooltip content={<Tip unit="%" />} />
        <Bar dataKey="비중" name="수입액 비중 (%)" isAnimationActive={animate}>
          {rows.map((r) => (
            <Cell key={r.원산지} fill={r.원산지 === '러시아' ? HIGHLIGHT : BASE} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 가공 품목별 생산량 — 명란젓·코다리·황태가 본체이고 연육은 거의 수입이다. */
export function PollockProcessingChart({ data }: { data: PollockData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT, second: SECOND } = PALETTE.명태;
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <BarChart data={data.가공품목.rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="품목" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        {legend}
        <Bar dataKey="2023" name="2023 (톤)" fill={BASE} fillOpacity={0.45} isAnimationActive={animate} />
        <Bar dataKey="2024" name="2024 (톤)" fill={SECOND} isAnimationActive={animate} />
        <Bar dataKey="2025" name="2025 (톤)" fill={HIGHLIGHT} isAnimationActive={animate} />
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 월말 재고와 수입 — 2026년 여름의 급감이 보인다. */
export function PollockStockChart({ data }: { data: PollockData }) {
  const animate = !useReducedMotion();
  const { base: BASE, highlight: HIGHLIGHT } = PALETTE.명태;
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data.재고.rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="월" {...AXIS} interval="preserveStartEnd" minTickGap={28} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        {legend}
        <Bar dataKey="수입" name="월 수입 (톤)" fill={BASE} fillOpacity={0.4} isAnimationActive={animate} />
        <Line type="monotone" dataKey="재고" name="월말 재고 (톤)" stroke={HIGHLIGHT} strokeWidth={2.2} dot={false} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}
