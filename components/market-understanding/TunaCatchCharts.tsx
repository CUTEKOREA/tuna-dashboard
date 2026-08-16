/**
 * FAO FishStat 집계 전용 차트.
 *
 * 큐레이션 위젯(93개 중 47개)과 달리 이쪽은 원본 175,253행을 직접 집계한 값이다.
 * 어획 단계의 골격 숫자라 별도 컴포넌트로 두고 단계별로 꽂아 넣는다.
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
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { truncateXAxis } from '@/lib/chart-standards';
import { SKJ_HUBS, type PriceTimeline, type TunaCatchData } from '@/lib/data/tuna-industry';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import styles from './TunaIndustryDashboard.module.css';

const SPECIES_COLOR: Record<string, string> = {
  가다랑어: '#0e7490',
  황다랑어: '#0ea5e9',
  눈다랑어: '#f59e0b',
  날개다랑어: '#7c3aed',
  대서양참다랑어: '#e11d48',
  남방참다랑어: '#be123c',
  태평양참다랑어: '#9f1239',
};

const RFMO_COLOR: Record<string, string> = {
  WCPFC: '#0e7490',
  IOTC: '#0ea5e9',
  IATTC: '#f59e0b',
  ICCAT: '#7c3aed',
  CCAMLR: '#64748b',
  미분류: '#94a3b8',
};

/** 항구 선 색. 방콕(벤치마크)을 가장 진하게 둔다. */
const HUB_COLOR = ['#0e7490', '#f59e0b', '#0ea5e9', '#7c3aed', '#e11d48'];

const AXIS = { stroke: 'var(--mu-axis)', tick: { fill: 'var(--mu-axis)', fontSize: 11 } } as const;
const GRID = <CartesianGrid strokeDasharray="3 3" stroke="var(--mu-grid)" vertical={false} />;

interface TipEntry {
  color?: string;
  name?: string | number;
  value?: number | string | ReadonlyArray<number | string>;
}

function Tip({
  active,
  label,
  payload,
  unit,
}: {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<TipEntry>;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      {payload.map((entry, index) => (
        <div key={index} className={styles.tooltipRow}>
          <span className={styles.tooltipSwatch} style={{ backgroundColor: entry.color }} />
          <span className={styles.tooltipName}>{entry.name}</span>
          <strong className={styles.tooltipValue}>
            {typeof entry.value === 'number' ? entry.value.toLocaleString('ko-KR') : String(entry.value)} {unit}
          </strong>
        </div>
      ))}
    </div>
  );
}

/**
 * 그리기 애니메이션을 켤지. 사용자가 모션 감소를 요청했으면 끈다.
 * 108개월 × 5선 같은 조밀한 차트는 애니메이션이 이해를 돕지 않고 지연만 만든다.
 */
function useChartAnimation(dense = false): boolean {
  const reduce = useReducedMotion();
  return !reduce && !dense;
}

const thousandTons = (value: number) => `${Math.round(value / 1000).toLocaleString('ko-KR')}천`;

/** 어종별 어획량 20년 누적 추이 — 구성비가 거의 변하지 않는다는 것을 보여준다. */
export function SpeciesTimelineChart({ data }: { data: TunaCatchData }) {
  const animate = useChartAnimation();
  const species = useMemo(() => data.어종구성.map((row) => row.어종), [data.어종구성]);
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <AreaChart data={data.어종시계열} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
        {GRID}
        <XAxis dataKey="연도" {...AXIS} interval={3} />
        <YAxis {...AXIS} tickFormatter={thousandTons} width={56} />
        <Tooltip content={<Tip unit="톤" />} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
        {species.map((name) => (
          <Area
            key={name}
            type="monotone"
            dataKey={name}
            stackId="catch"
            stroke={SPECIES_COLOR[name] ?? '#64748b'}
            fill={SPECIES_COLOR[name] ?? '#64748b'}
            fillOpacity={0.55}
            isAnimationActive={animate}
          />
        ))}
      </AreaChart>
    </SafeResponsiveContainer>
  );
}

