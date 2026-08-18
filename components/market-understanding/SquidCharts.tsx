/**
 * 집계 JSON 을 직접 그리는 오징어 차트들.
 *
 * 선별 위젯(`SquidWidgetView`)이 원본 위젯을 그대로 보여주는 자리라면, 여기는 이 페이지가
 * 스스로 집계한 수치를 그리는 자리다. FAO 어획 2024년과 관세청 통관 2020~2024년이 원본이다.
 *
 * 색: 종·바스켓·한국 강조는 `lib/squid-chart-colors`.
 * 이름 없는 순위 막대·이중축 둘째 축·해역 정체성은 `lib/chart-palette`.
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
  LabelList,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { CHART_RANK, HUB_ID, shareColor } from '@/lib/chart-palette';
import { getSmartRotation, truncateXAxis } from '@/lib/chart-standards';
import {
  companiesByMonth,
  focusCompanyTag,
  focusSummaries,
  isFocusCompany,
  labelForMonth,
  monthFromLabel,
  panFor,
  seasonTotals,
  vesselAxisLabel,
  vesselsByMonth,
} from '@/lib/data/falkland-squid-vessels';
import { FalklandMonthChips, monthBarName, useFalklandMonth } from './FalklandMonthFilter';
import {
  squidByArea,
  squidBySizeBand,
  squidGearSeries,
} from '@/lib/data/deepsea-fishery';
import type {
  SquidCatchData,
  SquidFleetData,
  SquidOceanFleetData,
  SquidTradeData,
} from '@/lib/data/squid-industry';
import {
  SQUID_ROLE,
  colorForBasket,
  colorForSeries,
  colorForSpecies,
  dashForSeries,
} from '@/lib/squid-chart-colors';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import styles from './TunaIndustryDashboard.module.css';

const MARGIN = { top: 12, right: 16, left: 0, bottom: 8 };
const AXIS = { stroke: 'var(--mu-axis)', tick: { fill: 'var(--mu-axis)', fontSize: 11 } } as const;

function useAnim() {
  return !useReducedMotion();
}

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

function FocusLegend({ month }: { month: Parameters<typeof focusSummaries>[0] }) {
  return (
    <div className={styles.focusLegend} aria-label="강조 회사">
      {focusSummaries(month).map((row) => {
        const idle = row.pan === 0;
        return (
          <span key={row.name} className={idle ? styles.focusLegendIdle : styles.focusLegendItem}>
            <i className={styles.focusSwatch} aria-hidden />
            {row.name} {row.vessels}척 {row.pan.toLocaleString('ko-KR')}판
            {idle ? ' · 휴어' : ''}
          </span>
        );
      })}
    </div>
  );
}

function makeFocusTick(
  metaOf: (label: string) => { focus: boolean; idle: boolean },
  rot: { angle: number; textAnchor: string },
) {
  return function FocusTick({
    x = 0,
    y = 0,
    payload,
  }: {
    x?: number | string;
    y?: number | string;
    payload?: { value?: string | number };
  }) {
    const label = String(payload?.value ?? '');
    const { focus, idle } = metaOf(label);
    const angle = rot.angle || 0;
    const px = Number(x) || 0;
    const py = Number(y) || 0;
    return (
      <text
        x={px}
        y={py}
        dy={angle ? 8 : 12}
        textAnchor={rot.textAnchor as 'end' | 'middle'}
        transform={angle ? `rotate(${angle},${px},${py})` : undefined}
        fill={focus ? SQUID_ROLE.highlight : 'var(--mu-axis)'}
        fontSize={focus ? 12 : 11}
        fontWeight={focus ? 700 : 400}
      >
        {truncateXAxis(label)}
        {idle ? (
          <tspan dx="3" fontSize={10} fontWeight={700}>
            0판
          </tspan>
        ) : null}
      </text>
    );
  };
}

function FocusBarLabel({
  x = 0,
  y = 0,
  width = 0,
  index = 0,
  rows,
}: {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  index?: number;
  rows: { company?: string; name?: string; pan?: number; totalPan?: number }[];
}) {
  const row = rows[index];
  if (!row) return null;
  const company = row.company ?? row.name ?? '';
  if (!isFocusCompany(company)) return null;
  const pan = row.pan ?? row.totalPan ?? 0;
  const tag = focusCompanyTag(company);
  const left = Number(x) + Number(width) / 2;
  const top = Number(y) - 4;
  return (
    <text
      x={left}
      y={Number.isFinite(top) ? top : 12}
      textAnchor="middle"
      fill={SQUID_ROLE.highlight}
      fontSize={10}
      fontWeight={700}
    >
      {pan === 0 ? `${tag} 0판` : tag}
    </text>
  );
}

/** 살오징어 붕괴 — 이 페이지의 중심 서사. 세계와 한국을 한 장에 겹친다. */
export function CollapseChart({ data }: { data: SquidCatchData }) {
  const animate = useAnim();
  // 55년치를 다 그리면 선이 뭉개진다. 5년 간격으로 솎되 최신 연도는 반드시 남긴다.
  const rows = useMemo(() => {
    const all = data.살오징어붕괴;
    const last = all[all.length - 1];
    const thinned = all.filter((row) => Number(row.연도) % 5 === 0);
    if (thinned[thinned.length - 1]?.연도 !== last?.연도) thinned.push(last);
    return thinned;
  }, [data]);

  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <LineChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} interval="preserveStartEnd" />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        {legend}
        <Line
          type="monotone"
          dataKey="세계"
          name="세계 어획량 (톤)"
          stroke={SQUID_ROLE.volume}
          strokeWidth={2.4}
          dot={false}
          isAnimationActive={animate}
        />
        <Line
          type="monotone"
          dataKey="한국"
          name="한국 어획량 (톤)"
          stroke={SQUID_ROLE.highlight}
          strokeWidth={2.4}
          dot={false}
          isAnimationActive={animate}
        />
      </LineChart>
    </SafeResponsiveContainer>
  );
}

