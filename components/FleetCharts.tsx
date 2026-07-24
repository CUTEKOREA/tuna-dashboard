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

const subscribeClientReady = () => () => {};
const getClientReadySnapshot = () => true;
const getServerReadySnapshot = () => false;

// Data Definitions
const weeklyData = [
  { name: 'MARI', captain: '김정훈', weekly: 195.00, avg: 27.86 },
  { name: 'S/CHA', captain: '최용석', weekly: 190.00, avg: 27.14 },
  { name: 'S/SPR', captain: '김효원', weekly: 182.00, avg: 26.00 },
  { name: 'N/STAR', captain: '조태연', weekly: 105.00, avg: 15.00 },
  { name: 'N/SUN', captain: '김형주', weekly: 100.00, avg: 14.29 },
  { name: 'S/HAR', captain: '오복근', weekly: 95.00, avg: 13.57 },
  { name: 'S/EXP', captain: '공준식', weekly: 81.30, avg: 11.61 },
  { name: 'S/PIO', captain: '김승현', weekly: 39.00, avg: 5.57 },
  { name: 'KONA', captain: '이평규', weekly: 22.00, avg: 3.14 },
  { name: 'S/JUP', captain: '강창훈', weekly: 0, avg: 0 },
];

const monthlyData = [
  { name: 'S/EXP', month1: 927, month2: 875, month3: 465, month4: 679, month5: 319, month6: 185, month7: 336 },
  { name: 'S/PIO', month1: 620, month2: 585, month3: 560, month4: 475, month5: 1205, month6: 881, month7: 158 },
  { name: 'S/CHA', month1: 320, month2: 700, month3: 640, month4: 250, month5: 805, month6: 380, month7: 430 },
  { name: 'S/HAR', month1: 1095, month2: 935, month3: 1120, month4: 435, month5: 575, month6: 0, month7: 300 },
  { name: 'S/JUP', month1: 0, month2: 175, month3: 595, month4: 855, month5: 310, month6: 845, month7: 135 },
  { name: 'S/SPR', month1: 806, month2: 485, month3: 1065, month4: 1555, month5: 1234, month6: 970, month7: 307 },
  { name: 'MARI', month1: 975, month2: 660, month3: 525, month4: 350, month5: 1060, month6: 900, month7: 655 },
  { name: 'KONA', month1: 722, month2: 330, month3: 659, month4: 430, month5: 596, month6: 681, month7: 279 },
  { name: 'N/SUN', month1: 665, month2: 310, month3: 0, month4: 502, month5: 528, month6: 820, month7: 180 },
  { name: 'N/STAR', month1: 675, month2: 880, month3: 515, month4: 1105, month5: 415, month6: 1165, month7: 800 },
];

const cumulativeData = [
  { rank: 1, cap: '조태연', name: 'N/STAR', date: '26/06/25', days: 25, catchTotal: 1005, daily: 40.2, diff: '-0.00', avgDiff: '-19.29' },
  { rank: 2, cap: '김효원', name: 'S/SPR', date: '25/09/27', days: 296, catchTotal: 8700, daily: 29.4, diff: '-10.81', avgDiff: '+8.48' },
  { rank: 3, cap: '김정훈', name: 'MARI', date: '25/04/17', days: 459, catchTotal: 10725, daily: 23.4, diff: '-16.83', avgDiff: '+2.46' },
  { rank: 4, cap: '김승현', name: 'S/PIO', date: '26/01/22', days: 179, catchTotal: 3944, daily: 22.0, diff: '-18.17', avgDiff: '+1.12' },
  { rank: 5, cap: '이평규', name: 'KONA', date: '26/03/11', days: 131, catchTotal: 2495, daily: 19.1, diff: '-21.15', avgDiff: '-1.86' },
  { rank: 6, cap: '최용석', name: 'S/CHA', date: '26/01/04', days: 197, catchTotal: 3525, daily: 17.9, diff: '-22.31', avgDiff: '-3.02' },
  { rank: 7, cap: '강창훈', name: 'S/JUP', date: '25/06/10', days: 405, catchTotal: 7095, daily: 17.5, diff: '-22.68', avgDiff: '-3.39' },
  { rank: 8, cap: '김형주', name: 'N/SUN', date: '25/10/20', days: 273, catchTotal: 3990, daily: 14.6, diff: '-25.58', avgDiff: '-6.29' },
  { rank: 9, cap: '공준식', name: 'S/EXP', date: '26/06/14', days: 36, catchTotal: 521, daily: 14.5, diff: '-25.72', avgDiff: '-6.43' },
  { rank: 10, cap: '오복근', name: 'S/HAR', date: '26/06/28', days: 22, catchTotal: 300, daily: 13.6, diff: '-26.56', avgDiff: '-7.27' },
];

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
        <YAxis yAxisId="right" orientation="right" stroke="var(--accent-danger)" axisLine={false} tickLine={false} tick={{ fontSize: rc.tickFontSize }} domain={[0, 80]} width={rc.isMobile ? 25 : 40} hide={rc.isMobile} />
        <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', borderColor: 'var(--chart-tooltip-border)', color: 'var(--text-main)', fontSize: rc.isMobile ? '11px' : '13px' }} />
        <Legend wrapperStyle={{ fontSize: rc.legendFontSize }} />
        <Bar yAxisId="left" dataKey="weekly" name="주간 어획량 (톤)" fill="var(--pastel-ice)" radius={[4, 4, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="avg" name="일평균 어획량" stroke="var(--accent-danger)" dot={{ r: rc.isMobile ? 3 : 5, fill: 'var(--accent-danger)' }} strokeWidth={0} />
      </ComposedChart>
    </SafeResponsiveContainer>
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
        <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', borderColor: 'var(--chart-tooltip-border)', color: 'var(--text-main)', fontSize: rc.isMobile ? '11px' : '13px' }} />
        <Legend wrapperStyle={{ fontSize: rc.legendFontSize }} />
        <Bar dataKey="month1" stackId="a" name="1월" fill="var(--pastel-lemon)" />
        <Bar dataKey="month2" stackId="a" name="2월" fill="var(--pastel-aqua)" />
        <Bar dataKey="month3" stackId="a" name="3월" fill="var(--pastel-orchid)" />
        <Bar dataKey="month4" stackId="a" name="4월" fill="#ce7a2c" />
        <Bar dataKey="month5" stackId="a" name="5월" fill="#ff98ba" />
        <Bar dataKey="month6" stackId="a" name="6월" fill="#c084fc" />
        <Bar dataKey="month7" stackId="a" name="7월" fill="#4ade80" radius={[4, 4, 0, 0]} />
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
    return (
      <div style={{ backgroundColor: 'var(--chart-tooltip-bg)', border: '1px solid var(--chart-tooltip-border)', padding: '8px', borderRadius: '6px', color: 'var(--text-main)', fontSize: '11px', maxWidth: '200px' }}>
        <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', fontSize: '12px' }}>{label}</p>
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
        <Bar yAxisId="left" dataKey="daily" name="일어획량 (톤)" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={rc.barSize} />
        <Scatter yAxisId="right" dataKey="rank" name="순위" fill="var(--pastel-peach)" shape={<CustomRankShape />} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

// Ensure the helper object handles exporting the table correctly
export const CumulativeTableData = cumulativeData;
