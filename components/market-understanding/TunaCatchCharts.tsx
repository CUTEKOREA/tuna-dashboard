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
import {
  SKJ_HUBS,
  type PriceTimeline,
  type StockStatusRow,
  type TunaCatchData,
  type TunaFleetData,
  type TunaTradeData,
} from '@/lib/data/tuna-industry';
import {
  TUNA_ROLE,
  colorForCountry,
  colorForHub,
  colorForRfmo,
  colorForSpecies,
} from '@/lib/tuna-chart-colors';
import type {
  ExportRankRow,
  OceanMatrixRow,
  OperatorRow,
  RetailShareRow,
} from '@/lib/data/valuechain-companies';
import SafeResponsiveContainer from '../SafeResponsiveContainer';
import styles from './TunaIndustryDashboard.module.css';

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
            stroke={colorForSpecies(name)}
            fill={colorForSpecies(name)}
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
            <Cell key={row.코드} fill={colorForSpecies(row.어종)} />
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
            <Cell key={row.국가} fill={colorForCountry(row.국가)} />
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
            <Cell key={row.관할} fill={colorForRfmo(row.관할)} />
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
            <Cell key={row.코드} fill={colorForRfmo(row.관할)} />
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
        <Bar yAxisId="left" dataKey="한국어획량" name="한국 어획량 (톤)" fill={TUNA_ROLE.volume} radius={[3, 3, 0, 0]} isAnimationActive={animate} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="세계점유율"
          name="세계 점유율 (%)"
          stroke={TUNA_ROLE.highlight}
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
            <Cell key={row.어종} fill={colorForSpecies(row.어종)} />
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
        {SKJ_HUBS.map((hub) => (
          <Line
            key={hub.key}
            type="monotone"
            dataKey={hub.label}
            name={hub.label}
            stroke={colorForHub(hub.label)}
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
        <Bar yAxisId="left" dataKey="자연산" name="자연산 어획 (톤)" fill={TUNA_ROLE.volume} radius={[3, 3, 0, 0]} isAnimationActive={animate} />
        <Bar yAxisId="left" dataKey="축양" name="축양 생산 (톤)" fill={TUNA_ROLE.processed} radius={[3, 3, 0, 0]} isAnimationActive={animate} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="축양비중"
          name="축양 비중 (%)"
          stroke={TUNA_ROLE.highlight}
          strokeWidth={2}
          dot={false}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/* ─── 교역 (FAO FishStat 무역통계) ───────────────────────────────────────── */

/** 국가별 수출액 상위 10. 잡는 나라와 파는 나라가 다르다는 것이 여기서 보인다. */
export function TradeExportRankChart({ data }: { data: TunaTradeData }) {
  const animate = useChartAnimation();
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <BarChart data={data.수출상위} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--mu-grid)" horizontal={false} />
        <XAxis type="number" {...AXIS} tickFormatter={(v: number) => `${v.toLocaleString('ko-KR')}`} />
        <YAxis type="category" dataKey="국가" {...AXIS} width={92} tickFormatter={truncateXAxis} />
        <Tooltip content={<Tip unit="백만 달러" />} cursor={{ fill: 'var(--mu-hover)' }} />
        <Bar dataKey="금액" name="수출액" radius={[0, 4, 4, 0]} isAnimationActive={animate}>
          {data.수출상위.map((row) => (
            <Cell key={row.국가} fill={colorForCountry(row.국가)} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 국가별 수입액 상위 10. 소비 시장이 어디인지가 여기서 보인다. */
export function TradeImportRankChart({ data }: { data: TunaTradeData }) {
  const animate = useChartAnimation();
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <BarChart data={data.수입상위} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--mu-grid)" horizontal={false} />
        <XAxis type="number" {...AXIS} tickFormatter={(v: number) => `${v.toLocaleString('ko-KR')}`} />
        <YAxis type="category" dataKey="국가" {...AXIS} width={92} tickFormatter={truncateXAxis} />
        <Tooltip content={<Tip unit="백만 달러" />} cursor={{ fill: 'var(--mu-hover)' }} />
        <Bar dataKey="금액" name="수입액" radius={[0, 4, 4, 0]} isAnimationActive={animate}>
          {data.수입상위.map((row) => (
            <Cell key={row.국가} fill={colorForCountry(row.국가)} />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/**
 * 품목군별 교역 단가.
 *
 * 「가공할수록 비싸진다」는 직관이 틀리는 지점이다. 로인·필렛이 톤당 가장 비싼 이유는
 * 순수 가식부이기 때문이고, 통조림은 액체와 용기 무게가 섞여 톤당으로는 싸 보인다.
 */
export function TradeStagePriceChart({ data }: { data: TunaTradeData }) {
  const animate = useChartAnimation();
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data.품목군구성} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
        {GRID}
        <XAxis dataKey="구분" {...AXIS} />
        <YAxis yAxisId="left" {...AXIS} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}천`} width={56} />
        <YAxis
          yAxisId="right"
          orientation="right"
          {...AXIS}
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}천`}
          width={52}
        />
        <Tooltip content={<Tip unit="" />} cursor={{ fill: 'var(--mu-hover)' }} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
        <Bar yAxisId="left" dataKey="금액" name="교역액 (백만 달러)" fill={TUNA_ROLE.volume} radius={[3, 3, 0, 0]} isAnimationActive={animate} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="단가"
          name="단가 (달러/톤)"
          stroke={TUNA_ROLE.highlight}
          strokeWidth={2}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 한국 참치류 수출입과 무역수지 9년. */
export function KoreaTradeBalanceChart({ data }: { data: TunaTradeData }) {
  const animate = useChartAnimation();
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data.한국교역} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
        {GRID}
        <XAxis dataKey="연도" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${v.toLocaleString('ko-KR')}`} width={56} />
        <Tooltip content={<Tip unit="백만 달러" />} cursor={{ fill: 'var(--mu-hover)' }} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
        <Bar dataKey="수출액" name="수출액" fill={TUNA_ROLE.volume} radius={[3, 3, 0, 0]} isAnimationActive={animate} />
        <Bar dataKey="수입액" name="수입액" fill={TUNA_ROLE.processed} radius={[3, 3, 0, 0]} isAnimationActive={animate} />
        <Line type="monotone" dataKey="무역수지" name="무역수지" stroke={TUNA_ROLE.highlight} strokeWidth={2} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 한국 수출단가와 세계 평균. 잘 잡지만 낮은 값에 판다는 주장의 근거다. */
export function KoreaExportPriceChart({ data }: { data: TunaTradeData }) {
  const animate = useChartAnimation();
  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data.수출단가비교} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
        {GRID}
        <XAxis dataKey="연도" {...AXIS} />
        <YAxis yAxisId="left" {...AXIS} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}천`} width={56} />
        <YAxis
          yAxisId="right"
          orientation="right"
          {...AXIS}
          tickFormatter={(v: number) => `${v}%`}
          width={48}
        />
        <Tooltip content={<Tip unit="" />} cursor={{ fill: 'var(--mu-hover)' }} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
        <Bar yAxisId="left" dataKey="세계평균" name="세계 평균 (달러/톤)" fill={TUNA_ROLE.muted} radius={[3, 3, 0, 0]} isAnimationActive={animate} />
        <Bar yAxisId="left" dataKey="한국" name="한국 (달러/톤)" fill={TUNA_ROLE.highlight} radius={[3, 3, 0, 0]} isAnimationActive={animate} />
        <Line yAxisId="right" type="monotone" dataKey="격차율" name="세계 평균 대비 (%)" stroke={TUNA_ROLE.highlight} strokeWidth={2} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 태국 수출입. 원어를 사서 완제품으로 되파는 구조가 숫자로 드러난다. */
export function ThailandTradeChart({ data }: { data: TunaTradeData }) {
  const animate = useChartAnimation();
  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data.태국교역} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
        {GRID}
        <XAxis dataKey="연도" {...AXIS} />
        <YAxis {...AXIS} tickFormatter={(v: number) => `${v.toLocaleString('ko-KR')}`} width={56} />
        <Tooltip content={<Tip unit="백만 달러" />} cursor={{ fill: 'var(--mu-hover)' }} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
        <Bar dataKey="수입액" name="원료 수입액" fill={TUNA_ROLE.processed} radius={[3, 3, 0, 0]} isAnimationActive={animate} />
        <Bar dataKey="수출액" name="완제품 수출액" fill={TUNA_ROLE.volume} radius={[3, 3, 0, 0]} isAnimationActive={animate} />
        <Line type="monotone" dataKey="무역수지" name="교역 흑자" stroke={TUNA_ROLE.highlight} strokeWidth={2} isAnimationActive={animate} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 해역별 허가 선망선과 실제 조업 — 등록부는 「조업해도 된다」는 목록이다. */
export function OceanFleetChart({ data }: { data: TunaFleetData }) {
  const animate = !useReducedMotion();
  const rows = data.해역별.rows;
  const rotation = { angle: -30, textAnchor: 'end' as const };

  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} margin={{ top: 12, right: 16, left: 0, bottom: rotation.angle ? 52 : 8 }}>
        <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="해역"
          stroke="var(--mu-axis)"
          tick={{ fill: 'var(--mu-axis)', fontSize: 11 }}
          tickFormatter={truncateXAxis}
          angle={rotation.angle}
          textAnchor={rotation.textAnchor}
          height={rotation.angle ? 66 : 30}
          interval={0}
        />
        <YAxis stroke="var(--mu-axis)" tick={{ fill: 'var(--mu-axis)', fontSize: 11 }} />
        <Tooltip content={<Tip unit="척" />} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
        <Bar dataKey="허가" name="허가 척수 (척)" fill="#0e7490" radius={[3, 3, 0, 0]} isAnimationActive={animate} />
        <Bar dataKey="실조업" name="실제 조업 (척)" fill="#f59e0b" radius={[3, 3, 0, 0]} isAnimationActive={animate} />
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/** 선적국별 척수와 어창용적 — 척수만 세면 한국이 과소평가된다. */
export function FlagFleetChart({ data }: { data: TunaFleetData }) {
  const animate = !useReducedMotion();
  const rows = data.선적국.rows;
  const rotation = { angle: -45, textAnchor: 'end' as const };

  return (
    <SafeResponsiveContainer width="100%" height={320}>
      <ComposedChart data={rows} margin={{ top: 12, right: 16, left: 0, bottom: rotation.angle ? 56 : 8 }}>
        <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="선적국"
          stroke="var(--mu-axis)"
          tick={{ fill: 'var(--mu-axis)', fontSize: 11 }}
          tickFormatter={truncateXAxis}
          angle={rotation.angle}
          textAnchor={rotation.textAnchor}
          height={rotation.angle ? 70 : 30}
          interval={0}
        />
        <YAxis yAxisId="left" stroke="var(--mu-axis)" tick={{ fill: 'var(--mu-axis)', fontSize: 11 }} />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="var(--mu-axis)"
          tick={{ fill: 'var(--mu-axis)', fontSize: 11 }}
          tickFormatter={(v: number) => `${Math.round(v / 1000)}천`}
        />
        <Tooltip content={<Tip unit="척" />} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
        <Bar yAxisId="left" dataKey="척수" name="선박 수 (척)" radius={[3, 3, 0, 0]} isAnimationActive={animate}>
          {rows.map((r, i) => (
            <Cell key={i} fill={r.선적국 === '대한민국' ? '#e11d48' : '#0e7490'} />
          ))}
        </Bar>
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="어창용적"
          name="어창용적 (㎥)"
          stroke="#f59e0b"
          strokeWidth={2.2}
          dot={{ r: 3 }}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/** 한국 참치 업종별 척수와 선령 — 연승은 배를 거의 새로 짓지 않았다. */
export function KoreaTunaGearChart({ data }: { data: TunaFleetData }) {
  const animate = !useReducedMotion();
  const rows = data.한국업종.rows.map((r) => ({
    업종: r.업종,
    노후: r.선령31년이상,
    신조: r.척수 - r.선령31년이상,
  }));

  return (
    <SafeResponsiveContainer width="100%" height={260}>
      <BarChart data={rows} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="업종" stroke="var(--mu-axis)" tick={{ fill: 'var(--mu-axis)', fontSize: 11 }} interval={0} />
        <YAxis stroke="var(--mu-axis)" tick={{ fill: 'var(--mu-axis)', fontSize: 11 }} />
        <Tooltip content={<Tip unit="척" />} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
        <Bar dataKey="노후" name="선령 31년 이상 (척)" stackId="a" fill="#e11d48" isAnimationActive={animate} />
        <Bar dataKey="신조" name="선령 30년 이하 (척)" stackId="a" fill="#0e7490" radius={[3, 3, 0, 0]} isAnimationActive={animate} />
      </BarChart>
    </SafeResponsiveContainer>
  );
}

// ─── 밸류체인 단계별 기업 ──────────────────────────────────────────────────

/**
 * 조업 단계 — 선사별 보유 선단을 어법으로 갈라 본다.
 *
 * ⚠ 기준시점이 회사마다 다르다. 막대를 나란히 놓았지만 같은 날의 사진이 아니다.
 *   캡션에 그 사실을 적어 둔다.
 */
export function OperatorFleetChart({ rows }: { rows: OperatorRow[] }) {
  const animate = !useReducedMotion();
  const data = useMemo(
    () => [...rows].sort((a, b) => b.참치선망 + b.참치연승 - (a.참치선망 + a.참치연승)),
    [rows],
  );

  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="회사" {...AXIS} tickFormatter={truncateXAxis} interval={0} />
        <YAxis {...AXIS} />
        <Tooltip content={<Tip unit="척" />} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
        <Bar
          dataKey="참치선망"
          name="참치선망 (척)"
          stackId="a"
          fill={TUNA_ROLE.volume}
          isAnimationActive={animate}
        />
        <Bar
          dataKey="참치연승"
          name="참치연승 (척)"
          stackId="a"
          fill={TUNA_ROLE.processed}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/**
 * 유통 단계 — 2024년 한국 원양업계 회사별 수출실적.
 * 한 출처·한 통화·한 해라서 이 단계에서 유일하게 나란히 세울 수 있는 값이다.
 */
export function ExportRankChart({ rows }: { rows: ExportRankRow[] }) {
  const animate = !useReducedMotion();

  return (
    <SafeResponsiveContainer width="100%" height={320}>
      <BarChart
        data={rows}
        layout="vertical"
        margin={{ top: 12, right: 24, left: 8, bottom: 8 }}
      >
        <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          {...AXIS}
          tickFormatter={(v: number) => `${Math.round(v / 1000)}백만`}
        />
        <YAxis
          type="category"
          dataKey="회사"
          {...AXIS}
          width={86}
          tickFormatter={truncateXAxis}
        />
        <Tooltip content={<Tip unit="천달러" />} />
        <Bar
          dataKey="수출실적"
          name="수출실적 (천달러)"
          radius={[0, 3, 3, 0]}
          isAnimationActive={animate}
        >
          {rows.map((row) => (
            <Cell
              key={row.회사}
              fill={row.회사 === '신라교역' ? TUNA_ROLE.highlight : TUNA_ROLE.volume}
            />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/**
 * 해역별 선사 — 한국 선사가 어느 바다에 배를 두는가.
 *
 * ⚠ 막대를 쌓았지만 **높이를 그 회사의 총 선단으로 읽으면 안 된다.**
 *   한 배가 두 기구에 동시 인가될 수 있고, 서·중부태평양·동부태평양 두 기구가 빠져 있다.
 *   이 그림이 말하는 것은 규모가 아니라 **어느 바다에 있느냐**다.
 */
export function OceanOperatorChart({
  rows,
  areas,
}: {
  rows: OceanMatrixRow[];
  areas: string[];
}) {
  const animate = !useReducedMotion();
  const fills = [TUNA_ROLE.volume, TUNA_ROLE.processed, TUNA_ROLE.highlight];

  return (
    <SafeResponsiveContainer width="100%" height={300}>
      <BarChart data={rows} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="선사" {...AXIS} tickFormatter={truncateXAxis} interval={0} />
        <YAxis {...AXIS} allowDecimals={false} />
        <Tooltip content={<Tip unit="척" />} />
        <Legend wrapperStyle={{ fontSize: 11, color: 'var(--mu-axis)' }} />
        {areas.map((area, index) => (
          <Bar
            key={area}
            dataKey={area}
            name={`${area} (척)`}
            stackId="a"
            fill={fills[index % fills.length]}
            radius={index === areas.length - 1 ? [3, 3, 0, 0] : undefined}
            isAnimationActive={animate}
          />
        ))}
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/**
 * 소매 단계 — 국내 참치캔 시장 점유율.
 *
 * 한 회사가 공시한 자사 점유율이라 나머지가 어떻게 나뉘는지는 알 수 없다.
 * 축을 0부터 두지 않고 70~85 구간으로 좁히면 하락이 과장되므로 0에서 시작한다.
 */
export function RetailShareChart({ rows }: { rows: RetailShareRow[] }) {
  const animate = !useReducedMotion();

  return (
    <SafeResponsiveContainer width="100%" height={280}>
      <ComposedChart data={rows} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="기간" {...AXIS} tickFormatter={truncateXAxis} interval={0} />
        <YAxis {...AXIS} domain={[0, 100]} tickFormatter={(v: number) => `${v}%`} />
        <Tooltip content={<Tip unit="%" />} />
        <Bar
          dataKey="점유율"
          name="참치캔 점유율 (%)"
          fill={TUNA_ROLE.volume}
          radius={[3, 3, 0, 0]}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

/**
 * 해역별 세계 상위 선사 — 한국 선사가 그 안에서 어디 있는지 함께 본다.
 *
 * ⚠ 「개인 소유」는 순위에서 빼 뒀다. 선사가 아니라 개인 소유 선박을 모은 칸이라
 *   나란히 세우면 1위가 되는데 그건 회사가 아니다. 비중은 캡션에 따로 적는다.
 */
export function OceanTopOwnerChart({
  rows,
  area,
}: {
  rows: { 선사: string; 척수: number; 비중?: number }[];
  area: string;
}) {
  const animate = !useReducedMotion();
  const data = useMemo(() => rows.slice(0, 10), [rows]);

  return (
    <SafeResponsiveContainer width="100%" height={330}>
      <BarChart data={data} layout="vertical" margin={{ top: 12, right: 24, left: 8, bottom: 8 }}>
        <CartesianGrid stroke="var(--mu-grid)" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" {...AXIS} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="선사"
          {...AXIS}
          width={132}
          tickFormatter={(v: string) => (v.length > 16 ? `${v.slice(0, 15)}…` : v)}
        />
        <Tooltip content={<Tip unit="척" />} />
        <Bar dataKey="척수" name={`${area} 인가 선박 (척)`} radius={[0, 3, 3, 0]} isAnimationActive={animate}>
          {data.map((row) => (
            <Cell
              key={row.선사}
              fill={/[가-힣]/.test(row.선사) ? TUNA_ROLE.highlight : TUNA_ROLE.volume}
            />
          ))}
        </Bar>
      </BarChart>
    </SafeResponsiveContainer>
  );
}

/**
 * 어종별 자원상태 — 기구가 평가한 계군 상태.
 *
 * ⚠ **오늘 상태가 아니다.** 평가에는 시점이 있고 원문은 2022년 평가를 싣는다.
 *   막대가 아니라 표로 내는 이유가 있다 — 「양호」는 세는 값이 아니라 판정이라
 *   개수를 세어 크기로 보여주면 없는 정량성을 만든다.
 */
export function StockStatusTable({ rows }: { rows: StockStatusRow[] }) {
  const grouped = useMemo(() => {
    const map = new Map<string, StockStatusRow[]>();
    for (const row of rows) {
      const list = map.get(row.어종) ?? [];
      list.push(row);
      map.set(row.어종, list);
    }
    return [...map.entries()];
  }, [rows]);

  return (
    <div className={styles.factWrap}>
      <table className={styles.factTable}>
        <caption className={styles.factCaption}>
          해역을 관리하는 기구가 평가한 계군 상태다. 평가연도를 함께 적었다 — 오늘 상태가 아니라
          그 해에 그렇게 평가했다는 뜻이다.
        </caption>
        <thead>
          <tr>
            <th scope="col">어종</th>
            <th scope="col">해역</th>
            <th scope="col">관리 기구</th>
            <th scope="col">상태</th>
            <th scope="col">평가연도</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(([species, list]) =>
            list.map((row, index) => (
              <tr key={`${species}-${row.해역}-${index}`}>
                {index === 0 ? (
                  <th scope="row" rowSpan={list.length}>
                    {species}
                  </th>
                ) : null}
                <td>{row.해역}</td>
                <td>{row.기구}</td>
                <td className={styles.factValue}>{row.상태}</td>
                <td>{row.평가연도}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}