/** 어종 구성 — 무엇을 「오징어」라 부르는지가 여기서 갈린다. */
export function SpeciesMixChart({ data }: { data: SquidCatchData }) {
  const animate = useAnim();
  const rows = data.어종구성;
  const rotation = getSmartRotation(rows.map((row) => row.어종));

  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} margin={{ ...MARGIN, bottom: rotation.angle ? 48 : 8 }}>
        {grid}
        <XAxis
          dataKey="어종"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rotation.angle}
          textAnchor={rotation.textAnchor as 'end' | 'middle'}
          height={rotation.angle ? 62 : 30}
          interval={0}
        />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        <Bar dataKey="어획량" name="어획량 (톤)" radius={[3, 3, 0, 0]} isAnimationActive={animate}>
          {rows.map((row, index) => (
            <Cell key={index} fill={colorForSpecies(row.어종)} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 국가 순위 — 잡는 나라. */
export function CountryRankChart({ data }: { data: SquidCatchData }) {
  const animate = useAnim();
  const rows = data.국가순위.slice(0, 12);
  const rotation = getSmartRotation(rows.map((row) => row.국가));

  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} margin={{ ...MARGIN, bottom: rotation.angle ? 48 : 8 }}>
        {grid}
        <XAxis
          dataKey="국가"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rotation.angle}
          textAnchor={rotation.textAnchor as 'end' | 'middle'}
          height={rotation.angle ? 62 : 30}
          interval={0}
        />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        <Bar dataKey="어획량" name="어획량 (톤)" radius={[3, 3, 0, 0]} isAnimationActive={animate}>
          {rows.map((row, index) => (
            <Cell
              key={index}
              fill={row.국가 === '대한민국' ? SQUID_ROLE.highlight : SQUID_ROLE.volume}
            />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 해역 순위 — 어디서 잡히나. */
export function AreaRankChart({ data }: { data: SquidCatchData }) {
  const animate = useAnim();
  const rows = data.해역순위;
  const rotation = getSmartRotation(rows.map((row) => row.해역));

  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} margin={{ ...MARGIN, bottom: rotation.angle ? 48 : 8 }}>
        {grid}
        <XAxis
          dataKey="해역"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rotation.angle}
          textAnchor={rotation.textAnchor as 'end' | 'middle'}
          height={rotation.angle ? 62 : 30}
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

/** 한국 어획량과 세계 점유율. */
export function KoreaTrendChart({ data }: { data: SquidCatchData }) {
  const animate = useAnim();
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data.한국시계열} margin={MARGIN}>
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
        />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar
          yAxisId="left"
          dataKey="어획량"
          name="한국 어획량 (톤)"
          fill={SQUID_ROLE.volume}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="세계점유율"
          name="세계 점유율 (%)"
          stroke={CHART_RANK}
          strokeWidth={2.2}
          dot={false}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 한국 수입 구조 — 국내 붕괴를 무엇으로 메우나. */
export function ImportOriginChart({ data }: { data: SquidTradeData }) {
  const animate = useAnim();
  const rows = data.수입국구성;
  const rotation = getSmartRotation(rows.map((row) => row.국가));

  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={rows} margin={{ ...MARGIN, bottom: rotation.angle ? 48 : 8 }}>
        {grid}
        <XAxis
          dataKey="국가"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rotation.angle}
          textAnchor={rotation.textAnchor as 'end' | 'middle'}
          height={rotation.angle ? 62 : 30}
          interval={0}
        />
        <YAxis yAxisId="left" {...AXIS} tickFormatter={(v: number) => `${v}`} />
        <YAxis
          yAxisId="right"
          orientation="right"
          {...AXIS}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}천`}
        />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar
          yAxisId="left"
          dataKey="수입액"
          name="수입액 (백만 달러)"
          fill={SQUID_ROLE.volume}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="단가"
          name="수입단가 (달러/톤)"
          stroke={CHART_RANK}
          strokeWidth={2.2}
          dot={{ r: 3 }}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 수입 시계열과 단가. */
export function ImportTrendChart({ data }: { data: SquidTradeData }) {
  const animate = useAnim();
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data.교역시계열} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} />
        <YAxis yAxisId="left" {...AXIS} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}천`} />
        <YAxis
          yAxisId="right"
          orientation="right"
          {...AXIS}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}천`}
        />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar
          yAxisId="left"
          dataKey="수입량"
          name="수입량 (톤)"
          fill={SQUID_ROLE.volume}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="수입단가"
          name="수입단가 (달러/톤)"
          stroke={CHART_RANK}
          strokeWidth={2.4}
          dot={{ r: 3 }}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 품목 단계별 단가 — 건조가 왜 톤당 비싼가. */
export function StagePriceChart({ data }: { data: SquidTradeData }) {
  const animate = useAnim();
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data.품목단계} margin={MARGIN}>
        {grid}
        <XAxis dataKey="구분" {...AXIS} interval={0} />
        <YAxis yAxisId="left" {...AXIS} tickFormatter={(v: number) => `${v}`} />
        <YAxis
          yAxisId="right"
          orientation="right"
          {...AXIS}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}천`}
        />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar
          yAxisId="left"
          dataKey="수입액"
          name="수입액 (백만 달러)"
          fill={SQUID_ROLE.volume}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="단가"
          name="수입단가 (달러/톤)"
          stroke={CHART_RANK}
          strokeWidth={2.4}
          dot={{ r: 4 }}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 어종 시계열 — 살오징어가 빠진 자리를 무엇이 채웠나. */