/** 어종별 구성비 — 가다랑어 한 종이 절반을 넘는다. */
export function SpeciesShareChart({ data }: { data: TunaCatchData }) {
  const animate = useChartAnimation();
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data.어종구성}
        layout="vertical"
        margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--mu-grid)" horizontal={false} />
        <XAxis type="number" {...AXIS} tickFormatter={thousandTons} />
        <YAxis type="category" dataKey="어종" {...AXIS} width={92} tickFormatter={truncateXAxis} />
        <Tooltip content={<Tip unit="톤" />} cursor={{ fill: 'var(--mu-hover)' }} />
        <Bar dataKey="어획량" name="어획량" radius={[0, 4, 4, 0]} isAnimationActive={animate}>
          {data.어종구성.map((row) => (
            <Cell key={row.코드} fill={SPECIES_COLOR[row.어종] ?? '#64748b'} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 국가별 어획 상위 12 — 한국의 위치를 눈으로 확인시킨다. */
export function CountryRankChart({ data }: { data: TunaCatchData }) {
  const animate = useChartAnimation();
  const rows = useMemo(() => data.국가순위.slice(0, 12), [data.국가순위]);
  return (
    <SafeResponsiveContainer width="100%" height={320}>
      <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--mu-grid)" horizontal={false} />
        <XAxis type="number" {...AXIS} tickFormatter={thousandTons} />
        <YAxis type="category" dataKey="국가" {...AXIS} width={92} tickFormatter={truncateXAxis} />
        <Tooltip content={<Tip unit="톤" />} cursor={{ fill: 'var(--mu-hover)' }} />
        <Bar dataKey="어획량" name="어획량" radius={[0, 4, 4, 0]} isAnimationActive={animate}>
          {rows.map((row) => (
            <Cell key={row.국가} fill={row.국가 === '대한민국' ? '#e11d48' : '#0e7490'} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** RFMO 관할별 어획 — 규제 한 줄이 산업 절반을 흔드는 이유. */
export function RfmoShareChart({ data }: { data: TunaCatchData }) {
  const animate = useChartAnimation();
  return (
    <SafeResponsiveContainer width="100%" height={260}>
      <BarChart data={data.관할별} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        {GRID}
        <XAxis dataKey="관할" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={thousandTons} width={56} />
        <Tooltip content={<Tip unit="톤" />} cursor={{ fill: 'var(--mu-hover)' }} />
        <Bar dataKey="어획량" name="어획량" radius={[4, 4, 0, 0]} isAnimationActive={animate}>
          {data.관할별.map((row) => (
            <Cell key={row.관할} fill={RFMO_COLOR[row.관할] ?? '#64748b'} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 해역별 어획 상위 8 — 서·중부태평양 한 곳이 절반 가까이다. */
export function AreaRankChart({ data }: { data: TunaCatchData }) {
  const animate = useChartAnimation();
  const rows = useMemo(() => data.해역순위.slice(0, 8), [data.해역순위]);
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--mu-grid)" horizontal={false} />
        <XAxis type="number" {...AXIS} tickFormatter={thousandTons} />
        <YAxis type="category" dataKey="해역" {...AXIS} width={104} tickFormatter={truncateXAxis} />
        <Tooltip content={<Tip unit="톤" />} cursor={{ fill: 'var(--mu-hover)' }} />
        <Bar dataKey="어획량" name="어획량" radius={[0, 4, 4, 0]} isAnimationActive={animate}>
          {rows.map((row) => (
            <Cell key={row.코드} fill={RFMO_COLOR[row.관할] ?? '#64748b'} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 한국 어획량과 세계 점유율 20년 — 물량은 늘어도 점유율은 정체다. */
export function KoreaTrendChart({ data }: { data: TunaCatchData }) {
  const animate = useChartAnimation();
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data.한국시계열} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
        {GRID}
        <XAxis dataKey="연도" {...AXIS} interval={3} />
        <YAxis yAxisId="left" {...AXIS} tickFormatter={thousandTons} width={56} />
        <YAxis
          yAxisId="right"
          orientation="right"
          {...AXIS}
          tickFormatter={(value: number) => `${value}%`}
          width={44}
        />
        <Tooltip content={<Tip unit="" />} cursor={{ fill: 'var(--mu-hover)' }} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
        <Bar yAxisId="left" dataKey="한국어획량" name="한국 어획량 (톤)" fill="#0e7490" radius={[3, 3, 0, 0]} isAnimationActive={animate} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="세계점유율"
          name="세계 점유율 (%)"
          stroke="#e11d48"
          strokeWidth={2}
          dot={false}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 한국 어종 구성 — 가다랑어 편중이 선단 성격을 말해준다. */
export function KoreaSpeciesChart({ data }: { data: TunaCatchData }) {
  const animate = useChartAnimation();
  const rows = useMemo(() => data.한국어종구성.filter((row) => row.어획량 > 0), [data.한국어종구성]);
  return (
    <SafeResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--mu-grid)" horizontal={false} />
        <XAxis type="number" {...AXIS} tickFormatter={thousandTons} />
        <YAxis type="category" dataKey="어종" {...AXIS} width={92} tickFormatter={truncateXAxis} />
        <Tooltip content={<Tip unit="톤" />} cursor={{ fill: 'var(--mu-hover)' }} />
        <Bar dataKey="어획량" name="어획량" radius={[0, 4, 4, 0]} isAnimationActive={animate}>
          {rows.map((row) => (
            <Cell key={row.어종} fill={SPECIES_COLOR[row.어종] ?? '#64748b'} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/**
 * 항구별 가다랑어 가격 9년 추이.
 *
 * 「참치 가격」이라는 단일 숫자가 왜 성립하지 않는지를 한 장으로 보여준다 —
 * 다섯 항구가 같은 어종을 두고 따로 움직이고 때로는 반대로 간다.
 * 결측은 메우지 않는다. 선이 끊기는 것 자체가 그 항구 고시가 멈췄다는 정보다.
 *
 * ⚠ 원자료 Atuna 는 유료 구독이다. 사내 열람 한정.
 */
export function SkjPriceByHubChart({ timeline }: { timeline: PriceTimeline }) {
  const animate = useChartAnimation(true);
  return (
    <SafeResponsiveContainer width="100%" height={320}>
      <LineChart data={timeline.points} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
        {GRID}
        <XAxis dataKey="월" {...AXIS} interval={11} />
        <YAxis
          {...AXIS}
          width={64}
          domain={['dataMin - 150', 'dataMax + 150']}
          tickFormatter={(value: number) => value.toLocaleString('ko-KR')}
        />
        <Tooltip content={<Tip unit="달러/톤" />} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
        {SKJ_HUBS.map((hub, index) => (
          <Line
            key={hub.key}
            type="monotone"
            dataKey={hub.label}
            name={hub.label}
            stroke={HUB_COLOR[index % HUB_COLOR.length]}
            strokeWidth={hub.key === 'skj_bkk' ? 2.6 : 1.6}
            dot={false}
            connectNulls={false}
            isAnimationActive={animate}
          />
        ))}
      </LineChart>
    </SafeResponsiveContainer>
  );
}

/**
 * 참다랑어 자연산 대 축양.
 *
 * 축양(ranching)은 어린 개체를 잡아 가두리에서 살찌우는 방식이라 통계상 양식으로 잡히지만
 * 종자를 자연에서 가져온다. 그래서 자연산 어획량과 나란히 놓아야 뜻이 보인다 —
 * 최근 몇 해 동안 두 값이 거의 같다.
 */
export function BluefinSourceChart({ data }: { data: TunaCatchData }) {
  const animate = useChartAnimation();
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart
        data={data.참다랑어자연산대축양}
        margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
      >
        {GRID}
        <XAxis dataKey="연도" {...AXIS} interval={3} />
        <YAxis yAxisId="left" {...AXIS} tickFormatter={thousandTons} width={56} />
        <YAxis
          yAxisId="right"
          orientation="right"
          {...AXIS}
          tickFormatter={(value: number) => `${value}%`}
          width={44}
          domain={[0, 100]}
        />
        <Tooltip content={<Tip unit="" />} cursor={{ fill: 'var(--mu-hover)' }} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
        <Bar yAxisId="left" dataKey="자연산" name="자연산 어획 (톤)" fill="#0e7490" radius={[3, 3, 0, 0]} isAnimationActive={animate} />
        <Bar yAxisId="left" dataKey="축양" name="축양 생산 (톤)" fill="#f59e0b" radius={[3, 3, 0, 0]} isAnimationActive={animate} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="축양비중"
          name="축양 비중 (%)"
          stroke="#e11d48"
          strokeWidth={2}
          dot={false}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}
