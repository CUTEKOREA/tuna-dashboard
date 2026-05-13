'use client';

import React, { useState, useEffect } from 'react';
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
  ResponsiveContainer,
  Scatter,
} from 'recharts';
import SafeResponsiveContainer from './SafeResponsiveContainer';
import { useResponsiveChart } from '../lib/useResponsiveChart';

// Data Definitions
const weeklyData = [
  { name: 'S/EXP', captain: '정윤채', weekly: 200, avg: 28.57 },
  { name: 'S/PIO', captain: '김승현', weekly: 795, avg: 113.57 },
  { name: 'S/CHA', captain: '최용석', weekly: 75, avg: 10.71 },
  { name: 'S/HAR', captain: '모승현', weekly: 345, avg: 49.29 },
  { name: 'S/JUP', captain: '강창훈', weekly: 220, avg: 31.43 },
  { name: 'S/SPR', captain: '김효원', weekly: 185, avg: 26.43 },
  { name: 'MARI', captain: '김정훈', weekly: 400, avg: 57.14 },
  { name: 'KONA', captain: '이평규', weekly: 257, avg: 36.71 },
  { name: 'N/SUN', captain: '김형주', weekly: 80, avg: 11.43 },
  { name: 'N/STAR', captain: '김태엽', weekly: 70, avg: 10.00 },
];

const monthlyData = [
  { name: 'S/EXP', month1: 927, month2: 875, month3: 465, month4: 679, month5: 200 },
  { name: 'S/PIO', month1: 620, month2: 585, month3: 560, month4: 475, month5: 860 },
  { name: 'S/CHA', month1: 320, month2: 700, month3: 640, month4: 250, month5: 255 },
  { name: 'S/HAR', month1: 1095, month2: 935, month3: 1120, month4: 435, month5: 530 },
  { name: 'S/JUP', month1: 175, month2: 595, month3: 855, month4: 310, month5: 280 },
  { name: 'S/SPR', month1: 806, month2: 485, month3: 1065, month4: 1555, month5: 185 },
  { name: 'MARI', month1: 975, month2: 660, month3: 525, month4: 350, month5: 630 },
  { name: 'KONA', month1: 722, month2: 330, month3: 659, month4: 430, month5: 267 },
  { name: 'N/SUN', month1: 665, month2: 310, month3: 0, month4: 502, month5: 240 },
  { name: 'N/STAR', month1: 675, month2: 880, month3: 515, month4: 1105, month5: 125 },
];

const cumulativeData = [
  { rank: 3, cap: '정윤채', name: 'S/EXP', date: '25/05/03', days: 373, catchTotal: 9372, daily: 25.1, diff: '-5.97', avgDiff: '+1.78' },
  { rank: 5, cap: '김승현', name: 'S/PIO', date: '26/01/22', days: 109, catchTotal: 2560, daily: 23.5, diff: '-7.61', avgDiff: '+0.14' },
  { rank: 9, cap: '최용석', name: 'S/CHA', date: '26/01/04', days: 127, catchTotal: 2165, daily: 17.1, diff: '-14.05', avgDiff: '-6.30' },
  { rank: 1, cap: '모승현', name: 'S/HAR', date: '25/05/09', days: 367, catchTotal: 11415, daily: 31.1, diff: '-0.00', avgDiff: '+7.75' },
  { rank: 8, cap: '강창훈', name: 'S/JUP', date: '25/06/10', days: 335, catchTotal: 6395, daily: 19.1, diff: '-12.01', avgDiff: '-4.26' },
  { rank: 2, cap: '김효원', name: 'S/SPR', date: '25/09/27', days: 226, catchTotal: 6374, daily: 28.2, diff: '-2.90', avgDiff: '+4.85' },
  { rank: 6, cap: '김정훈', name: 'MARI', date: '25/04/17', days: 389, catchTotal: 8740, daily: 22.5, diff: '-8.63', avgDiff: '-0.88' },
  { rank: 7, cap: '이평규', name: 'KONA', date: '26/03/11', days: 61, catchTotal: 1206, daily: 19.8, diff: '-11.33', avgDiff: '-3.58' },
  { rank: 10, cap: '김형주', name: 'N/SUN', date: '25/10/20', days: 203, catchTotal: 2702, daily: 13.3, diff: '-17.79', avgDiff: '-10.04' },
  { rank: 4, cap: '김태엽', name: 'N/STAR', date: '25/05/06', days: 370, catchTotal: 8840, daily: 23.9, diff: '-7.21', avgDiff: '+0.54' },
];

