/**
 * 집계 JSON 을 직접 그리는 오징어 차트들.
 *
 * 선별 위젯(`SquidWidgetView`)이 원본 위젯을 그대로 보여주는 자리라면, 여기는 이 페이지가
 * 스스로 집계한 수치를 그리는 자리다. FAO 어획 2024년과 관세청 통관 2020~2024년이 원본이다.
 *
 * 색은 오징어 시그니처 그라디언트(purple → pink)를 따른다. 참치(cyan → blue)와 구분된다.
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
import type { SquidCatchData, SquidTradeData } from '@/lib/data/squid-industry';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import styles from './TunaIndustryDashboard.module.css';

/** 오징어 계열 색. 두족류 시그니처(purple → pink)에서 뽑았다. */
const SQUID_COLORS = ['#7c3aed', '#db2777', '#0ea5e9', '#f59e0b', '#059669', '#64748b'];

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
          stroke={SQUID_COLORS[0]}
          strokeWidth={2.4}
          dot={false}
          isAnimationActive={animate}
        />
        <Line
          type="monotone"
          dataKey="한국"
          name="한국 어획량 (톤)"
          stroke={SQUID_COLORS[1]}
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
            <Cell
              key={index}
              // 갑오징어·미분류를 다른 색으로 둔다. 합산하면 안 되는 것이 눈에 보이게.
              fill={
                row.구분 === '오징어'
                  ? SQUID_COLORS[0]
                  : row.구분 === '갑오징어'
                    ? SQUID_COLORS[1]
                    : SQUID_COLORS[5]
              }
            />
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
            <Cell key={index} fill={row.국가 === '대한민국' ? SQUID_COLORS[1] : SQUID_COLORS[0]} />
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
          fill={SQUID_COLORS[0]}
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
          fill={SQUID_COLORS[0]}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="세계점유율"
          name="세계 점유율 (%)"
          stroke={SQUID_COLORS[1]}
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
          fill={SQUID_COLORS[0]}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="단가"
          name="수입단가 (달러/톤)"
          stroke={SQUID_COLORS[1]}
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
          fill={SQUID_COLORS[0]}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="수입단가"
          name="수입단가 (달러/톤)"
          stroke={SQUID_COLORS[1]}
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
          fill={SQUID_COLORS[0]}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="단가"
          name="수입단가 (달러/톤)"
          stroke={SQUID_COLORS[1]}
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
            stroke={SQUID_COLORS[index % SQUID_COLORS.length]}
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
            <Cell
              key={index}
              fill={
                row.구분 === '오징어'
                  ? SQUID_COLORS[0]
                  : row.구분 === '갑오징어'
                    ? SQUID_COLORS[1]
                    : SQUID_COLORS[5]
              }
            />
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
              // 살오징어만 다른 색으로 둔다 — 연근해 자원이 어디쯤인지 한눈에 보이게
              fill={row.어종 === '살오징어' ? SQUID_COLORS[1] : SQUID_COLORS[0]}
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
            <Cell
              key={index}
              fill={row.구분 === '원물' ? SQUID_COLORS[0] : row.구분 === '완제품' ? SQUID_COLORS[1] : SQUID_COLORS[3]}
            />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}
