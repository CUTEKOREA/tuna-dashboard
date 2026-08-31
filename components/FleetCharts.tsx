'use client';

import React, { useSyncExternalStore } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter,
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { useResponsiveChart } from '../lib/useResponsiveChart';
import { ChartPatternDefs } from './ChartPatterns';
import { purseSeineCatch } from '@/lib/fleet-operations-2026-08-23';
import { fleetDailyPublicSeries } from '@/lib/data/fleet-daily-public';
import { CHART_RANK, shareColor } from '@/lib/chart-palette';

const subscribeClientReady = () => () => {};
const getClientReadySnapshot = () => true;
const getServerReadySnapshot = () => false;

/* V3 라이트: 전역 recharts 기본 툴팁(!important)이 라이트 흰 배경이라 시리즈색 글자가
 * 소실됨 — 다크 커스텀 툴팁으로 교체 (MarketDashboard의 MarketChartTip 패턴) */
function FleetChartTip({ active, payload, label }: {
  active?: boolean;
  payload?: { name?: string; value?: number | string; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#303c46',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '10px',
      boxShadow: '0 8px 24px rgba(16, 24, 40, 0.35)',
      padding: '10px 12px',
      fontSize: '12.5px',
      lineHeight: 1.6,
    }}>
      <div style={{ color: '#c6c9d2', marginBottom: '4px', fontWeight: 700 }}>{label}</div>
      {payload.map((entry) => (
        <div key={String(entry.name)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color ?? '#ffffff', flex: '0 0 auto' }} />
          <span style={{ color: '#ffffff' }}>
            {entry.name} : {typeof entry.value === 'number' ? entry.value.toLocaleString('ko-KR') : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// Data Definitions
const weeklyData = purseSeineCatch.weeklyRanking.map((item) => ({
  name: item.vessel,
  captain: item.captain,
  weekly: item.catchMt,
  avg: item.dailyAverageMt,
}));

const monthlyData = purseSeineCatch.monthlyByVessel.map((item) => ({
  name: item.vessel,
  month1: item.monthlyMt[0], month2: item.monthlyMt[1], month3: item.monthlyMt[2], month4: item.monthlyMt[3],
  month5: item.monthlyMt[4], month6: item.monthlyMt[5], month7: item.monthlyMt[6], month8: item.monthlyMt[7],
}));

type MonthlyCatchSeriesConfig = {
  dataKey: string;
  name: string;
  color: string;
  strokeDasharray?: string;
  radius?: [number, number, number, number];
};

const monthlyCatchSeries: MonthlyCatchSeriesConfig[] = [
  { dataKey: 'month1', name: '1월', color: shareColor(0) },
  { dataKey: 'month2', name: '2월', color: shareColor(1) },
  { dataKey: 'month3', name: '3월', color: shareColor(2) },
  { dataKey: 'month4', name: '4월', color: shareColor(3) },
  { dataKey: 'month5', name: '5월', color: shareColor(4), strokeDasharray: '6 3' },
  { dataKey: 'month6', name: '6월', color: shareColor(5), strokeDasharray: '3 3' },
  { dataKey: 'month7', name: '7월', color: shareColor(6), strokeDasharray: '8 3 2 3', radius: [4, 4, 0, 0] },
  { dataKey: 'month8', name: '8월', color: shareColor(7), strokeDasharray: '2 3', radius: [4, 4, 0, 0] },
];

const cumulativeData = purseSeineCatch.seasonRanking.map((item) => ({
  rank: item.rank,
  cap: item.captain,
  name: item.vessel,
  date: item.boardingDate.slice(2).replaceAll('-', '/'),
  days: item.seasonDays,
  catchTotal: item.catchMt,
  daily: item.dailyCatchMt,
  diff: Object.is(item.leaderDeltaMt, -0) ? '-0.00' : item.leaderDeltaMt.toFixed(2),
  avgDiff: `${item.averageDeltaMt >= 0 ? '+' : ''}${item.averageDeltaMt.toFixed(2)}`,
}));

export function WeeklyCatchChart() {
  const mounted = useSyncExternalStore(subscribeClientReady, getClientReadySnapshot, getServerReadySnapshot);
  const rc = useResponsiveChart();
  if (!mounted) return <div style={{ height: rc.chartHeight }} />;

  return (
    <SafeResponsiveContainer width="100%" height={rc.chartHeight}>
      <ComposedChart data={weeklyData} margin={rc.chartMargin}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="var(--chart-axis)" 
          tickLine={false} 
          axisLine={false} 
          tick={{ fontSize: rc.tickFontSize }}
          angle={rc.xAxisAngle}
          dy={rc.xAxisDy}
          interval={0}
        />
        <YAxis yAxisId="left" stroke="var(--chart-axis)" axisLine={false} tickLine={false} tick={{ fontSize: rc.tickFontSize }} width={rc.isMobile ? 30 : 40} />
        <YAxis yAxisId="right" orientation="right" stroke="var(--accent-danger)" axisLine={false} tickLine={false} tick={{ fontSize: rc.tickFontSize }} domain={[0, 30]} width={rc.isMobile ? 25 : 40} hide={rc.isMobile} />
        <Tooltip content={<FleetChartTip />} />
        <Legend wrapperStyle={{ fontSize: rc.legendFontSize }} />
        <Bar yAxisId="left" dataKey="weekly" name="주간 어획량 (톤)" fill={CHART_RANK} radius={[4, 4, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="avg" name="일평균 어획량" stroke="var(--accent-danger)" dot={{ r: rc.isMobile ? 3 : 5, fill: 'var(--accent-danger)' }} strokeWidth={2} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

export function MonthlyCatchSeries() {
  return (
    <>
      {monthlyCatchSeries.map((series) => (
        <Bar
          key={series.dataKey}
          dataKey={series.dataKey}
          stackId="a"
          name={series.name}
          fill={series.color}
          fillOpacity={series.strokeDasharray ? 0.78 : 1}
          stroke={series.color}
          strokeWidth={series.strokeDasharray ? 1.5 : 0}
          strokeDasharray={series.strokeDasharray}
          radius={series.radius}
        />
      ))}
    </>
  );
}

export function MonthlyCatchChart() {
  const mounted = useSyncExternalStore(subscribeClientReady, getClientReadySnapshot, getServerReadySnapshot);
  const rc = useResponsiveChart();
  if (!mounted) return <div style={{ height: rc.chartHeight }} />;

  return (
    <SafeResponsiveContainer width="100%" height={rc.chartHeight}>
      <BarChart data={monthlyData} margin={rc.chartMargin}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="var(--chart-axis)" 
          tickLine={false} 
          axisLine={false} 
          tick={{ fontSize: rc.tickFontSize }}
          angle={rc.xAxisAngle}
          dy={rc.xAxisDy}
          interval={0}
        />
        <YAxis stroke="var(--chart-axis)" axisLine={false} tickLine={false} tick={{ fontSize: rc.tickFontSize }} domain={[0, 7000]} width={rc.isMobile ? 30 : 40} />
        <Tooltip content={<FleetChartTip />} />
        <Legend wrapperStyle={{ fontSize: rc.legendFontSize }} />
        <MonthlyCatchSeries />
      </BarChart>
    </SafeResponsiveContainer>
  );
}

const CustomRankShape = (props: any) => {
  const { cx, cy, payload } = props;
  const rank = payload.rank;
  const size = typeof window !== 'undefined' && window.innerWidth <= 480 ? 16 : 22;
  
  if (rank === 1) return <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={size}>🐟</text>;
  if (rank === 2) return <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={size}>🐠</text>;
  if (rank === 3) return <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontSize={size}>🐡</text>;

  return <circle cx={cx} cy={cy} r={3} fill="var(--pastel-peach)" />;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // V3 라이트: 다크 툴팁 관례 (MarketChartTip 패턴)
    return (
      <div style={{ backgroundColor: '#303c46', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '8px', borderRadius: '6px', color: '#ffffff', fontSize: '11px', maxWidth: '200px' }}>
        <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', fontSize: '12px', color: '#c6c9d2' }}>{label}</p>
        {payload.map((entry: any, index: number) => {
          if (entry.name === 'name' || entry.dataKey === 'name') return null;
          return (
            <div key={`item-${index}`} style={{ margin: '3px 0', color: entry.color }}>
              {entry.name} : {entry.value}
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function CumulativeChart() {
  const mounted = useSyncExternalStore(subscribeClientReady, getClientReadySnapshot, getServerReadySnapshot);
  const rc = useResponsiveChart();
  if (!mounted) return <div style={{ height: rc.smallChartHeight }} />;

  return (
    <SafeResponsiveContainer width="100%" height={rc.smallChartHeight}>
      <ComposedChart data={cumulativeData} margin={rc.isMobile ? { top: 15, right: 5, left: -15, bottom: 0 } : { top: 30, right: 0, left: 0, bottom: 0 }}>
        <ChartPatternDefs />
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="var(--chart-axis)" 
          tickLine={false} 
          axisLine={false} 
          tick={{ fontSize: rc.tickFontSize }}
          angle={rc.xAxisAngle}
          dy={rc.xAxisDy}
          interval={0}
        />
        <YAxis yAxisId="left" stroke="var(--chart-axis)" axisLine={false} tickLine={false} tick={{ fontSize: rc.tickFontSize }} domain={[0, 40]} width={rc.isMobile ? 25 : 40} />
        <YAxis yAxisId="right" orientation="right" stroke="var(--pastel-peach)" axisLine={false} tickLine={false} tick={false} domain={[0, 11]} reversed width={rc.isMobile ? 10 : 20} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: rc.legendFontSize }} />
        <Bar yAxisId="left" dataKey="daily" name="일어획량 (톤)" fill={CHART_RANK} radius={[4, 4, 0, 0]} barSize={rc.barSize} />
        <Scatter yAxisId="right" dataKey="rank" name="순위" fill={shareColor(4)} shape={<CustomRankShape />} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

// Ensure the helper object handles exporting the table correctly
export const CumulativeTableData = cumulativeData;

/* 일간 어획 추이 — 해역 합계가 기본이고, 옵션으로 선박별 라인을 편다.
 * 합계는 보고 헤더의 일간 어획량, 선박별은 상세 행의 어획량이라 검산 차이가 그대로 보인다. */
const DAILY_TREND_REGIONS = {
  pacific: { label: '태평양', color: 'var(--accent-primary)' },
  atlantic: { label: '대서양', color: '#f59e0b' },
} as const;

type DailyTrendRegion = keyof typeof DAILY_TREND_REGIONS;

function formatTrendDate(date: string) {
  return `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;
}

export function DailyCatchTrendChart() {
  const mounted = useSyncExternalStore(subscribeClientReady, getClientReadySnapshot, getServerReadySnapshot);
  const rc = useResponsiveChart();
  const [region, setRegion] = React.useState<DailyTrendRegion | 'total'>('total');
  const [vessel, setVessel] = React.useState<string | null>(null);

  const series = fleetDailyPublicSeries;
  const vesselNames = region === 'total'
    ? []
    : Object.keys(series[region].vessels);

  const data = React.useMemo(() => series.dates.map((date, index) => ({
    date: formatTrendDate(date),
    fullDate: date,
    태평양: series.pacific.totalMt[index] ?? 0,
    대서양: series.atlantic.totalMt[index] ?? 0,
    합계: (series.pacific.totalMt[index] ?? 0) + (series.atlantic.totalMt[index] ?? 0),
    선박: region === 'total' || !vessel ? null : series[region].vessels[vessel]?.[index] ?? null,
  })), [series, region, vessel]);

  if (!mounted) return <div style={{ height: rc.mainChartHeight }} />;

  const chipStyle = (active: boolean) => ({
    padding: '4px 10px',
    borderRadius: 999,
    border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--dsc-surface-border, rgba(0,0,0,.12))'}`,
    background: active ? 'var(--accent-primary)' : 'transparent',
    color: active ? '#ffffff' : 'var(--text-muted)',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
  });

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        <button type="button" style={chipStyle(region === 'total')} onClick={() => { setRegion('total'); setVessel(null); }}>
          해역 합계
        </button>
        {(Object.keys(DAILY_TREND_REGIONS) as DailyTrendRegion[]).map((key) => (
          <button
            key={key}
            type="button"
            style={chipStyle(region === key)}
            onClick={() => { setRegion(key); setVessel(Object.keys(series[key].vessels)[0] ?? null); }}
          >
            {DAILY_TREND_REGIONS[key].label} 선박별
          </button>
        ))}
      </div>
      {region !== 'total' ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
          {vesselNames.map((name) => (
            <button key={name} type="button" style={chipStyle(vessel === name)} onClick={() => setVessel(name)}>
              {name}
            </button>
          ))}
        </div>
      ) : null}
      <SafeResponsiveContainer width="100%" height={rc.mainChartHeight}>
        <ComposedChart data={data} margin={rc.chartMargin}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="var(--chart-axis)"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: rc.tickFontSize }}
            interval={rc.isMobile ? 20 : 9}
            minTickGap={12}
          />
          <YAxis
            stroke="var(--chart-axis)"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: rc.tickFontSize }}
            width={rc.isMobile ? 30 : 45}
          />
          <Tooltip content={<FleetChartTip />} />
          <Legend wrapperStyle={{ fontSize: rc.legendFontSize }} />
          {region === 'total' ? (
            <>
              <Line type="monotone" dataKey="태평양" name="태평양 일간 어획량 (MT)" stroke={DAILY_TREND_REGIONS.pacific.color} strokeWidth={1.6} dot={false} />
              <Line type="monotone" dataKey="대서양" name="대서양 일간 어획량 (MT)" stroke={DAILY_TREND_REGIONS.atlantic.color} strokeWidth={1.6} dot={false} />
              <Line type="monotone" dataKey="합계" name="합계 일간 어획량 (MT)" stroke={CHART_RANK} strokeWidth={2.2} dot={false} />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey={DAILY_TREND_REGIONS[region].label}
                name={`${DAILY_TREND_REGIONS[region].label} 해역 합계 (MT)`}
                stroke="var(--chart-axis)"
                strokeWidth={1.2}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="선박"
                name={`${vessel ?? '선박'} 일간 어획량 (MT)`}
                stroke={DAILY_TREND_REGIONS[region].color}
                strokeWidth={2.2}
                dot={false}
                connectNulls={false}
              />
            </>
          )}
        </ComposedChart>
      </SafeResponsiveContainer>
    </div>
  );
}