export function WeeklyCatchChart() {
  const [mounted, setMounted] = useState(false);
  const rc = useResponsiveChart();
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height: rc.chartHeight }} />;

  return (
    <SafeResponsiveContainer width="100%" height={rc.chartHeight}>
      <ComposedChart data={weeklyData} margin={rc.chartMargin}>
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
        <YAxis yAxisId="right" orientation="right" stroke="var(--accent-danger)" axisLine={false} tickLine={false} tick={{ fontSize: rc.tickFontSize }} domain={[0, 60]} width={rc.isMobile ? 25 : 40} hide={rc.isMobile} />
        <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', borderColor: 'var(--chart-tooltip-border)', color: 'var(--text-main)', fontSize: rc.isMobile ? '11px' : '13px' }} />
        <Legend wrapperStyle={{ fontSize: rc.legendFontSize }} />
        <Bar yAxisId="left" dataKey="weekly" name="주간 어획량 (톤)" fill="var(--pastel-ice)" radius={[4, 4, 0, 0]} />
        <Line yAxisId="right" type="monotone" dataKey="avg" name="일평균 어획량" stroke="var(--accent-danger)" dot={{ r: rc.isMobile ? 3 : 5, fill: 'var(--accent-danger)' }} strokeWidth={0} />
      </ComposedChart>
    </SafeResponsiveContainer>
  );
}

export function MonthlyCatchChart() {
  const [mounted, setMounted] = useState(false);
  const rc = useResponsiveChart();
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height: rc.chartHeight }} />;

  return (
    <SafeResponsiveContainer width="100%" height={rc.chartHeight}>
      <BarChart data={monthlyData} margin={rc.chartMargin}>
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
        <YAxis stroke="var(--chart-axis)" axisLine={false} tickLine={false} tick={{ fontSize: rc.tickFontSize }} domain={[0, 3500]} width={rc.isMobile ? 30 : 40} />
        <Tooltip contentStyle={{ backgroundColor: 'var(--chart-tooltip-bg)', borderColor: 'var(--chart-tooltip-border)', color: 'var(--text-main)', fontSize: rc.isMobile ? '11px' : '13px' }} />
        <Legend wrapperStyle={{ fontSize: rc.legendFontSize }} />
        <Bar dataKey="month1" stackId="a" name="1월" fill="var(--pastel-lemon)" />
        <Bar dataKey="month2" stackId="a" name="2월" fill="var(--pastel-aqua)" />
        <Bar dataKey="month3" stackId="a" name="3월" fill="var(--pastel-orchid)" />
        <Bar dataKey="month4" stackId="a" name="4월" fill="#ce7a2c" />
        <Bar dataKey="month5" stackId="a" name="5월" fill="#ff98ba" radius={[4, 4, 0, 0]} />
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
  const [mounted, setMounted] = useState(false);
  const rc = useResponsiveChart();
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div style={{ height: rc.smallChartHeight }} />;

  return (
    <SafeResponsiveContainer width="100%" height={rc.smallChartHeight}>
      <ComposedChart data={cumulativeData} margin={rc.isMobile ? { top: 15, right: 5, left: -15, bottom: 0 } : { top: 30, right: 0, left: 0, bottom: 0 }}>
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