export function SpeciesTimelineChart({ data }: { data: SquidCatchData }) {
  const animate = useAnim();
  const rows = data.어종시계열;
  const keys = useMemo(() => {
    const set = new Set<string>();
    for (const row of rows) {
      for (const key of Object.keys(row)) if (key !== '연도') set.add(key);
    }
    return [...set];
  }, [rows]);

  return (
    <SafeResponsiveContainer width="100%" height={320}>
      <LineChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="연도" {...AXIS} interval="preserveStartEnd" />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        {legend}
        {keys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={key}
            stroke={colorForSeries(key, index)}
            strokeDasharray={dashForSeries(key)}
            strokeWidth={2}
            dot={false}
            isAnimationActive={animate}
          />
        ))}
      </LineChart>
    </SafeResponsiveContainer>
  );
}

/** 바스켓 구성 — 합산하면 안 되는 셋. */
export function BasketChart({ data }: { data: SquidCatchData }) {
  const animate = useAnim();
  return (
    <SafeResponsiveContainer width="100%" height={220}>
      <BarChart data={data.바스켓구성} layout="vertical" margin={{ ...MARGIN, left: 80 }}>
        {grid}
        <XAxis type="number" {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <YAxis type="category" dataKey="구분" {...AXIS} width={78} />
        <Tooltip content={<Tip unit=" 톤" />} />
        <Bar dataKey="어획량" name="어획량 (톤)" radius={[0, 3, 3, 0]} isAnimationActive={animate}>
          {data.바스켓구성.map((row, index) => (
            <Cell key={index} fill={colorForBasket(row.구분)} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 한국 어종별 어획량 — 무엇을 잡고 있나. */
export function KoreaSpeciesChart({ data }: { data: SquidCatchData }) {
  const animate = useAnim();
  const rows = data.한국어종구성;
  const rotation = getSmartRotation(rows.map((row) => row.어종));

  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} margin={{ ...MARGIN, bottom: rotation.angle ? 48 : 8 }}>
        {grid}
        <XAxis
          dataKey="어종"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rotation.angle}
          textAnchor={rotation.textAnchor as 'end' | 'middle'}
          height={rotation.angle ? 62 : 30}
          interval={0}
        />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip unit=" 톤" />} />
        <Bar dataKey="어획량" name="어획량 (톤)" radius={[3, 3, 0, 0]} isAnimationActive={animate}>
          {rows.map((row, index) => (
            <Cell
              key={index}
              fill={colorForSpecies(row.어종)}
            />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 수입 형태 구성 — 한국은 어떤 모습으로 사 오는가. 단가가 아니라 물량이 축이다. */
export function ImportFormChart({ data }: { data: SquidTradeData }) {
  const animate = useAnim();
  return (
    <SafeResponsiveContainer width="100%" height={240}>
      <BarChart data={data.품목단계} layout="vertical" margin={{ ...MARGIN, left: 72 }}>
        {grid}
        <XAxis type="number" {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <YAxis type="category" dataKey="구분" {...AXIS} width={70} />
        <Tooltip content={<Tip unit=" 톤" />} />
        <Bar dataKey="수입량" name="수입량 (톤)" radius={[0, 3, 3, 0]} isAnimationActive={animate}>
          {data.품목단계.map((row, index) => (
            <Cell key={index} fill={shareColor(index)} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 주요국 수출입 비교 — 한국이 어디에 서 있는가. */
export function CountryCompareChart({ data }: { data: SquidTradeData }) {
  const animate = useAnim();
  // 최신 연도만 본다. 보고가 없는 나라는 직전 해로 대신하되 그 사실이 라벨에 남는다.
  const rows = useMemo(() => {
    const byCountry = new Map<string, { 국가: string; 수입액: number; 수출액: number; 연도: string }>();
    for (const row of data.국가비교) {
      const prev = byCountry.get(row.국가);
      if (prev && prev.연도 >= row.연도) continue;
      byCountry.set(row.국가, {
        국가: row.연도 === (prev?.연도 ?? row.연도) ? row.국가 : row.국가,
        수입액: row.수입액 ?? 0,
        수출액: row.수출액 ?? 0,
        연도: row.연도,
      });
    }
    return [...byCountry.values()]
      .map((r) => ({ ...r, 국가: r.연도 === '2025' ? r.국가 : `${r.국가} (${r.연도})` }))
      .sort((a, b) => b.수입액 + b.수출액 - (a.수입액 + a.수출액));
  }, [data]);

  const rotation = getSmartRotation(rows.map((row) => row.국가));

  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} margin={{ ...MARGIN, bottom: rotation.angle ? 48 : 8 }}>
        {grid}
        <XAxis
          dataKey="국가"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rotation.angle}
          textAnchor={rotation.textAnchor as 'end' | 'middle'}
          height={rotation.angle ? 62 : 30}
          interval={0}
        />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${v}`} />
        <Tooltip content={<Tip unit=" 백만달러" />} />
        {legend}
        <Bar
          dataKey="수입액"
          name="수입액 (백만 달러)"
          fill={SQUID_ROLE.volume}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
        <Bar
          dataKey="수출액"
          name="수출액 (백만 달러)"
          fill={CHART_RANK}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 원양 업종별 척수와 선령 — 어법이 다르면 다른 사업이다. */
export function DistantGearChart({ data }: { data: SquidFleetData }) {
  const animate = useAnim();
  const rows = useMemo(
    () =>
      data.원양업종.rows.map((r) => ({
        업종: r.업종,
        신조: r.척수 - r.선령31년이상,
        노후: r.선령31년이상,
      })),
    [data],
  );
  const rotation = getSmartRotation(rows.map((r) => r.업종));

  return (
    <SafeResponsiveContainer width="100%" height={310}>
      <BarChart data={rows} margin={{ ...MARGIN, bottom: rotation.angle ? 52 : 8 }}>
        {grid}
        <XAxis
          dataKey="업종"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rotation.angle}
          textAnchor={rotation.textAnchor as 'end' | 'middle'}
          height={rotation.angle ? 66 : 30}
          interval={0}
        />
        <YAxis {...AXIS} />
        <Tooltip content={<Tip unit=" 척" />} />
        {legend}
        <Bar
          dataKey="노후"
          name="선령 31년 이상 (척)"
          stackId="a"
          fill={SQUID_ROLE.highlight}
          isAnimationActive={animate}
        />
        <Bar
          dataKey="신조"
          name="선령 30년 이하 (척)"
          stackId="a"
          fill={SQUID_ROLE.volume}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 연근해 업종별 척당 배분량 — 같은 「오징어 어선」으로 묶을 수 없는 이유. */
export function CoastalGearChart({ data }: { data: SquidFleetData }) {
  const animate = useAnim();
  const rows = data.연근해업종.rows;
  const rotation = getSmartRotation(rows.map((r) => r.업종));

  return (
    <SafeResponsiveContainer width="100%" height={310}>
      <ComposedChart data={rows} margin={{ ...MARGIN, bottom: rotation.angle ? 52 : 8 }}>
        {grid}
        <XAxis
          dataKey="업종"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rotation.angle}
          textAnchor={rotation.textAnchor as 'end' | 'middle'}
          height={rotation.angle ? 66 : 30}
          interval={0}
        />
        <YAxis yAxisId="left" {...AXIS} />
        <YAxis yAxisId="right" orientation="right" {...AXIS} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar
          yAxisId="left"
          dataKey="선박수"
          name="선박 수 (척)"
          fill={SQUID_ROLE.volume}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="척당배분량"
          name="척당 배분량 (톤)"
          stroke={CHART_RANK}
          strokeWidth={2.4}
          dot={{ r: 4 }}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 채낚기 선박의 선령 분포 — 원양 오징어 선단이 얼마나 늙었는가. */
export function VesselAgeChart({ data }: { data: SquidFleetData }) {
  const animate = useAnim();
  const rows = useMemo(
    () =>
      [...data.채낚기선박.rows]
        .sort((a, b) => b.선령 - a.선령)
        .map((v) => ({ 선명: v.선명, 선령: v.선령, 톤수: v.톤수 })),
    [data],
  );
  const rotation = getSmartRotation(rows.map((r) => r.선명));

  return (
    <SafeResponsiveContainer width="100%" height={330}>
      <BarChart data={rows} margin={{ ...MARGIN, bottom: rotation.angle ? 58 : 8 }}>
        {grid}
        <XAxis
          dataKey="선명"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rotation.angle}
          textAnchor={rotation.textAnchor as 'end' | 'middle'}
          height={rotation.angle ? 72 : 30}
          interval={0}
        />
        <YAxis {...AXIS} />
        <Tooltip content={<Tip unit=" 년" />} />
        <Bar dataKey="선령" name="선령 (년)" radius={[3, 3, 0, 0]} isAnimationActive={animate}>
          {rows.map((r, i) => (
            <Cell key={i} fill={r.선령 >= 31 ? SQUID_ROLE.highlight : SQUID_ROLE.volume} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 3국 채낚기 선단 — 척수는 대만이, 배 크기는 한국이 크다. */
export function NationFleetChart({ data }: { data: SquidFleetData }) {
  const animate = useAnim();
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data.국가별선단.rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="국가" {...AXIS} interval={0} />
        <YAxis yAxisId="left" {...AXIS} />
        <YAxis yAxisId="right" orientation="right" {...AXIS} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar
          yAxisId="left"
          dataKey="척수"
          name="선박 수 (척)"
          fill={SQUID_ROLE.volume}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="평균톤수"
          name="평균 톤수 (톤)"
          stroke={CHART_RANK}
          strokeWidth={2.4}
          dot={{ r: 4 }}
          connectNulls={false}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/**
 * 선사별 채낚기 선단 — 척수와 선단 규모(합계 톤수).
 *
 * 열 개 회사가 스무 척을 나눠 갖는다. 한 회사가 여러 척을 가진 곳과 한 척뿐인 곳이
 * 섞여 있어, 「오징어 선사」를 한 덩어리로 보면 규모 차이가 사라진다.
 */
export function CompanyFleetChart({ data }: { data: SquidFleetData }) {
  const animate = useAnim();
  const rows = useMemo(
    () => [...data.채낚기선박.회사별].sort((a, b) => b.척수 - a.척수 || b.합계톤수 - a.합계톤수),
    [data],
  );
  const rot = getSmartRotation(rows.map((r) => r.회사));

  return (
    <SafeResponsiveContainer width="100%" height={320}>
      <ComposedChart data={rows} margin={{ ...MARGIN, bottom: rot.angle ? 54 : 8 }}>
        {grid}
        <XAxis
          dataKey="회사"
          {...AXIS}
          tickFormatter={truncateXAxis}
          angle={rot.angle}
          textAnchor={rot.textAnchor as 'end' | 'middle'}
          height={rot.angle ? 68 : 30}
          interval={0}
        />
        <YAxis yAxisId="left" {...AXIS} allowDecimals={false} />
        <YAxis
          yAxisId="right"
          orientation="right"
          {...AXIS}
          tickFormatter={(v: number) => `${Math.round(v / 1000)}천`}
        />
        <Tooltip content={<Tip />} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
        <Bar
          yAxisId="left"
          dataKey="척수"
          name="보유 척수 (척)"
          fill={SQUID_ROLE.volume}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="합계톤수"
          name="선단 합계 톤수 (톤)"
          stroke={CHART_RANK}
          strokeWidth={2.2}
          dot={{ r: 3 }}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/**
 * 남태평양 공해 채낚기 선단 — 척수와 척당 크기를 함께 본다.
 *
 * ⚠ 이 그림에는 **선사가 없다.** 남태평양 공해 관리기구가 소유사를 공개하지 않기 때문이다.
 *   참치 페이지가 해역마다 선사를 세울 수 있는 것과 달라, 오징어는 선적국이 한계다.
 */
export function OceanJiggerChart({ data }: { data: SquidOceanFleetData }) {
  const animate = useAnim();
  const rows = useMemo(() => data.채낚기톤급.filter((r) => r.척수 >= 5), [data]);

  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="선적" {...AXIS} tickFormatter={truncateXAxis} interval={0} />
        <YAxis yAxisId="left" {...AXIS} allowDecimals={false} />
        <YAxis
          yAxisId="right"
          orientation="right"
          {...AXIS}
          tickFormatter={(v: number) => `${Math.round(v)}t`}
        />
        <Tooltip content={<Tip />} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
        <Bar
          yAxisId="left"
          dataKey="척수"
          name="채낚기 척수 (척)"
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        >
          {rows.map((r) => (
            <Cell key={r.선적} fill={r.선적 === '대한민국' ? SQUID_ROLE.highlight : SQUID_ROLE.volume} />
          ))}
        </Bar>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="평균톤수"
          name="척당 평균 톤수 (톤)"
          stroke={CHART_RANK}
          strokeWidth={2.4}
          dot={{ r: 4 }}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/* ─── 원양산업 통계연보 시리즈 (2026-08-17 전사) ─────────────── */

/** 한국 원양 오징어 어가 — 수역별 연평균 (원/kg). 결측 연도는 선이 끊긴다. */
export function SquidYearbookPriceChart({ rows }: {
  rows: { 연도: string; 남서대서양: number | null; 뉴질랜드: number | null; 페루: number | null }[];
}) {
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <LineChart data={rows} margin={{ top: 12, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="연도" stroke="var(--mu-axis)" tick={{ fill: 'var(--mu-axis)', fontSize: 11 }} />
        <YAxis stroke="var(--mu-axis)" tick={{ fill: 'var(--mu-axis)', fontSize: 11 }}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}천`} />
        <Tooltip formatter={(value) => [`${Number(value ?? 0).toLocaleString()} 원/kg`, '']} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="남서대서양" name="남서대서양 (원/kg)" stroke={HUB_ID.bkk} strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
        <Line type="monotone" dataKey="뉴질랜드" name="뉴질랜드 (원/kg)" stroke={HUB_ID.mnt} strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
        <Line type="monotone" dataKey="페루" name="페루 (원/kg)" stroke={HUB_ID.sey} strokeWidth={2} dot={{ r: 2 }} connectNulls={false} />
      </LineChart>
    </SafeResponsiveContainer>
  );
}

/** 2024년 한국 원양 오징어류 월별 생산 (톤). */
export function SquidMonthlyCatchChart({ months }: { months: number[] }) {
  const data = months.map((value, index) => ({ 월: `${index + 1}월`, 생산: value }));
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 12, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="월" stroke="var(--mu-axis)" tick={{ fill: 'var(--mu-axis)', fontSize: 11 }} interval={0} />
        <YAxis stroke="var(--mu-axis)" tick={{ fill: 'var(--mu-axis)', fontSize: 11 }}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}천`} />
        <Tooltip formatter={(value) => [`${Number(value ?? 0).toLocaleString()} 톤`, '']} />
        <Bar dataKey="생산" name="생산 (톤)" fill={CHART_RANK} radius={[3, 3, 0, 0]} />
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/* ── 원양어업통계조사 (해양수산부 승인 제114048호) ──────────────────────────
 *
 * ⚠ 이 차트들은 **원양어업만** 담는다. 같은 페이지의 FAO 기준 수치와 더할 수 없다.
 * ⚠ 생산금액 차트는 만들지 않는다 — 2021~2024년 금액이 톤당 6,667천원으로 고정돼
 *   있어 독립 측정이 아니라 환산값으로 보인다. 단가 선을 그리면 뜻 없는 평선이 된다.
 */

/** 오징어채낚기 업종 연도별 생산량. 이 업종의 실제 조업 규모다. */
export function SquidGearProductionChart() {
  const animate = !useReducedMotion();
  const rows = useMemo(() => squidGearSeries().map((p) => ({ ...p, 라벨: `${p.연도}년` })), []);

  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <ComposedChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="라벨" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="생산량" name="생산량 (톤)" fill={CHART_RANK} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/**
 * 해역별 오징어류 생산량.
 *
 * ⚠ 해역이 계층이다 — 「대서양」 안에 「서남부」가 들어 있어 더하면 이중계상이다.
 *   그래서 합계를 그리지 않고 막대만 나란히 둔다.
 */
export function SquidAreaChart({ year }: { year: string }) {
  const animate = !useReducedMotion();
  const rows = useMemo(() => squidByArea(year), [year]);

  return (
    <SafeResponsiveContainer width="100%" height={260}>
      <ComposedChart data={rows} margin={MARGIN} layout="vertical">
        <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <YAxis type="category" dataKey="해역" {...AXIS} width={72} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="생산량" name="생산량 (톤)" isAnimationActive={animate}>
          {rows.map((r) => (
            // 동남부가 SPRFMO 수역이다 — 다른 자료와 맞대는 칸이라 따로 짚는다.
            <Cell key={r.해역} fill={r.해역 === '동남부' ? SQUID_ROLE.highlight : CHART_RANK} />
          ))}
        </Bar>
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 보유 척수 구간별 오징어류 생산량. 회사명은 없지만 회사를 척수로 묶은 축이다. */
export function SquidSizeBandChart({ year }: { year: string }) {
  const animate = !useReducedMotion();
  const rows = useMemo(() => squidBySizeBand(year), [year]);

  return (
    <SafeResponsiveContainer width="100%" height={260}>
      <ComposedChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="구간" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar dataKey="생산량" name="생산량 (톤)" fill={CHART_RANK} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/* ── 포클랜드 선박별 실적 (신라교역 사내 자료) ────────────────────────────── */

/** 선박별 물량. 기본은 어기 누계, 칩으로 달을 고른다. */
export function FalklandVesselChart() {
  const animate = !useReducedMotion();
  const { month } = useFalklandMonth();
  const rows = useMemo(
    () =>
      vesselsByMonth(month).map((v) => ({
        ...v,
        pan: panFor(v, month),
        label: vesselAxisLabel(v),
      })),
    [month],
  );
  const rot = getSmartRotation(rows.map((r) => r.label));
  const metaByLabel = (label: string) => {
    const row = rows.find((item) => item.label === label);
    return {
      focus: !!row && isFocusCompany(row.company),
      idle: !!row && isFocusCompany(row.company) && row.pan === 0,
    };
  };

  return (
    <>
      <FalklandMonthChips />
      <FocusLegend month={month} />
      <SafeResponsiveContainer width="100%" height={360}>
        <ComposedChart data={rows} margin={{ ...MARGIN, top: 22, bottom: rot.angle ? 60 : 8 }}>
          {grid}
          <XAxis
            dataKey="label"
            {...AXIS}
            tick={makeFocusTick(metaByLabel, rot)}
            height={rot.angle ? 74 : 30}
            interval={0}
          />
          <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
          <Tooltip content={<Tip />} />
          {legend}
          <Bar dataKey="pan" name={monthBarName(month)} isAnimationActive={animate} radius={[3, 3, 0, 0]}>
            {rows.map((row) => {
              const focus = isFocusCompany(row.company);
              return (
                <Cell
                  key={`${row.name}-${row.company}`}
                  fill={focus ? SQUID_ROLE.highlight : CHART_RANK}
                  fillOpacity={focus ? 1 : 0.38}
                  stroke={focus ? SQUID_ROLE.highlight : undefined}
                  strokeWidth={focus ? 1.2 : 0}
                />
              );
            })}
            <LabelList dataKey="label" content={(props) => <FocusBarLabel {...props} rows={rows} />} />
          </Bar>
        </ComposedChart>
      </SafeResponsiveContainer>
      <p className={styles.catchSourceLine}>
        진한 장미색과 위 칩이 선민수산·현원수산이다. 108은해는 선민 실적과 현원 0판이 따로 있어 축에 회사를 붙였다.
      </p>
    </>
  );
}

/** 회사별 선단 규모와 물량. 선박에서 다시 세운 값이다(원본 집계에 한 회사가 빠져 있다). */
export function FalklandCompanyChart() {
  const animate = !useReducedMotion();
  const { month } = useFalklandMonth();
  const rows = useMemo(() => companiesByMonth(month), [month]);
  const rot = getSmartRotation(rows.map((r) => r.name));

  return (
    <>
      <FocusLegend month={month} />
      <SafeResponsiveContainer width="100%" height={340}>
        <ComposedChart data={rows} margin={{ ...MARGIN, top: 22, bottom: rot.angle ? 58 : 8 }}>
          {grid}
          <XAxis
            dataKey="name"
            {...AXIS}
            tick={makeFocusTick((label) => {
              const row = rows.find((item) => item.name === label);
              return {
                focus: isFocusCompany(label),
                idle: !!row && isFocusCompany(label) && row.totalPan === 0,
              };
            }, rot)}
            height={rot.angle ? 72 : 30}
            interval={0}
          />
          <YAxis yAxisId="left" {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
          <YAxis yAxisId="right" orientation="right" {...AXIS} allowDecimals={false} />
          <Tooltip content={<Tip />} />
          {legend}
          <Bar yAxisId="left" dataKey="totalPan" name={monthBarName(month)} isAnimationActive={animate} radius={[3, 3, 0, 0]}>
            {rows.map((row) => {
              const focus = isFocusCompany(row.name);
              return (
                <Cell
                  key={row.name}
                  fill={focus ? SQUID_ROLE.highlight : SQUID_ROLE.volume}
                  fillOpacity={focus ? 1 : 0.42}
                  stroke={focus ? SQUID_ROLE.highlight : undefined}
                  strokeWidth={focus ? 1.2 : 0}
                />
              );
            })}
            <LabelList
              dataKey="name"
              content={(props) => <FocusBarLabel {...props} rows={rows} />}
            />
          </Bar>
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="vessels"
            name="보유 척수 (척)"
            stroke={CHART_RANK}
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={animate}
          />
        </ComposedChart>
      </SafeResponsiveContainer>
      <p className={styles.catchSourceLine}>
        진한 장미색과 위 칩이 선민수산·현원수산이다. 현원수산은 0판이라 막대가 없어도 칩·축·「0판」표기에 남아 있다.
      </p>
    </>
  );
}

/** 어기 월별 선단 합계. 12월에 시작해 이듬해 5월에 끝난다 — 달력 순이 아니다. */
export function FalklandSeasonChart() {
  const animate = !useReducedMotion();
  const { month, setMonth } = useFalklandMonth();
  const rows = useMemo(() => seasonTotals(), []);
  const selectedLabel = labelForMonth(month);

  return (
    <SafeResponsiveContainer width="100%" height={260}>
      <ComposedChart data={rows} margin={MARGIN}>
        {grid}
        <XAxis dataKey="월" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${Math.round(v / 1000)}천`} />
        <Tooltip content={<Tip />} />
        {legend}
        <Bar
          dataKey="물량"
          name="선단 합계 (판)"
          isAnimationActive={animate}
          cursor="pointer"
          onClick={(entry) => {
            const next = monthFromLabel(String(entry?.payload?.월 ?? ''));
            if (next) setMonth(next);
          }}
        >
          {rows.map((row) => (
            <Cell
              key={row.월}
              fill={month !== 'all' && row.월 === selectedLabel ? SQUID_ROLE.highlight : CHART_RANK}
            />
          ))}
        </Bar>
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}
